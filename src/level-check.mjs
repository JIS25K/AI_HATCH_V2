// An exploratory behavior rubric, not a standardized or validated ability scale.
export const levelCheckVersion='level-check-v1';
const option=(text,level=0)=>({text,level});
const situation=(id,area,title,context,choices,correct,why,next)=>({id,kind:'situation',area,title,context,options:[...choices.map(text=>({text})),{text:'아직 잘 모르겠습니다.'}],correct,why,next});
const experience=(id,area,title,context,options)=>({id,kind:'experience',area,title,context,options});
export const common=[
 situation('brief','프롬프트 · 작업 명세','5분 발표의 초안을 맡기려 합니다. 무엇을 먼저 알려줄까요?','자료는 준비됐습니다. 청중은 이 주제를 처음 접합니다.',[
 '자료와 함께 전문적인 발표자의 말투를 지정한다.',
 '자료와 함께 청중·핵심 결론·발표 시간을 지정한다.',
 '자료로 긴 초안을 받은 뒤, 다섯 문단으로 줄인다.'
 ],1,'말투나 문단 수보다 누구에게 무엇을 얼마나 전달할지가 먼저 정해져야 합니다.','다음 요청에 대상·목적·분량을 한 줄씩 붙여보세요.'),
 experience('context','컨텍스트 설계','AI에 자료와 조건을 알려줄 때, 실제로 어떻게 해왔나요?','가장 최근에 끝낸 작업을 떠올려 하나를 골라주세요. 해보고 싶은 방식이 아닌, 해본 방식입니다.',[
 option('아직 AI를 작업에 사용해보지 않았다.'),
 option('그때그때 궁금한 것을 묻거나 요약을 요청했다.'),
 option('내 자료와 함께 목적·분량·출력 형식을 정해줬다.',1),
 option('반복할 자료·작성 규칙을 저장하고, 바뀐 내용도 고쳐가며 썼다.',2)
 ]),
 situation('evidence','출처 · 근거 검증','비교표의 “효과가 30% 높다”는 수치, 어떻게 확인할까요?','AI가 출처 링크를 달았습니다. 아직 원문을 읽지는 않았습니다.',[
 '원문에서 수치뿐 아니라 비교 대상·측정 조건까지 대조한다.',
 '다른 AI에게도 같은 질문을 해 수치가 일치하는지 본다.',
 '같은 AI에게 오류를 다시 찾게 하고 수정본을 사용한다.'
 ],0,'여러 답변이 일치해도 같은 오류일 수 있습니다. 해당 수치가 내 비교 조건에 맞는지 원문에서 확인해야 합니다.','주장 하나에 원문 위치와 적용 조건을 붙여보세요. 못 찾으면 확인 필요로 남기세요.'),
 experience('execution','도구 연결 · 실행 구조','자료를 가져오고 결과를 만드는 일을 어디까지 맡겨봤나요?','커넥터·MCP, 워크플로우, 에이전트 등 직접 구성하거나 설정을 바꿔 사용한 경험을 골라주세요.',[
 option('내가 자료를 넣고, 다음 할 일을 매번 메시지로 요청했다.'),
 option('문서나 앱을 연결해, AI가 필요한 자료를 직접 찾아오게 했다.',3),
 option('여러 작업을 정해진 순서로 연결해, 한 번 실행하면 이어지게 했다.',4),
 option('목표와 제한을 주고, AI가 다음 행동을 골라 진행하게 구성했다.',5)
 ]),
 experience('operation','평가 · 운영','만든 AI 작업을 계속 쓸 때, 품질은 어떻게 관리했나요?','직접 준비하거나 바꿔 운영한 방식 중 가장 가까운 것을 골라주세요.',[
 option('아직 반복해 쓸 작업을 만들지 않았거나, 결과를 그때그때 읽었다.'),
 option('몇 가지 예시로 한 번 시험했지만, 같은 검사를 반복하지는 않았다.'),
 option('검사용 사례·통과 기준을 두고, 실패하면 멈추거나 검토하게 했다.',6),
 option('여러 작업의 공통 자료·권한·실행 기록을 함께 관리하고 고쳤다.',7)
 ])
];
const e=(level,title,context,options)=>experience('experience_'+level,'내가 구성한 방식',title,context,options);
const s=(level,title,context,options,correct,why,next)=>situation('judgment_'+level,'새 상황에 적용하기',title,context,options,correct,why,next);
// Each experience option names an observable behavior, with no points for jargon.
export const branches={
 1:[
 e(1,'프롬프트를 개선할 때 직접 바꿔본 것은 무엇인가요?','요청문을 쓰거나 고친 경험에서 가장 가까운 것을 골라주세요.',[
 option('설명을 읽어봤지만 내 작업에 맞게 바꾸지는 않았다.'),
 option('“더 자세히” 또는 “다시 해줘”라고 요청했다.'),
 option('지킬 조건을 정하고, 빠진 조건을 짚어 수정했다.',1),
 option('아직 요청문을 작성해보지 않았다.')]),
 s(1,'표로 요청했는데 긴 설명문이 나왔습니다. 어떻게 수정할까요?','필요한 열은 항목·차이·추천 대상입니다.',[
 '더 명확하고 전문적으로 정리해달라고 한다.',
 '새 대화에서 같은 요청을 한 번 더 보낸다.',
 '필요한 열과 예시 한 행을 보여주고 그 형식으로 바꾸게 한다.'
 ],2,'원하는 출력 구조를 예시로 보여주면 수정해야 할 기준이 분명해집니다.','자주 쓰는 결과 형식의 예시 한 개를 요청문과 함께 저장해보세요.')],
 2:[
 e(2,'저장해둔 자료와 규칙을 다음 작업에 어떻게 사용했나요?','같은 프로젝트에서 두 번째 작업을 했던 때를 떠올려주세요.',[
 option('이전에 잘 나온 요청문을 복사했다.',1),
 option('자료·용어·규칙을 모아두고, 오래된 내용을 갱신하며 썼다.',2),
 option('매번 새 대화에서 목적과 형식을 다시 설명했다.',1),
 option('저장만 했고 다음 작업에 써보지는 않았다.',0)]),
 s(2,'프로젝트의 납기일이 바뀌었는데, AI가 옛 날짜를 씁니다. 먼저 할 일은?','이 작업에는 저장된 안내 문서와 작성 규칙을 사용하고 있습니다.',[
 '현재 대화에서만 새 날짜로 고쳐달라고 한다.',
 '참고 문서의 낡은 날짜와 충돌하는 지침을 고친다.',
 '새 대화를 열어 같은 문서로 처음부터 다시 요청한다.'
 ],1,'공통 자료가 그대로면 다음 작업에서도 같은 오류가 반복됩니다. 사용하는 맥락을 갱신해야 합니다.','반복해서 쓰는 자료 한 곳을 정하고, 갱신 날짜와 공통 규칙을 함께 기록해보세요.')],
 3:[
 e(3,'자료를 연결할 때 직접 정해본 것은 무엇인가요?','파일을 대화창에 첨부한 것과 앱·저장소를 연결한 것은 구분해주세요.',[
 option('파일 내용을 복사하거나 대화창에 첨부했다.',1),
 option('다른 사람이 연결한 도구에서 질문만 했다.',1),
 option('가져올 문서·폴더와 접근 범위를 정하고 조회 결과를 확인했다.',3),
 option('연결 버튼은 눌렀지만 자료를 가져오는지 확인하지 않았다.')]),
 s(3,'연결한 폴더의 문서를 AI가 찾지 못합니다. 무엇부터 확인할까요?','그 문서는 AI에게 맡긴 작업에 필요한 자료입니다.',[
 '문서가 연결 범위에 있는지와 읽기 권한을 확인한다.',
 '요청문에 문서 제목을 여러 번 넣어 다시 찾게 한다.',
 '저장소의 모든 폴더를 연결해 다시 찾게 한다.'
 ],0,'자료를 못 찾는 원인이 연결 범위나 권한에 있을 수 있습니다. 필요한 범위부터 확인합니다.','연결된 자료 하나를 조회하고, 실제로 읽은 문서와 허용한 범위를 대조해보세요.')],
 4:[
 e(4,'워크플로우에서 직접 설계하거나 바꿔본 것은 무엇인가요?','예: 자료 수집 → 요약 → 표 저장. 코드를 썼는지는 중요하지 않습니다.',[
 option('각 단계의 결과를 내가 복사해 다음 요청에 넣었다.',1),
 option('시작 조건과 단계별 입력·출력을 정해 새 자료로 다시 실행했다.',4),
 option('다른 사람이 만든 자동화를 설정 변경 없이 실행했다.',0),
 option('도구 연결만 했고 여러 단계가 이어지게 만들지는 않았다.',3)]),
 s(4,'수집한 자료가 0개인데, 다음 요약 단계가 실행됩니다. 어디를 고칠까요?','지금은 수집 → 요약 → 저장이 차례대로 실행됩니다.',[
 '요약 요청문에 “자료가 없으면 추측하지 마”를 추가한다.',
 '완성된 표를 나중에 읽어 빈 결과를 직접 지운다.',
 '수집 뒤에 자료 수를 확인하고, 0개면 멈추는 조건을 둔다.'
 ],2,'다음 단계가 받을 입력이 있는지를 작업 흐름에서 검사하면 불필요한 실행을 막을 수 있습니다.','단계 하나에 “무엇이 들어와야 다음으로 갈 수 있는가”를 명시해보세요.')],
 5:[
 e(5,'에이전트를 구성할 때 직접 정해본 것은 무엇인가요?','에이전트가 다음 행동을 선택하며 진행하는 작업을 뜻합니다. 기본 모드를 켠 경험과 구분해주세요.',[
 option('쓸 도구·허용할 행동·멈출 조건을 정하고 실행 기록을 확인했다.',5),
 option('목표만 입력하고 기본 설정대로 실행했다.',0),
 option('내가 정한 고정 순서대로만 실행되게 했다.',4),
 option('필요할 때마다 내가 다음 행동을 메시지로 지시했다.',1)]),
 s(5,'AI가 같은 검색을 반복하며 작업을 끝내지 못합니다. 어떤 규칙이 필요할까요?','이미 검색 결과는 모였지만 결론이 나지 않는 상황입니다.',[
 '완료할 때까지 중단하지 말라는 지침을 더 강하게 준다.',
 '시도 횟수와 종료 조건을 두고, 해결 못 하면 사람에게 넘긴다.',
 '정보가 부족할 수 있으니 검색 도구를 더 연결한다.'
 ],1,'다음 행동을 AI가 고를수록 반복과 실패에서 빠져나올 조건이 필요합니다.','허용할 행동, 최대 시도 횟수, 사람에게 넘길 조건을 각각 한 줄로 정해보세요.')],
 6:[
 e(6,'검사가 실제로 실패를 찾아내는지 어떻게 확인했나요?','평가셋은 반복 검사에 쓰는 사례 묶음입니다. 의도적으로 잘못된 입력을 넣어본 경험도 포함합니다.',[
 option('AI에게 자기 답변을 다시 검토하게 했다.',1),
 option('결과 몇 개를 사람이 읽고 이상한 부분을 고쳤다.',1),
 option('실패한 입력·검사 항목·처리 결과를 남기고 같은 입력으로 재검사했다.',6),
 option('작업 단계는 자동으로 이어지지만 품질 검사는 따로 없다.',4)]),
 s(6,'요청문을 고친 뒤 답변이 좋아 보입니다. 개선됐는지 어떻게 비교할까요?','이 작업은 앞으로도 같은 종류의 자료에 반복해서 사용할 예정입니다.',[
 '같은 검사 사례에 수정 전후를 적용하고, 실패와 누락도 비교한다.',
 '수정한 요청문에 새 자료를 넣고 자연스럽게 읽히는지 확인한다.',
 '잘 나온 결과를 몇 개 골라 이전 결과와 비교한다.'
 ],0,'같은 사례와 기준으로 비교해야 무엇이 개선되고 무엇이 나빠졌는지 구분할 수 있습니다.','정상 사례와 자주 실패한 사례를 묶어, 변경할 때마다 같은 기준으로 검사해보세요.')],
 7:[
 e(7,'새 워크플로우를 추가할 때, 기존 작업 환경에 어떻게 붙이나요?','최근 추가한 작업 하나를 떠올려주세요. 앱을 여러 개 쓰는 것만을 뜻하지는 않습니다.',[
 option('앱마다 요청문을 따로 저장해 사용한다.',2),
 option('여러 자동화를 쓰지만 자료·설정은 각각 관리한다.',4),
 option('한 작업의 검사 사례와 실패 처리를 관리한다.',6),
 option('공통 자료·권한·기록 체계에 연결하고 기존 작업에 미치는 영향을 검사한다.',7)]),
 s(7,'공통 자료를 바꿨더니 한 작업만 틀린 결과를 냅니다. 먼저 할 일은?','여러 작업이 같은 자료를 참고하며 실행됩니다.',[
 '모든 작업의 요청문에 예외 지시를 추가한다.',
 '공통 자료를 없애고 각 작업에 사본을 만든다.',
 '영향받은 작업을 기록으로 찾고, 이전 자료로 되돌려 비교한다.'
 ],2,'여러 작업이 공통 기반을 쓰면 변경의 영향과 되돌릴 방법까지 함께 관리해야 합니다.','공통 자료 하나를 바꿨을 때 어떤 작업을 다시 검사해야 하는지 목록으로 남겨보세요.')]
};
const clarification=experience('ownership','경험을 한 번 더 확인할게요','지금 떠올린 작업에서, 직접 설명하고 바꿀 수 있는 범위는 어디까지인가요?','선택한 경험을 바탕으로 판단할 범위를 한 번 더 확인합니다. AI의 도움을 받았어도 실행 방식을 이해하고 바꿨다면 직접 구성한 경험에 포함합니다.',[
 option('자료가 들어오고 결과가 나오는 과정을 설명하고, 설정도 바꿀 수 있다.',2),
 option('일부 설정은 바꾸지만, 전체가 어떻게 동작하는지는 모른다.',1),
 option('실행만 했고 규칙이나 설정은 직접 바꿔보지 않았다.'),
 option('아직 해보지 않은 방식을 생각하며 답했다.')]);
const beginnerClarification=experience('ownership','경험을 한 번 더 확인할게요','지금 떠올린 작업은 어디까지 해본 상태인가요?','실제 경험과 앞으로 해볼 방식을 구분하기 위한 마지막 질문입니다.',[
 option('내 자료로 결과를 만들고, 필요한 부분을 직접 고쳐봤다.',2),
 option('예제를 따라 해봤지만 내 작업에는 아직 쓰지 않았다.',1),
 option('다른 사람의 설명이나 시연을 본 적만 있다.'),
 option('앞으로 해보고 싶은 방식을 생각하며 답했다.')]);
const clarificationFor=route=>route<3?beginnerClarification:clarification;
const needsClarification=(route,e,s,answers)=>e.options[answers[5].choice].level!==route||(route>=3&&!good(s,answers[6].choice))||(answers[1].choice===0&&route>0);
const byId=new Map([...common,...Object.values(branches).flat(),clarification].map(q=>[q.id,q]));
export const publicQuestion=q=>({id:q.id,kind:q.kind,area:q.area,title:q.title,context:q.context,options:q.options.map(o=>o.text)});
const good=(q,a)=>a===q.correct;
export function routeFor(answers){const selected=id=>answers.find(a=>a.id===id)?.choice;return Math.max(0,...['context','execution','operation'].map(id=>byId.get(id).options[selected(id)]?.level||0));}
export function flow(answers){
 if(!Array.isArray(answers)||answers.length>8)return null;
 let path=[...common];let route=0;
 for(let i=0;i<answers.length;i++){
  if(i===5){route=routeFor(answers.slice(0,5));path.push(...branches[Math.max(1,route)]);}
  if(i===7){const e=path[5],s=path[6];if(needsClarification(route,e,s,answers))path.push(clarificationFor(route));}
  const a=answers[i],q=path[i];if(!a||!q||a.id!==q.id||!Number.isInteger(a.choice)||a.choice<0||a.choice>=q.options.length)return null;
 }
 if(answers.length===5){route=routeFor(answers);path.push(...branches[Math.max(1,route)]);}
 if(answers.length===7){route=routeFor(answers);if(needsClarification(route,path[5],path[6],answers))path.push(clarificationFor(route));}
 if(answers.length>5)route=routeFor(answers);
 return {route,path,next:path[answers.length]||null,complete:answers.length===path.length};
}
const names=['물어보기','명확하게 지시하기','맥락 설계하기','도구 연결하기','작업 흐름 만들기','에이전트에 위임하기','검증 체계 만들기','나만의 작업 시스템'];
const actions=[
 '작업 하나를 골라 목적·대상·원하는 결과 형식을 적고 AI에 요청해보세요.',
 '반복하는 작업의 자료와 작성 규칙을 한곳에 모아 다음 작업에 다시 써보세요.',
 '자주 복사하는 자료 하나를 연결하고, AI가 실제로 읽은 범위와 출처를 확인해보세요.',
 '반복 작업을 3단계로 나누고, 단계 사이에 넘길 결과와 멈출 조건을 정해보세요.',
 '순서가 자주 달라지는 작업 하나에서만 AI가 다음 행동을 고르게 하고 중단 조건을 두세요.',
 '자주 틀리는 사례와 통과 기준을 만들어, 변경할 때마다 같은 검사로 비교해보세요.',
 '여러 작업이 공유하는 자료와 검사 기준을 묶고, 변경 영향을 기록해보세요.',
 '공통 자료 하나가 바뀔 때 영향받는 작업, 재검사 기준, 되돌릴 방법을 함께 관리해보세요.'
];
export function assessLevel(answers){
 const f=flow(answers);if(!f?.complete)return null;
 const exp=f.path[5],observed=exp.options[answers[5].choice].level;
 let level=Math.min(f.route,observed);
 const owner=answers.find(a=>a.id==='ownership')?.choice;
 // Never infer unasked intermediate capabilities. Context baseline is independently reported.
 const baseline=common[1].options[answers[1].choice].level;
 if(owner===2||owner===3)level=Math.min(level,baseline);
 const noUseConflict=answers[1].choice===0&&f.route>0;
 if(noUseConflict)level=0;
 const provisional=observed!==f.route||owner===1||owner===2||owner===3||noUseConflict;
 const judgments=f.path.filter(q=>q.kind==='situation').map(q=>{const a=answers.find(a=>a.id===q.id).choice;return {id:q.id,area:q.area,title:q.title,selected:q.options[a].text,correct:good(q,a),recommended:q.options[q.correct].text,why:q.why,next:q.next};});
 const gaps=judgments.filter(j=>!j.correct);
 const evidence=f.path.filter(q=>q.kind==='experience').map(q=>({title:q.title,selected:q.options[answers.find(a=>a.id===q.id).choice].text}));
 return {version:levelCheckVersion,level,name:names[level],reportedLevel:f.route,provisional,count:answers.length,judgments,evidence,goodCount:judgments.length-gaps.length,next:gaps[0]?.next||actions[level],nextLevel:gaps.length?level:Math.min(level+1,7),explanation:level===f.route?`맡긴 범위와 구체적인 실행 경험에서 ‘${names[level]}’에 해당하는 행동을 선택했습니다.`:`Level ${f.route}에 해당하는 선택도 있었지만 다른 경험 응답과 차이가 있어, Level ${level}을 출발점으로 제안합니다.`,caution:provisional?'응답 사이에 차이가 있어 보수적으로 제안했습니다. 실제 결과물을 확인하면 달라질 수 있습니다.':'직접 실행한 결과물을 확인한 인증이 아닙니다. 선택한 경험과 판단을 바탕으로 추정한 활용 단계입니다.'};
}
export const levelIntro={version:levelCheckVersion,minQuestions:7,maxQuestions:8};
