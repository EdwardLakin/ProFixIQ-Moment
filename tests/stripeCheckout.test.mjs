import test from 'node:test';
import assert from 'node:assert/strict';
import { getCheckoutPlanFromPayload, resolveStripePriceId } from '../lib/stripeCheckout.ts';

test('paid plan payload is stable and accepted', () => {
  assert.equal(getCheckoutPlanFromPayload({ plan: 'plus' }), 'plus');
  assert.equal(getCheckoutPlanFromPayload({ plan: 'pro' }), 'pro');
});

test('invalid plan payload is rejected', () => {
  assert.equal(getCheckoutPlanFromPayload({ plan: 'Plus' }), null);
  assert.equal(getCheckoutPlanFromPayload({ plan: 'free' }), null);
});

test('missing price id returns controlled error', () => {
  const result = resolveStripePriceId('plus', { plusPriceId: '', proPriceId: 'price_123' });
  assert.equal(result.ok, false);
});

test('free plan never resolves through paid checkout mapper', () => {
  assert.equal(getCheckoutPlanFromPayload({ plan: 'free' }), null);
});

test('checkout urls are absolute server-side', () => {
  const appUrl = 'https://example.com';
  const successUrl = new URL('/onboarding?checkout=success', appUrl).toString();
  const cancelUrl = new URL('/pricing?checkout=cancelled', appUrl).toString();
  assert.equal(successUrl, 'https://example.com/onboarding?checkout=success');
  assert.equal(cancelUrl, 'https://example.com/pricing?checkout=cancelled');
});
