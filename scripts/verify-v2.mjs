import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import worker from '../src/worker.mjs';
import {digest} from '../src/admin-auth.mjs';
import {tasks,blockers,practices,makePlan} from '../src/v2-content.mjs';
const sqlite=new DatabaseSync(':memory:');
sqlite.exec('PRAGMA foreign_keys=ON');
for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync('drizzle/'+file,'utf8'));
const binding={prepare(sql){return {bind(...args){return {first:()=>sqlite.prepare(sql).get(...args)||null,all:()=>({results:sqlite.prepare(sql).all(...args)}),run:()=>sqlite.prepare(sql).run(...args)}}}},async batch(statements){sqlite.exec('BEGIN');try{const result=statements.map(s=>s.run());sqlite.exec('COMMIT');return result}catch(e){sqlite.exec('ROLLBACK');throw e}}};
const env={DB:binding,ASSETS:{fetch:()=>new Response('asset')}};
const origin='https://example.test';
function client(){let cookie='';return async(path,data,{status=200,headers={}}={})=>{const res=await worker.fetch(new Request(origin+path,{method:data===undefined?'GET':'POST',headers:{cookie,origin,'content-type':'application/json',...headers},...(data===undefined?{}:{body:JSON.stringify(data)})}),env);const set=res.headers.get('set-cookie');if(set)cookie=set.split(';')[0];const text=await res.text();assert.equal(res.status,status,path+' '+text);return res.headers.get('content-type')?.includes('application/json')?JSON.parse(text):text}}
const a=client(),b=client();const adminToken='a'.repeat(64);sqlite.prepare('INSERT INTO admin_sessions(token_hash,expires_at) VALUES(?,?)').run(await digest(adminToken),Date.now()+3600000);const auth={headers:{cookie:'hatch_admin='+adminToken}};
const enter=async(c,source,qa=false)=>{const id=crypto.randomUUID();const response=await c('/api/v2/enter',{id,source,qa});return response.run};
const event=(c,id,name,extra={})=>c('/api/v2/event',{runId:id,name,...extra});
const run=await enter(a,'network');await a('/api/v2/enter',{id:run.id,source:'changed'});assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM v2_runs').get().n,1);
assert.equal((await a('/api/v2/run?id='+run.id)).selectedLevel,null);
await event(a,run.id,'level_explore',{level:4});await event(a,run.id,'level_explore',{level:4});
await a('/api/v2/event',{runId:run.id,name:'level_select',level:8,eventId:crypto.randomUUID()},{status:400});
await b('/api/v2/event',{runId:run.id,name:'level_select',level:4,eventId:crypto.randomUUID()},{status:404});
await event(a,run.id,'level_select',{level:0,eventId:crypto.randomUUID()});assert.equal((await a('/api/v2/run?id='+run.id)).selectedLevel,0);
await event(a,run.id,'level_select',{level:4,eventId:crypto.randomUUID()});assert.equal((await a('/api/v2/run?id='+run.id)).selectedLevel,4);
assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM v2_events WHERE name='level_explore_4'").get().n,1);
assert.equal(sqlite.prepare('SELECT started_at FROM v2_runs WHERE id=?').get(run.id).started_at,null);
await a('/api/v2/event',{runId:run.id,name:'prompt_copy'},{status:400});
await b('/api/v2/run?id='+run.id,undefined,{status:404});
await b('/api/v2/select',{runId:run.id,task:'study'},{status:404});
await a('/api/v2/select',{runId:run.id,task:'invalid'},{status:400});
await a('/api/v2/select',{runId:run.id,task:'research'});
await a('/api/v2/select',{runId:run.id,task:'research',blocker:'verify'});
const profile={runId:run.id,task:'research',blocker:'verify',practice:'context'};
const done=await a('/api/v2/select',profile);assert.equal(done.plan.practice,'자료와 조건을 함께 제공합니다');assert.equal((await a('/api/v2/select',profile)).plan.title,done.plan.title);
await a('/api/v2/select',{...profile,practice:'system'},{status:409});
await event(a,run.id,'result_view');await event(a,run.id,'result_view');await event(a,run.id,'prompt_copy');await event(a,run.id,'trial_open');
const eid=crypto.randomUUID();await event(a,run.id,'feedback',{eventId:eid,outcome:'useful',reason:'clearer'});await event(a,run.id,'feedback',{eventId:eid,outcome:'useful',reason:'clearer'});
assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM v2_events WHERE name LIKE 'feedback_%'").get().n,1);
assert.equal((await a('/api/v2/run?id='+run.id)).feedback.outcome,'useful');
await event(a,run.id,'feedback',{eventId:crypto.randomUUID(),outcome:'not_yet',reason:'no_time'});assert.equal((await a('/api/v2/run?id='+run.id)).feedback.outcome,'not_yet');
const second=await enter(a,'network');await a('/api/v2/select',{runId:second.id,task:'study',blocker:'structure',practice:'ask'});await event(a,second.id,'result_view');
const qa=await enter(b,'internal_review');assert.equal(qa.is_qa,1);await b('/api/v2/select',{runId:qa.id,task:'presentation',blocker:'repeat',practice:'system'});await event(b,qa.id,'result_view');
await a('/api/admin/v2/summary',undefined,{status:401});await a('/api/admin/v2/export.csv',undefined,{status:401});
let summary=await a('/api/admin/v2/summary',undefined,auth);assert.equal(summary.metrics.visitors,1);assert.equal(summary.metrics.runs,2);assert.equal(summary.metrics.viewed,1);assert.equal(summary.metrics.applied,0);assert.equal(summary.excludedQa,1);assert.equal(summary.levelMap.explored,1);assert.equal(summary.levelMap.selected,1);assert.equal(summary.levelMap.byLevel[4].users,1);assert.equal(summary.levelMap.byLevel[0].users,0);
summary=await a('/api/admin/v2/summary?qa=1',undefined,auth);assert.equal(summary.metrics.visitors,2);
summary=await a('/api/admin/v2/summary?source=missing',undefined,auth);assert.equal(summary.metrics.visitors,0);
// Verify historical feedback is reconstructed at the experiment cutoff, not overwritten.
sqlite.prepare("UPDATE v2_runs SET created_at='2026-10-01 00:00:00',started_at='2026-10-01 00:01:00',result_at='2026-10-01 00:02:00' WHERE id=?").run(run.id);
sqlite.prepare("UPDATE v2_events SET created_at='2026-10-01 00:03:00' WHERE run_id=?").run(run.id);
sqlite.prepare("UPDATE v2_events SET created_at='2026-10-04 00:00:00' WHERE run_id=? AND name LIKE 'feedback_%' AND json_extract(detail,'$.outcome')='not_yet'").run(run.id);
summary=await a('/api/admin/v2/summary?start=2026-10-01T00:00:00Z&end=2026-10-03T00:00:00Z',undefined,auth);assert.equal(summary.metrics.applied,1);assert.equal(summary.metrics.useful,1);
await a('/api/admin/v2/summary?start=bad',undefined,{...auth,status:400});
await a('/api/v2/enter',{id:crypto.randomUUID()},{headers:{origin:'https://other.test'},status:403});
const csv=await a('/api/admin/v2/export.csv',undefined,auth);assert.match(csv,/event_at/);assert.match(csv,/feedback_/);assert.doesNotMatch(csv,/internal_review/);
for(const task of tasks)for(const blocker of blockers)for(const practice of practices){const p=makePlan({task:task.id,blocker:blocker.id,practice:practice.id});assert.equal(p.checks.length,3);assert.ok(p.prompt.length>100);assert.ok(!p.prompt.includes('undefined'))}
assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM sqlite_master WHERE type='table' AND name IN ('sessions','events','completions','utility_waitlist')").get().n,0);
assert.match(await a('/'),/AI HATCH V2/);assert.match(await a('/admin'),/AI HATCH V2/);
await a('/api/content',undefined,{status:404});
for(const [path,target] of [['/v2?src=network&qa=1','/?src=network&qa=1'],['/v2/admin','/admin']]){
 const redirect=await worker.fetch(new Request(origin+path),env);assert.equal(redirect.status,302);assert.equal(redirect.headers.get('location'),origin+target);
}
// Verify owner credential initialization and real password login on the independent database.
const password='synthetic-test-password-only',salt='b'.repeat(64),encoder=new TextEncoder();
const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
const bytes=await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(salt),iterations:100000,hash:'SHA-256'},key,256);
const hash=Buffer.from(bytes).toString('hex');env.ADMIN_ACCOUNT_SEED=JSON.stringify({password_hash:hash,salt,created_at:1});
const owner=client();assert.equal((await owner('/api/admin/auth')).configured,true);
await owner('/api/admin/login',{password:'wrong-password'},{status:401});
await owner('/api/admin/login',{password});assert.equal((await owner('/api/admin/auth')).authenticated,true);
assert.ok((await owner('/api/admin/v2/summary')).metrics);
await owner('/api/admin/logout',{});assert.equal((await owner('/api/admin/auth')).authenticated,false);
assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM admin_account').get().n,1);
// Purchase intent requires an owned, completed run and a visible offer; never a payment.
const buyer=client(),buyerRun=await enter(buyer,'purchase_test_external');
await buyer('/api/v2/event',{runId:buyerRun.id,name:'purchase_click'},{status:400});
const buyerProfile={runId:buyerRun.id,task:'study',blocker:'repeat',practice:'context'};
const buyerPlan=await buyer('/api/v2/select',buyerProfile);
assert.equal(buyerPlan.plan.offer.price,4900);assert.ok(buyerPlan.plan.kit.demo.input.includes('가상'));
assert.match(buyerPlan.plan.prompt,/Anki/);assert.equal(buyerPlan.plan.kit.tools.length,2);
await event(buyer,buyerRun.id,'result_view');
await buyer('/api/v2/event',{runId:buyerRun.id,name:'purchase_click'},{status:400});
await b('/api/v2/event',{runId:buyerRun.id,name:'offer_view'},{status:404});
await event(buyer,buyerRun.id,'prompt_copy_click');await event(buyer,buyerRun.id,'prompt_copy_click');
let funnel=await a('/api/admin/v2/summary?source=purchase_test_external',undefined,auth);
assert.equal(funnel.metrics.copyClicked,1);assert.equal(funnel.metrics.copied,0);
await event(buyer,buyerRun.id,'prompt_copy');
await event(buyer,buyerRun.id,'offer_view',{price:1,offer:{price:1}});
await event(buyer,buyerRun.id,'purchase_click',{price:1});await event(buyer,buyerRun.id,'purchase_click');
assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM v2_events WHERE run_id=? AND name LIKE 'purchase_click%'").get(buyerRun.id).n,1);
const offerDetail=JSON.parse(sqlite.prepare("SELECT detail FROM v2_events WHERE run_id=? AND name LIKE 'purchase_click%'").get(buyerRun.id).detail);assert.equal(offerDetail.offer.price,4900);assert.equal(offerDetail.offer.currency,'KRW');
const repeatBuyerRun=await enter(buyer,'purchase_test_external');
await buyer('/api/v2/select',{...buyerProfile,runId:repeatBuyerRun.id});
await event(buyer,repeatBuyerRun.id,'result_view');await event(buyer,repeatBuyerRun.id,'offer_view');await event(buyer,repeatBuyerRun.id,'purchase_click');
funnel=await a('/api/admin/v2/summary?source=purchase_test_external',undefined,auth);
assert.equal(funnel.metrics.purchaseClicked,1);assert.equal(funnel.metrics.offerViewed,1);assert.equal(funnel.metrics.copied,1);
assert.equal(funnel.byFunnel.find(r=>r.task==='study'&&r.blocker==='repeat'&&r.practice==='context').purchaseClicked,1);
assert.equal(funnel.byOffer[0].price,4900);assert.equal(funnel.byOffer[0].purchaseClicked,1);
const buyerQaRun=await enter(b,'internal_purchase_test');await b('/api/v2/select',{...buyerProfile,runId:buyerQaRun.id});await event(b,buyerQaRun.id,'result_view');await event(b,buyerQaRun.id,'offer_view');await event(b,buyerQaRun.id,'purchase_click');
funnel=await a('/api/admin/v2/summary',undefined,auth);assert.equal(funnel.metrics.purchaseClicked,1);
funnel=await a('/api/admin/v2/summary?qa=1',undefined,auth);assert.equal(funnel.metrics.purchaseClicked,2);
const newCsv=await a('/api/admin/v2/export.csv?source=purchase_test_external',undefined,auth);assert.match(newCsv,/purchase_click/);assert.match(newCsv,/4900/);
sqlite.prepare("UPDATE v2_events SET created_at='2026-10-08 00:00:00' WHERE name LIKE 'purchase_click%'").run();
funnel=await a('/api/admin/v2/summary?end=2026-10-07T00:00:00Z',undefined,auth);assert.equal(funnel.metrics.purchaseClicked,0);
for(const task of tasks)for(const blocker of blockers)for(const practice of practices){const plan=makePlan({task:task.id,blocker:blocker.id,practice:practice.id});assert.equal(plan.kit.demo.headers.length,3);assert.equal(plan.offer.price,4900);assert.match(plan.prompt,/출력 계약/);}
console.log('PASS: purchase prerequisites, price snapshot, copy click/success separation, repeated-click and cross-run browser dedup, all 27 funnels, QA/source/cutoff filters and CSV.');
console.log('PASS: independent V2 root/admin, legacy redirects preserve query, V1 endpoints absent; admin credential initialization/login/logout; 27 plans; identity isolation; origin checks; event idempotency; QA exclusion; cohort statistics; CSV.');
// The short check measures scenario decisions, independently of the work funnel.
const checkUser=client(),checkRun=await enter(checkUser,'check_experiment');
const publicQuestions=(await checkUser('/api/v2/content')).abilityCheck.questions;
assert.equal(publicQuestions.length,4);assert.equal(typeof publicQuestions[0].options[0],'string');
await checkUser('/api/v2/event',{runId:checkRun.id,name:'check_complete',answers:[1,0,2,1]},{status:400});
await event(checkUser,checkRun.id,'check_start');await event(checkUser,checkRun.id,'check_start');
await b('/api/v2/event',{runId:checkRun.id,name:'check_complete',answers:[1,0,2,1]},{status:404});
for(const answers of [[1,0,2],[1,0,2,8],[1,0,2,'1'],[null,0,2,1]])await checkUser('/api/v2/event',{runId:checkRun.id,name:'check_complete',answers},{status:400});
await checkUser('/api/v2/event',{runId:checkRun.id,name:'check_answer',question:4,answer:0},{status:400});
const checkAnswers=[1,0,2,1];for(let i=0;i<4;i++)await event(checkUser,checkRun.id,'check_answer',{question:i,answer:checkAnswers[i]});
const checked=await event(checkUser,checkRun.id,'check_complete',{answers:checkAnswers,ready:0});assert.equal(checked.check.ready,4);
assert.equal((await event(checkUser,checkRun.id,'check_complete',{answers:[0,1,0,0]})).check.ready,4); // Retries cannot rewrite an issued result.
assert.equal((await checkUser('/api/v2/run?id='+checkRun.id)).check.ready,4);
assert.equal(sqlite.prepare('SELECT started_at FROM v2_runs WHERE id=?').get(checkRun.id).started_at,null);
const checkSummary=await checkUser('/api/admin/v2/summary?source=check_experiment',undefined,auth);assert.equal(checkSummary.abilityCheck.started,1);assert.equal(checkSummary.abilityCheck.completed,1);assert.ok(checkSummary.abilityCheck.dimensions.every(d=>d.users===1));assert.equal(checkSummary.metrics.started,0);
assert.match(await checkUser('/api/admin/v2/export.csv?source=check_experiment',undefined,auth),/check_complete_decision-check-v1/);
const {assess}=await import('../src/ability-check.mjs');
for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++)for(let d=0;d<3;d++){const r=assess([a,b,c,d]);assert.equal(r.dimensions.length,4);assert.ok(r.ready>=0&&r.ready<=4);assert.equal(r.priority.score,Math.min(...r.dimensions.map(x=>x.score)));}
console.log('Decision check: 81 profiles, validation, ownership, deduplication, restore and separate funnel verified.');

// Adaptive assessment: owned, resumable drafts; immutable results; separate metrics.
const {common:levelCommon,flow:levelFlow}=await import('../src/level-check.mjs');
const lc=client(),lr=await enter(lc,'level_experiment');
const postLevel=(payload,opts)=>lc('/api/v2/level-check',{runId:lr.id,...payload},opts);
await postLevel({action:'save',answers:[{id:'brief',choice:1}]},{status:400});
let ls=await postLevel({action:'start'});assert.equal(ls.answers.length,0);assert.equal(ls.questions.length,5);
assert.ok(!JSON.stringify(ls.questions).includes('correct'));
await b('/api/v2/level-check',{runId:lr.id,action:'start'},{status:404});
await postLevel({action:'save',answers:[{id:'brief',choice:1},{id:'context',choice:3}]},{status:400});
let la=[];for(const [i,choice] of [1,3,0,2,0].entries()){la.push({id:levelCommon[i].id,choice});ls=await postLevel({action:'save',answers:la});}
assert.equal(ls.questions[5].id,'experience_4');
assert.equal((await lc('/api/v2/run?id='+lr.id)).levelCheck.answers.length,5);
// Editing an earlier answer must discard incompatible branch history.
la=la.slice(0,3);la.push({id:'execution',choice:1});await postLevel({action:'save',answers:la});la.push({id:'operation',choice:0});ls=await postLevel({action:'save',answers:la});assert.equal(ls.questions[5].id,'experience_3');
await postLevel({action:'save',answers:[...la,{id:'experience_4',choice:1}]},{status:400});
for(const choice of [2,0]){const f=levelFlow(la);la.push({id:f.next.id,choice});ls=await postLevel({action:'save',answers:la});}
assert.equal(ls.result.level,3);assert.equal(ls.answers.length,7);
assert.equal((await postLevel({action:'save',answers:la})).result.level,3);
assert.equal((await lc('/api/v2/run?id='+lr.id)).levelCheck.result.level,3);
assert.equal((await postLevel({action:'start'})).result.level,3);
assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM v2_events WHERE run_id=? AND name LIKE ?').get(lr.id,'level_check_complete_%').n,1);
const lm=await lc('/api/admin/v2/summary?source=level_experiment',undefined,auth);assert.equal(lm.levelAssessment.started,1);assert.equal(lm.levelAssessment.completed,1);assert.equal(lm.levelAssessment.byLevel[3].users,1);assert.equal(lm.levelAssessment.steps[7].users,0);assert.equal(lm.metrics.started,0);
const levelCsv=await lc('/api/admin/v2/export.csv?source=level_experiment',undefined,auth);assert.match(levelCsv,/level_check_complete/);assert.doesNotMatch(levelCsv,/level_check_state/);
// QA exclusion applies to the new assessment as well.
await event(b,qa.id,'level_explore',{level:2});await b('/api/v2/level-check',{runId:qa.id,action:'start'});
assert.equal((await lc('/api/admin/v2/summary',undefined,auth)).levelAssessment.started,1);
assert.equal((await lc('/api/admin/v2/summary?qa=1',undefined,auth)).levelAssessment.started,2);
console.log('Adaptive level check: branch editing, resume, server classification, immutable completion, QA and independent funnel passed.');

if(process.argv.includes('--serve-admin-fixture')){
 const {createServer}=await import('node:http');
 const mime={'.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml'};
 env.ASSETS.fetch=async request=>{const path=new URL(request.url).pathname;const ext=path.slice(path.lastIndexOf('.'));return new Response(readFileSync('public'+path),{headers:{'content-type':mime[ext]||'text/plain'}})};
 createServer(async(req,res)=>{try{const headers=new Headers(req.headers);headers.set('cookie','hatch_admin='+adminToken);const chunks=[];for await(const c of req)chunks.push(c);const body=Buffer.concat(chunks);const response=await worker.fetch(new Request('http://127.0.0.1:8788'+req.url,{method:req.method,headers,...(body.length?{body}: {})}),env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()))}catch(e){res.writeHead(500);res.end(e.message)}}).listen(8788,'127.0.0.1',()=>console.log('Synthetic admin fixture: http://127.0.0.1:8788/v2/admin'));
}else sqlite.close();
