// Loaded only by the isolated workflow test process, never by application code.
if (process.env.WOOLTRACE_TEST_OAUTH !== "1" || !process.env.TURSO_DATABASE_URL?.startsWith("file:") || new URL(process.env.APP_BASE_URL).hostname !== "localhost") {
  throw new Error("The OAuth fixture requires an isolated localhost test database.");
}
const profiles = {
  carrier: { sub: "test-new-carrier", email: "NEW-CARRIER@example.test", name: "New Carrier", email_verified: true },
  existing: { sub: "test-existing-partner", email: "existing-partner@example.test", name: "Existing Partner", email_verified: true },
  uninvited: { sub: "test-new-uninvited", email: "new-uninvited@example.test", name: "New Member", email_verified: true },
  unverified: { sub: "test-unverified", email: "NEW-CARRIER@example.test", name: "Unverified", email_verified: false },
};
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, options) => {
  const url = String(input);
  if (url.startsWith("https://customer-api.open-meteo.com/v1/forecast?") && process.env.OPEN_METEO_API_KEY === "local-weather-fixture") {
    return Response.json({ current: { temperature_2m: 26, relative_humidity_2m: 61, wind_speed_10m: 12, precipitation: 0, time: "2026-10-04T14:00" }, daily: { time: ["2026-10-04", "2026-10-05", "2026-10-06"], temperature_2m_max: [28, 29, 27], temperature_2m_min: [20, 21, 20], precipitation_probability_max: [15, 30, 65], precipitation_sum: [0, 1, 5] } });
  }
  if (url === "https://generativelanguage.googleapis.com/v1beta/models/wooltrace-test-model:generateContent" && process.env.GEMINI_API_KEY === "local-ai-fixture") {
    const context = JSON.parse(JSON.parse(options.body).contents[0].parts[0].text);
    if (context.question === "Simulate upstream failure") return Response.json({ error: "fixture" }, { status: 500 });
    return Response.json({ candidates: [{ content: { parts: [{ text: "Fixture explanation for " + context.role + ". Seller asking prices are not completed-sale rates. Check forecast dates." }] } }] });
  }
  if (url === "https://oauth2.googleapis.com/token") {
    const code = new URLSearchParams(String(options.body)).get("code");
    return profiles[code] ? Response.json({ access_token: "local-test-" + code }) : Response.json({ error: "invalid_grant" }, { status: 400 });
  }
  if (url === "https://openidconnect.googleapis.com/v1/userinfo") {
    const code = options.headers.authorization.replace("Bearer local-test-", "");
    return profiles[code] ? Response.json(profiles[code]) : Response.json({ error: "invalid_token" }, { status: 401 });
  }
  return realFetch(input, options);
};
