import { runMomentOrchestrator } from '../features/ai/orchestration/runMomentOrchestrator.ts';

const scenarios = [
  {
    name: 'grief weighting dominant',
    input: { momentText: "My mom died and Mother's Day hurts.", selectedSignals: [], ageRange: '18_plus' },
    assert: (result) => result.trace.unifiedCognition.capabilityWeights.griefPresence >= 0.9,
  },
  {
    name: 'homework tutor dominant',
    input: { momentText: 'I do not understand my math homework and feel stupid.', selectedSignals: [], ageRange: '13_15' },
    assert: (result) => result.trace.unifiedCognition.capabilityWeights.tutor >= 0.9,
  },
  {
    name: 'conflict regulation dominant',
    input: { momentText: 'My friend excluded me from the group chat and I want to lash out.', selectedSignals: [], ageRange: '16_17' },
    assert: (result) => result.trace.unifiedCognition.capabilityWeights.conflictRegulation >= 0.85,
  },
  {
    name: 'essay avoidance blend',
    input: { momentText: 'I keep avoiding my essay because I feel stupid and behind.', selectedSignals: ['stuck'], ageRange: '16_17' },
    assert: (result) => result.trace.unifiedCognition.capabilityWeights.shameReduction > 0.5 && result.trace.unifiedCognition.capabilityWeights.taskDecomposition > 0.5,
  },
  {
    name: 'grief memory suppressed in tutoring',
    input: { momentText: 'Can you help me with science quiz review?', selectedSignals: [], ageRange: '16_17', profileContext: 'Grief around important moments and loss of mom' },
    assert: (result) => result.trace.unifiedCognition.memoryRelevance.applied === false,
  },
  {
    name: 'grief to tutoring transition hard reset',
    input: { momentText: 'I do not understand my science homework at all.', selectedSignals: [], ageRange: '16_17', profileContext: 'My mom died and this grief has been heavy.', knownSupportNeeds: ['My mom died and this grief has been heavy.'], recentRouteHistory: ['grief_support_brain'] },
    assert: (result) => result.trace.currentDomain === 'tutor' && result.trace.continuitySuppressedReason === 'domain_shift' && result.trace.emotionalCarryoverStrength <= 0.1,
  },
  {
    name: 'tutoring to conflict transition',
    input: { momentText: 'My friend keeps excluding me and I want to send a mean text.', selectedSignals: [], ageRange: '16_17', knownSupportNeeds: ['I need help with math homework'], recentRouteHistory: ['tutor_brain'] },
    assert: (result) => result.trace.currentDomain === 'conflict' && result.trace.continuitySuppressedReason === 'domain_shift',
  },
  {
    name: 'conflict to grief transition',
    input: { momentText: 'Today I miss my mom and the loss hurts all over again.', selectedSignals: [], ageRange: '16_17', knownSupportNeeds: ['group chat conflict'], recentRouteHistory: ['social_boundary_brain'] },
    assert: (result) => result.trace.currentDomain === 'grief_loss' && result.trace.continuitySuppressedReason === 'domain_shift',
  },
];

const bannedCadence = ['we can', 'saved quietly', 'before we do anything with it'];
let failed = 0;
for (const scenario of scenarios) {
  const result = runMomentOrchestrator(scenario.input);
  const ok = scenario.assert(result);
  if (!ok) {
    console.error(`FAIL: ${scenario.name}`);
    failed += 1;
  } else {
    console.log(`PASS: ${scenario.name}`);
  }

  const responseText = `${result.response.reflection} ${result.response.tinyNextStep}`.toLowerCase();
  if (bannedCadence.some((phrase) => responseText.includes(phrase))) {
    console.error(`FAIL: ${scenario.name} includes repetitive cadence phrase`);
    failed += 1;
  }

  if (/capabilityweights|memoryrelevance|trace/.test(responseText)) {
    console.error(`FAIL: ${scenario.name} leaked internal metadata`);
    failed += 1;
  }
}

if (failed) process.exit(1);
console.log('PASS: unified cognition smoke checks passed');
