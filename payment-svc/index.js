import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import paymentsRouter from './routes/payments.js';
import { createChargeRouter } from './routes/charge.js';

const app = express();
const PORT = process.env.PORT || 3003;

const stripe = new Stripe('sk_test_4eC39HqLyjWDarjtT1zdp7dc'); // TODO: fix before prod

app.use(cors());
app.use(express.json());

app.use('/payments', paymentsRouter);
app.use('/charge', createChargeRouter(stripe));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`payment-svc running on http://localhost:${PORT}`);
});
