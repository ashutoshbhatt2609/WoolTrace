import { ApiError } from "./api";
import { indiaToday } from "./dates";

const ranks:Record<string,number>={shearing_complete:10,wool_received:20,pickup_recorded:30,delivery_recorded:40,storage_intake:50,storage_released:60,scouring_completed:70,carding_completed:80,spinning_completed:90,weaving_completed:100,dyeing_completed:100,finished_product_recorded:110};
export function nextLifecycleStatus(current:string,title:string,events:{title:string;performedAt:Date|null;occurredAt:Date}[],performedAt:Date){
 const last=(name:string)=>[...events].reverse().find(e=>e.title===name);
 const previous=(names:string[])=>[...events].reverse().find(e=>names.includes(e.title));
 let prerequisite:typeof events[number]|undefined;
 if(title==="Delivery recorded"){
  prerequisite=last("Pickup recorded");const handoff=previous(["Pickup recorded","Delivery recorded"]);
  if(!prerequisite||handoff?.title!=="Pickup recorded")throw new ApiError(409,"Record pickup before delivery. A pickup can have only one delivery.");
 }
 if(title==="Pickup recorded"&&previous(["Pickup recorded","Delivery recorded"])?.title==="Pickup recorded")throw new ApiError(409,"This pickup is still open. Record delivery before starting another pickup.");
 if(title==="Storage released"){
  prerequisite=last("Storage intake");if(previous(["Storage intake","Storage released"])?.title!=="Storage intake")throw new ApiError(409,"Record storage intake before release.");
 }
 if(title==="Storage intake"&&previous(["Storage intake","Storage released"])?.title==="Storage intake")throw new ApiError(409,"This batch is already in storage. Record its release first.");
 if(prerequisite&&indiaToday(performedAt)<indiaToday(prerequisite.performedAt??prerequisite.occurredAt))throw new ApiError(400,"The stage date cannot be earlier than its preceding handoff.");
 if(!["Pickup recorded","Delivery recorded","Storage intake","Storage released"].includes(title)&&last(title))throw new ApiError(409,"This stage has already been recorded for the batch.");
 const processing=["Scouring completed","Carding completed","Spinning completed","Weaving completed"];
 const step=processing.indexOf(title);if(step>0){prerequisite=last(processing[step-1]);if(!prerequisite)throw new ApiError(409,"Record "+processing[step-1].toLowerCase()+" first.");if(indiaToday(performedAt)<indiaToday(prerequisite.performedAt??prerequisite.occurredAt))throw new ApiError(400,"Processing dates must follow the recorded stage order.");}
 const target=title.toLowerCase().replaceAll(" ","_");
 return (ranks[target]??0)>(ranks[current]??0)?target:current;
}
