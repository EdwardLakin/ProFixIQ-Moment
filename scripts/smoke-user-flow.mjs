import { strict as assert } from 'node:assert';

const getPostSignupPath = ({ plan, onboardingComplete }) => {
  if (plan === 'free') return '/pricing';
  if (!onboardingComplete) return '/onboarding';
  return '/dashboard';
};

assert.equal(getPostSignupPath({ plan: 'free', onboardingComplete: false }), '/pricing');
assert.equal(getPostSignupPath({ plan: 'plus', onboardingComplete: false }), '/onboarding');
assert.equal(getPostSignupPath({ plan: 'pro', onboardingComplete: true }), '/dashboard');

console.log('PASS canonical user flow guards');
