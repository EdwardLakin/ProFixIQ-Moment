import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentMomentPlan } from "@/lib/subscriptions";
import { canUseMomentFeature, FREE_MOMENT_LIMIT, getFeatureRequiredPlan, type MomentFeature } from "@/lib/moment-entitlements";

export { canUseMomentFeature, FREE_MOMENT_LIMIT };

export type UpgradeRequiredResponse = { ok: false; code: "upgrade_required"; requiredPlan: "plus" | "pro"; feature: MomentFeature; message: string };
export function buildUpgradeRequiredResponse(feature: MomentFeature): UpgradeRequiredResponse { const requiredPlan = getFeatureRequiredPlan(feature); return { ok:false, code:"upgrade_required", requiredPlan, feature, message:`This feature requires ${requiredPlan === "pro" ? "Pro" : "Plus"}. Upgrade to continue.`}; }

export async function getMomentFeatureAccess(feature: MomentFeature) { const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) return {ok:false as const,status:401 as const,response:{error:"Unauthorized"}}; const subscription=await getCurrentMomentPlan(user.id); if(!canUseMomentFeature(subscription.plan, feature)) return {ok:false as const,status:403 as const,response:buildUpgradeRequiredResponse(feature),userId:user.id,plan:subscription.plan}; return {ok:true as const,userId:user.id,plan:subscription.plan,subscription}; }
export async function requireMomentFeature(feature: MomentFeature) { return getMomentFeatureAccess(feature); }
export async function getMomentUsageSnapshot(userId: string, plan: "free"|"plus"|"pro") { const supabase=await createSupabaseServerClient(); const {count}=await supabase.from("moment_routes").select("id",{count:"exact",head:true}).eq("user_id",userId); const used=count??0; const limit=canUseMomentFeature(plan,"unlimited_moments")?null:FREE_MOMENT_LIMIT; return {usedMoments:used,momentLimit:limit,remainingMoments:limit===null?null:Math.max(limit-used,0)}; }
