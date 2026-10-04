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
