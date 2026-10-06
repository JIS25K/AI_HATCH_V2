import assert from 'node:assert/strict';
import {common,branches,flow,assessLevel,publicQuestion} from '../src/level-check.mjs';
const base=(context,execution,operation)=>[1,context,0,execution,operation].map((choice,i)=>({id:common[i].id,choice}));
const finish=(answers,experienceChoice,scenarioChoice,ownership=0)=>{let f=flow(answers);answers=[...answers,{id:f.next.id,choice:experienceChoice}];f=flow(answers);answers.push({id:f.next.id,choice:scenarioChoice});f=flow(answers);if(!f.complete)answers.push({id:f.next.id,choice:ownership});return answers;};
const fixtures=[
 ['never used',0,base(0,0,0),0,2],
 ['clear instructions',1,base(2,0,0),2,2],
 ['maintained context',2,base(3,0,0),1,1],
 ['connected source',3,base(2,1,0),2,0],
 ['configured workflow',4,base(3,2,0),1,2],
 ['bounded agent',5,base(3,3,0),0,1],
 ['evaluation without agent',6,base(3,2,2),2,0],
 ['shared system',7,base(3,3,3),3,2]
];
for(const [name,expected,prefix,e,j] of fixtures){const a=finish(prefix,e,j),r=assessLevel(a);assert.equal(r.level,expected,name);assert.equal(a.length,7,name);assert.equal(r.goodCount,3,name);}
assert.equal(assessLevel(finish(base(3,3,3),1,2)).level,4,'Several separate automations are not shared infrastructure.');
assert.equal(assessLevel(finish(base(3,3,0),1,1,2)).level,0,'Using a default agent does not demonstrate agent construction.');
assert.equal(assessLevel(finish(base(2,0,2),1,0)).level,1,'Reading a few outputs is not a repeatable evaluation system.');
const safe=finish(base(3,2,0),1,2),unsafe=finish(base(3,2,0),1,0);assert.equal(assessLevel(safe).level,assessLevel(unsafe).level);assert.ok(assessLevel(unsafe).goodCount<3);
for(const q of [...common,...Object.values(branches).flat()]){assert.equal(new Set(q.options.map(o=>o.text)).size,q.options.length);assert.ok(q.title.length<80);assert.ok(q.options.every(o=>o.text.length<85));assert.ok(!JSON.stringify(publicQuestion(q)).includes('correct'));}
for(const bad of [null,{},[{id:'execution',choice:0}],[{id:'brief',choice:-1}],[{id:'brief',choice:4}],[{id:'brief',choice:'1'}],Array(10).fill({id:'brief',choice:0})])assert.equal(flow(bad),null);
assert.equal(assessLevel(finish(base(0,3,3),3,2)).level,0,'Explicit non-use conflicts cannot produce an advanced level.');
let paths=0,seven=0,eight=0;const distribution=Array(8).fill(0);
function visit(a=[]){const f=flow(a);assert.ok(f);if(f.complete){const r=assessLevel(a);assert.ok(r);assert.ok([7,8].includes(a.length));assert.ok(r.level<=f.route);assert.ok(r.level>=0&&r.level<=7);assert.equal(r.judgments.length,3);assert.ok(r.next.length>0);assert.equal(flow([...a,{id:'ownership',choice:0}]),null);distribution[r.level]++;paths++;a.length===7?seven++:eight++;return;}assert.ok(a.length<8);for(let choice=0;choice<f.next.options.length;choice++)visit([...a,{id:f.next.id,choice}]);}
visit();assert.ok(distribution.every(n=>n>0));console.log(JSON.stringify({paths,seven,eight,distribution,checks:'Every valid path terminates, eight levels reachable, no judgment-only promotion, no missing or extra questions.'}));
