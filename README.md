# WoolTrace

WoolTrace is a farmer-first wool traceability and direct-commerce platform focused on Karnataka. A farmer starts a wool batch when shearing begins, records the completed shearing with a compressed photo, and keeps later quality, sale, transport, storage and processing events on one QR-linked public passport.

WoolTrace currently provides a traceability record, not a government certification. Farm documents and administrator approval are intentionally not required in the present workflow.

## Product features

- Google sign-in, plus an optional demo login for development and presentations
- Farmer, buyer, laboratory, transporter, warehouse, processor and brand portals
- Shearing start and completion records with client-side photo compression
- Hash-linked wool lifecycle events and public QR passports
- Reverse bidding and direct seller-owned BHIM/UPI payment QR codes
- Quality-result entry, bookings, weather and optional government market data
- Karnataka laboratory and sheep-and-wool outreach directory
- Responsive landing page and workspace

## Technology

- Next.js 16, React 19 and TypeScript
- Turso/libSQL with Drizzle ORM
- Google OAuth implemented without a third-party auth service
- Vercel deployment

## Local setup

Requirements: Node.js 22.13 or newer and a Turso database.

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`.

For a presentation without Google credentials, set `DEMO_MODE=true`. Do not use demo mode for a public production launch.

## Environment variables

Required for persistent data:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `AUTH_SECRET` — a long random secret used to sign login sessions

Required for real Google sign-in:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `APP_BASE_URL` — the public Vercel URL, without a trailing slash

Optional:

- `DEMO_MODE`
- `FARM_LATITUDE`, `FARM_LONGITUDE`, `FARM_LOCATION_NAME`
- `DATA_GOV_IN_API_KEY`, `AGMARKNET_RESOURCE_ID`

Never commit `.env.local`, `.vercel`, OAuth secrets or database tokens. They are already ignored by Git.

## Google OAuth callback

Create a Web application in Google Cloud Console and add this authorised redirect URI:

```text
https://YOUR-VERCEL-DOMAIN/api/auth/google/callback
```

For local development also add:

```text
http://localhost:3000/api/auth/google/callback
```

## Checks

```bash
npm run lint
npm run build
```

## Deploy to Vercel

1. Push this directory to GitHub.
2. Import the repository in Vercel as a Next.js project.
3. Add the required environment variables in Vercel project settings.
4. Run `npm run db:migrate` once with the Turso variables available.
5. Deploy.

Vercel automatically runs `npm run build`.
