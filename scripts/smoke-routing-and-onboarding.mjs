import { strict as assert } from 'node:assert';

const normalizeAgeRange = (value) => {
  if (value === 'under_13' || value === '13_15' || value === '16_17' || value === '18_plus') return value;
  return '18_plus';
};

const deriveTrustedAge = (profileAgeRange, clientAgeRange) => ({
  trusted: normalizeAgeRange(profileAgeRange),
  ignoredClient: clientAgeRange,
});

const mapOnboardingPayload = (selected) => ({
  focus_areas: selected,
  support_goals: selected,
});

const selected = ['task_start', 'calm_restart'];
const payload = mapOnboardingPayload(selected);
assert.deepEqual(payload.focus_areas, selected);
assert.deepEqual(payload.support_goals, selected);
console.log('PASS onboarding payload maps support_goals -> focus_areas/support_goals consistently');

const teenRoute = deriveTrustedAge('13_15', '18_plus');
assert.equal(teenRoute.trusted, '13_15');
console.log('PASS routing trusts profile age over client age (teen profile wins)');

const adultRoute = deriveTrustedAge('18_plus', 'under_13');
assert.equal(adultRoute.trusted, '18_plus');
console.log('PASS routing trusts profile age over client age (adult profile wins)');

const fallbackRoute = deriveTrustedAge('not_set', 'under_13');
assert.equal(fallbackRoute.trusted, '18_plus');
console.log('PASS routing defaults not_set profile age to 18_plus');
