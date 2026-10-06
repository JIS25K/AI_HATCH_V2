const enc=new TextEncoder();
const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
export const digest=async text=>hex(await crypto.subtle.digest('SHA-256',enc.encode(text)));
const equal=(a,b)=>{if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;};
async function derive(password,salt){const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},key,256));}
const tokenFrom=request=>request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('hatch_admin='))?.slice(12)||'';
const cookie=(request,value,age)=>`hatch_admin=${value}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${age}${new URL(request.url).protocol==='https:'?'; Secure':''}`;
export async function adminSession(request,db){const token=tokenFrom(request);if(!/^[a-f0-9]{64}$/.test(token))return false;return !!await db.one('SELECT 1 FROM admin_sessions WHERE token_hash=? AND expires_at>?',await digest(token),Date.now());}
async function limit(request,db){const bucket=Math.floor(Date.now()/900000);const ip=await digest(request.headers.get('cf-connecting-ip')||'local');await db.run('DELETE FROM admin_attempts WHERE bucket<?',bucket-1);for(const [key,max] of [[ip,10],['global',100]]){const row=await db.one('INSERT INTO admin_attempts(key,bucket,attempts) VALUES(?,?,1) ON CONFLICT(key,bucket) DO UPDATE SET attempts=attempts+1 RETURNING attempts',key,bucket);if(row.attempts>max)return false;}return true;}
export async function authRoute(request,env,db){
 const url=new URL(request.url),path=url.pathname;
 if(!['/api/admin/auth','/api/admin/setup','/api/admin/login','/api/admin/logout'].includes(path))return null;
 const respond=(status,data,setCookie)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff',...(setCookie?{'set-cookie':setCookie}:{})}});
 // Provision the existing owner credential from a private runtime secret once.
 let account=await db.one('SELECT * FROM admin_account WHERE id=1');
 if(!account&&env.ADMIN_ACCOUNT_SEED){
  const seed=JSON.parse(env.ADMIN_ACCOUNT_SEED);
  if(!/^[a-f0-9]{64}$/.test(seed.password_hash)||!/^[a-f0-9]{64}$/.test(seed.salt))throw new Error('Invalid admin seed');
  await db.run('INSERT OR IGNORE INTO admin_account(id,password_hash,salt,created_at) VALUES(1,?,?,?)',seed.password_hash,seed.salt,seed.created_at);
  account=await db.one('SELECT * FROM admin_account WHERE id=1');
 }
 if(path==='/api/admin/auth'&&request.method==='GET')return respond(200,{configured:!!account,authenticated:await adminSession(request,db)});
 if(request.method!=='POST')return respond(405,{error:'허용되지 않은 요청입니다.'});
 if(request.headers.get('origin')!==url.origin||!request.headers.get('content-type')?.startsWith('application/json'))return respond(403,{error:'관리자 페이지에서 다시 시도해주세요.'});
 if(path==='/api/admin/logout'){await db.run('DELETE FROM admin_sessions WHERE token_hash=?',await digest(tokenFrom(request)));return respond(200,{ok:true},cookie(request,'',0));}
 const raw=await request.text();if(raw.length>4096)return respond(413,{error:'입력값이 너무 깁니다.'});let input;try{input=JSON.parse(raw)}catch{return respond(400,{error:'잘못된 요청입니다.'});}
 if(!input||typeof input.password!=='string'||input.password.length>128)return respond(400,{error:'비밀번호를 확인해주세요.'});
 if(!await limit(request,db))return respond(429,{error:'시도가 너무 많습니다. 15분 후 다시 시도해주세요.'});
 if(path==='/api/admin/setup'){
  if(account)return respond(409,{error:'이미 비밀번호가 설정되어 있습니다. 로그인해주세요.'});
  if(!env.ADMIN_SETUP_HASH||!Number.isFinite(Number(env.ADMIN_SETUP_EXPIRES))||Date.now()>Number(env.ADMIN_SETUP_EXPIRES)||typeof input.setupKey!=='string'||!equal(await digest(input.setupKey),env.ADMIN_SETUP_HASH))return respond(403,{error:'최초 설정 전용 링크가 필요하거나 링크가 만료되었습니다.'});
  if(input.password.length<12)return respond(400,{error:'비밀번호는 12자 이상으로 설정해주세요.'});
  const salt=random(),hash=await derive(input.password,salt);
  const created=await db.one('INSERT INTO admin_account(id,password_hash,salt,created_at) VALUES(1,?,?,?) ON CONFLICT(id) DO NOTHING RETURNING id',hash,salt,Date.now());
  if(!created)return respond(409,{error:'이미 설정되었습니다. 로그인해주세요.'});
 }else{
  if(!account)return respond(403,{error:'아직 관리자 비밀번호가 설정되지 않았습니다.'});
  if(!equal(await derive(input.password,account.salt),account.password_hash))return respond(401,{error:'비밀번호가 일치하지 않습니다.'});
 }
 const token=random();await db.batch([['DELETE FROM admin_sessions WHERE expires_at<=?',Date.now()],['INSERT INTO admin_sessions(token_hash,expires_at) VALUES(?,?)',await digest(token),Date.now()+604800000]]);
 return respond(200,{ok:true},cookie(request,token,604800));
}
