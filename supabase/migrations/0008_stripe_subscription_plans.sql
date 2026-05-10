alter table public.moment_subscriptions
  add column if not exists stripe_price_id text,
  add column if not exists cancel_at_period_end boolean not null default false;

alter table public.moment_subscriptions
  drop constraint if exists moment_subscriptions_plan_check;

alter table public.moment_subscriptions
  add constraint moment_subscriptions_plan_check check (plan in ('free','plus','pro'));

create index if not exists moment_subscriptions_customer_idx on public.moment_subscriptions(stripe_customer_id);
create index if not exists moment_subscriptions_subscription_idx on public.moment_subscriptions(stripe_subscription_id);
create index if not exists moment_subscriptions_status_idx on public.moment_subscriptions(status);
