# APIs: what WoolTrace actually needs

## Required (already configured in your Vercel project)
| Purpose | Provider | Environment keys | Where to get them |
|---|---|---|---|
| Google sign-in | Google Cloud OAuth web client | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET | https://console.cloud.google.com/auth/clients |
| Batches, users, photos, offers and trace events | Turso | TURSO_DATABASE_URL, TURSO_AUTH_TOKEN | https://app.turso.tech/ |
| Signed login sessions | Generated locally, not an external API | AUTH_SECRET (32+ random characters) | Generate securely; keep private |
| Public QR and OAuth URLs | Your deployment | APP_BASE_URL | https://wool-trace.vercel.app |
| Production safety | App configuration | DEMO_MODE=false | Vercel project environment settings |

Google callback: https://wool-trace.vercel.app/api/auth/google/callback

## No API key needed
- BHIM/UPI QR: seller saves their own UPI ID in **My profile**. An accepted buyer can scan the generated QR. The seller manually confirms bank credit.
- Batch/product QR: generated in the app and points to the public passport.
- Photo compression: performed in the browser; the server then decodes, validates and recompresses the JPEG with Sharp before storing it in Turso. Invalid or truncated images are rejected.
- Lab map links: existing directory links open maps for outreach. No Google Maps billing key is required.

## Optional weather
Code supports Open-Meteo with an 8-second timeout, response validation, a 10-minute server cache and source timestamps.
- Commercial use: obtain OPEN_METEO_API_KEY from https://open-meteo.com/en/pricing. No purchase has been made for you.
- Evaluation / non-commercial project: set WEATHER_NONCOMMERCIAL=true only if your usage qualifies for the provider's free tier.
- Optional FARM_LATITUDE, FARM_LONGITUDE, FARM_LOCATION_NAME; defaults are Chitradurga, Karnataka, not the signed-in farmer's automatic location.
- Source attribution is shown in the interface.
Weather is not required to register, trace or trade wool.

## Not required / not yet available
- No Razorpay, SMS OTP, Firebase, Google Maps or certificate-authority keys are required.
- A generic AGMARKNET crop feed is not a verified wool-price feed. WoolTrace uses submitted marketplace offers, not invented live wool prices.
- Automated logistics bookings, tracking and bank reconciliation need separately selected providers and contracts. Current service plans do not contact providers.
- Email invitations are not sent automatically; share the site link with the invited Google-email holder yourself.

## Internal API coverage
Authenticated and rate-limited: /api/profile, /api/batches, /api/batches/events, /api/batches/quality, /api/bids, /api/participants, /api/lots, /api/bookings, /api/payments/upi, /api/live/overview.
Public operational health: /api/health (no credentials or user data returned).
Public history: /batch/:id and /lot/:id.

Batch, offer and service-plan lists are paginated; dashboards use database-wide summaries for the account, not only the first page. Stage records store the actual work date separately from their submission time. Full payment references are private to the seller and winning buyer; public histories display only the final four characters.

Do not paste secrets into chat. Set them in Vercel **Project Settings → Environment Variables** and redeploy. Production and preview should have separate databases.
