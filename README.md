# ProFixIQ-Moment

## MVP smoke test checklist

- [ ] Landing loads with Tailwind styling in Vercel deployment.
- [ ] Sign in page loads.
- [ ] Dashboard loads.
- [ ] Check-in submits and returns a guided response.
- [ ] Stuck submits and returns a guided response.
- [ ] Math reset submits and returns a guided response.
- [ ] Drama pause submits and returns a guided response.
- [ ] API fallback works when OpenAI key is missing.

## Vercel deployment note

Use the repository `package-lock.json` and run `npm ci` in CI/build pipelines to ensure the lockfile-resolved Tailwind/PostCSS toolchain is used consistently.

## Manual UX smoke checklist

- [ ] Landing styled
- [ ] Onboarding works
- [ ] Dashboard check-in submits
- [ ] Routing badge appears
- [ ] Module pages submit
- [ ] API warning appears when persistence fails
- [ ] Parent page explains privacy
- [ ] Settings page loads
- [ ] Mobile viewport usable
