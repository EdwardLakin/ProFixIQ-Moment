# Moment Supabase RLS Audit (Security Hardening)

## Scope
- Migrations reviewed: `supabase/migrations/0001` through `0011`.
- Code paths reviewed for reads/writes: `app/api/**`, `app/dashboard/**`, `app/settings/**`, `app/parent/**`, `app/internal/**`, `features/**`, `lib/**`.
- Public tables audited: all `public.moment_*` tables.

## Table-by-table audit

| Table | Ownership Columns | RLS Enabled | Current Policies After Hardening | App Code Paths | Expected Access Model | Risks / Notes |
|---|---|---:|---|---|---|---|
| `moment_profiles` | `user_id` | Yes | own select/insert/update | `app/settings/page.tsx`, `lib/auth.ts`, `features/moment/context/syncAdapter.ts`, `app/dashboard/page.tsx` | User-only profile access; admin checks server-side only | `upsert` in sync adapter uses `id` conflict and may fail logically because uniqueness is on `user_id`; not an RLS bypass but potential data consistency issue. |
| `moment_guardian_links` | `student_user_id`, `guardian_user_id` | Yes | student select/insert/update | (No direct user UI writes found in requested paths) | Student-owned link management; guardian summary access derives from accepted + summary_access | Guardian cannot see raw entries via this table alone; keep as relationship gate only. |
| `moment_checkins` | `user_id` | Yes | own select/insert/update | (Indirectly via AI flows) | User-private emotional entries | Previously `FOR ALL`; now split policies to avoid implicit delete grants. |
| `moment_stuck_sessions` | `user_id` | Yes | own select/insert/update | `app/api/ai/stuck/route.ts`, `app/api/stuck-sessions/[id]/status/route.ts` | User-only | Previously `FOR ALL`; now explicit CRUD subset. |
| `moment_drama_pauses` | `user_id` | Yes | own select/insert/update | `app/api/ai/drama-pause/route.ts` | User-only | Raw social notes remain private. |
| `moment_math_resets` | `user_id` | Yes | own select/insert/update | `app/api/ai/math-reset/route.ts` | User-only | Previously `FOR ALL`; now explicit CRUD subset. |
| `moment_ai_messages` | `user_id` | Yes | own select/insert | `app/api/ai/check-in/route.ts`, `app/api/ai/stuck/route.ts`, `app/api/ai/drama-pause/route.ts`, `app/api/ai/math-reset/route.ts` | User-only raw AI logs; no guardian/admin broad reads via RLS | No update/delete policy intentionally. |
| `moment_safety_events` | `user_id` | Yes | own select/insert | AI and safety recording flows | User-private safety telemetry; internal use via service role only | Maintain strict privacy; no guardian policy. |
| `moment_parent_summaries` | `student_user_id`, `guardian_user_id` | Yes | student select + guardian summary select (accepted + summary_access=true) | Parent dashboard surfaces summaries only (by design) | Guardian gets summaries only; no raw journal/session access | Existing guardian policy already enforces accepted link + summary access. |
| `moment_subscriptions` | `user_id` | Yes | own select | `lib/subscriptions.ts`, `app/settings/page.tsx`, Stripe routes | User can read own plan; writes only via Stripe webhook/service role | Client writes blocked (no insert/update/delete policies). |
| `moment_routes` | `user_id` | **Now Yes** | own select/insert/update | `app/api/ai/check-in/route.ts`, `lib/entitlements.ts` | User-only routing history | **Previously missing RLS + policies**; hardening adds both. |
| `moment_threads` | `user_id` | **Now Yes** | own select/insert/update | `app/api/ai/check-in/route.ts`, `app/api/moment/memory/actions/route.ts`, `features/moment/memory/readMomentMemory.ts` | User-only thread state | **Previously missing RLS + policies**; hardening adds both. |
| `moment_entries` | `user_id` | Yes | own select/insert/update | `features/moment/memory/persistMomentMemory.ts`, `features/moment/memory/readMomentMemory.ts` | User-private memory/journal-like content | Previously `FOR ALL`; now explicit no-delete model. |
| `moment_goals` | `user_id` | Yes | own select/insert/update | `features/moment/memory/*`, `app/api/moment/memory/actions/route.ts`, `app/settings/page.tsx` | User-owned goals | No broad access. |
| `moment_tiny_wins` | `user_id` | Yes | own select/insert/update | `features/moment/memory/*`, actions route | User-private | No delete policy. |
| `moment_suggestions` | `user_id` | Yes | own select/insert/update | `features/moment/memory/*`, actions route, settings page | User-private suggestions | No broad/guardian access. |
| `moment_support_effectiveness` | `user_id` | Yes | own select/insert/update | `features/moment/memory/*` | User-private effectiveness signals | Observability-like but still per-user only. |
| `moment_patterns` | `user_id` | Yes | own select/insert/update | `app/api/ai/check-in/route.ts`, `features/moment/memory/readMomentMemory.ts` | User-private derived patterns | Parent access should use summaries, not raw patterns table. |
| `moment_orchestration_events` | `user_id` | Yes | own select/insert | `app/api/ai/check-in/route.ts`, `app/internal/review/page.tsx` | User-own rows only by RLS; internal cross-user review via service role + strict server authorization | Internal review switched to admin client after reviewer auth check. |
| `moment_support_feedback` | `user_id` | Yes | own select/insert | `app/api/moment/feedback/route.ts`, `app/internal/review/page.tsx` | User-own rows only by RLS; internal cross-user review via service role + strict server auth | Prevents broad authenticated reads. |

## Policies added/changed in `0011_moment_rls_hardening.sql`
- Enabled RLS on every `moment_*` table.
- Added missing policies for `moment_routes` and `moment_threads`.
- Replaced legacy `FOR ALL` owner policies with action-specific policies (`own_select`, `own_insert`, `own_update`) for private user tables.
- Normalized observability policy names and retained owner-only access for direct user queries.
- Preserved strict subscription boundary (`select` only for client role).

## Parent/guardian boundary
- Guardian access remains restricted to `moment_parent_summaries` only.
- Guardian access requires accepted link and `summary_access = true` via `moment_guardian_links`.
- No guardian access was added for raw entries, AI messages, threads, notes, or safety payloads.

## Admin/internal boundary
- No broad public/admin RLS policies were added.
- Internal review path uses explicit authorization (`admin` profile role + allowlisted email) before querying observability tables.
- Cross-user review reads now use service role server-side only.

## Billing boundary
- `moment_subscriptions` remains user-readable only.
- Stripe webhook continues to own writes using service role in server route.

## Observability boundary
- `moment_orchestration_events` and `moment_support_feedback` are owner-readable only via RLS.
- No anonymous/broad authenticated select policies.
- Internal analytics relies on service role plus server-side auth gate.

## Verification SQL
Use the checks embedded in `supabase/migrations/0011_moment_rls_hardening.sql` comments to validate:
1. RLS enabled on all `moment_*` tables.
2. No broad `SELECT ... USING (true)` style policies.
3. Policy counts by table.
4. `moment_subscriptions` does not allow client writes.
5. Observability tables are not broadly readable.
6. Guardian policies are confined to summary access.

## Remaining risks
- Service role bypass remains powerful by design; keep service key only in trusted server contexts.
- Internal review UI depends on environment hygiene (`INTERNAL_REVIEW_EMAILS`, admin role correctness).
- Existing `moment_profiles` upsert conflict target (`id`) in sync adapter may need a follow-up correctness fix (not an RLS bypass).
