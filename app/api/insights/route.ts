import { api, ApiError, json } from "@/app/lib/api";
import { getInsights } from "@/app/lib/insights";
import { isInsightArea } from "@/app/lib/insights-locations";
export const GET = api(async request => {
  const area = new URL(request.url).searchParams.get("area") ?? "chitradurga";
  if (!isInsightArea(area)) throw new ApiError(400, "Choose a supported Karnataka area.");
  return json(await getInsights(area));
});
