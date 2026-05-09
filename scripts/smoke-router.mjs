const decide = (ageRange, text) => {
  const normalized = text.toLowerCase();
  const teen = ageRange && ageRange !== '18_plus';
  if (/(suicide|kill myself|self harm|hurt myself|abuse)/.test(normalized)) return 'safety_support_brain';
  if (teen && /(finances|partner|marriage|taxes|workplace|dating)/.test(normalized)) return 'emotional_reset_brain';
  if (/(money|bills|budget|debt|taxes)/.test(normalized)) return 'finance_clarity_brain';
  if (/(partner|spouse|dating|breakup|marriage)/.test(normalized)) return 'relationship_reflection_brain';
  if (/(math|homework|class|test|teacher)/.test(normalized)) return normalized.includes('math') ? 'math_reset_brain' : 'school_overwhelm_brain';
  if (/(\bboss\b|\bjob\b|\bburnout\b|\bdeadline\b|\bworkplace\b)/.test(normalized)) return 'work_stress_brain';
  if (/(friend|drama|group chat|rumor|social)/.test(normalized)) return 'social_boundary_brain';
  if (/(start|stuck|avoid|procrast)/.test(normalized)) return 'task_start_brain';
  return 'emotional_reset_brain';
};
const cases=[['13_15','I need help with my math homework',['math_reset_brain']],['16_17','my friend keeps pulling me into drama',['social_boundary_brain']],['13_15','I am worried about my taxes and marriage',['emotional_reset_brain','social_boundary_brain','task_start_brain'],['finance_clarity_brain','relationship_reflection_brain']],['18_plus','my boss keeps piling work on me',['work_stress_brain']],['18_plus','I don’t know how to budget this month',['finance_clarity_brain']],['18_plus','I need to talk to my partner but I’m overwhelmed',['relationship_reflection_brain']],[undefined,'I’m overwhelmed and can’t start',['emotional_reset_brain','task_start_brain']],[undefined,'I want to hurt myself',['safety_support_brain']]];
let failed=0;for(const [age,text,allowed,reject=[]] of cases){const got=decide(age,text);const ok=allowed.includes(got)&&!reject.includes(got);console.log(`${ok?'PASS':'FAIL'}: ${got} <- ${text}`);if(!ok)failed++;}if(failed)process.exit(1);
