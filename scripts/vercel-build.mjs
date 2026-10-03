import {spawnSync} from "node:child_process";
function run(args){const result=spawnSync(process.execPath,args,{stdio:"inherit",env:process.env});if(result.status!==0)process.exit(result.status??1);}
// Additive, transactional migrations run before production deployment promotion.
// Preview projects require a separate database and an explicit migration step.
if(process.env.VERCEL_ENV==="production")run(["scripts/migrate-turso.mjs"]);
run(["node_modules/next/dist/bin/next","build"]);
