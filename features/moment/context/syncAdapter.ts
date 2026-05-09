import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { MomentEnvironmentState } from "@/features/moment/context/types";

type SyncResult = "skipped" | "synced" | "failed";
const PREFERENCE_KEY = "moment_environment";

function mergeEnvironmentState(local: MomentEnvironmentState, remote: MomentEnvironmentState): MomentEnvironmentState {
  return {
    recentEmotionalState: local.recentEmotionalState ?? remote.recentEmotionalState,
    recentRoutePatterns: [...local.recentRoutePatterns, ...remote.recentRoutePatterns]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 12),
    unresolvedLoops: [...local.unresolvedLoops, ...remote.unresolvedLoops]
      .filter((loop, index, arr) => arr.findIndex((it) => it.id === loop.id) === index)
      .slice(0, 8),
    lastSuccessfulRestart: local.lastSuccessfulRestart ?? remote.lastSuccessfulRestart,
    activeRecoveryContext: local.activeRecoveryContext ?? remote.activeRecoveryContext,
  };
}

export async function syncEnvironmentState(local: MomentEnvironmentState): Promise<{ status: SyncResult; merged?: MomentEnvironmentState }> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { status: "skipped" };

    const { data: profile } = await supabase
      .from("moment_profiles")
      .select("id,preferences")
      .eq("id", session.user.id)
      .maybeSingle();

    const remote = ((profile?.preferences as Record<string, unknown> | null)?.[PREFERENCE_KEY] ?? null) as MomentEnvironmentState | null;
    const merged = remote ? mergeEnvironmentState(local, remote) : local;

    const currentPreferences = (profile?.preferences as Record<string, unknown> | null) ?? {};
    const nextPreferences = { ...currentPreferences, [PREFERENCE_KEY]: merged };

    await supabase.from("moment_profiles").upsert({ id: session.user.id, preferences: nextPreferences }, { onConflict: "id" });

    return { status: "synced", merged };
  } catch {
    return { status: "failed" };
  }
}
