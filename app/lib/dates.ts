import { z } from "zod";

export function indiaToday(now=new Date()){
 const parts=new Intl.DateTimeFormat("en",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
 const part=(type:string)=>parts.find(p=>p.type===type)?.value;
 return `${part("year")}-${part("month")}-${part("day")}`;
}
export const calendarDate=z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid calendar date.").refine(value=>{
 const date=new Date(value+"T00:00:00.000Z");return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
},"Choose a valid calendar date.");
export const pastDate=calendarDate.refine(value=>value<=indiaToday(),"Choose today or an earlier date.").transform(value=>new Date(value+"T00:00:00.000Z"));
export const plannedDate=calendarDate.refine(value=>value>=indiaToday(),"Choose today or a future date.").transform(value=>new Date(value+"T00:00:00.000Z"));
