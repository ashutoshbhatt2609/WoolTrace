# WoolTrace launch checklist

## What the app now does
- Google OAuth with PKCE and signed, validated sessions; no phone login.
- Self-selected roles and onboarding without farm verification.
- Farmer-recorded origin, dates, compressed JPEG evidence and final weight.
- Explicit listings, buyer offers and atomic offer acceptance.
- Seller-owned BHIM/UPI QR visible only to the sale parties; manual seller payment confirmation before ownership transfer.
- Owner-controlled invitations for laboratories, transporters, warehouses, processors and brands.
- Public batch history with original farmer, current owner, stage notes, evidence and hash-chain consistency checks.
- Weight-constrained output lots linked to the original batch and optional parent lot.
- Service planning, not automatic provider bookings; Karnataka lab outreach directory, not partner endorsements.

## Required Vercel environment
Add these under the **wool-trace project → Settings → Environment Variables → Production**:
- APP_BASE_URL = https://wool-trace.vercel.app
- GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from the Google Cloud OAuth web client.
- AUTH_SECRET: a private random value of at least 32 characters.
- TURSO_DATABASE_URL and TURSO_AUTH_TOKEN from the connected Turso database.
- DEMO_MODE = false.

Google authorized JavaScript origin: https://wool-trace.vercel.app
Google redirect URI: https://wool-trace.vercel.app/api/auth/google/callback

Never commit .env files or paste credentials into tickets/chat. Rotate credentials previously shared in chat and replace them in Vercel. Deployments need a redeploy after environment changes.

## Release commands
Run from the root of the standalone WoolTrace repository:
1. npm ci
2. npm run lint
3. npm run build
4. node scripts/test-workflows.mjs
5. npm audit --omit=dev --audit-level=high
6. Load production variables securely; run node scripts/check-production.mjs.
7. Apply additive migrations with npm run db:migrate before deploying the new code.
8. Push main to the Git-connected wool-trace Vercel project.
9. Check /api/health and complete an actual Google sign-in in the browser.

The test suite starts a temporary local database and server, signs local test identities with a random test-only secret, and never contacts the production database. --serve keeps that isolated server running for UI review.

Preview deployments must use an isolated preview database and matching OAuth redirect/origin. Do not run preview tests against production.

## Still required from the operator before commercial launch
- Public owner/business name and support email; replace the launch caveats in privacy/terms with an operational contact and reviewed policies.
- Decide retention, corrections, privacy removal and dispute-handling procedures. Public notes/photos are intentionally public; source truth is participant-reported.
- Configure and test database backup/restore with Turso. Restore testing and recovery objectives are operational tasks, not guaranteed by this code.
- Enable uptime monitoring for /api/health, Vercel log alerts and an incident-response contact.
- Conduct an actual Google login, create a genuine batch and check a printed QR on a second device.
- Confirm Google OAuth audience/publishing status; if still in testing, only listed test users can sign in.
- Verify the seller's UPI account and recipient name. WoolTrace does not confirm bank transfers or operate escrow.
- Obtain an appropriately licensed wool-price feed if one is desired. No simulated price is presented as live.
- Independent security/privacy review and load testing are still recommended; a passing build is not a guarantee of production security.

## Known boundaries
The hash chain detects inconsistent stored events but is not an external immutable ledger. A database administrator with full access can rewrite data and hashes. QR labels can be copied; WoolTrace does not certify physical fibre identity. Lab roles are self-selected and owner-invited, not accredited by the platform. Output lots model one source batch and processing loss; blending multiple source batches is not implemented. Service plans do not notify providers. There is no automatic bank reconciliation, logistics tracking-provider integration or verified commodity-price feed.

Development-only dependency advisories must be reviewed separately from the production dependency audit. Do not downgrade framework or migration tooling with npm audit fix --force merely to silence advisories.
