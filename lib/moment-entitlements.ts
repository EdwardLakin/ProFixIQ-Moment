import { type MomentPlan } from "@/lib/plans";

export const FREE_MOMENT_LIMIT = 10;
export const MOMENT_FEATURES = ["unlimited_moments","ai_basic_reflection","ai_deep_support","goals","pattern_insights","advanced_insights","export_summaries","personalization"] as const;
export type MomentFeature = (typeof MOMENT_FEATURES)[number];

type EntitlementMap = Record<MomentFeature, boolean>;

const PLAN_ENTITLEMENTS: Record<MomentPlan, EntitlementMap> = { free: { unlimited_moments:false, ai_basic_reflection:true, ai_deep_support:false, goals:false, pattern_insights:false, advanced_insights:false, export_summaries:false, personalization:false }, plus: { unlimited_moments:true, ai_basic_reflection:true, ai_deep_support:true, goals:true, pattern_insights:true, advanced_insights:false, export_summaries:false, personalization:true }, pro: { unlimited_moments:true, ai_basic_reflection:true, ai_deep_support:true, goals:true, pattern_insights:true, advanced_insights:true, export_summaries:true, personalization:true } };
const FEATURE_MIN_PLAN: Record<MomentFeature, MomentPlan> = { unlimited_moments:"plus", ai_basic_reflection:"free", ai_deep_support:"plus", goals:"plus", pattern_insights:"plus", advanced_insights:"pro", export_summaries:"pro", personalization:"plus" };

export function getMomentEntitlements(plan: MomentPlan): EntitlementMap { return PLAN_ENTITLEMENTS[plan]; }
export function canUseMomentFeature(plan: MomentPlan, feature: MomentFeature): boolean { return PLAN_ENTITLEMENTS[plan][feature]; }
export function getFeatureRequiredPlan(feature: MomentFeature): "plus" | "pro" { return FEATURE_MIN_PLAN[feature] === "pro" ? "pro" : "plus"; }
