import { runMomentOrchestrator } from '../features/ai/orchestration/runMomentOrchestrator.ts';

const base = { selectedSignals: [], knownSupportNeeds: [], followUpHistory: [], recentRouteHistory: [], profileContext: '', sourceSurface: 'check_in', ageRange: '18_plus' };
const cases = [
  { text: 'My mom died a few years ago and I’m really sad. All my friends are making plans with their moms and I can’t.', must: ['sorry', 'mom'], not: ['Send me the exact problem'] },
  { text: 'I don’t understand my math homework and I feel stupid.', must: ['doesn\'t mean you\'re stupid', 'exact problem'], not: ['stay with this'] },
  { text: 'I have a science quiz tomorrow and I don’t understand the study guide.', must: ['exact problem', 'step by step'], not: ['missing her'] },
  { text: 'I need to start my essay but I keep avoiding it and now I hate myself for wasting the whole day.', must: ['shame spiral', 'essay about'], not: ['deep, personal way'] },
  { text: 'My friend left me out again and I want to text something mean because I’m hurt.', must: ['left out hurts', 'drafting one honest text'], not: ['No pressure to reply right away'] },
];

let failed = 0;
for (const c of cases) {
  const r = runMomentOrchestrator({ ...base, momentText: c.text });
  const output = [r.response.reflection, r.response.tinyNextStep, ...r.response.steps, r.response.supportiveNote].join(' ');
  for (const term of c.must) if (!output.toLowerCase().includes(term.toLowerCase())) { console.error('FAIL missing', term); failed++; }
  for (const term of c.not) if (output.toLowerCase().includes(term.toLowerCase())) { console.error('FAIL banned', term); failed++; }
}
if (failed) process.exit(1);
console.log('PASS: domain behavior smoke checks passed');
