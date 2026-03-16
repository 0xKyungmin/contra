import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), 'server', '.env') });
import express from 'express';
import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';

import rpcRouter from './routes/rpc.js';
import dbRouter from './routes/db.js';
import txRouter from './routes/tx.js';
import adminRouter from './routes/admin.js';

const app = express();
const PORT = process.env.PORT ?? 3435;

app.use(cors({ origin: 'http://localhost:3434' }));
app.use(express.json());

// Request logging with tenant context (populated after auth middleware runs).
app.use((req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now();
  _res.on('finish', () => {
    const tenantName = req.tenant?.name ?? 'unauthenticated';
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} ${_res.statusCode} ${duration}ms tenant=${tenantName}`
    );
  });
  next();
});

// Public endpoint - no auth required.
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authenticated routes.
app.use('/api/rpc', rpcRouter);
app.use('/api/db', dbRouter);
app.use('/api/tx', txRouter);
app.use('/api/admin', adminRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
