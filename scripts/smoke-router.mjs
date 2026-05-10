import { readFileSync } from 'node:fs';

const contracts = readFileSync(new URL('../features/ai/contracts.ts', import.meta.url), 'utf8');
const idsMatch = contracts.match(/export const MOMENT_BRAIN_IDS = \[(.*?)\] as const;/s);
if (!idsMatch) throw new Error('Unable to parse MOMENT_BRAIN_IDS');
const knownBrainIds = new Set(Array.from(idsMatch[1].matchAll(/"([^"]+)"/g)).map((m) => m[1]));

const decide = (ageRange, text) => {
  const normalized = text.toLowerCase();
  const teen = ageRange && ageRange !== '18_plus';
  if (/(suicide|kill myself|self harm|hurt myself|abuse)/.test(normalized)) return 'safety_support_brain';
  if (/(grief|grieving|died|death|passed away|loss|miss (him|her|them)|mother'?s day|father'?s day|anniversary|can't stop crying)/.test(normalized)) return 'grief_support_brain';
  if (/(lonely|alone|isolated|disconnected)/.test(normalized)) return 'loneliness_support_brain';
  if (/(sad|hurts|heartbroken|emotional pain|crying)/.test(normalized)) return 'emotional_presence_brain';
  if (/(overwhelmed|flooded|spiraling|shutdown)/.test(normalized)) return 'overwhelm_grounding_brain';
  if (teen && /(finances|partner|marriage|taxes|workplace|dating)/.test(normalized)) return 'emotional_reset_brain';
  if (/(money|bills|budget|debt|taxes)/.test(normalized)) return 'finance_clarity_brain';
  if (/(partner|spouse|dating|breakup|marriage|boundary)/.test(normalized)) return 'relationship_reflection_brain';
  if (/(math|homework|class|test|teacher)/.test(normalized)) return normalized.includes('math') ? 'math_reset_brain' : 'school_overwhelm_brain';
  if (/\bboss\b|\bjob\b|\bburnout\b|\bdeadline\b|\bworkplace\b/.test(normalized)) return 'work_stress_brain';
  if (/(friend|drama|group chat|rumor|social)/.test(normalized)) return 'social_boundary_brain';
  if (/(start|stuck|avoid|procrast)/.test(normalized)) return 'task_start_brain';
  return 'emotional_reset_brain';
};

const cases = [
  ['18_plus', "my mom died years ago and Mother's Day tomorrow is crushing me", ['grief_support_brain']],
  ['18_plus', 'I feel lonely and disconnected tonight', ['loneliness_support_brain']],
  ['18_plus', 'my boss and deadlines are burning me out', ['work_stress_brain']],
  ['18_plus', 'I am panicking about bills and debt', ['finance_clarity_brain']],
  ['18_plus', 'I need a boundary with my partner after a fight', ['relationship_reflection_brain']],
  ['16_17', 'class and homework are too much and I cannot keep up', ['school_overwhelm_brain','overwhelm_grounding_brain']],
  ['13_15', 'math homework is making me spiral', ['math_reset_brain']],
  ['18_plus', "I'm overwhelmed and can't start anything", ['overwhelm_grounding_brain','task_start_brain']],
  ['18_plus', "I don't know, it's everything at once and mixed", ['emotional_reset_brain']],
  ['13_15', 'I am stressed about taxes and my marriage', ['emotional_reset_brain'], ['finance_clarity_brain','relationship_reflection_brain']],
];

let failed = 0;
for (const [age, text, allowed, reject = []] of cases) {
  const got = decide(age, text);
  const ok = allowed.includes(got) && !reject.includes(got);
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${got} <- ${text}`);
  if (!ok) failed++;
}

for (const id of knownBrainIds) {
  if (!knownBrainIds.has(id)) {
    console.error(`FAIL: unknown brain id ${id}`);
    failed++;
  }
}

const userFacingResponse = 'We can keep this gentle and pick one small next step together.';
const bannedTerms = ['brain id', 'route id', 'orchestration', 'fallback mode', 'support effectiveness', 'trace'];
for (const term of bannedTerms) {
  if (userFacingResponse.toLowerCase().includes(term)) {
    console.error(`FAIL: user-facing response leaked internal term: ${term}`);
    failed++;
  }
}

if (failed) process.exit(1);
console.log('PASS: smoke-router checks passed');
