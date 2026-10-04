"use client";
import { createContext, useContext, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { AlertCircle, CheckCircle2, LoaderCircle, ArrowRight, Upload, X } from "lucide-react";

export async function requestJson<T=Record<string,unknown>>(url:string,init?:RequestInit):Promise<T>{
 const response=await fetch(url,{...init,headers:{"Content-Type":"application/json",...init?.headers},cache:"no-store",signal:AbortSignal.timeout(20000)});
 const data=await response.json().catch(()=>({error:"The response could not be read."}));
 if(!response.ok) throw new Error(data.error||"Something went wrong. Please try again.");
 return data as T;
}
const FormContext=createContext<{errors:Record<string,string>}>({errors:{}});
export function ActionForm({children,submit,onSubmit,success="Saved successfully.",intro,disabled=false}:{children:ReactNode;submit:string;onSubmit:(data:FormData)=>Promise<void>;success?:string;intro?:string;disabled?:boolean}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(""),[failed,setFailed]=useState(false),[errors,setErrors]=useState<Record<string,string>>({});
 const alert=useRef<HTMLDivElement>(null);
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy||disabled)return;const form=e.currentTarget;
  const invalid=Array.from(form.elements).filter((el):el is HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement=>(el instanceof HTMLInputElement||el instanceof HTMLSelectElement||el instanceof HTMLTextAreaElement)&&!el.disabled&&!el.checkValidity());
  if(invalid.length){setErrors(Object.fromEntries(invalid.map(el=>[el.name,el.validationMessage])));setFailed(true);setMessage("Please check "+invalid.length+" "+(invalid.length===1?"field":"fields")+" before continuing.");invalid[0].focus();return;}
  const data=new FormData(form);setErrors({});setBusy(true);setMessage("");
  try{await onSubmit(data);setFailed(false);setMessage(success);}
  catch(err){setFailed(true);setMessage(err instanceof Error?err.message:"Please try again.");setTimeout(()=>alert.current?.focus(),0);}
  finally{setBusy(false);}
 }
 return <FormContext.Provider value={{errors}}><form className="wt-form wt-entry-form" onSubmit={save} noValidate aria-busy={busy} onChangeCapture={e=>{const name=e.target.getAttribute("name");if(name)setErrors(current=>{const next={...current};delete next[name];return next;});setMessage("");}}>
 {intro&&<p className="wt-form-intro">{intro}</p>}<fieldset disabled={busy||disabled}>{children}<div className="wt-form-footer"><span>Review your details before saving.</span><button className="wt-button" type="submit">{busy?<LoaderCircle className="wt-spinner" size={17}/>:null}{busy?"Saving your details…":submit}{!busy&&<ArrowRight size={17}/>}</button></div></fieldset>
 {message&&<div ref={alert} tabIndex={-1} role={failed?"alert":"status"} className={failed?"wt-form-feedback is-error":"wt-form-feedback is-success"}>{failed?<AlertCircle size={18}/>:<CheckCircle2 size={18}/>}<span>{message}</span></div>}</form></FormContext.Provider>;
}
export function Field({label,name,type="text",value,required=true,min,max,step,placeholder,help,unit,autoComplete,minLength,disabled=false}:{label:string;name:string;type?:string;value?:string|number;required?:boolean;min?:string|number;max?:string|number;step?:string;placeholder?:string;help?:string;unit?:string;autoComplete?:string;minLength?:number;disabled?:boolean}){
 const id=useId(),{errors}=useContext(FormContext),error=errors[name],description=id+"-hint";
 const examples:Record<string,string>={farmName:"e.g. Deccani Farmers Group",village:"e.g. Hiriyur",district:"e.g. Chitradurga",breed:"e.g. Deccani",shearer:"Name of the person or shearing team",organisation:"Your farm, group or company",location:"Farm, facility or handover location",providerName:"Name of your service provider",reference:"Bank transaction ID / UTR",name:"e.g. Deccani yarn — October lot",grade:"e.g. B",email:"partner@example.com"};
 return <label className={"wt-field "+(error?"has-error":"")} htmlFor={id}><span className="wt-field-name">{label}{required?<span className="wt-required" aria-label="required"> *</span>:<small>Optional</small>}</span><span className={"wt-input-wrap "+(unit?"has-unit":"")}><input id={id} name={name} type={type} defaultValue={value} required={required} min={min} max={max} step={step} placeholder={placeholder??examples[name]} minLength={minLength} maxLength={type==="text"?160:undefined} inputMode={type==="number"?"decimal":type==="email"?"email":undefined} autoComplete={autoComplete??(type==="email"?"email":"off")} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={help||error?description:undefined}/>{unit&&<span className="wt-input-unit">{unit}</span>}</span>{(help||error)&&<small className={error?"wt-field-error":"wt-field-hint"} id={description}>{error||help}</small>}</label>;
}
export function FormSection({title,description,children}:{title:string;description?:string;children:ReactNode}){
 return <section className="wt-form-section"><div><h3>{title}</h3>{description&&<p>{description}</p>}</div>{children}</section>;
}
export function SelectField({label,name,children,required=true,value,defaultValue,help,onChange}:{label:string;name:string;children:ReactNode;required?:boolean;value?:string;defaultValue?:string;help?:string;onChange?:(value:string)=>void}){
 const id=useId(),{errors}=useContext(FormContext),error=errors[name],description=id+"-hint";
 return <label className={"wt-field "+(error?"has-error":"")} htmlFor={id}><span className="wt-field-name">{label}{required?<span className="wt-required" aria-label="required"> *</span>:<small>Optional</small>}</span><select id={id} name={name} required={required} value={value} defaultValue={value===undefined?defaultValue:undefined} onChange={onChange?e=>onChange(e.target.value):undefined} aria-invalid={Boolean(error)} aria-describedby={help||error?description:undefined}>{children}</select>{(help||error)&&<small className={error?"wt-field-error":"wt-field-hint"} id={description}>{error||help}</small>}</label>;
}
export function NotesField({name="notes",label="Stage details",placeholder}:{name?:string;label?:string;placeholder?:string}){
 const id=useId();
 return <label className="wt-field" htmlFor={id}><span className="wt-field-name">{label}<small>Optional</small></span><textarea id={id} name={name} rows={4} maxLength={500} placeholder={placeholder}/><small className="wt-field-hint">Up to 500 characters. Keep private contact details out of public stage notes.</small></label>;
}
export function PhotoField(){
 const [preview,setPreview]=useState(""),[name,setName]=useState(""),[error,setError]=useState("");
 const input=useRef<HTMLInputElement>(null),{errors}=useContext(FormContext);
 async function choose(file?:File){
  setError("");if(!file)return;try{const compressed=await compressPhoto(file);setPreview(compressed);setName(file.name);}catch(e){setPreview("");setName("");if(input.current)input.current.value="";setError((e as Error).message);}
 }
 return <div className="wt-photo-field"><label className="wt-upload"><Upload size={23}/><span><strong>{name||"Add a shearing photo"}</strong><small>Choose a JPG, PNG or WebP · up to 15 MB</small></span><span className="wt-upload-action">Choose photo</span><input ref={input} type="file" name="photo" accept="image/jpeg,image/png,image/webp" required onChange={e=>choose(e.target.files?.[0])} aria-label="Shearing photo"/></label>{preview&&<div className="wt-photo-preview"><Image unoptimized src={preview} width={180} height={130} alt="Your selected shearing photo"/><div><strong>Photo ready</strong><p>Compressed for upload. This appears on the wool passport.</p><button type="button" onClick={()=>{setPreview("");setName("");if(input.current)input.current.value="";}}><X size={14}/> Remove photo</button></div></div>}{(error||errors.photo)&&<p className="wt-field-error" role="alert">{error||errors.photo}</p>}</div>;
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
