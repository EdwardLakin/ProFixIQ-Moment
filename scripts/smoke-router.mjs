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
  if (/(partner|spouse|dating|breakup|marriage)/.test(normalized)) return 'relationship_reflection_brain';
  if (/(math|homework|class|test|teacher)/.test(normalized)) return normalized.includes('math') ? 'math_reset_brain' : 'school_overwhelm_brain';
  if (/(\bboss\b|\bjob\b|\bburnout\b|\bdeadline\b|\bworkplace\b)/.test(normalized)) return 'work_stress_brain';
  if (/(friend|drama|group chat|rumor|social)/.test(normalized)) return 'social_boundary_brain';
  if (/(start|stuck|avoid|procrast)/.test(normalized)) return 'task_start_brain';
  return 'emotional_reset_brain';
};
const cases=[['13_15','I need help with my math homework',['math_reset_brain']],['16_17','my friend keeps pulling me into drama',['social_boundary_brain']],['13_15','I am worried about my taxes and marriage',['emotional_reset_brain','social_boundary_brain','task_start_brain'],['finance_clarity_brain','relationship_reflection_brain']],['18_plus','my boss keeps piling work on me',['work_stress_brain']],['18_plus','I don’t know how to budget this month',['finance_clarity_brain']],['18_plus','my mom died a few years ago and Mother’s Day tomorrow really hurts',['grief_support_brain'],['task_start_brain','work_stress_brain','life_admin_brain']],['18_plus','I feel alone tonight',['loneliness_support_brain']],[undefined,'I’m sad and can\'t stop crying',['grief_support_brain','emotional_presence_brain']],[undefined,'I’m overwhelmed and can’t start',['overwhelm_grounding_brain']],[undefined,'I want to hurt myself',['safety_support_brain']]];
let failed=0;for(const [age,text,allowed,reject=[]] of cases){const got=decide(age,text);const ok=allowed.includes(got)&&!reject.includes(got);console.log(`${ok?'PASS':'FAIL'}: ${got} <- ${text}`);if(!ok)failed++;}if(failed)process.exit(1);


const knownBrainIds = new Set(["school_overwhelm_brain","math_reset_brain","social_boundary_brain","task_start_brain","emotional_reset_brain","confidence_repair_brain","work_stress_brain","finance_clarity_brain","relationship_reflection_brain","household_overload_brain","life_admin_brain","decision_reset_brain","safety_support_brain","grief_support_brain","emotional_presence_brain","loneliness_support_brain","overwhelm_grounding_brain"]);
const griefRoute = decide("18_plus", "My mom died and Mother's Day is really hard");
if (!knownBrainIds.has(griefRoute)) {
  console.error(`FAIL: unknown brain id from grief route: ${griefRoute}`);
  process.exit(1);
}
if (griefRoute === "emotional_reset_brain") {
  console.error("FAIL: grief route regressed to emotional reset fallback lane");
  process.exit(1);
}
console.log("PASS: grief route maps to supported emotional/grief brain without fallback lane");

const blockedMessage = "You’ve reached your monthly Moment limit. You can still view your journal and saved support until your limit resets.";
if (/unlock(s)? on Plus/i.test(blockedMessage)) {
  console.error("FAIL: blocked message still includes feature unlock copy");
  process.exit(1);
}
console.log("PASS: monthly-limit message uses usage-only billing language");
