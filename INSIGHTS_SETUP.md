# Workspace switching and insights

The dropdown above each signed-in workspace switches roles on the same Google account. The dedicated PATCH endpoint changes only `role` and `onboarded`; it preserves organisation, payment details and records. Demo switching navigates directly between sample portals without changing a real account. Roles are self-selected, not verification badges. Owner/invitation checks still control batch access.

## Weather

`/insights` supports selected Karnataka districts. Open-Meteo supplies model-based current conditions and a three-day forecast near each district centre. Data carries source times, units and attribution. It is not exact farm weather. The server caches upstream weather for ten minutes; Refresh requests the latest available cached data. Failures show no fabricated fallback.

In Vercel → Project → Settings → Environment Variables:

- Set `OPEN_METEO_API_KEY` from an Open-Meteo commercial plan: https://open-meteo.com/en/pricing.
- Alternatively set `WEATHER_NONCOMMERCIAL=true` only if your use qualifies for their non-commercial evaluation service. Do not assume that a public commercial deployment qualifies.

The older Farm weather page still uses the configured `FARM_*` default coordinates. Weather & wool insights supports the area picker for all account roles.

## Prices

The database query groups public, currently listed wool batches created in the last 30 days by breed and grade in the selected district. It reports minimum and maximum seller reserve/asking prices, count and latest batch creation date. Private bids, payment records and user emails are not exposed. Asking prices are not completed sales, guaranteed quotes or independently observed current wool-market rates.

An external market feed is NOT connected yet. To integrate one, provide the provider name, API documentation, subscription coverage for wool/Karnataka, price units, grade/breed mapping and update schedule. Add the key directly in Vercel after the adapter is built. A generic market API key cannot establish that its feed covers wool; crop commodity feeds cannot substitute.

## AI

Create a Gemini API key at https://aistudio.google.com/apikey and choose an available text-generation model in your project. Add `GEMINI_API_KEY` and `GEMINI_MODEL` in Vercel, then redeploy. These are server-only, never `NEXT_PUBLIC_*` variables and never committed.

The user must opt in before asking. The server sends only their question, active role, selected area and displayed aggregate source data to Google Gemini. It does not send account identity, emails, photos, private bids or payment references. Do not put private information in a question. No history is stored by this application; the provider's own processing/retention policies still apply.

The assistant has no write tools or permissions. It explains context and cannot create certificates, change records, guarantee weather or supply missing live prices. Authentication, same-origin protection, input limits, a 20-second timeout and five-request-per-minute per-account AI limit protect the endpoint. AI can still be wrong: source data and human decisions remain authoritative.

## Verification

Workflow tests use an isolated SQLite database and explicit fake weather/AI responses. The fixture is loaded only by the test Node process, never by deployed application code. Tests exercise role preservation/access boundaries, area validation, no-data prices, weather parsing, AI consent, failures and rate limiting. Real upstream credentials and provider availability must be checked after configuration; fixture tests are not proof of live connectivity.
