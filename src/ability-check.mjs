export const checkVersion='decision-check-v1';
export const questions=[
 {id:'context',area:'맥락 설계',term:'Context design',level:2,title:'팀 발표 초안이 매번 엉뚱한 방향으로 나옵니다.',situation:'자료는 충분합니다. 5분 발표에서 같은 수정을 반복하지 않으려면, 무엇부터 바꿀까요?',options:[
  {text:'기존 요청문에 “더 전문적이고 논리적으로”라는 조건을 추가한다.',score:0,why:'추상적인 품질 표현만으로는 대상·목적·완료 조건이 정해지지 않습니다.'},
  {text:'청중·결론·시간과 쓸 자료를 정리하고, 원하는 구성 예시를 함께 준다.',score:2,why:'AI가 참고할 범위와 결과의 기준을 함께 정하면 수정 이유를 구체적으로 확인할 수 있습니다.'},
  {text:'참고자료 전체를 넣고, 좋은 발표의 구성을 먼저 추천받는다.',score:1,why:'자료를 주는 것은 도움이 됩니다. 다만 청중·결론·시간을 정하지 않으면 방향은 여전히 AI의 추정에 맡겨집니다.'}],next:'다음 요청 전에 대상·목적·자료 범위·완료 조건을 네 줄로 써보세요.'},
 {id:'evidence',area:'근거 검증',term:'Evidence tracing',level:6,title:'AI가 만든 비교표에 “효과가 30% 높다”는 숫자가 있습니다.',situation:'출처 링크는 있지만 원문은 아직 보지 않았습니다. 제출 전에 무엇을 먼저 할까요?',options:[
  {text:'링크를 열어 대상·비교 기준·측정 기간과 수치를 원문에서 대조한다.',score:2,why:'링크의 존재보다 그 자료가 같은 조건에서 해당 주장을 뒷받침하는지가 중요합니다.'},
  {text:'같은 AI에게 출처가 정확한지 다시 확인해 달라고 한다.',score:0,why:'같은 답변의 재확인은 독립적인 검증이 아닙니다. 설명이 더 확신에 차더라도 원문 근거가 필요합니다.'},
  {text:'다른 AI에게도 물어보고 두 답변의 수치가 같은지 비교한다.',score:1,why:'답변 차이를 발견하는 데는 유용하지만, 같은 오류를 반복할 수도 있습니다. 최종 기준은 원문과 측정 조건입니다.'}],next:'주장 하나 옆에 원문 문장·위치·적용 조건을 적고, 찾지 못하면 “확인 필요”로 남겨보세요.'},
 {id:'workflow',area:'반복 작업',term:'Workflow design',level:4,title:'매주 새 자료를 모아 요약하고 표에 정리합니다.',situation:'이번 주부터 재작업을 줄이고 싶습니다. 가장 먼저 만들 것은 무엇일까요?',options:[
  {text:'검색부터 공유까지 모두 알아서 하는 에이전트를 바로 연결한다.',score:0,why:'성공 기준과 실패 처리가 없는 상태에서 범위만 넓히면 오류를 알아채기 어렵습니다.'},
  {text:'지난주에 잘 나온 요청문을 저장해 매주 복사해서 쓴다.',score:1,why:'좋은 시작입니다. 자료 누락·중복·출력 형식까지 확인하는 절차가 더해져야 반복 실행을 관리할 수 있습니다.'},
  {text:'수집→중복 제거→요약→저장 순서와 단계별 확인 기준을 정해 작게 시험한다.',score:2,why:'작업을 작게 나누고 입출력과 실패 지점을 정하면 어디를 자동화할지 판단할 수 있습니다.'}],next:'반복 작업을 3~4단계로 나누고, 각 단계의 입력·출력·실패 시 행동을 한 줄씩 써보세요.'},
 {id:'control',area:'위임 통제',term:'Bounded delegation',level:5,title:'AI에게 문서 수정과 팀원에게 결과 발송을 맡기려 합니다.',situation:'잘못된 문서가 전송되면 되돌리기 어렵습니다. 어떤 방식으로 맡길까요?',options:[
  {text:'정확하게 처리하라는 지침을 주고, 수정과 발송 권한을 함께 허용한다.',score:0,why:'지침만으로 실수를 막을 수는 없습니다. 외부로 전달되는 행동은 별도의 권한과 확인 지점이 필요합니다.'},
  {text:'수정 초안까지만 허용하고, 검토 기준·중단 조건·발송 전 승인을 정한다.',score:2,why:'되돌리기 어려운 행동에 승인 지점을 두고, 어디까지 맡겼는지 실행 기록으로 확인할 수 있어야 합니다.'},
  {text:'먼저 한 번 발송을 시험한 뒤, 문제없는지 받은 사람에게 확인한다.',score:1,why:'작게 시험하는 것은 좋지만 실제 수신자에게 발송하기 전에 테스트 환경과 승인 절차를 마련해야 합니다.'}],next:'AI가 할 수 있는 일·멈출 조건·사람의 승인이 필요한 일을 각각 한 줄로 정해보세요.'}
];
export const publicCheck={version:checkVersion,questions:questions.map(({id,area,title,situation,options})=>({id,area,title,situation,options:options.map(o=>o.text)}))};
export function assess(answers){
 if(!Array.isArray(answers)||answers.length!==questions.length||answers.some(a=>!Number.isInteger(a)||a<0||a>2))return null;
 const dimensions=questions.map((q,i)=>({id:q.id,area:q.area,term:q.term,level:q.level,title:q.title,answer:answers[i],selected:q.options[answers[i]].text,score:q.options[answers[i]].score,explanation:q.options[answers[i]].why,recommended:q.options.find(o=>o.score===2).text,next:q.next}));
 const priority=[...dimensions].sort((a,b)=>a.score-b.score)[0];
 return {version:checkVersion,answers,dimensions,priority,ready:dimensions.filter(d=>d.score===2).length};
}
