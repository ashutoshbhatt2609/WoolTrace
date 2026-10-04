"use client";
import { Download, Share2 } from "lucide-react";
import { useState } from "react";
export default function PassportActions({batchId}:{batchId:string}){
 const [message,setMessage]=useState("");
 async function share(){try{const data={title:"WoolTrace "+batchId,text:"Recorded wool journey",url:window.location.href};if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(data.url);setMessage("Link copied.");}}catch(e){if(e instanceof Error&&e.name!=="AbortError")setMessage("Could not share automatically. Copy the link from your browser’s address bar.");}}
 return <div className="passport-actions"><button className="passport-button" onClick={()=>window.print()}><Download/> Print or save QR passport</button><button className="passport-button" onClick={share}><Share2/> Share passport</button>{message&&<p role="status">{message}</p>}</div>;
}
