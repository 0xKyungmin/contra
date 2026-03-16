import { Router } from 'express';
import type { Request, Response } from 'express';
import { Pool } from 'pg';
import { authenticate } from '../middleware/auth.js';
import { buildVisibilityClause, canSeeMint, filterTransactions } from '../middleware/visibility.js';
import type { TransactionRow } from '../middleware/visibility.js';
import { runPreset, PRESET_METADATA } from '../config/presets.js';

const router = Router();

let _pool: Pool | null = null;
function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return _pool;
}

// All /api/db endpoints require authentication.
router.use(authenticate);

// GET /api/db/transactions - list transactions filtered by tenant visibility
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? '50'), 10), 500);
    const offset = Math.max(parseInt(String(req.query.offset ?? '0'), 10), 0);
    const { status, type, mint } = req.query;
    const tenant = req.tenant;

    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const vis = buildVisibilityClause(tenant, idx);
    if (vis.clause) {
      conditions.push(vis.clause);
      values.push(...vis.values);
      idx = vis.nextIdx;
    }

    if (status) {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }
    if (type) {
      conditions.push(`transaction_type = $${idx++}`);
      values.push(type);
    }
    if (mint) {
      conditions.push(`mint = $${idx++}`);
      values.push(mint);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(limit, offset);

    const query = `
      SELECT * FROM transactions
      ${where}
      ORDER BY created_at DESC
      LIMIT $${idx++} OFFSET $${idx}
    `;

    const result = await getPool().query(query, values);
    res.json({ transactions: result.rows, total: result.rowCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: 'Database error', detail: message });
  }
});

// GET /api/db/transactions/:signature - single transaction with visibility check
router.get('/transactions/:signature', async (req: Request, res: Response) => {
  try {
    const { signature } = req.params;
    const tenant = req.tenant;

    const result = await getPool().query(
      'SELECT * FROM transactions WHERE signature = $1',
      [signature]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    const tx = result.rows[0] as TransactionRow;

    // Enforce visibility: non-admin tenants may only access their own transactions.
    if (tenant.role !== 'admin') {
      const allowed = new Set(tenant.pubkeys);
      const visible =
        (typeof tx.initiator === 'string' && allowed.has(tx.initiator)) ||
        (typeof tx.recipient === 'string' && allowed.has(tx.recipient));
      if (!visible) {
        res.status(403).json({ error: 'Forbidden', detail: 'Transaction not visible to this tenant' });
        return;
      }
    }

    res.json({ transaction: tx });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: 'Database error', detail: message });
  }
});

// GET /api/db/mints - admin sees all; tenant sees only mints they have interacted with
router.get('/mints', async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant;

    if (tenant.role === 'admin') {
      const result = await getPool().query('SELECT * FROM mints ORDER BY created_at DESC');
      res.json({ mints: result.rows });
      return;
    }

    // For tenants: derive the set of visible mints from their transactions.
    const txResult = await getPool().query('SELECT mint, initiator, recipient FROM transactions');
    const rows = txResult.rows as TransactionRow[];
    const visibleTxs = filterTransactions(rows, tenant);
    const visibleMints = new Set(visibleTxs.map((tx) => tx.mint).filter(Boolean));

    if (visibleMints.size === 0) {
      res.json({ mints: [] });
      return;
    }

    const placeholders = Array.from(visibleMints)
      .map((_, i) => `$${i + 1}`)
      .join(', ');
    const mintResult = await getPool().query(
      `SELECT * FROM mints WHERE address IN (${placeholders}) ORDER BY created_at DESC`,
      Array.from(visibleMints)
    );
    res.json({ mints: mintResult.rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: 'Database error', detail: message });
  }
});

// GET /api/db/balances - escrow balances scoped to tenant-visible mints
router.get('/balances', async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant;
    const conditions: string[] = ['status = \'completed\''];
    const values: unknown[] = [];
    let idx = 1;

    const vis = buildVisibilityClause(tenant, idx);
    if (vis.clause) {
      conditions.push(vis.clause);
      values.push(...vis.values);
      idx = vis.nextIdx;
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const result = await getPool().query(
      `
      SELECT
        mint,
        SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END) AS total_deposits,
        SUM(CASE WHEN transaction_type = 'withdrawal' THEN amount ELSE 0 END) AS total_withdrawals,
        SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE -amount END) AS balance
      FROM transactions
      ${where}
      GROUP BY mint
      ORDER BY mint
      `,
      values
    );
    res.json({ balances: result.rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: 'Database error', detail: message });
  }
});

// GET /api/db/stats - aggregate stats scoped to tenant-visible transactions
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const tenant = req.tenant;
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const vis = buildVisibilityClause(tenant, idx);
    if (vis.clause) {
      conditions.push(vis.clause);
      values.push(...vis.values);
      idx = vis.nextIdx;
    }

    // idx is consumed; suppress lint warning.
    void idx;

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await getPool().query(
      `
      SELECT
        COUNT(*) AS total_transactions,
        SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END) AS total_deposits,
        SUM(CASE WHEN transaction_type = 'withdrawal' THEN amount ELSE 0 END) AS total_withdrawals,
        COUNT(DISTINCT mint) AS unique_mints
      FROM transactions
      ${where}
      `,
      values
    );
    res.json({ stats: result.rows[0] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: 'Database error', detail: message });
  }
});

// GET /api/db/query - execute a named preset query with optional parameters
router.get('/query', async (req: Request, res: Response) => {
  try {
    const { preset } = req.query;

    if (!preset || typeof preset !== 'string') {
      res.status(400).json({
        error: 'Bad request',
        detail: 'Query parameter "preset" is required',
        available: PRESET_METADATA,
      });
      return;
    }

    const rawParams = Object.fromEntries(
      Object.entries(req.query)
        .filter(([k]) => k !== 'preset')
        .map(([k, v]) => [k, String(v ?? '')])
    );

    const result = await runPreset(getPool(), preset, rawParams, req.tenant);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message.startsWith('Unknown preset') || message.includes('required') ? 400 : 500;
    res.status(status).json({ error: 'Query failed', detail: message });
  }
});

// GET /api/db/presets - list available query presets
router.get('/presets', (_req: Request, res: Response) => {
  res.json({ presets: PRESET_METADATA });
});

export default router;
