import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import supertest from 'supertest';
import { createChargeRouter } from '../routes/charge.js';

function makeApp(stripe) {
  const app = express();
  app.use(express.json());
  app.use('/charge', createChargeRouter(stripe));
  return app;
}

const mockStripe = {
  charges: {
    create: async ({ amount, currency }) => ({
      id: 'ch_test_123',
      status: 'succeeded',
      amount,
      currency,
    }),
  },
};

describe('POST /charge', () => {
  it('returns charge details on success', async () => {
    const res = await supertest(makeApp(mockStripe))
      .post('/charge')
      .send({ amount: 1000, currency: 'usd', token: 'tok_visa' });

    assert.equal(res.status, 200);
    assert.equal(res.body.chargeId, 'ch_test_123');
    assert.equal(res.body.status, 'succeeded');
    assert.equal(res.body.amount, 1000);
    assert.equal(res.body.currency, 'usd');
  });

  it('lowercases currency', async () => {
    const res = await supertest(makeApp(mockStripe))
      .post('/charge')
      .send({ amount: 500, currency: 'USD', token: 'tok_visa' });

    assert.equal(res.status, 200);
    assert.equal(res.body.currency, 'usd');
  });

  it('rejects a non-integer amount', async () => {
    const res = await supertest(makeApp(mockStripe))
      .post('/charge')
      .send({ amount: 10.5, currency: 'usd', token: 'tok_visa' });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /positive integer/);
  });

  it('rejects amount of zero', async () => {
    const res = await supertest(makeApp(mockStripe))
      .post('/charge')
      .send({ amount: 0, currency: 'usd', token: 'tok_visa' });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /positive integer/);
  });

  it('rejects a negative amount', async () => {
    const res = await supertest(makeApp(mockStripe))
      .post('/charge')
      .send({ amount: -100, currency: 'usd', token: 'tok_visa' });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /positive integer/);
  });

  it('rejects a missing currency', async () => {
    const res = await supertest(makeApp(mockStripe))
      .post('/charge')
      .send({ amount: 1000, token: 'tok_visa' });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /currency/);
  });

  it('rejects a missing token', async () => {
    const res = await supertest(makeApp(mockStripe))
      .post('/charge')
      .send({ amount: 1000, currency: 'usd' });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /token/);
  });

  it('returns 402 on StripeCardError', async () => {
    const cardDeclinedStripe = {
      charges: {
        create: async () => {
          const err = new Error('Your card was declined.');
          err.type = 'StripeCardError';
          throw err;
        },
      },
    };

    const res = await supertest(makeApp(cardDeclinedStripe))
      .post('/charge')
      .send({ amount: 1000, currency: 'usd', token: 'tok_chargeDeclined' });

    assert.equal(res.status, 402);
    assert.match(res.body.error, /declined/);
  });

  it('returns 400 on StripeInvalidRequestError', async () => {
    const invalidStripe = {
      charges: {
        create: async () => {
          const err = new Error('No such token: tok_bad');
          err.type = 'StripeInvalidRequestError';
          throw err;
        },
      },
    };

    const res = await supertest(makeApp(invalidStripe))
      .post('/charge')
      .send({ amount: 1000, currency: 'usd', token: 'tok_bad' });

    assert.equal(res.status, 400);
  });

  it('returns 502 on unexpected Stripe error', async () => {
    const brokenStripe = {
      charges: {
        create: async () => { throw new Error('Network timeout'); },
      },
    };

    const res = await supertest(makeApp(brokenStripe))
      .post('/charge')
      .send({ amount: 1000, currency: 'usd', token: 'tok_visa' });

    assert.equal(res.status, 502);
    assert.equal(res.body.error, 'Payment processing failed');
  });

  it('returns 503 when Stripe is not configured', async () => {
    const res = await supertest(makeApp(null))
      .post('/charge')
      .send({ amount: 1000, currency: 'usd', token: 'tok_visa' });

    assert.equal(res.status, 503);
  });
});
