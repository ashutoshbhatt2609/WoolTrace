import { z } from "zod";
import { api, json } from "@/app/lib/api";
const weatherSchema=z.object({current:z.object({temperature_2m:z.number(),relative_humidity_2m:z.number(),wind_speed_10m:z.number(),precipitation:z.number(),time:z.string()})});
export const GET=api(async()=>{
 const location=process.env.FARM_LOCATION_NAME??"Chitradurga, Karnataka";
 const key=process.env.OPEN_METEO_API_KEY;
 if(!key && process.env.WEATHER_NONCOMMERCIAL!=="true")return json({location,weather:null,status:"not_enabled",message:"Weather is optional. The operator has not enabled a weather data plan."});
 try{
  const lat=Number(process.env.FARM_LATITUDE??14.2251),lon=Number(process.env.FARM_LONGITUDE??76.398);
  if(!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lon)||Math.abs(lon)>180)throw new Error("Invalid coordinates");
  const query=new URLSearchParams({latitude:String(lat),longitude:String(lon),current:"temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",timezone:"Asia/Kolkata"});
  if(key)query.set("apikey",key);
  const response=await fetch("https://"+(key?"customer-api.open-meteo.com":"api.open-meteo.com")+"/v1/forecast?"+query,{signal:AbortSignal.timeout(8000),next:{revalidate:600}});
  if(!response.ok)throw new Error("Weather unavailable");
  const {current}=weatherSchema.parse(await response.json());
  return json({location,status:"available",weather:{temperatureC:current.temperature_2m,humidityPercent:current.relative_humidity_2m,windKph:current.wind_speed_10m,precipitationMm:current.precipitation,observedAt:current.time,source:"Open-Meteo",sourceUrl:"https://open-meteo.com/"}});
 }catch{return json({location,weather:null,status:"unavailable",message:"Weather data is temporarily unavailable. No estimated values are shown."});}
});
