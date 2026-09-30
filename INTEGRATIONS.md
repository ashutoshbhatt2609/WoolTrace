# WoolTrace production integrations

Do not commit real credentials. Add them in the Site deployment environment and use `.env.example` only as a list of names.

## Already provisioned

- Cloudflare D1 binding `DB`: users, farms, wool batches, lifecycle events, quality results, bids, service bookings and ownership changes.
- Open-Meteo: current farm weather. No key is required. Set the three `FARM_*` variables to change the default farm.
- Demo login: controlled by `DEMO_MODE`. Set it to `false` before production launch.

## Google sign-in

Create a Google OAuth client of type **Web application**. Configure this exact authorised redirect URI:

`https://wooltrace-farm-to-fabric.witty-clock-9839.chatgpt.site/api/auth/google/callback`

Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, and `APP_BASE_URL`. `AUTH_SECRET` should be a cryptographically random value of at least 32 bytes.

## Government market prices

Generate a data.gov.in API key and select the exact AGMARKNET resource to use. Add `DATA_GOV_IN_API_KEY` and `AGMARKNET_RESOURCE_ID`. WoolTrace requests the government resource server-side and only marks the feed live after usable records are returned.

## Maps

Add a restricted Google Maps Platform server key as `GOOGLE_MAPS_API_KEY`. Enable only the APIs the final workflow uses and restrict the key in Google Cloud.

## Payments

Payments use seller-owned BHIM / UPI QR codes, so no payment-gateway credentials are needed. The seller saves their UPI ID and display name in the Reverse bidding workspace. After an offer is accepted, WoolTrace creates an exact-value UPI payment request for that batch. The seller must verify the credit in their own bank or UPI app before releasing the wool; a QR scan by itself is not proof of payment.

## Logistics and laboratory integrations

There is no universal API for either workflow. Choose the logistics provider and wool testing laboratory, then provide their API documentation or sandbox account. The implementation needs their base URL, authentication method, request/response schema, webhook events and signature verification rules.

Planned variables are `LOGISTICS_API_URL`, `LOGISTICS_API_KEY`, `LOGISTICS_WEBHOOK_SECRET`, `LAB_API_URL`, `LAB_API_KEY`, and `LAB_WEBHOOK_SECRET`.

## Platform storage still optional

The current product stores structured certificates and quality metadata in D1. If signed PDF certificates, invoice files or proof-of-delivery photos must be uploaded, add an R2 binding (recommended logical name `FILES`) and a file-retention policy. This is intentionally not provisioned until upload requirements are confirmed.
