import type { Tenant } from '../config/tenants.js';

export interface TransactionRow {
  initiator?: string | null;
  recipient?: string | null;
  mint?: string | null;
  [key: string]: unknown;
}

/**
 * Filter a list of transaction rows based on tenant visibility.
 *
 * - Admin role: returns all rows unchanged.
 * - Tenant role: returns only rows where initiator OR recipient appears in
 *   the tenant's registered pubkeys.
 */
export function filterTransactions(
  transactions: TransactionRow[],
  tenant: Tenant
): TransactionRow[] {
  if (tenant.role === 'admin') return transactions;

  const allowed = new Set(tenant.pubkeys);
  return transactions.filter(
    (tx) =>
      (typeof tx.initiator === 'string' && allowed.has(tx.initiator)) ||
      (typeof tx.recipient === 'string' && allowed.has(tx.recipient))
  );
}

/**
 * Determine whether a tenant is permitted to see a specific mint.
 *
 * - Admin role: always true.
 * - Tenant role: true only if the tenant has at least one transaction involving
 *   that mint (checked via the provided transaction list).
 *
 * Pass the already-filtered transaction list or the full list for admin checks.
 */
export function canSeeMint(
  mint: string,
  tenant: Tenant,
  transactions: TransactionRow[]
): boolean {
  if (tenant.role === 'admin') return true;

  const allowed = new Set(tenant.pubkeys);
  return transactions.some(
    (tx) =>
      tx.mint === mint &&
      ((typeof tx.initiator === 'string' && allowed.has(tx.initiator)) ||
        (typeof tx.recipient === 'string' && allowed.has(tx.recipient)))
  );
}

/**
 * Build a SQL WHERE fragment that restricts rows to the tenant's pubkeys.
 *
 * Returns an object containing:
 *   - clause: the WHERE condition string (empty string for admin)
 *   - values: the parameter values to append to the query's value list
 *   - nextIdx: the next $N placeholder index after consuming these values
 *
 * The caller is responsible for inserting the clause into the query and
 * appending `values` to their parameter array starting at `startIdx`.
 */
export function buildVisibilityClause(
  tenant: Tenant,
  startIdx: number
): { clause: string; values: string[]; nextIdx: number } {
  if (tenant.role === 'admin') {
    return { clause: '', values: [], nextIdx: startIdx };
  }

  if (tenant.pubkeys.length === 0) {
    // Tenant has no pubkeys -> sees nothing.
    return { clause: '(1=0)', values: [], nextIdx: startIdx };
  }

  const placeholders = tenant.pubkeys.map((_, i) => `$${startIdx + i}`).join(', ');
  const clause = `(initiator IN (${placeholders}) OR recipient IN (${placeholders}))`;
  return {
    clause,
    values: tenant.pubkeys,
    nextIdx: startIdx + tenant.pubkeys.length,
  };
}
