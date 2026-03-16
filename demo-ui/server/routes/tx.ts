import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import bs58 from 'bs58';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All /api/tx endpoints require authentication.
router.use(authenticate);

function getAdminKeypair(): Keypair {
  const key = process.env.ADMIN_PRIVATE_KEY;
  if (!key) throw new Error('ADMIN_PRIVATE_KEY is not set');
  const decoded = bs58.decode(key);
  return Keypair.fromSecretKey(decoded);
}

function getConnection(): Connection {
  const url = process.env.GATEWAY_URL ?? 'http://localhost:8899';
  return new Connection(url, 'confirmed');
}

// POST /api/tx/transfer - sign and send SPL token transfer
router.post('/transfer', async (req: Request, res: Response) => {
  try {
    const { mint, recipient, amount } = req.body as {
      mint: string;
      recipient: string;
      amount: number;
    };

    if (!mint || !recipient || amount == null) {
      res.status(400).json({ error: 'mint, recipient, and amount are required' });
      return;
    }

    const connection = getConnection();
    const admin = getAdminKeypair();
    const mintPubkey = new PublicKey(mint);
    const recipientPubkey = new PublicKey(recipient);

    const sourceAta = getAssociatedTokenAddressSync(mintPubkey, admin.publicKey);
    const destinationAta = getAssociatedTokenAddressSync(mintPubkey, recipientPubkey);

    const ix = createTransferInstruction(
      sourceAta,
      destinationAta,
      admin.publicKey,
      BigInt(amount)
    );

    const tx = new Transaction().add(ix);
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = admin.publicKey;
    tx.sign(admin);

    const signature = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: true,
    });

    // Record the initiating tenant for audit purposes.
    const initiator = req.tenant.pubkeys[0] ?? 'unknown';
    res.json({ signature, initiator });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: 'Transfer failed', detail: message });
  }
});

// POST /api/tx/create-ata - create ATA if not exists
router.post('/create-ata', async (req: Request, res: Response) => {
  try {
    const { mint, owner } = req.body as { mint: string; owner: string };

    if (!mint || !owner) {
      res.status(400).json({ error: 'mint and owner are required' });
      return;
    }

    const connection = getConnection();
    const admin = getAdminKeypair();
    const mintPubkey = new PublicKey(mint);
    const ownerPubkey = new PublicKey(owner);

    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      admin,
      mintPubkey,
      ownerPubkey
    );

    res.json({ ata: ata.address.toBase58() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: 'Create ATA failed', detail: message });
  }
});

export default router;
