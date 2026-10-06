import { authRoute, adminSession } from './admin-auth.mjs';
import { database } from './db.mjs';
import v2Template from './v2-template.mjs';
import { v2Route } from './v2-api.mjs';
export default {
 async fetch(request,env) {
  const url=new URL(request.url), path=url.pathname;
  if(/^\/v2\/(app\.js|styles\.css|favicon\.svg)$/.test(path))return env.ASSETS.fetch(request);
  let cookie;
  const headers={'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin'};
  const json=(status,data)=>new Response(JSON.stringify(data),{status,headers:{...headers,'content-type':'application/json; charset=utf-8',...(cookie?{'set-cookie':cookie}:{})}});
  const html=(status,text)=>new Response(text,{status,headers:{...headers,'content-type':'text/html; charset=utf-8','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",...(cookie?{'set-cookie':cookie}:{})}});
  try {
   if(path==='/healthz')return json(200,{ok:true});
   if(request.method==='GET'&&['/','/admin'].includes(path))return html(200,v2Template);
   if(request.method==='GET'&&['/v2','/v2/','/v2/admin'].includes(path)){url.pathname=path.endsWith('/admin')?'/admin':'/';return Response.redirect(url.toString(),302);}
   const db=database(env.DB);
   if(path.startsWith('/api/admin/')){const auth=await authRoute(request,env,db);if(auth)return auth;if(!await adminSession(request,db))return json(401,{error:'관리자 로그인이 필요합니다.'});}
   let visitor=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('ai_v0='))?.slice(6);
   if(!/^[a-f0-9-]{36}$/.test(visitor||'')){visitor=crypto.randomUUID();cookie=`ai_v0=${visitor}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${url.protocol==='https:'?'; Secure':''}`;}
   await db.run('INSERT OR IGNORE INTO visitors(id) VALUES(?)',visitor);
   if(path.startsWith('/api/v2/')||path.startsWith('/api/admin/v2/'))return await v2Route({request,url,db,visitor,json});
   return json(404,{error:'찾을 수 없는 페이지입니다.'});
  } catch(e) { return json(e.status||500,{error:e.status?e.message:'잠시 후 다시 시도해주세요.'}); }
 }
};
