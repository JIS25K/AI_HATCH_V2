import {offerFor,offerVersion} from './workflow-kits.mjs';
import {version,levels,tasks,blockers,practices,outcomes,reasons,makePlan} from './v2-content.mjs';
const clean=v=>typeof v==='string'?v.replace(/[^a-zA-Z0-9가-힣_-]/g,'').slice(0,60):'';
const has=(list,id)=>list.some(x=>x.id===id);
const fail=(status,message)=>{throw Object.assign(new Error(message),{status})};
const uuid=/^[a-f0-9-]{36}$/;
const writeEvent=(db,run,name,detail=null)=>db.run('INSERT OR IGNORE INTO v2_events(run_id,name,detail) VALUES(?,?,?)',run,name,detail);
export async function v2Route({request,url,db,visitor,json}){
 const path=url.pathname;
 if(path==='/api/v2/content'&&request.method==='GET')return json(200,{version,levels,tasks,blockers,practices,outcomes,reasons});
 if(path.startsWith('/api/admin/v2/'))return adminRoute({request,url,db,json}); // Authenticated by the parent router.
 if(request.method==='GET'&&path==='/api/v2/run'){
  const run=await db.one('SELECT * FROM v2_runs WHERE id=? AND visitor_id=?',url.searchParams.get('id')||'',visitor);
  if(!run)fail(404,'이 브라우저에서 저장한 실행안을 찾을 수 없습니다. 처음부터 다시 선택해주세요.');
  const feedback=await db.one("SELECT detail FROM v2_events WHERE run_id=? AND name LIKE 'feedback_%' ORDER BY created_at DESC,rowid DESC LIMIT 1",run.id);
  const selection=await db.one("SELECT detail FROM v2_events WHERE run_id=? AND name LIKE 'level_select_%' ORDER BY created_at DESC,rowid DESC LIMIT 1",run.id);
  return json(200,{run,plan:run.result_at?makePlan(run):null,feedback:feedback?.detail?JSON.parse(feedback.detail):null,selectedLevel:selection?Number(selection.detail):null});
 }
 if(request.method!=='POST')return json(404,{error:'not found'});
 if(request.headers.get('origin')!==url.origin||!request.headers.get('content-type')?.startsWith('application/json'))fail(403,'사이트에서 다시 시도해주세요.');
 const raw=await request.text();if(raw.length>4096)fail(413,'입력값이 너무 깁니다.');let input;try{input=JSON.parse(raw)}catch{fail(400,'잘못된 요청입니다.')}
 if(!input||typeof input!=='object'||Array.isArray(input))fail(400,'잘못된 요청입니다.');
 if(path==='/api/v2/enter'){
  if(!uuid.test(input.id||''))fail(400,'잘못된 방문 정보입니다.');
  const source=clean(input.source)||clean(input.utm_source)||'direct';
  // Idempotent per page entry. Cap abusive run creation per anonymous browser.
  if((await db.one("SELECT COUNT(*) AS n FROM v2_runs WHERE visitor_id=? AND created_at>=datetime('now','-1 hour')",visitor)).n>=60&&!await db.one('SELECT 1 FROM v2_runs WHERE id=? AND visitor_id=?',input.id,visitor))fail(429,'잠시 후 다시 시도해주세요.');
  await db.run('INSERT OR IGNORE INTO v2_runs(id,visitor_id,version,source,utm_source,utm_campaign,is_qa) VALUES(?,?,?,?,?,?,?)',input.id,visitor,version,source,clean(input.utm_source)||null,clean(input.utm_campaign)||null,input.qa===true||/^(qa|test|internal|ui_qa)(_|$)/i.test(source)?1:0);
  const run=await db.one('SELECT * FROM v2_runs WHERE id=? AND visitor_id=?',input.id,visitor);if(!run)fail(409,'방문 정보를 다시 생성해주세요.');
  return json(200,{run});
 }
 const run=await db.one('SELECT * FROM v2_runs WHERE id=? AND visitor_id=?',input.runId||'',visitor);if(!run)fail(404,'방문 정보가 만료되었습니다. 새로고침 후 다시 시도해주세요.');
 if(path==='/api/v2/select'){
  if(run.result_at){if(run.task===input.task&&run.blocker===input.blocker&&run.practice===input.practice)return json(200,{run,plan:makePlan(run)});fail(409,'완료된 실행안입니다. 새 작업을 선택해주세요.');}
  if(!has(tasks,input.task))fail(400,'작업을 선택해주세요.');
  if(input.blocker!=null&&!has(blockers,input.blocker))fail(400,'막히는 단계를 선택해주세요.');
  if(input.practice!=null&&(!input.blocker||!has(practices,input.practice)))fail(400,'현재 방식을 선택해주세요.');
  const done=!!input.practice;
  await db.run("UPDATE v2_runs SET task=?,blocker=?,practice=?,started_at=COALESCE(started_at,CURRENT_TIMESTAMP),result_at=CASE WHEN ?=1 THEN CURRENT_TIMESTAMP ELSE NULL END WHERE id=? AND result_at IS NULL",input.task,input.blocker||null,input.practice||null,done?1:0,run.id);
  const updated=await db.one('SELECT * FROM v2_runs WHERE id=?',run.id);
  return json(200,{run:updated,plan:updated.result_at?makePlan(updated):null});
 }
 if(path==='/api/v2/event'){
  if(['level_explore','level_select'].includes(input.name)){
   if(!Number.isInteger(input.level)||input.level<0||input.level>7)fail(400,'0~7 사이의 단계를 선택해주세요.');
   if(input.name==='level_select'&&!uuid.test(input.eventId||''))fail(400,'응답 식별자가 필요합니다.');
   await writeEvent(db,run.id,input.name==='level_explore'?'level_explore_'+input.level:'level_select_'+input.eventId,String(input.level));
   return json(200,{ok:true});
  }
  if(!run.result_at)fail(400,'실행안을 먼저 확인해주세요.');
  const names=['result_view','prompt_copy','prompt_copy_click','trial_open','return_link_copy','offer_view','purchase_click','feedback'];
  if(!names.includes(input.name))fail(400,'잘못된 이벤트입니다.');
  if(input.name!=='result_view'&&!await db.one("SELECT 1 FROM v2_events WHERE run_id=? AND name='result_view'",run.id))fail(400,'실행안을 먼저 확인해주세요.');
  if(input.name==='purchase_click'&&!await db.one("SELECT 1 FROM v2_events WHERE run_id=? AND name=?",run.id,'offer_view_'+offerVersion))fail(400,'상품 안내를 먼저 확인해주세요.');
  if(input.name==='feedback'){
   if(!has(outcomes,input.outcome)||!has(reasons[input.outcome]||[],input.reason))fail(400,'적용 결과와 이유를 선택해주세요.');
   if(!uuid.test(input.eventId||''))fail(400,'응답 식별자가 필요합니다.');
   await writeEvent(db,run.id,'feedback_'+input.eventId,JSON.stringify({outcome:input.outcome,reason:input.reason}));
  }else {
   const detail={contentVersion:version,...(['offer_view','purchase_click'].includes(input.name)?{offer:offerFor(run.task)}:{})};
   await writeEvent(db,run.id,['offer_view','purchase_click'].includes(input.name)?input.name+'_'+offerVersion:input.name,JSON.stringify(detail));
  }
  return json(200,{ok:true});
 }
 return json(404,{error:'not found'});
}
function dateValue(value,fallback){if(!value)return fallback;if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value)||!Number.isFinite(Date.parse(value)))fail(400,'조회 기간을 확인해주세요.');return new Date(value).toISOString().slice(0,19).replace('T',' ')}
async function adminRoute({request,url,db,json}){
 if(request.method!=='GET')return json(405,{error:'허용되지 않은 요청입니다.'});
 const start=dateValue(url.searchParams.get('start'),'2000-01-01 00:00:00'),end=dateValue(url.searchParams.get('end'),'2100-01-01 00:00:00');if(start>=end)fail(400,'종료 시각은 시작 시각 이후여야 합니다.');
 const includeQa=url.searchParams.get('qa')==='1',source=clean(url.searchParams.get('source'));
 const where='r.created_at>=? AND r.created_at<?'+(includeQa?'':' AND r.is_qa=0')+(source?' AND r.source=?':'');const args=[start,end,...(source?[source]:[])];
 const allRows=await db.all(`SELECT r.*,e.name,e.detail,e.created_at AS event_at,e.updated_at AS event_updated_at FROM v2_runs r LEFT JOIN v2_events e ON e.run_id=r.id AND e.created_at<? WHERE ${where} ORDER BY r.created_at,r.id,e.created_at,e.rowid`,end,...args);
 if(url.pathname==='/api/admin/v2/export.csv'){
  const cell=v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';
  const columns=['id','visitor_id','version','source','utm_source','utm_campaign','is_qa','task','blocker','practice','created_at','started_at','result_at','name','detail','event_at','event_updated_at'];
  const csv='\uFEFF'+[columns,...allRows.map(row=>columns.map(c=>['started_at','result_at'].includes(c)&&row[c]>=end?'':row[c]))].map(r=>r.map(cell).join(',')).join('\r\n');
  return new Response(csv,{headers:{'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="ai-hatch-v2-events.csv"','cache-control':'no-store'}});
 }
 for(const row of allRows){if(row.name?.startsWith('offer_view_'))row.name='offer_view';if(row.name?.startsWith('purchase_click_'))row.name='purchase_click';}
 if(url.pathname!=='/api/admin/v2/summary')return json(404,{error:'not found'});
 const lastFeedback=new Map();for(const row of allRows)if(row.name?.startsWith('feedback_'))lastFeedback.set(row.id,row);
 const lastLevel=new Map();for(const row of allRows)if(row.name?.startsWith('level_select_'))lastLevel.set(row.id,row);
 const levelMap={explored:new Set(allRows.filter(r=>r.name?.startsWith('level_explore_')).map(r=>r.visitor_id)).size,selected:new Set([...lastLevel.values()].map(r=>r.visitor_id)).size,byLevel:levels.map(l=>({level:l.level,users:new Set([...lastLevel.values()].filter(r=>Number(r.detail)===l.level).map(r=>r.visitor_id)).size}))};
 const rows=allRows.filter(row=>!row.name?.startsWith('feedback_')).concat([...lastFeedback.values()].map(row=>({...row,name:'feedback'})));
 const metricsFor=items=>{const sets=Object.fromEntries(['visitors','started','generated','viewed','copyClicked','copied','offerViewed','purchaseClicked','trial','applied','useful','feedback'].map(k=>[k,new Set()]));const runs=new Set();for(const r of items){runs.add(r.id);sets.visitors.add(r.visitor_id);if(r.started_at&&r.started_at<end)sets.started.add(r.visitor_id);if(r.result_at&&r.result_at<end)sets.generated.add(r.visitor_id);const key={result_view:'viewed',prompt_copy_click:'copyClicked',prompt_copy:'copied',offer_view:'offerViewed',purchase_click:'purchaseClicked',trial_open:'trial'}[r.name];if(key)sets[key].add(r.visitor_id);if(r.name==='feedback'){sets.feedback.add(r.visitor_id);const f=JSON.parse(r.detail);if(f.outcome!=='not_yet')sets.applied.add(r.visitor_id);if(f.outcome==='useful')sets.useful.add(r.visitor_id)}}return {...Object.fromEntries(Object.entries(sets).map(([k,v])=>[k,v.size])),runs:runs.size}};
 const group=key=>[...new Set(rows.map(r=>r[key]||'unselected'))].map(value=>({value,...metricsFor(rows.filter(r=>(r[key]||'unselected')===value))}));
 const byFunnel=tasks.flatMap(t=>blockers.flatMap(b=>practices.map(p=>({task:t.id,blocker:b.id,practice:p.id,...metricsFor(rows.filter(r=>r.task===t.id&&r.blocker===b.id&&r.practice===p.id))}))));
 const offerRows=rows.filter(r=>['offer_view','purchase_click'].includes(r.name));
 const byOffer=[...new Set(offerRows.map(r=>JSON.parse(r.detail).offer.id))].map(id=>{const items=offerRows.filter(r=>JSON.parse(r.detail).offer.id===id);const detail=JSON.parse(items[0].detail);return {id,price:detail.offer.price,currency:detail.offer.currency,contentVersion:detail.contentVersion,...metricsFor(items)};});
 const feedback=rows.filter(r=>r.name==='feedback');const outcomesSummary=outcomes.map(o=>({value:o.id,users:new Set(feedback.filter(r=>JSON.parse(r.detail).outcome===o.id).map(r=>r.visitor_id)).size}));
 const reasonSummary=Object.entries(reasons).flatMap(([outcome,rs])=>rs.map(reason=>({outcome,value:reason.id,users:new Set(feedback.filter(r=>{const f=JSON.parse(r.detail);return f.outcome===outcome&&f.reason===reason.id}).map(r=>r.visitor_id)).size})));
 const excluded=(await db.one(`SELECT COUNT(DISTINCT visitor_id) AS n FROM v2_runs r WHERE r.created_at>=? AND r.created_at<? AND r.is_qa=1${source?' AND r.source=?':''}`,...args)).n;
 const first=(await db.one('SELECT MIN(created_at) AS at FROM v2_runs WHERE is_qa=0')).at;
 return json(200,{version,start,end,includeQa,excludedQa:excluded,firstEntry:first,metrics:metricsFor(rows),levelMap,byFunnel,byOffer,byVersion:group('version'),bySource:group('source'),byTask:group('task'),byBlocker:group('blocker'),byPractice:group('practice'),outcomes:outcomesSummary,reasons:reasonSummary});
}
