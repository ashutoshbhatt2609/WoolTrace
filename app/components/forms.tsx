"use client";
import { useState, type FormEvent, type ReactNode } from "react";
export async function requestJson<T=Record<string,unknown>>(url:string,init?:RequestInit):Promise<T>{
 const response=await fetch(url,{...init,headers:{"Content-Type":"application/json",...init?.headers},cache:"no-store",signal:AbortSignal.timeout(20000)});
 const data=await response.json().catch(()=>({error:"The response could not be read."}));
 if(!response.ok) throw new Error(data.error||"Something went wrong. Please try again.");
 return data as T;
}
export function ActionForm({children,submit,onSubmit,success="Saved successfully."}:{children:ReactNode;submit:string;onSubmit:(data:FormData)=>Promise<void>;success?:string}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(""),[failed,setFailed]=useState(false);
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();const data=new FormData(e.currentTarget);setBusy(true);setMessage("");try{await onSubmit(data);setFailed(false);setMessage(success);}catch(err){setFailed(true);setMessage(err instanceof Error?err.message:"Please try again.");}finally{setBusy(false);}}
 return <form className="wt-form" onSubmit={save}><fieldset disabled={busy}>{children}<button className="wt-button" type="submit">{busy?"Saving…":submit}</button></fieldset>{message&&<p role={failed?"alert":"status"} className={failed?"wt-error":"wt-success"}>{message}</p>}</form>;
}
export function Field({label,name,type="text",value,required=true,min,max,step,placeholder}:{label:string;name:string;type?:string;value?:string|number;required?:boolean;min?:string|number;max?:string|number;step?:string;placeholder?:string}){
 return <label>{label}<input name={name} type={type} defaultValue={value} required={required} min={min} max={max} step={step} placeholder={placeholder} maxLength={type==="text"?160:undefined}/></label>;
}
export async function compressPhoto(file:File){
 if(!file.size || !["image/jpeg","image/png","image/webp"].includes(file.type)) throw new Error("Choose a JPEG, PNG or WebP photo.");
 if(file.size>15*1024*1024) throw new Error("Choose a photo smaller than 15 MB.");
 const bitmap=await createImageBitmap(file);const canvas=document.createElement("canvas");
 const scale=Math.min(1,1280/Math.max(bitmap.width,bitmap.height));canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
 const ctx=canvas.getContext("2d");if(!ctx){bitmap.close();throw new Error("Photo processing is unavailable in this browser.");}
 ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 for(const quality of [.78,.62,.45,.3]){const result=canvas.toDataURL("image/jpeg",quality);if(result.length<500000)return result;}
 throw new Error("Please crop or resize this photo before uploading.");
}
