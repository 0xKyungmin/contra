import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getAllTenants,
  adminRegisterTenant,
  grantPubkeys,
  revokePubkeys,
} from '../config/tenants.js';

const router = Router();

// All /api/admin endpoints require authentication and admin role.
router.use(authenticate);
router.use(requireAdmin);

// GET /api/admin/tenants - list all registered tenants
router.get('/tenants', (_req: Request, res: Response) => {
  const tenants = getAllTenants().map((t) => ({
    name: t.name,
    role: t.role,
    pubkeys: t.pubkeys,
    // Expose the API key only in admin listing so operators can distribute keys.
    apiKey: t.apiKey,
  }));
  res.json({ tenants });
});

// POST /api/admin/register - register a new named tenant
router.post('/register', (req: Request, res: Response) => {
  const { name, pubkey } = req.body as { name?: string; pubkey?: string };

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'Bad request', detail: '"name" is required' });
    return;
  }
  if (!pubkey || typeof pubkey !== 'string' || pubkey.trim().length === 0) {
    res.status(400).json({ error: 'Bad request', detail: '"pubkey" is required' });
    return;
  }

  const tenant = adminRegisterTenant(name.trim(), pubkey.trim());
  res.status(201).json({
    message: 'Tenant registered',
    tenant: {
      name: tenant.name,
      apiKey: tenant.apiKey,
      pubkeys: tenant.pubkeys,
      role: tenant.role,
    },
  });
});

// POST /api/admin/grant - add pubkeys to a tenant's visibility
router.post('/grant', (req: Request, res: Response) => {
  const { targetPubkey, grantPubkeys: pubkeysToGrant } = req.body as {
    targetPubkey?: string;
    grantPubkeys?: string[];
  };

  if (!targetPubkey || typeof targetPubkey !== 'string') {
    res.status(400).json({ error: 'Bad request', detail: '"targetPubkey" is required' });
    return;
  }
  if (!Array.isArray(pubkeysToGrant) || pubkeysToGrant.length === 0) {
    res.status(400).json({ error: 'Bad request', detail: '"grantPubkeys" must be a non-empty array' });
    return;
  }

  const updated = grantPubkeys(targetPubkey, pubkeysToGrant);
  if (!updated) {
    res.status(404).json({ error: 'Not found', detail: 'No tenant found for the given targetPubkey' });
    return;
  }

  res.json({
    message: 'Pubkeys granted',
    tenant: { name: updated.name, pubkeys: updated.pubkeys },
  });
});

// POST /api/admin/revoke - remove pubkeys from a tenant's visibility
router.post('/revoke', (req: Request, res: Response) => {
  const { targetPubkey, revokePubkeys: pubkeysToRevoke } = req.body as {
    targetPubkey?: string;
    revokePubkeys?: string[];
  };

  if (!targetPubkey || typeof targetPubkey !== 'string') {
    res.status(400).json({ error: 'Bad request', detail: '"targetPubkey" is required' });
    return;
  }
  if (!Array.isArray(pubkeysToRevoke) || pubkeysToRevoke.length === 0) {
    res.status(400).json({ error: 'Bad request', detail: '"revokePubkeys" must be a non-empty array' });
    return;
  }

  const updated = revokePubkeys(targetPubkey, pubkeysToRevoke);
  if (!updated) {
    res.status(404).json({ error: 'Not found', detail: 'No tenant found for the given targetPubkey' });
    return;
  }

  res.json({
    message: 'Pubkeys revoked',
    tenant: { name: updated.name, pubkeys: updated.pubkeys },
  });
});

export default router;
