import { Router } from 'express';

const router = Router();

/**
 * POST /charge
 * Body: { amount: number (positive integer, smallest currency unit), currency: string, token: string }
 * Stripe injected via dependency injection from index.js
 */
export function createChargeRouter(stripe) {
  const router = Router();

  router.post('/', async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured on this server' });
    }

    const { amount, currency, token } = req.body;

    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive integer' });
    }
    if (!currency || typeof currency !== 'string') {
      return res.status(400).json({ error: 'currency is required' });
    }
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'token is required' });
    }

    try {
      const charge = await stripe.charges.create({
        amount,
        currency: currency.toLowerCase(),
        source: token,
      });

      res.json({
        chargeId: charge.id,
        status: charge.status,
        amount: charge.amount,
        currency: charge.currency,
      });
    } catch (err) {
      if (err.type === 'StripeCardError') {
        return res.status(402).json({ error: err.message });
      }
      if (err.type === 'StripeInvalidRequestError') {
        return res.status(400).json({ error: err.message });
      }
      console.error('Stripe charge error:', err.message);
      res.status(502).json({ error: 'Payment processing failed' });
    }
  });

  return router;
}
