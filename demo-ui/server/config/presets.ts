import type { Tenant } from './tenants.js';
import type { Pool } from 'pg';

export interface QueryPresetMeta {
  id: string;
  name: string;
  description: string;
  params?: PresetParam[];
}

export interface PresetParam {
  name: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  default?: string | number;
}

export interface PresetResult {
  data: Record<string, unknown>[];
  sql: string;
  params: unknown[];
}

export const PRESET_METADATA: QueryPresetMeta[] = [
  {
    id: 'my-transactions',
    name: 'My Transactions',
    description: 'All transactions where you are the initiator or recipient',
  },
  {
    id: 'my-deposits',
    name: 'My Deposits',
    description: 'Deposit transactions associated with your wallets',
  },
  {
    id: 'my-withdrawals',
    name: 'My Withdrawals',
    description: 'Withdrawal transactions associated with your wallets',
  },
  {
    id: 'by-mint',
    name: 'By Mint',
    description: 'Filter transactions by mint address',
    params: [{ name: 'mint', type: 'text' }],
  },
  {
    id: 'by-recipient',
    name: 'By Recipient',
    description: 'Filter transactions by recipient address',
    params: [{ name: 'recipient', type: 'text' }],
  },
  {
    id: 'recent',
    name: 'Recent',
    description: 'Most recent N transactions',
    params: [{ name: 'limit', type: 'number', default: 10 }],
  },
  {
    id: 'by-status',
    name: 'By Status',
    description: 'Filter transactions by status',
    params: [
      {
        name: 'status',
        type: 'select',
        options: ['pending', 'processing', 'completed', 'failed'],
      },
    ],
  },
  {
    id: 'by-date-range',
    name: 'By Date Range',
    description: 'Filter transactions within a date range',
    params: [
      { name: 'from', type: 'text' },
      { name: 'to', type: 'text' },
    ],
  },
  {
    id: 'large-transfers',
    name: 'Large Transfers',
    description: 'Transfers above a minimum amount threshold',
    params: [{ name: 'min_amount', type: 'number', default: 1000000 }],
  },
];

/**
 * Build tenant-scoped visibility conditions.
 * Admin tenants see everything; regular tenants are restricted to their pubkeys.
 */
function buildTenantConditions(
  tenant: Tenant,
  startIdx: number
): { clause: string; values: unknown[]; nextIdx: number } {
  if (tenant.role === 'admin') {
    return { clause: '', values: [], nextIdx: startIdx };
  }

  const placeholders = tenant.pubkeys
    .map((_, i) => `$${startIdx + i}`)
    .join(', ');

  const clause =
    tenant.pubkeys.length === 0
      ? '(1=0)' // no pubkeys -> see nothing
      : `(initiator IN (${placeholders}) OR recipient IN (${placeholders}))`;

  return {
    clause,
    values: tenant.pubkeys,
    nextIdx: startIdx + tenant.pubkeys.length,
  };
}

/** Execute a named preset query with the given parameters against the pool. */
export async function runPreset(
  pool: Pool,
  presetId: string,
  rawParams: Record<string, string>,
  tenant: Tenant
): Promise<PresetResult> {
  const values: unknown[] = [];
  let idx = 1;

  const tenantCond = buildTenantConditions(tenant, idx);
  values.push(...tenantCond.values);
  idx = tenantCond.nextIdx;

  const tenantWhere = tenantCond.clause
    ? `(${tenantCond.clause})`
    : '';

  function and(extra: string): string {
    if (!tenantWhere && !extra) return '';
    if (!tenantWhere) return `WHERE ${extra}`;
    if (!extra) return `WHERE ${tenantWhere}`;
    return `WHERE ${tenantWhere} AND ${extra}`;
  }

  let sql: string;

  switch (presetId) {
    case 'my-transactions': {
      sql = `SELECT * FROM transactions ${and('')} ORDER BY created_at DESC LIMIT 100`;
      break;
    }

    case 'my-deposits': {
      const typeCond = `transaction_type = $${idx++}`;
      values.push('deposit');
      sql = `SELECT * FROM transactions ${and(typeCond)} ORDER BY created_at DESC LIMIT 100`;
      break;
    }

    case 'my-withdrawals': {
      const typeCond = `transaction_type = $${idx++}`;
      values.push('withdrawal');
      sql = `SELECT * FROM transactions ${and(typeCond)} ORDER BY created_at DESC LIMIT 100`;
      break;
    }

    case 'by-mint': {
      const mint = rawParams['mint'];
      if (!mint) throw new Error('Parameter "mint" is required');
      const mintCond = `mint = $${idx++}`;
      values.push(mint);
      sql = `SELECT * FROM transactions ${and(mintCond)} ORDER BY created_at DESC LIMIT 100`;
      break;
    }

    case 'by-recipient': {
      const recipient = rawParams['recipient'];
      if (!recipient) throw new Error('Parameter "recipient" is required');
      const recipientCond = `recipient = $${idx++}`;
      values.push(recipient);
      sql = `SELECT * FROM transactions ${and(recipientCond)} ORDER BY created_at DESC LIMIT 100`;
      break;
    }

    case 'recent': {
      const limit = Math.min(Math.max(parseInt(rawParams['limit'] ?? '10', 10), 1), 500);
      const limitPlaceholder = `$${idx++}`;
      values.push(limit);
      sql = `SELECT * FROM transactions ${and('')} ORDER BY created_at DESC LIMIT ${limitPlaceholder}`;
      break;
    }

    case 'by-status': {
      const status = rawParams['status'];
      if (!status) throw new Error('Parameter "status" is required');
      const allowed = ['pending', 'processing', 'completed', 'failed'];
      if (!allowed.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${allowed.join(', ')}`);
      }
      const statusCond = `status = $${idx++}`;
      values.push(status);
      sql = `SELECT * FROM transactions ${and(statusCond)} ORDER BY created_at DESC LIMIT 100`;
      break;
    }

    case 'by-date-range': {
      const from = rawParams['from'];
      const to = rawParams['to'];
      if (!from || !to) throw new Error('Parameters "from" and "to" are required');
      const dateCond = `created_at >= $${idx++} AND created_at <= $${idx++}`;
      values.push(from, to);
      sql = `SELECT * FROM transactions ${and(dateCond)} ORDER BY created_at DESC LIMIT 500`;
      break;
    }

    case 'large-transfers': {
      const minAmount = parseInt(rawParams['min_amount'] ?? '1000000', 10);
      if (isNaN(minAmount)) throw new Error('Parameter "min_amount" must be a number');
      const amountCond = `amount >= $${idx++}`;
      values.push(minAmount);
      sql = `SELECT * FROM transactions ${and(amountCond)} ORDER BY amount DESC LIMIT 100`;
      break;
    }

    default:
      throw new Error(`Unknown preset: ${presetId}`);
  }

  const result = await pool.query(sql, values);
  return { data: result.rows, sql, params: values };
}
