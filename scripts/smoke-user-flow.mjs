import { strict as assert } from 'node:assert';

const getPostSignupPath = ({ onboardingComplete }) => {
  if (!onboardingComplete) return '/onboarding';
  return '/dashboard';
};

assert.equal(getPostSignupPath({ plan: 'free', onboardingComplete: false }), '/onboarding');
assert.equal(getPostSignupPath({ plan: 'free', onboardingComplete: true }), '/dashboard');
assert.equal(getPostSignupPath({ plan: 'plus', onboardingComplete: false }), '/onboarding');
assert.equal(getPostSignupPath({ plan: 'pro', onboardingComplete: true }), '/dashboard');

const isDashboardAccessible = (plan) => ['/free', '/plus', '/pro'].includes(`/${plan}`);
assert.equal(isDashboardAccessible('free'), true);
assert.equal(isDashboardAccessible('plus'), true);
assert.equal(isDashboardAccessible('pro'), true);

const checkoutSuccessPath = ({ onboardingComplete }) => onboardingComplete ? '/dashboard' : '/onboarding';
assert.equal(checkoutSuccessPath({ onboardingComplete: false }), '/onboarding');
assert.equal(checkoutSuccessPath({ onboardingComplete: true }), '/dashboard');

console.log('PASS canonical user flow guards');
