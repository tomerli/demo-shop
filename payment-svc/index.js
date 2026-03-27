import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import paymentsRouter from './routes/payments.js';
import { createChargeRouter } from './routes/charge.js';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.use('/payments', paymentsRouter);
app.use('/charge', createChargeRouter());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`payment-svc running on http://localhost:${PORT}`);
});
