import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

const gatewayUrl = () => process.env.GATEWAY_URL ?? 'http://localhost:8899';

// POST /api/rpc/proxy - forward JSON-RPC request to gateway
router.post('/proxy', async (req: Request, res: Response) => {
  try {
    const response = await fetch(gatewayUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(502).json({ error: 'Gateway unreachable', detail: message });
  }
});

// GET /api/rpc/slot - get latest slot
router.get('/slot', async (_req: Request, res: Response) => {
  try {
    const response = await fetch(gatewayUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSlot',
        params: [],
      }),
    });
    const data = await response.json() as { result?: unknown; error?: unknown };
    if (data.error) {
      res.status(502).json({ error: data.error });
      return;
    }
    res.json({ slot: data.result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(502).json({ error: 'Gateway unreachable', detail: message });
  }
});

// GET /api/rpc/balance/:pubkey - get account lamports via getAccountInfo
router.get('/balance/:pubkey', async (req: Request, res: Response) => {
  try {
    const { pubkey } = req.params;
    const response = await fetch(gatewayUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [pubkey, { encoding: 'base64' }],
      }),
    });
    const data = await response.json() as { result?: { value?: { lamports?: number } | null }; error?: unknown };
    if (data.error) {
      res.status(502).json({ error: data.error });
      return;
    }
    const lamports = data.result?.value?.lamports ?? 0;
    res.json({ balance: lamports });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(502).json({ error: 'Gateway unreachable', detail: message });
  }
});

export default router;
