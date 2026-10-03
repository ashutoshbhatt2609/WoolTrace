import {createClient} from "@libsql/client";
const required=["APP_BASE_URL","GOOGLE_CLIENT_ID","GOOGLE_CLIENT_SECRET","AUTH_SECRET","TURSO_DATABASE_URL","TURSO_AUTH_TOKEN"];
const missing=required.filter(k=>!process.env[k]);
if(missing.length)throw new Error("Missing environment keys: "+missing.join(", "));
if(process.env.AUTH_SECRET.length<32)throw new Error("AUTH_SECRET must contain at least 32 characters.");
if(process.env.DEMO_MODE==="true")throw new Error("Disable DEMO_MODE for production.");
const base=new URL(process.env.APP_BASE_URL);if(base.protocol!=="https:")throw new Error("Production APP_BASE_URL must use HTTPS.");
console.log("Required environment keys are present. Secrets are not printed.");
console.log("Production origin: "+base.origin);
const client=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
try{
 const tables=await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
 console.log("Database reachable. Tables: "+tables.rows.map(r=>r.name).join(", "));
 const requiredTables=["users","farms","wool_batches","batch_events","bids","bookings","batch_participants","product_lots","rate_windows"];
 const names=new Set(tables.rows.map(r=>r.name));const absent=requiredTables.filter(t=>!names.has(t));
 if(absent.length){console.log("Migrations required for: "+absent.join(", "));process.exitCode=2;}
 else{await client.execute("SELECT onboarded, organisation FROM users LIMIT 0");await client.execute("SELECT sale_status, completed_at FROM wool_batches LIMIT 0");console.log("Production schema checks passed.");}
}finally{client.close();}
