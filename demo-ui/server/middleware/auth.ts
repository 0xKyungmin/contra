import type { Request, Response, NextFunction } from 'express';
import {
  getTenantByApiKey,
  getTenantByPubkey,
  autoRegisterTenant,
  type Tenant,
} from '../config/tenants.js';

// Extend Express Request to carry the resolved tenant.
declare global {
  namespace Express {
    interface Request {
      tenant: Tenant;
    }
  }
}

/**
 * Authentication middleware.
 *
 * Precedence:
 *   1. X-API-Key header -> look up by API key
 *   2. X-Wallet-Pubkey header -> look up by pubkey; auto-register if new
 *   3. Neither present -> 401
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'];
  const walletPubkey = req.headers['x-wallet-pubkey'];

  if (typeof apiKey === 'string' && apiKey.length > 0) {
    const tenant = getTenantByApiKey(apiKey);
    if (!tenant) {
      res.status(401).json({ error: 'Unauthorized', detail: 'Invalid API key' });
      return;
    }
    req.tenant = tenant;
    return next();
  }

  if (typeof walletPubkey === 'string' && walletPubkey.length > 0) {
    let tenant = getTenantByPubkey(walletPubkey);
    if (!tenant) {
      // Auto-register unknown wallets so Phantom users get in without a pre-issued key.
      tenant = autoRegisterTenant(walletPubkey);
    }
    req.tenant = tenant;
    return next();
  }

  res.status(401).json({
    error: 'Unauthorized',
    detail: 'Provide X-API-Key or X-Wallet-Pubkey header',
  });
}

/**
 * Authorization middleware factory.
 * Requires the request to have already passed through authenticate().
 * Rejects non-admin tenants with 403.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.tenant) {
    res.status(401).json({ error: 'Unauthorized', detail: 'Authentication required' });
    return;
  }
  if (req.tenant.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden', detail: 'Admin role required' });
    return;
  }
  next();
}
