import { NextResponse } from "next/server";
import { getGoogleUser } from "@/app/lib/google-auth";

export const dynamic = "force-dynamic";

type Integration = {
  id: string;
  label: string;
  status: "live" | "setup_required" | "unavailable";
  detail: string;
};

export async function GET() {
  const user = await getGoogleUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const integrations: Integration[] = [
    { id: "traceability", label: "Traceability database", status: "live", detail: "Cloudflare D1" },
    connection("market", "Mandi market feed", "DATA_GOV_IN_API_KEY", "AGMARKNET_RESOURCE_ID"),
    connection("logistics", "Logistics tracking", "LOGISTICS_API_URL", "LOGISTICS_API_KEY"),
    connection("maps", "Maps and geocoding", "GOOGLE_MAPS_API_KEY"),
    connection("payments", "Payments", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"),
    connection("lab", "Laboratory results", "LAB_API_URL", "LAB_API_KEY"),
  ];

  let weather: null | {
    temperatureC: number;
    humidityPercent: number;
    windKph: number;
    precipitationMm: number;
    weatherCode: number;
    observedAt: string;
    source: string;
  } = null;

  try {
    const latitude = process.env.FARM_LATITUDE ?? "34.0484";
    const longitude = process.env.FARM_LONGITUDE ?? "74.3805";
    const query = new URLSearchParams({
      latitude,
      longitude,
      current: "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
      timezone: "Asia/Kolkata",
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Weather service returned ${response.status}`);
    const payload = await response.json() as {
      current?: {
        temperature_2m?: number;
        relative_humidity_2m?: number;
        wind_speed_10m?: number;
        precipitation?: number;
        weather_code?: number;
        time?: string;
      };
    };
    if (payload.current) {
      weather = {
        temperatureC: payload.current.temperature_2m ?? 0,
        humidityPercent: payload.current.relative_humidity_2m ?? 0,
        windKph: payload.current.wind_speed_10m ?? 0,
        precipitationMm: payload.current.precipitation ?? 0,
        weatherCode: payload.current.weather_code ?? 0,
        observedAt: payload.current.time ?? new Date().toISOString(),
        source: "Open-Meteo",
      };
    }
  } catch {
    integrations.push({ id: "weather", label: "Farm weather", status: "unavailable", detail: "Provider temporarily unavailable" });
  }

  if (weather) integrations.unshift({ id: "weather", label: "Farm weather", status: "live", detail: weather.source });

  return NextResponse.json(
    {
      updatedAt: new Date().toISOString(),
      location: process.env.FARM_LOCATION_NAME ?? "Gulmarg, Jammu & Kashmir",
      weather,
      integrations,
      liveCount: integrations.filter((item) => item.status === "live").length,
      totalCount: integrations.length,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

function connection(id: string, label: string, ...keys: string[]): Integration {
  const configured = keys.every((key) => Boolean(process.env[key]));
  return {
    id,
    label,
    status: configured ? "live" : "setup_required",
    detail: configured ? "Credentials connected" : "Provider credentials needed",
  };
}
