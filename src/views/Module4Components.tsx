import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { Lesson } from '../data/tutorialData';

export const CopyButton = ({ text, className = "" }: { text: string, className?: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  
  return (
    <button 
      onClick={handleCopy}
      className={`absolute top-2 right-2 p-1.5 bg-gray-700/50 hover:bg-gray-700 rounded-md text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-[10px] ${className}`}
    >
      {copied ? <><Check size={12} /> 복사됨!</> : <><Copy size={12} /> 복사</>}
    </button>
  );
};

export const Lesson42Interactive = ({ onExecute }: { onExecute: (data: {title: string, content: React.ReactNode, point: string}) => void }) => {
  const [taskType, setTaskType] = useState('가정통신문');
  const [rules, setRules] = useState<Record<string, boolean>>({});

  const taskOptions: Record<string, string[]> = {
    '가정통신문': [
      '상단에 학교명·날짜 표시',
      '제목은 한 줄로 간결하게',
      '목적·내용·안내사항·문의처 순서 유지',
      '어조: 공식적이되 친근하게',
      '마지막에 담당 교사·연락 가능 시간 표시',
      '"검토 후 사용하세요" 안내 자동 포함'
    ],
    '공문 회신': [
      '수신·발신·제목·본문 형식 준수',
      '행정 어체(해요체 금지) 사용',
      '붙임 문서 목록 체계적 정리',
      '결재란 안내 포함'
    ],
    '학부모 안내 문자': [
      '100자 이내로 핵심 정보만',
      '정중하고 부드러운 어조',
      '마지막에 담당자 서명 포함'
    ],
    '교육청 보고서': [
      '목적·현황·추진계획·기대효과 구조',
      '수치 기반으로 객관적인 서술',
      '보고서 개조식(bullet point) 작성'
    ]
  };

  useEffect(() => {
    // Reset rules when task type changes
    const initialRules: Record<string, boolean> = {};
    if (taskOptions[taskType]) {
      taskOptions[taskType].forEach(rule => initialRules[rule] = true);
    }
    setRules(initialRules);
  }, [taskType]);

  const handleRuleToggle = (rule: string) => {
    setRules(prev => ({ ...prev, [rule]: !prev[rule] }));
  };

  const [generated, setGenerated] = useState("");

  const handleGenerate = () => {
    const selectedRules = Object.entries(rules).filter(([_, checked]) => checked).map(([rule, _], idx) => `${idx + 1}. ${rule}`);
    
    const promptText = `[4-1에서 만든 학교 컨텍스트]를 여기에 붙여넣습니다.

[${taskType} 하네스 규칙]
${taskType} 작성 시 아래 규칙을 반드시 따릅니다:
${selectedRules.join('\n')}

이 설정으로 ${taskType} 주제만 말하면 즉시 초안을 작성합니다.`;
    
    onExecute({
      title: '나만의 행정 업무 하네스',
      content: promptText,
      point: '완성된 하네스를 프롬프트 창에 넣으면, 매번 형식을 지정하지 않아도 "[입력 정보]"만 바꾸어 무한 재사용이 가능해집니다.'
    });
  };

  return (
    <div className="flex-1 bg-[#0e1318] rounded-xl p-5 border border-gray-800 flex flex-col gap-4 overflow-y-auto">
      <div className="text-white font-bold mb-2">나의 행정 업무 하네스 만들기</div>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 block mb-2">1단계: 업무 유형 선택</label>
          <select 
            value={taskType} 
            onChange={e => setTaskType(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-canva-purple"
          >
            {Object.keys(taskOptions).map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        
        <div>
          <label className="text-xs text-gray-400 block mb-2">2단계: 하네스 구성 요소 선택</label>
          <div className="space-y-2 text-sm text-gray-300 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
            {taskOptions[taskType]?.map(rule => (
              <label key={rule} className="flex items-start gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rules[rule] || false} 
                  onChange={() => handleRuleToggle(rule)} 
                  className="rounded border-gray-600 text-canva-purple focus:ring-canva-purple bg-gray-700 mt-1 flex-shrink-0" 
                />
                <span className="leading-tight">{rule}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={handleGenerate}
        className="w-full py-3 bg-canva-purple text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-lg mt-2"
      >
        하네스 생성하기
      </button>
    </div>
  );
};

export const Lesson43Interactive = ({ onExecute }: { onExecute: (data: {title: string, content: React.ReactNode, point: string, hideDocsButton?: boolean}) => void }) => {
  const promptText = `(여기에 4-1에서 만든 학교 시스템 프롬프트를 붙여넣으세요)

(여기에 4-2에서 만든 행정 업무 하네스를 적절히 붙여넣으세요)

위 규칙을 바탕으로 사용자가 요구하는 문서를 작성하고, 사용자가 앱에서 문서를 편하게 만들어갈 수 있도록 만들어주세요.`;

  const handleTest = () => {
    onExecute({
      title: '바이브코딩으로 앱 제작 시뮬레이션 결과',
      content: `### 🚀 행정 자동화 앱 초안 생성 완료\n\n\`\`\`text\n[시스템] AI가 선생님의 프롬프트를 바탕으로 '가정통신문 자동 작성 앱'을 구성했습니다.\n\n사용자 인터페이스 (UI) 예상:\n1. '주제를 입력하세요' 텍스트 박스\n2. '문서 생성' 버튼\n3. '생성된 문서 출력' 창\n\nAI가 입력된 규칙(4-1, 4-2)을 시스템 백그라운드에 고정하고,\nUI를 통해 입력된 주제만 넘겨받아 완벽하게 포맷된 문서를 출력하는 앱이 만들어집니다.\n\`\`\``,
      point: '원래는 코드를 짜야 하지만, Google AI Studio Build에서는 이런 "지시문(Prompt)"만으로도 즉시 나만의 맞춤형 도구를 만들 수 있습니다. 이것이 바로 코딩 없이 대화만으로 프로그램을 만드는 "바이브코딩(Vibe Coding)"의 세계입니다.',
      hideDocsButton: true
    });
  };

  return (
    <div className="flex-1 bg-[#0e1318] rounded-xl p-5 border border-gray-800 flex flex-col gap-4 overflow-y-auto">
      <div className="text-white font-bold mb-2">바이브 코딩으로 앱 맛보기 (Google AI Studio Build)</div>
      
      <div className="text-sm text-gray-300 bg-gray-800/50 p-4 rounded-lg">
        <ul className="list-decimal pl-4 space-y-2">
          <li><a href="https://aistudio.google.com/build" target="_blank" rel="noopener noreferrer" className="text-canva-teal hover:underline font-bold">Google AI Studio Build</a> 에 접속하여 새 창을 엽니다.</li>
          <li>기존에 작성해 두었던 <strong>[4-1 시스템 프롬프트]</strong>와 <strong>[4-2 하네스]</strong> 내용을 조합합니다.</li>
          <li>AI에게 아래와 같이 지시하여 나만의 도구를 만듭니다.</li>
        </ul>
      </div>

      <div className="relative bg-[#1c232b] p-4 rounded-lg border border-gray-700">
        <div className="text-xs font-bold text-gray-400 mb-2">Build 화면에 붙여넣을 템플릿</div>
        <CopyButton text={promptText} />
        <pre className="text-xs text-canva-gray whitespace-pre-wrap font-mono mt-2">{promptText}</pre>
      </div>

      <div className="mt-2 text-sm">
        <div className="text-xs text-gray-400 mb-2">안내대로 앱을 만들었을 때의 결과 시뮬레이션</div>
        <div className="flex gap-2">
          <button onClick={handleTest} className="w-full py-3 bg-canva-teal text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-lg">바이브코딩 적용 결과 확인</button>
        </div>
      </div>
    </div>
  );
};

export const Lesson44Interactive = ({ onExecute }: { onExecute: (data: {title: string, content: React.ReactNode, point: string}) => void }) => {
  const [selectedOpt, setSelectedOpt] = useState('');
  
  const promptText = `당신은 초등학교 가정통신문 작성 전문 도우미입니다.

가정통신문 작성 규칙:
1. 업로드된 예시 파일의 형식과 어조를 참고합니다
2. 상단: 학교명 + 날짜 + 담당 교사
3. 본문: 목적 → 내용 → 안내사항 → 문의처
4. 최하단: "※ 이 문서는 초안입니다. 검토 후 사용하세요."

추가 규칙:
- 날짜·장소·금액 등 미확정 정보는 [  ] 표시
- 불필요한 수식어 없이 핵심만 전달`;

  const getRecommendation = (opt: string) => {
    switch(opt) {
      case 'google': return "👉 Google AI Studio (무료, 구글 생태계)";
      case 'quality': return "👉 Claude Project / Skill (한국어 우수)";
      case 'free': return "👉 Google AI Studio (기본 한도 내 무료)";
      case 'learn': return "👉 Claude Project (문서 형태 학습 용이)";
      default: return "";
    }
  };

  const handleTest = () => {
    const resultJSX = (
      <div className="flex flex-col gap-3 w-full">
        <div className="border border-gray-700 bg-gray-800 rounded-lg p-4 relative">
          <h4 className="text-gray-300 font-bold mb-2">Google AI Studio 결과 (무료 에이전트)</h4>
          <pre className="text-xs text-gray-400 whitespace-pre-wrap">■ 일시: 2024년 ○월 ○일\n■ 장소: [장소명]\n■ 준비물: 도시락 등\n\n(형식은 동일하나 문체가 다소 기계적이고 직접적/구조적)</pre>
        </div>
        <div className="border border-canva-teal/50 bg-canva-teal/10 rounded-lg p-4 relative">
           <h4 className="text-canva-teal font-bold mb-2">Claude Skill 결과 (문서 업로드 학습형)</h4>
          <pre className="text-xs text-gray-200 whitespace-pre-wrap">따스한 봄기운이 만연한 요즘, 가정에 평안이 깃드시길 바랍니다.\n금번 본교 4학년에서는 교과 과정과 연계된 현장체험학습을 아래와 같이 추진하고자 하오니, 학부모님들의 많은 협조를 부탁드립니다.\n\n(기존에 업로드한 예시 파일의 부드러운 어조와 서술형 안내 방식을 완벽하게 재연함)</pre>
        </div>
      </div>
    );
    
    onExecute({
      title: '에이전트 모델 비교 결과',
      content: resultJSX,
      point: '보고서 기획이나 아이데이션은 비용이 저렴하거나 구조화 능력이 좋은 AI(Gemini)가 유리하지만, 예전 공문 파일처럼 "형식과 말투"가 중요한 서류 작업은 문서 분석/모방 능력이 좋은 AI(Claude)를 에이전트로 쓰는 것이 더 효율적입니다.'
    });
  };

  return (
    <div className="flex-1 bg-[#0e1318] rounded-xl p-5 border border-gray-800 flex flex-col gap-4 overflow-y-auto">
      <div className="text-white font-bold mb-2">Claude Skill 에이전트 제작 및 도구 비교</div>
      
      <div className="relative bg-[#1c232b] p-3 rounded-lg border border-gray-700">
        <div className="text-[10px] font-bold text-gray-400 mb-1">개선된 시스템 프롬프트 (Project/Skill 용)</div>
        <CopyButton text={promptText} />
        <pre className="text-xs text-canva-gray whitespace-pre-wrap font-mono mt-2">{promptText}</pre>
        <button onClick={handleTest} className="w-full mt-2 py-2 bg-canva-purple/20 text-canva-purple rounded text-xs font-bold hover:bg-canva-purple/30">Google vs Claude 결과 차이 확인</button>
      </div>

      <div className="mt-2">
        <div className="text-xs text-gray-400 mb-3">도구 선택 체크리스트</div>
        <div className="space-y-2 text-sm text-gray-300">
          {[
            {id:'google', label:'"Google 서비스를 주로 쓴다"'},
            {id:'quality', label:'"한국어 문서 퀄리티가 제일 중요하다"'},
            {id:'free', label:'"기본적으로 무료로 쓰고 싶다"'},
            {id:'learn', label:'"기존 학교 문서를 업로드해 학습시키고 싶다"'}
          ].map(opt => (
            <div key={opt.id} 
              className={`p-3 rounded-lg border cursor-pointer transition-colors flex flex-col justify-center ${selectedOpt === opt.id ? 'bg-canva-purple/10 border-canva-purple text-white' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}
              onClick={() => setSelectedOpt(opt.id)}
            >
              <div>{opt.label}</div>
              {selectedOpt === opt.id && <div className="text-canva-teal font-bold text-xs mt-1">{getRecommendation(opt.id)}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Lesson45Interactive = ({ onExecute }: { onExecute: (data: {title: string, content: React.ReactNode, point: string}) => void }) => {
  const [classifications, setClassifications] = useState<Record<string, boolean | null>>({
    'Google Drive 문서': null,
    'NEIS 성적 데이터': null,
    '학부모 개인 연락처': null,
    '학교 공식 캘린더': null,
    '업무관리시스템 공문': null,
    '최신 교육부 보도자료 (웹)': null
  });

  const exactAnswers: Record<string, boolean> = {
    'Google Drive 문서': true,
    'NEIS 성적 데이터': false,
    '학부모 개인 연락처': false,
    '학교 공식 캘린더': true,
    '업무관리시스템 공문': false,
    '최신 교육부 보도자료 (웹)': true
  };

  const handleClassify = (item: string, isPossible: boolean) => {
    setClassifications(prev => ({ ...prev, [item]: isPossible }));
  };

  const handleScenarioTest = () => {
    const resultJSX = (
      <div className="flex flex-col gap-3 w-full">
        <div className="border border-red-900/40 bg-[#1c232b] rounded-lg p-4 relative shadow-inner">
          <h4 className="text-red-400 font-bold mb-2">MCP 연동 없음 (과거 데이터 기반)</h4>
          <pre className="text-xs text-gray-400 whitespace-pre-wrap">현장체험학습 시 일반적인 안전 수칙을 준수하시기 바랍니다.\n1. 질서 유지\n2. 교통 안전 ...\n(AI가 학습한 과거의 일반적인 내용, 현재 법률과 달라질 수 있음)</pre>
        </div>
        <div className="border border-green-900/40 bg-green-900/10 rounded-lg p-4 relative shadow-inner">
           <h4 className="text-green-400 font-bold mb-2">MCP 웹 검색 연동 적용</h4>
          <pre className="text-xs text-green-200 whitespace-pre-wrap">2024년 2월 발표된 교육부 최신 현장체험학습 안전 지침 가이드라인에 따라 아래 사항을 안내합니다.\n1. 응급구조사 동승 규정 최신 규정 반영\n2. 노란버스 이용 관련 예외 조항 등 ...\n(신뢰할 수 있는 최신 정보가 문서에 자동으로 반영됨!)</pre>
        </div>
      </div>
    );
    
    onExecute({
      title: 'MCP 연동 시뮬레이션: 정보의 정확성 점검',
      content: resultJSX,
      point: 'MCP로 최신 규정이나 공식 웹사이트를 연동하면 환각(거짓 정보) 없이 법적으로 안전한 공문과 안내본을 쓸 수 있습니다. 이는 AI의 신뢰성을 극적으로 높입니다.'
    });
  };

  const isAllAnswered = Object.values(classifications).every(v => v !== null);
  const correctCount = Object.keys(classifications).filter(k => classifications[k] === exactAnswers[k]).length;

  return (
    <div className="flex-1 bg-[#0e1318] rounded-xl p-5 border border-gray-800 flex flex-col gap-4 overflow-y-auto">
      <div className="text-white font-bold mb-2">체험: AI가 외부 자료를 직접 가져올 때</div>
      
      <div className="bg-gray-800/50 p-4 rounded-lg">
        <div className="text-sm text-gray-300 mb-2">체험 1: 웹 검색 연동 시뮬레이션</div>
        <div className="text-xs text-gray-400 mb-2 bg-gray-900 p-2 rounded">시나리오: "최신 교육부 현장체험학습 안전 지침을 반영해 가정통신문 써줘"</div>
        <button onClick={handleScenarioTest} className="px-4 py-2 bg-canva-teal text-white rounded font-bold text-xs hover:bg-opacity-90 w-full mb-1">
          연동 전/후 결과 비교해보기
        </button>
      </div>

      <div className="bg-[#1c232b] p-4 rounded-lg border border-gray-700 mt-2">
        <div className="text-sm font-bold text-white mb-2">체험 2: 연결 가능/불가 시스템 분류</div>
        <div className="text-xs text-gray-400 mb-4">현재 학교 환경에서 AI와 개인적으로 연결(MCP) 가능한 것과 절대 해선 안 되는(불가) 것을 분류해 보세요.</div>
        
        <div className="space-y-2">
          {Object.keys(classifications).map(item => (
            <div key={item} className="flex items-center justify-between bg-gray-800 p-2.5 rounded border border-gray-700">
              <span className="text-[13px] text-gray-200">{item}</span>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleClassify(item, true)}
                  className={`px-3 py-1 rounded text-[11px] font-bold transition-colors ${classifications[item] === true ? 'bg-canva-teal text-white border border-teal-500' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                >가능(안전)</button>
                <button 
                  onClick={() => handleClassify(item, false)}
                  className={`px-3 py-1 rounded text-[11px] font-bold transition-colors ${classifications[item] === false ? 'bg-red-900/50 text-red-300 border border-red-800' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                >불가(위험)</button>
              </div>
            </div>
          ))}
        </div>
        
        {isAllAnswered && (
          <div className={`mt-4 flex flex-col gap-3 p-3 rounded text-xs font-bold ${correctCount === 6 ? 'bg-canva-teal/20 text-canva-teal' : 'bg-amber-500/20 text-amber-500'}`}>
            <div>
              {correctCount === 6 ? "완벽합니다! 교육청 승인 없는 교내 시스템/개인정보 연동은 절대 금물입니다." : "틀린 항목이 있습니다. NEIS, 업무관리시스템, 학생/학부모 개인정보는 임의 연동이 절대 불가합니다."}
            </div>
            {correctCount === 6 && (
              <button onClick={() => onExecute({
                  title: '데이터 판별 결과 (피드백)',
                  content: '모든 데이터를 안전하게 분류하셨습니다! \n개인/민감/공공 시스템 정보에 대한 이해도가 높습니다.',
                  point: '앞으로 AI가 스스로 시스템에 연결되는(MCP) 시대가 일상화될 것입니다. 이때 가장 중요한 교사의 역량은 "이 데이터를 AI에게 줘도 안전한가?"를 판별하고 지휘하는 능력입니다.'
              })} className="py-2 bg-canva-teal/20 hover:bg-canva-teal text-white rounded transition-colors text-center w-full">
                실습 피드백 및 결과 확인
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const Lesson46Interactive = ({ onExecute }: { onExecute: (data: {title: string, content: React.ReactNode, point: string}) => void }) => {
  const resultText = `=== ○○초등학교 4학년 2반 AI 행정 도구함 ===
작성: 홍길동 / 2024년 3월

[1] 학교 시스템 프롬프트 (컨텍스트)
당신은 ○○초등학교 도우미입니다... (4-1 내용)

[2] 가정통신문 하네스
형식: [학교명]+[날짜]+[제목]... (4-2 내용)

[3] 공문 회신 하네스
어조: 행정 어체 준수... (4-2 내용)

[사용 방법]
1. 새 AI 대화 창 열기
2. [1] 학교 시스템 프롬프트 붙여넣기
3. 해당 업무의 하네스 붙여넣기
4. 업무 주제만 입력
5. 결과 검토 후 사용

※ 개인정보는 포함되어 있지 않습니다. 공유 및 재사용 가능합니다.`;

  const handleExport = () => {
    onExecute({
      title: '나만의 AI 행정 루틴 패키지 완료',
      content: resultText,
      point: '단순한 프롬프트 전달을 넘어서, 이 패키지 체계를 동료나 교무실에 공유하면 작은 개인 작업이 학교 전체의 행정 효율 시스템으로 확장됩니다.'
    });
  };

  return (
    <div className="flex-1 bg-[#0e1318] rounded-xl p-5 border border-gray-800 flex flex-col gap-4 overflow-y-auto">
      <div className="text-white font-bold mb-2">나의 AI 행정 루틴 완성 및 공유하기</div>
      
      <div className="bg-gray-800/50 p-4 rounded-lg">
        <div className="text-sm text-gray-300 mb-2">1단계: 연간 루틴 구상 (예시)</div>
        <ul className="text-xs text-gray-400 space-y-1 ml-4 list-disc">
          <li>3월: 학년 기본 컨텍스트(4-1) 세팅 완료</li>
          <li>4월: 체험학습용 가정통신문 하네스(4-2) 적극 활용</li>
          <li>6월: 통지표 작성 시 보조 에이전트(4-3) 활용</li>
          <li>연중: 교육청 공문은 Claude MCP(4-5)로 웹 핑거프린트 확인</li>
        </ul>
      </div>

      <div className="bg-[#1c232b] p-4 rounded-lg border border-gray-700">
        <div className="text-sm font-bold text-white mb-2">2단계: AI 도구함 모아보기 & 공유 패키지 생성</div>
        <div className="text-xs text-gray-400 mb-4">4-1 ~ 4-4에서 만든 나만의 프롬프트 기술들을 텍스트 하나로 묶어 동료와 쉽게 공유할 수 있습니다.</div>
        
        <button 
          onClick={handleExport}
          className="w-full py-3 bg-canva-purple text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          🎁 동료 공유용 텍스트 패키지 내보내기 보기
        </button>
      </div>
    </div>
  );
};

export const Lesson41Interactive = ({ onExecute }: { onExecute: (data: {title: string, content: React.ReactNode, point: string}) => void }) => {
  const [inputs, setInputs] = useState({
    school: '',
    teacher: '',
    grade: '',
    tasks: [] as string[],
    customTask: '',
    special: ''
  });

  const handleTaskToggle = (task: string) => {
    setInputs(prev => ({
      ...prev,
      tasks: prev.tasks.includes(task) 
        ? prev.tasks.filter(t => t !== task)
        : [...prev.tasks, task]
    }));
  };

  const generatePrompt = () => {
    const allTasks = [...inputs.tasks];
    if (inputs.customTask) allTasks.push(inputs.customTask);
    
    const lines = [
      `당신은 ${inputs.school || '[학교명]'} 행정 업무 도우미입니다.`,
      ``,
      `학교 정보:`,
      `- 학교명: ${inputs.school || '[학교명]'}`,
      `- 담당 교사: ${inputs.teacher || '[이름]'}, ${inputs.grade || '[학년·학급]'}`,
      `- 주요 업무: ${allTasks.length > 0 ? allTasks.join(', ') : '[업무 목록]'}`,
      ...(inputs.special ? [`- 학교 특수 상황: ${inputs.special}`] : []),
      ``,
      `작성 원칙:`,
      `- 모든 문서는 초안으로 제공하며 "검토 후 사용"을 안내합니다`,
      `- 공식 문서는 행정 어체로 작성합니다`,
      `- 명확하고 핵심 위주로 작성합니다`
    ];

    onExecute({
      title: '나만의 학교 시스템 프롬프트',
      content: lines.join('\n'),
      point: '이 시스템 프롬프트를 모든 대화의 시작점(Context)으로 활용하세요. AI가 학교 행정 전문가 모드로 고정됩니다.'
    });
  };

  return (
    <div className="flex-1 bg-[#0e1318] rounded-xl p-5 border border-gray-800 flex flex-col gap-4 overflow-y-auto">
      <div className="text-white font-bold mb-2">나의 학교 자동화 컨텍스트 설정</div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">학교 이름</label>
          <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-canva-purple" placeholder="예: 한국초등학교" value={inputs.school} onChange={e => setInputs({...inputs, school: e.target.value})} />
        </div>
        
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-400 block mb-1">담당 교사</label>
            <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-canva-purple" placeholder="예: 홍길동" value={inputs.teacher} onChange={e => setInputs({...inputs, teacher: e.target.value})} />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-400 block mb-1">학년·학급</label>
            <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-canva-purple" placeholder="예: 4학년 2반 담임" value={inputs.grade} onChange={e => setInputs({...inputs, grade: e.target.value})} />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">주요 담당 업무 (다중 선택)</label>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
            {['가정통신문 작성', '공문 회신', '학부모 안내 문자', '교육청 보고서', '학교폭력 사안 문서'].map(task => (
              <label key={task} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={inputs.tasks.includes(task)} onChange={() => handleTaskToggle(task)} className="rounded border-gray-600 text-canva-purple focus:ring-canva-purple bg-gray-700" />
                {task}
              </label>
            ))}
          </div>
          <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white mt-2 focus:outline-none focus:border-canva-purple" placeholder="기타 (직접 입력)" value={inputs.customTask} onChange={e => setInputs({...inputs, customTask: e.target.value})} />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">학교 특수 상황 (선택)</label>
          <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-canva-purple" placeholder="예: 혁신학교, AI 선도학교 등" value={inputs.special} onChange={e => setInputs({...inputs, special: e.target.value})} />
        </div>
      </div>

      <button 
        onClick={generatePrompt}
        className="w-full py-3 bg-canva-purple text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-lg mt-2 shrink-0 mb-4"
      >
        시스템 프롬프트 생성 (비교 결과 보기)
      </button>
    </div>
  );
};
