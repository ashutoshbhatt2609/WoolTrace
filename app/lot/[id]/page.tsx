import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { getDb } from "@/db";
import { productLots } from "@/db/schema";
import { appBaseUrl } from "@/app/lib/integration-config";
export const dynamic="force-dynamic";
export default async function LotPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const [lot]=await getDb().select().from(productLots).where(eq(productLots.id,id)).limit(1);if(!lot)notFound();
 const qr=await QRCode.toDataURL(appBaseUrl()+"/lot/"+id,{width:260,margin:2});
 return <main className="wt-legal"><Link href="/">WoolTrace</Link><p>PUBLIC PRODUCT-LOT PASSPORT</p><h1>{lot.name}</h1><p>{lot.kind.replaceAll("_"," ")} · {lot.weightKg} kg</p><div className="wt-lot-qr"><Image unoptimized src={qr} width={260} height={260} alt="QR for this product lot"/><div><p>Scan to return to this lot and its source wool.</p><code>{lot.id}</code><p>Recorded {lot.createdAt.toLocaleDateString("en-IN",{timeZone:"Asia/Kolkata"})}</p></div></div><h2>Follow the wool back</h2>{lot.parentLotId&&<p><Link href={"/lot/"+lot.parentLotId}>Open the parent processing lot →</Link></p>}<p><Link className="wt-button" href={"/batch/"+lot.batchId}>See source farmer & complete batch journey →</Link></p><p>Linked by an invited participant. Output weights are checked against recorded parent allocations. This does not independently certify physical identity, processing quality or yield.</p></main>;
}
