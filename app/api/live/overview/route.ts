import { NextResponse } from "next/server";
import { getGoogleUser } from "@/app/lib/google-auth";
import { integrationDefinitions, type IntegrationState } from "@/app/lib/integration-config";

export const dynamic = "force-dynamic";

type Integration = { id: string; label: string; status: IntegrationState; detail: string };
type MarketQuote = { commodity: string; variety: string; market: string; district: string; state: string; minPrice: string; maxPrice: string; modalPrice: string; arrivalDate: string };

export async function GET() {
  const user = await getGoogleUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const integrations: Integration[] = integrationDefinitions().filter((item) => item.id !== "auth").map((item) => ({ id: item.id, label: item.label, status: item.state, detail: item.detail }));
  const [weatherResult, marketResult] = await Promise.allSettled([loadWeather(), loadMarketPrices()]);
  const weather = weatherResult.status === "fulfilled" ? weatherResult.value : null;
  const market = marketResult.status === "fulfilled" ? marketResult.value : [];
  setStatus(integrations, "weather", weather ? "live" : "unavailable", weather ? "Open-Meteo responded successfully" : "Provider temporarily unavailable");
  if (process.env.DATA_GOV_IN_API_KEY && process.env.AGMARKNET_RESOURCE_ID) setStatus(integrations, "market", market.length ? "live" : "unavailable", market.length ? `${market.length} government market records received` : "The configured feed returned no usable records");
  return NextResponse.json({ updatedAt: new Date().toISOString(), location: process.env.FARM_LOCATION_NAME ?? "Chitradurga, Karnataka", weather, market, integrations, liveCount: integrations.filter((item) => item.status === "live" || item.status === "configured").length, totalCount: integrations.length }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

async function loadWeather() {
  const query = new URLSearchParams({ latitude: process.env.FARM_LATITUDE ?? "14.2251", longitude: process.env.FARM_LONGITUDE ?? "76.3980", current: "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m", timezone: "Asia/Kolkata" });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`, { cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Weather service returned ${response.status}`);
  const payload = await response.json() as { current?: { temperature_2m?: number; relative_humidity_2m?: number; wind_speed_10m?: number; precipitation?: number; weather_code?: number; time?: string } };
  if (!payload.current) throw new Error("Weather response did not contain current conditions");
  return { temperatureC: payload.current.temperature_2m ?? 0, humidityPercent: payload.current.relative_humidity_2m ?? 0, windKph: payload.current.wind_speed_10m ?? 0, precipitationMm: payload.current.precipitation ?? 0, weatherCode: payload.current.weather_code ?? 0, observedAt: payload.current.time ?? new Date().toISOString(), source: "Open-Meteo" };
}

async function loadMarketPrices(): Promise<MarketQuote[]> {
  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  const resourceId = process.env.AGMARKNET_RESOURCE_ID;
  if (!apiKey || !resourceId) return [];
  const query = new URLSearchParams({ "api-key": apiKey, format: "json", limit: "12" });
  const response = await fetch(`https://api.data.gov.in/resource/${encodeURIComponent(resourceId)}?${query}`, { cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Market service returned ${response.status}`);
  const payload = await response.json() as { records?: Record<string, unknown>[] };
  return (payload.records ?? []).map((record) => ({ commodity: value(record, "commodity"), variety: value(record, "variety"), market: value(record, "market"), district: value(record, "district"), state: value(record, "state"), minPrice: value(record, "min_price"), maxPrice: value(record, "max_price"), modalPrice: value(record, "modal_price"), arrivalDate: value(record, "arrival_date") })).filter((record) => record.commodity || record.market);
}

function value(record: Record<string, unknown>, key: string) { return String(record[key] ?? record[key.replace(/_/g, " ")] ?? ""); }
function setStatus(items: Integration[], id: string, status: IntegrationState, detail: string) { const item = items.find((entry) => entry.id === id); if (item) { item.status = status; item.detail = detail; } }
