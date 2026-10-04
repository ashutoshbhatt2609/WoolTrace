import "server-only";
import sharp from "sharp";
import { ApiError } from "./api";

export async function validatePhoto(value:string){
 try{
  if(!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(value))throw new Error("Invalid encoding");
  const bytes=Buffer.from(value.split(",")[1],"base64");
  const image=sharp(bytes,{failOn:"warning",limitInputPixels:20_000_000});
  const metadata=await image.metadata();
  if(metadata.format!=="jpeg"||!metadata.width||!metadata.height||metadata.width<16||metadata.height<16)throw new Error("Invalid image");
  const output=await image.rotate().resize({width:1280,height:1280,fit:"inside",withoutEnlargement:true}).jpeg({quality:70}).toBuffer();
  if(output.length>375000)throw new Error("Photo too large");
  return "data:image/jpeg;base64,"+output.toString("base64");
 }catch{throw new ApiError(400,"Choose a complete JPEG photo. Try cropping or resizing it if the upload fails.");}
}
