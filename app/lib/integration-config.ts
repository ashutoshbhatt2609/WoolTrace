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
  return (process.env.APP_BASE_URL ?? "https://wooltrace-farm-to-fabric.witty-clock-9839.chatgpt.site").replace(/\/$/, "");
}

export function integrationDefinitions(): IntegrationDefinition[] {
  return [
    {
      id: "database",
      label: "Traceability database",
      purpose: "Users, farms, batches, bids, bookings and every wool lifecycle event",
      variables: ["DB (D1 binding)"],
      provider: "Cloudflare D1",
      state: "live",
      detail: "Platform binding connected",
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
      id: "maps",
      label: "Maps and geocoding",
      purpose: "Farm, warehouse and transport locations",
      variables: ["GOOGLE_MAPS_API_KEY"],
      provider: "Google Maps Platform",
      state: configured("GOOGLE_MAPS_API_KEY") ? "configured" : "setup_required",
      detail: configured("GOOGLE_MAPS_API_KEY") ? "Restricted key present" : "Restricted server-side API key required",
    },
    {
      id: "payments",
      label: "Payments",
      purpose: "Order creation, payment verification and settlement notifications",
      variables: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"],
      provider: "Razorpay",
      state: configured("RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET") ? "configured" : "setup_required",
      detail: configured("RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET") ? "Live credentials present" : "Keys and webhook secret required",
      note: `Planned webhook: ${appBaseUrl()}/api/webhooks/razorpay`,
    },
    {
      id: "logistics",
      label: "Logistics tracking",
      purpose: "Pickup booking, live shipment status and proof of delivery",
      variables: ["LOGISTICS_API_URL", "LOGISTICS_API_KEY", "LOGISTICS_WEBHOOK_SECRET"],
      provider: "Your selected logistics provider",
      state: configured("LOGISTICS_API_URL", "LOGISTICS_API_KEY", "LOGISTICS_WEBHOOK_SECRET") ? "configured" : "setup_required",
      detail: configured("LOGISTICS_API_URL", "LOGISTICS_API_KEY", "LOGISTICS_WEBHOOK_SECRET") ? "Provider endpoint present" : "Provider and API contract still need to be selected",
      note: `Planned webhook: ${appBaseUrl()}/api/webhooks/logistics`,
    },
    {
      id: "lab",
      label: "Laboratory results",
      purpose: "Verified micron, staple length, yield and certificate results",
      variables: ["LAB_API_URL", "LAB_API_KEY", "LAB_WEBHOOK_SECRET"],
      provider: "Your selected wool testing laboratory",
      state: configured("LAB_API_URL", "LAB_API_KEY", "LAB_WEBHOOK_SECRET") ? "configured" : "setup_required",
      detail: configured("LAB_API_URL", "LAB_API_KEY", "LAB_WEBHOOK_SECRET") ? "Laboratory endpoint present" : "Laboratory and result schema still need to be selected",
      note: `Planned webhook: ${appBaseUrl()}/api/webhooks/lab`,
    },
  ];
}
