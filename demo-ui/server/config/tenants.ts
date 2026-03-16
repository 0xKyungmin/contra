import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export interface Tenant {
  name: string;
  apiKey: string;
  pubkeys: string[];
  role: 'admin' | 'tenant';
}

// Deterministic keypairs for demo tenants generated from fixed seeds.
// Seeds are 32-byte buffers derived by repeating a byte pattern.
function keypairFromSeed(byte: number): Keypair {
  const seed = new Uint8Array(32).fill(byte);
  return Keypair.fromSeed(seed);
}

const aliceKeypair = keypairFromSeed(0x01);
const bobKeypair = keypairFromSeed(0x02);
const carolKeypair = keypairFromSeed(0x03);
const daveKeypair = keypairFromSeed(0x04);

// Export demo keypairs so the frontend can use them for testing.
export const demoKeypairs = {
  alice: {
    pubkey: aliceKeypair.publicKey.toBase58(),
    secretKey: bs58.encode(aliceKeypair.secretKey),
  },
  bob: {
    pubkey: bobKeypair.publicKey.toBase58(),
    secretKey: bs58.encode(bobKeypair.secretKey),
  },
  carol: {
    pubkey: carolKeypair.publicKey.toBase58(),
    secretKey: bs58.encode(carolKeypair.secretKey),
  },
  dave: {
    pubkey: daveKeypair.publicKey.toBase58(),
    secretKey: bs58.encode(daveKeypair.secretKey),
  },
};

// Mutable in-memory tenant registry.
// Keyed by apiKey for O(1) lookup by API key.
const tenantsByApiKey = new Map<string, Tenant>();
// Secondary index: pubkey -> apiKey for wallet-based lookup.
const apiKeyByPubkey = new Map<string, string>();

function registerTenant(tenant: Tenant): void {
  tenantsByApiKey.set(tenant.apiKey, tenant);
  for (const pk of tenant.pubkeys) {
    apiKeyByPubkey.set(pk, tenant.apiKey);
  }
}

// Seed the registry with pre-configured tenants.
const adminApiKey = process.env.ADMIN_API_KEY ?? 'contra-admin-key-2024';

registerTenant({
  name: 'Operator',
  apiKey: adminApiKey,
  pubkeys: ['9gj4F8rjHjUdzRB27timWQurP7x3JnDMxD2uyFepAqDo'],
  role: 'admin',
});

registerTenant({
  name: 'Alice',
  apiKey: 'contra-alice-key-2024',
  pubkeys: [aliceKeypair.publicKey.toBase58()],
  role: 'tenant',
});

registerTenant({
  name: 'Bob',
  apiKey: 'contra-bob-key-2024',
  pubkeys: [bobKeypair.publicKey.toBase58()],
  role: 'tenant',
});

registerTenant({
  name: 'Carol',
  apiKey: 'contra-carol-key-2024',
  pubkeys: [carolKeypair.publicKey.toBase58()],
  role: 'tenant',
});

registerTenant({
  name: 'Dave',
  apiKey: 'contra-dave-key-2024',
  pubkeys: [daveKeypair.publicKey.toBase58()],
  role: 'tenant',
});

/** Look up a tenant by their API key. Returns undefined if not found. */
export function getTenantByApiKey(apiKey: string): Tenant | undefined {
  return tenantsByApiKey.get(apiKey);
}

/** Look up a tenant by a wallet pubkey. Returns undefined if not found. */
export function getTenantByPubkey(pubkey: string): Tenant | undefined {
  const key = apiKeyByPubkey.get(pubkey);
  if (!key) return undefined;
  return tenantsByApiKey.get(key);
}

/**
 * Auto-register a new tenant for a previously-unseen wallet pubkey.
 * Returns the newly created Tenant (with a freshly generated API key).
 */
export function autoRegisterTenant(pubkey: string): Tenant {
  // Generate a stable-ish API key from the pubkey prefix.
  const apiKey = `contra-dynamic-${pubkey.slice(0, 8)}-${Date.now()}`;
  const tenant: Tenant = {
    name: `Wallet ${pubkey.slice(0, 8)}`,
    apiKey,
    pubkeys: [pubkey],
    role: 'tenant',
  };
  registerTenant(tenant);
  return tenant;
}

/**
 * Register a named tenant with a specific pubkey (used by admin endpoint).
 * Returns the created Tenant including its generated API key.
 */
export function adminRegisterTenant(name: string, pubkey: string): Tenant {
  const apiKey = `contra-tenant-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  const tenant: Tenant = {
    name,
    apiKey,
    pubkeys: [pubkey],
    role: 'tenant',
  };
  registerTenant(tenant);
  return tenant;
}

/** Add pubkeys to a tenant's visibility list (admin grant). */
export function grantPubkeys(targetPubkey: string, grantPubkeys: string[]): Tenant | undefined {
  const apiKey = apiKeyByPubkey.get(targetPubkey);
  if (!apiKey) return undefined;
  const tenant = tenantsByApiKey.get(apiKey);
  if (!tenant) return undefined;
  for (const pk of grantPubkeys) {
    if (!tenant.pubkeys.includes(pk)) {
      tenant.pubkeys.push(pk);
      apiKeyByPubkey.set(pk, apiKey);
    }
  }
  return tenant;
}

/** Remove pubkeys from a tenant's visibility list (admin revoke). */
export function revokePubkeys(targetPubkey: string, revokePubkeys: string[]): Tenant | undefined {
  const apiKey = apiKeyByPubkey.get(targetPubkey);
  if (!apiKey) return undefined;
  const tenant = tenantsByApiKey.get(apiKey);
  if (!tenant) return undefined;
  for (const pk of revokePubkeys) {
    // Do not remove the tenant's own primary pubkey to avoid orphaning the record.
    const idx = tenant.pubkeys.indexOf(pk);
    if (idx !== -1) {
      tenant.pubkeys.splice(idx, 1);
      apiKeyByPubkey.delete(pk);
    }
  }
  return tenant;
}

/** Return a snapshot of all registered tenants. */
export function getAllTenants(): Tenant[] {
  return Array.from(tenantsByApiKey.values());
}
