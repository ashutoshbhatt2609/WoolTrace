# WoolTrace

A Karnataka-focused wool traceability and direct-commerce app. Farmers record the source and shearing photo; invited partners add later stages; buyers make direct offers. Public batch and product-lot QR pages keep the original farmer visible.

**A traceability record, not a certification authority.** Google sign-in does not verify a farm. Labs are owner-invited, not accredited by WoolTrace.

## Stack
Next.js 16.3.8, React 19, TypeScript, Drizzle and Turso/libSQL. Vercel hosts the application.

## Local setup
Use Node.js 22.13+ (Vercel uses Node 24). Install with npm ci, copy .env.example to .env.local, fill your own values, run npm run db:migrate and npm run dev.
APP_BASE_URL must be http://localhost:3000 for local sign-in, with the matching Google OAuth callback.

Never commit .env files. Optional demo mode is for isolated development only; production uses DEMO_MODE=false.

## Checks
- npm run lint
- npm run build
- node scripts/test-workflows.mjs — isolated temporary database; no production records.
- npm audit --omit=dev --audit-level=high

The GitHub Actions workflow runs the same checks. Development-tool advisories need separate review; do not force incompatible framework downgrades.

## Deployment
The Git-connected Vercel project is **wool-trace**, serving https://wool-trace.vercel.app.
vercel.json runs transactional, additive migrations before production builds. A failed migration stops deployment promotion. Use a separate database for previews and migrate it explicitly.
Check /api/health after deployment and complete an actual Google sign-in.

## Features
- Google OAuth with PKCE, validated signed sessions and role onboarding.
- Farm source registration, shearing completion and compressed JPEG evidence.
- Farmer listings, buyer offers, atomic acceptance and seller-confirmed UPI payments.
- Ownership-controlled partner invitations and stage updates.
- Laboratory measurements and participant-attributed public history.
- Weight-constrained child lots with parent and source-batch QR links.
- Service planning and Karnataka lab outreach directory.
- Optional licensed weather integration, responsive workspace and real account metrics.

## Setup and operating boundaries
See [API_SETUP.md](API_SETUP.md) for required/optional keys and provider links.
See [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) for launch checks and operator responsibilities.
See [design.md](design.md) for design rules.

No automatic bank verification, provider booking/notification, accredited certification, blended-source lots or verified live wool-price feed is claimed. Real-user acceptance tests, credential rotation, backup/restore checks, support contacts and operational policies remain launch requirements.
