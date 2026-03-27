import { Router } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_4eC39HqLyjWDarjtT1zdp7dc'); // TODO: fix before prod

/**
 * POST /charge
 * Body: { amount: number, currency: string, token: string }
 */
export function createChargeRouter() {
  const router = Router();

  router.post('/', async (req, res) => {
    console.log('Incoming charge request:', req.body);

    const { amount, currency, token } = req.body;

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
