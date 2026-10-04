import "server-only";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { farms, woolBatches } from "@/db/schema";
import { insightLocations, type InsightArea } from "./insights-locations";
const weatherSchema = z.object({ current: z.object({ temperature_2m: z.number(), relative_humidity_2m: z.number(), wind_speed_10m: z.number(), precipitation: z.number(), time: z.string() }), daily: z.object({ time: z.array(z.string()), temperature_2m_max: z.array(z.number()), temperature_2m_min: z.array(z.number()), precipitation_probability_max: z.array(z.number().nullable()), precipitation_sum: z.array(z.number()) }) });
export async function areaWeather(area: InsightArea) {
  const location = insightLocations[area], key = process.env.OPEN_METEO_API_KEY;
  if (!key && process.env.WEATHER_NONCOMMERCIAL !== "true") return { status: "not_enabled", current: null, forecast: [], message: "Weather needs an Open-Meteo plan or eligible non-commercial evaluation enabled by the operator." };
  try {
    const query = new URLSearchParams({ latitude: String(location.latitude), longitude: String(location.longitude), current: "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m", daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum", forecast_days: "3", timezone: "Asia/Kolkata" });
    if (key) query.set("apikey", key);
    const response = await fetch("https://" + (key ? "customer-api.open-meteo.com" : "api.open-meteo.com") + "/v1/forecast?" + query, { signal: AbortSignal.timeout(8000), next: { revalidate: 600 } });
    if (!response.ok) throw new Error("Unavailable");
    const data = weatherSchema.parse(await response.json());
    return { status: "available", current: { temperatureC: data.current.temperature_2m, humidityPercent: data.current.relative_humidity_2m, windKph: data.current.wind_speed_10m, precipitationMm: data.current.precipitation, observedAt: data.current.time }, forecast: data.daily.time.map((date, i) => ({ date, highC: data.daily.temperature_2m_max[i], lowC: data.daily.temperature_2m_min[i], rainChancePercent: data.daily.precipitation_probability_max[i], rainMm: data.daily.precipitation_sum[i] })), source: "Open-Meteo", sourceUrl: "https://open-meteo.com/", message: "Model-based weather near the district centre, not a measurement at your farm. Times are India time." };
  } catch { return { status: "unavailable", current: null, forecast: [], message: "Weather is temporarily unavailable. No estimated conditions are substituted." }; }
}
export async function woolMarket(area: InsightArea) {
  const cutoff = new Date(Date.now() - 30 * 86400000);
  const rows = await getDb().select({ breed: woolBatches.breed, grade: woolBatches.grade, low: sql<number>`min(${woolBatches.reservePrice})`, high: sql<number>`max(${woolBatches.reservePrice})`, count: sql<number>`count(*)`, latest: sql<number>`max(${woolBatches.createdAt})` }).from(woolBatches).innerJoin(farms, eq(farms.id, woolBatches.farmId)).where(and(eq(woolBatches.saleStatus, "listed"), eq(farms.state, "Karnataka"), sql`lower(${farms.district}) = ${insightLocations[area].district.toLowerCase()}`, gte(woolBatches.createdAt, cutoff), gte(woolBatches.reservePrice, 0.01))).groupBy(woolBatches.breed, woolBatches.grade);
  return { status: rows.length ? "available" : "no_data", source: "WoolTrace public listings", kind: "Seller asking prices—not completed sales or an independent market rate", currency: "INR", unit: "kg", period: "Currently listed batches created in the last 30 days", quotes: rows.map(row => ({ ...row, latest: new Date(row.latest).toISOString() })), externalStatus: "not_connected", message: "A wool-specific external price provider has not been connected. AI never supplies live price quotes." };
}
export async function getInsights(area: InsightArea) {
  const [weather, market] = await Promise.all([areaWeather(area), woolMarket(area)]);
  return { area, location: insightLocations[area].name, fetchedAt: new Date().toISOString(), weather, market, aiEnabled: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL) };
}
