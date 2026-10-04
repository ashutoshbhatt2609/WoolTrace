import { z } from "zod";
export function pageInput(request:Request){
 const params=new URL(request.url).searchParams;
 const page=z.coerce.number().int().min(1).max(100000).parse(params.get("page")??1);
 const limit=z.coerce.number().int().min(1).max(100).parse(params.get("limit")??100);
 return {page,limit,offset:(page-1)*limit};
}
export function pageInfo(page:number,limit:number,total:number){return {page,limit,total,hasNext:page*limit<total};}
