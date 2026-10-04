import "server-only";
export function appBaseUrl(){
 const host=process.env.VERCEL_PROJECT_PRODUCTION_URL??process.env.VERCEL_URL;
 return (process.env.APP_BASE_URL??(host?"https://"+host:"http://localhost:3000")).replace(/\/$/,"");
}
