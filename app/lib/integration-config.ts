import "server-only";

export type IntegrationState = "live" | "configured" | "setup_required" | "unavailable";

export type IntegrationDefinition = {
  id: string;
  label: string;
  purpose: string;
  variables: string[];
  provider: string;
  state: IntegrationState;
  detail: string;
  note?: string;
};

const configured = (...keys: string[]) => keys.every((key) => Boolean(process.env[key]?.trim()));

export function appBaseUrl() {
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return (process.env.APP_BASE_URL ?? (vercelHost ? `https://${vercelHost}` : "http://localhost:3000")).replace(/\/$/, "");
}

export function integrationDefinitions(): IntegrationDefinition[] {
  return [
    {
      id: "database",
      label: "Traceability database",
      purpose: "Users, farms, batches, bids, bookings and every wool lifecycle event",
      variables: ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"],
      provider: "Turso",
      state: configured("TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN") ? "configured" : "setup_required",
      detail: configured("TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN") ? "Serverless database connected" : "Connect a Turso database from Vercel Marketplace",
    },
    {
      id: "auth",
      label: "Google sign-in",
      purpose: "Production account access for farmers, buyers and partners",
      variables: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "AUTH_SECRET", "APP_BASE_URL"],
      provider: "Google Identity",
      state: configured("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "AUTH_SECRET") ? "configured" : "setup_required",
      detail: configured("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "AUTH_SECRET") ? "OAuth credentials present" : "OAuth credentials required",
      note: `${appBaseUrl()}/api/auth/google/callback`,
    },
    {
      id: "weather",
      label: "Farm weather",
      purpose: "Current temperature, humidity, rain and wind near the farm",
      variables: ["FARM_LATITUDE", "FARM_LONGITUDE", "FARM_LOCATION_NAME"],
      provider: "Open-Meteo",
      state: "configured",
      detail: "No API key required; farm coordinates are optional",
    },
    {
      id: "market",
      label: "Mandi market feed",
      purpose: "Government commodity arrivals and modal, minimum and maximum prices",
      variables: ["DATA_GOV_IN_API_KEY", "AGMARKNET_RESOURCE_ID"],
      provider: "data.gov.in / AGMARKNET",
      state: configured("DATA_GOV_IN_API_KEY", "AGMARKNET_RESOURCE_ID") ? "configured" : "setup_required",
      detail: configured("DATA_GOV_IN_API_KEY", "AGMARKNET_RESOURCE_ID") ? "Credentials present; feed checked on request" : "API key and selected resource ID required",
    },
    {
      id: "payments",
      label: "BHIM / UPI payments",
      purpose: "Seller-owned payment QR for every accepted wool offer",
      variables: ["Seller UPI ID (saved in Reverse bidding)"],
      provider: "BHIM / UPI",
      state: "live",
      detail: "No gateway account, API key or platform fee required",
      note: "The seller verifies the credit in their own bank or UPI app before releasing wool.",
    },
  ];
}
