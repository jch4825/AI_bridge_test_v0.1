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

[${taskType} 프롬프트 템플릿 규칙]
${taskType} 작성 시 아래 규칙을 반드시 따릅니다:
${selectedRules.join('\n')}

이 설정으로 ${taskType} 주제만 말하면 즉시 초안을 작성합니다.`;
    
    onExecute({
      title: '나만의 행정 업무 프롬프트 템플릿',
      content: promptText,
      point: '완성된 프롬프트 템플릿을 프롬프트 창에 넣으면, 매번 형식을 지정하지 않아도 "[입력 정보]"만 바꾸어 무한 재사용이 가능해집니다.'
    });
  };

  return (
    <div className="flex-1 bg-[#0e1318] rounded-xl p-5 border border-gray-800 flex flex-col gap-4 overflow-y-auto">
      <div className="text-white font-bold mb-2">나의 행정 업무 프롬프트 템플릿 만들기</div>
      
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
          <label className="text-xs text-gray-400 block mb-2">2단계: 프롬프트 템플릿 구성 요소 선택</label>
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
        프롬프트 템플릿 생성하기
      </button>
    </div>
  );
};

export const Lesson43Interactive = ({ onExecute }: { onExecute: (data: {title: string, content: React.ReactNode, point: string, hideDocsButton?: boolean}) => void }) => {
  const canvasPrompt = `학생 이름을 입력하면 다음 3가지를 자동 생성해 주는 간단한 웹 도구를 만들어줘:
1) 그 학생을 위한 칭찬 문구 3가지 (학습 태도/교우 관계/노력 측면)
2) 복사 버튼
3) "다른 문구 보기" 새로고침 버튼
색감은 부드러운 파스텔 톤으로, 초등학교 교사가 쓴다는 느낌으로 만들어줘.`;

  const handleTest = () => {
    onExecute({
      title: 'Gemini Canvas 체험 시뮬레이션 결과',
      content: `### 🎨 Gemini Canvas가 즉시 생성하는 화면 (예상)\n\n\`\`\`text\n[Canvas 미리보기]\n\n┌─────────────────────────────────────┐\n│  🌸 학생 칭찬 문구 생성기           │\n├─────────────────────────────────────┤\n│  학생 이름: [김하늘        ]        │\n│                                     │\n│  [ ✨ 칭찬 문구 생성하기 ]          │\n│                                     │\n│  💬 생성된 칭찬:                    │\n│  1. "김하늘 학생은 모둠 활동에서…"   │\n│  2. "꾸준히 숙제를 제출하는 모습…"   │\n│  3. "친구를 배려하는 태도가…"        │\n│                                     │\n│  [ 📋 복사 ]  [ 🔄 다른 문구 보기 ]  │\n└─────────────────────────────────────┘\n\n(대화창 안에서 바로 동작. 수정하고 싶으면 "버튼 색을 보라색으로 바꿔줘" 같이 말만 하면 됨.)\n\`\`\``,
      point: '단 한 번의 자연어 지시만으로 버튼·입력창·출력 영역이 모두 작동하는 미니 도구가 만들어집니다. 이것이 가장 낮은 진입 장벽의 바이브 코딩이며, 다음 4-4에서는 이를 영구 재사용 가능한 "앱"으로 확장합니다.',
      hideDocsButton: true
    });
  };

  return (
    <div className="flex-1 bg-[#0e1318] rounded-xl p-5 border border-gray-800 flex flex-col gap-4 overflow-y-auto">
      <div className="text-white font-bold mb-2">Gemini Canvas 체험 가이드</div>

      <div className="text-sm text-gray-300 bg-gray-800/50 p-4 rounded-lg">
        <ul className="list-decimal pl-4 space-y-2">
          <li><a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" className="text-canva-teal hover:underline font-bold">Google Gemini</a> 에 접속해 로그인합니다.</li>
          <li>입력창 하단의 <strong>[Canvas]</strong> 옵션을 켭니다.</li>
          <li>아래 예시 프롬프트를 붙여 넣고 전송합니다. 오른쪽 Canvas 창에 즉시 작동하는 도구가 생성됩니다.</li>
          <li>추가 대화로 색상·기능을 조정해 봅니다. (예: "버튼 색을 보라색으로 바꿔줘")</li>
        </ul>
      </div>

      <div className="relative bg-[#1c232b] p-4 rounded-lg border border-gray-700">
        <div className="text-xs font-bold text-gray-400 mb-2">Canvas에 붙여넣을 예시 프롬프트</div>
        <CopyButton text={canvasPrompt} />
        <pre className="text-xs text-canva-gray whitespace-pre-wrap font-mono mt-2">{canvasPrompt}</pre>
      </div>

      <div className="mt-2 text-sm">
        <div className="text-xs text-gray-400 mb-2">Canvas가 만들어낼 결과 시뮬레이션</div>
        <div className="flex gap-2">
          <button onClick={handleTest} className="w-full py-3 bg-canva-teal text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-lg">Gemini Canvas 결과 미리보기</button>
        </div>
      </div>
    </div>
  );
};

export const Lesson44Interactive = ({ onExecute }: { onExecute: (data: {title: string, content: React.ReactNode, point: string, hideDocsButton?: boolean}) => void }) => {
  const promptText = `(여기에 4-1에서 만든 학교 시스템 프롬프트를 붙여넣으세요)

(여기에 4-2에서 만든 행정 업무 프롬프트 템플릿을 적절히 붙여넣으세요)

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
          <li>기존에 작성해 두었던 <strong>[4-1 시스템 프롬프트]</strong>와 <strong>[4-2 프롬프트 템플릿]</strong> 내용을 조합합니다.</li>
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

export const Lesson47Interactive = ({ onExecute }: { onExecute: (data: {title: string, content: React.ReactNode, point: string}) => void }) => {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatSent, setChatSent] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [createSubmenuOpen, setCreateSubmenuOpen] = useState(false);

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploaded(true);
      setStep(5);
    }, 1600);
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    setChatSent(true);
    setAiTyping(true);
    setTimeout(() => {
      setAiTyping(false);
      setShowResponse(true);
    }, 1800);
  };

  const handleComplete = () => {
    const resultJSX = (
      <div className="flex flex-col gap-3 w-full">
        <div className="border border-canva-teal/50 bg-canva-teal/10 rounded-lg p-4">
          <h4 className="text-canva-teal font-bold mb-2">✅ Skill 연결 후 AI 응답</h4>
          <pre className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">{`[HWPX 공문/기안문 자동 채우기 스킬 v2] 호출됨

✓ 기안문 서식 적용 완료
✓ 수신·참조·제목·본문·붙임 자동 구성
✓ 행정 어체 변환 완료

📎 현장체험학습_기안문.hwpx (생성 완료)
  → 한글 2020 이상에서 바로 열림`}</pre>
        </div>
        <div className="border border-gray-700 bg-gray-800 rounded-lg p-4">
          <h4 className="text-gray-300 font-bold mb-2">❌ Skill 미연결 상태의 일반 Claude</h4>
          <pre className="text-xs text-gray-400 whitespace-pre-wrap leading-relaxed">{`기안문 본문을 텍스트로 작성해 드립니다.
복사해서 한글에 붙여넣고 서식을 직접 맞추세요...
(hwpx 파일 직접 생성 불가)`}</pre>
        </div>
      </div>
    );
    onExecute({
      title: 'HWPX 공문 스킬 연결 결과',
      content: resultJSX,
      point: 'Skill을 한 번만 내 Claude 계정에 업로드해 두면, 이후에는 주제만 말해도 한글에서 바로 열리는 hwpx 파일이 자동 생성됩니다. 서식·어체·결재란까지 자동으로 맞춰주기 때문에 공문 작성 시간이 극적으로 줄어듭니다.'
    });
  };

  return (
    <div className="flex-1 bg-[#0e1318] rounded-xl p-0 border border-gray-800 flex flex-col overflow-hidden">
      {/* Claude 시뮬레이션 헤더 */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1d24] border-b border-gray-800">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-[10px] font-bold text-white">C</div>
        <div className="text-xs text-gray-300 font-semibold">Claude.ai — Skill 업로드 시뮬레이터</div>
        <div className="ml-auto flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70"></div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 사이드바 (Claude 스타일) */}
        <div className="w-[180px] bg-[#141820] border-r border-gray-800 p-3 flex flex-col gap-1.5">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">메뉴</div>
          <div className="text-xs text-gray-400 px-2 py-1.5 rounded hover:bg-gray-800/50">💬 새 대화</div>
          <div className="text-xs text-gray-400 px-2 py-1.5 rounded hover:bg-gray-800/50">📁 Projects</div>
          <button
            onClick={() => step === 1 && setStep(2)}
            className={`text-left text-xs px-2 py-1.5 rounded transition-all ${step >= 2 ? 'bg-canva-purple/20 text-canva-purple border border-canva-purple/40' : 'text-gray-300 hover:bg-gray-800/70 border border-transparent btn-highlight'}`}
          >
            {step >= 2 ? '✓' : '➕'} 커스터마이즈
          </button>
          <div className="text-xs text-gray-500 px-2 py-1.5">⚙️ 설정</div>
          <div className="mt-auto border-t border-gray-800 pt-2 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setAddMenuOpen(false);
                setCreateSubmenuOpen(false);
                if (step === 5) {
                  // 업로드 완료 화면에서 되돌아가면 업로드/대화 상태도 초기화
                  setUploaded(false);
                  setChatSent(false);
                  setChatInput('');
                  setShowResponse(false);
                  setAiTyping(false);
                }
                setStep(s => Math.max(1, s - 1));
              }}
              disabled={step <= 1}
              className="text-[10px] px-2 py-1 rounded border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="직전 단계로 돌아가기"
            >
              ← 이전
            </button>
            <div className="text-[10px] text-gray-600">
              <span className="text-canva-teal font-bold">{Math.min(step, 5)}</span>
              <span className="text-gray-700">/5</span>
            </div>
          </div>
        </div>

        {/* 우측 메인 패널 */}
        <div className="flex-1 overflow-y-auto">
          {/* Step 1: 시작 */}
          {step === 1 && (
            <div className="p-5 flex flex-col gap-4">
              <div className="text-white font-bold text-sm">🎯 목표: HWPX 공문 스킬 연결하기</div>
              <div className="bg-[#1c232b] border border-gray-700 rounded-lg p-4 text-xs text-gray-300 leading-relaxed">
                이 스킬을 내 Claude에 올리면, 대화만으로 <span className="text-canva-teal font-bold">아래아한글(.hwpx) 공문·기안문 파일</span>이 자동으로 생성됩니다.
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-200">
                  📎 스킬 출처: <a href="https://blog.naver.com/metagwc/224253033223" target="_blank" rel="noopener noreferrer" className="text-amber-300 underline hover:text-amber-100">HWPX 공문/기안문 자동 채우기 스킬 v2 (메타교육 블로그)</a>
                </div>
              </div>
              <button onClick={() => setStep(2)} className="py-2.5 bg-canva-purple text-white rounded-lg text-sm font-bold hover:bg-opacity-90 transition-colors">
                시작하기 → 좌측 [+ 커스터마이즈] 클릭
              </button>
            </div>
          )}

          {/* Step 2: Customize 첫 화면 — 좌측 [스킬] 탭 클릭 */}
          {step === 2 && (
            <div className="p-5 flex flex-col gap-4">
              <div className="text-white font-bold text-sm">Step 1/3 · Customize 화면 — 좌측 [스킬] 탭 선택</div>
              <div className="bg-[#1c232b] border border-gray-700 rounded-lg overflow-hidden">
                {/* Customize 상단 헤더 */}
                <div className="px-3 py-2 border-b border-gray-700 text-[11px] text-gray-400 flex items-center gap-1.5">
                  ← Customize
                </div>
                <div className="flex min-h-[260px]">
                  {/* 좌측 탭 컬럼 */}
                  <div className="w-[150px] border-r border-gray-700 p-2 flex flex-col gap-1">
                    <button
                      onClick={() => setStep(3)}
                      className="text-left text-[11px] px-2.5 py-1.5 rounded text-canva-teal bg-canva-teal/10 border border-canva-teal/40 font-bold btn-highlight btn-highlight-teal"
                    >
                      📜 스킬
                    </button>
                    <div className="text-[11px] px-2.5 py-1.5 rounded text-gray-400">
                      🔌 커넥터
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-700/60">
                      <div className="flex items-center justify-between px-1.5 py-1 text-[10px] text-gray-500">
                        <span>개인 플러그인</span>
                        <span className="text-gray-600">+</span>
                      </div>
                      <div className="text-[10px] text-gray-600 px-1.5 py-1 leading-snug">
                        플러그인으로 Claude에게 역할 수준의 전문성 부여
                      </div>
                      <button className="w-full mt-2 px-2 py-1.5 text-[10px] text-gray-400 border border-gray-700 rounded">
                        플러그인 탐색
                      </button>
                    </div>
                  </div>
                  {/* 우측 메인 — 빈 상태 */}
                  <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl mb-2">💼</div>
                    <div className="text-sm text-gray-200 font-bold mb-1">Claude 맞춤설정</div>
                    <div className="text-[11px] text-gray-500 mb-4 max-w-[280px]">
                      스킬, 커넥터, 플러그인은 Claude가 사용자와 함께 작업하는 방식을 결정합니다.
                    </div>
                    <div className="flex flex-col gap-2 w-full max-w-[260px]">
                      <div className="flex items-center gap-2 px-3 py-2 border border-gray-700 rounded text-left">
                        <span className="text-base">🔌</span>
                        <div className="flex-1">
                          <div className="text-[11px] text-gray-200 font-semibold">앱 연결</div>
                          <div className="text-[9px] text-gray-500">Claude가 이미 사용 중인 도구를 읽고 쓸 수 있도록</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 border border-gray-700 rounded text-left">
                        <span className="text-base">📜</span>
                        <div className="flex-1">
                          <div className="text-[11px] text-gray-200 font-semibold">새 스킬 만들기</div>
                          <div className="text-[9px] text-gray-500">Claude에게 프로세스, 팀 규범, 전문 지식을 가르치세요</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-gray-500">
                👆 좌측의 <span className="text-canva-teal font-bold">[📜 스킬]</span> 탭을 클릭하세요.
              </div>
            </div>
          )}

          {/* Step 3: 스킬 탭 — [+] 버튼 → 스킬 업로드 */}
          {step === 3 && (
            <div className="p-5 flex flex-col gap-4">
              <div className="text-white font-bold text-sm">Step 2/3 · 스킬 탭에서 [+] → [스킬 업로드]</div>
              <div className="bg-[#1c232b] border border-gray-700 rounded-lg overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-700 text-[11px] text-gray-400 flex items-center gap-1.5">
                  ← Customize
                </div>
                <div className="flex min-h-[280px]">
                  {/* 좌측 탭 컬럼 (스킬 선택됨) */}
                  <div className="w-[130px] border-r border-gray-700 p-2 flex flex-col gap-1">
                    <div className="text-[11px] px-2.5 py-1.5 rounded text-canva-teal bg-canva-teal/15 border border-canva-teal/40 font-bold">
                      📜 스킬
                    </div>
                    <div className="text-[11px] px-2.5 py-1.5 rounded text-gray-400">
                      🔌 커넥터
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-700/60 flex items-center justify-between px-1.5 py-1 text-[10px] text-gray-500">
                      <span>개인 플러그인</span>
                      <span className="text-gray-600">+</span>
                    </div>
                  </div>
                  {/* 중간 컬럼 — 스킬 리스트 */}
                  <div className="flex-1 p-3 relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-gray-200 font-bold">스킬</div>
                      <div className="flex items-center gap-1.5">
                        <button className="w-6 h-6 rounded text-gray-500 hover:bg-gray-800 flex items-center justify-center text-xs">
                          🔍
                        </button>
                        <button
                          onClick={() => { setAddMenuOpen(v => !v); setCreateSubmenuOpen(false); }}
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all ${
                            addMenuOpen
                              ? 'bg-canva-purple text-white'
                              : 'text-canva-purple bg-canva-purple/10 border border-canva-purple/40 btn-highlight'
                          }`}
                          title="추가"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 mb-2">개인 스킬</div>
                    <div className="border border-dashed border-gray-700 rounded p-4 text-center text-[10px] text-gray-500">
                      아직 추가된 개인 스킬이 없습니다
                    </div>

                    {/* [+] 드롭다운 메뉴 */}
                    {addMenuOpen && (
                      <div className="absolute top-10 right-3 z-20 bg-[#0f1318] border border-gray-700 rounded-lg shadow-2xl py-1 min-w-[170px]">
                        <button
                          onClick={() => { setAddMenuOpen(false); }}
                          className="w-full text-left px-3 py-2 text-[11px] text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                        >
                          <span className="text-xs">🗂️</span> 스킬 둘러보기
                        </button>
                        <div
                          onMouseEnter={() => setCreateSubmenuOpen(true)}
                          onMouseLeave={() => setCreateSubmenuOpen(false)}
                          className="relative"
                        >
                          <button
                            onClick={() => setCreateSubmenuOpen(v => !v)}
                            className={`w-full text-left px-3 py-2 text-[11px] flex items-center justify-between gap-2 hover:bg-gray-800 ${createSubmenuOpen ? 'bg-gray-800 text-white' : 'text-gray-300'}`}
                          >
                            <span className="flex items-center gap-2"><span className="text-xs">➕</span> 스킬 만들기</span>
                            <span className="text-gray-500">▶</span>
                          </button>
                          {createSubmenuOpen && (
                            <div className="absolute right-full top-0 mr-1 bg-[#0f1318] border border-gray-700 rounded-lg shadow-2xl py-1 min-w-[180px]">
                              <button
                                onClick={() => { setAddMenuOpen(false); setCreateSubmenuOpen(false); }}
                                className="w-full text-left px-3 py-2 text-[11px] text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                              >
                                <span className="text-xs">🤖</span> Claude와 함께 창작하기
                              </button>
                              <button
                                onClick={() => { setAddMenuOpen(false); setCreateSubmenuOpen(false); }}
                                className="w-full text-left px-3 py-2 text-[11px] text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                              >
                                <span className="text-xs">📝</span> 스킬 지침 작성
                              </button>
                              <button
                                onClick={() => { setAddMenuOpen(false); setCreateSubmenuOpen(false); setStep(4); }}
                                className="w-full text-left px-3 py-2 text-[11px] text-canva-purple bg-canva-purple/10 hover:bg-canva-purple/20 font-bold flex items-center gap-2 btn-highlight"
                              >
                                <span className="text-xs">⬆️</span> 스킬 업로드
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-gray-500">
                👆 우측 상단의 <span className="text-canva-purple font-bold">[+]</span> → <span className="text-gray-300">[스킬 만들기]</span> → <span className="text-canva-purple font-bold">[스킬 업로드]</span> 순서로 클릭하세요.
              </div>
            </div>
          )}

          {/* Step 4: 파일 업로드 */}
          {step === 4 && (
            <div className="p-5 flex flex-col gap-4">
              <div className="text-white font-bold text-sm">Step 3/3 · 스킬 파일 업로드</div>
              <div className="bg-[#1c232b] border border-gray-700 rounded-lg p-5">
                <div className="text-sm text-gray-200 font-semibold mb-2">스킬 업로드</div>
                <div className="text-[11px] text-gray-500 mb-4">
                  .zip 파일을 선택하거나 여기로 드래그하세요
                </div>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    uploading ? 'border-canva-teal bg-canva-teal/5' : uploaded ? 'border-green-500 bg-green-500/5' : 'border-gray-600 hover:border-canva-purple bg-gray-900/40'
                  }`}
                >
                  {!uploading && !uploaded && (
                    <>
                      <div className="text-3xl mb-2">📦</div>
                      <div className="text-xs text-gray-300 font-semibold mb-1">HWPX 공문/기안문 자동 채우기 스킬 v2.zip</div>
                      <div className="text-[10px] text-gray-500 mb-3">크기: 245 KB · 출처: 메타교육 블로그</div>
                      <button
                        onClick={handleUpload}
                        className="px-4 py-2 bg-canva-purple text-white rounded text-xs font-bold hover:bg-opacity-90 btn-highlight"
                      >
                        이 스킬 업로드
                      </button>
                    </>
                  )}
                  {uploading && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-canva-teal border-t-transparent rounded-full animate-spin"></div>
                      <div className="text-xs text-canva-teal font-bold">업로드 중...</div>
                      <div className="text-[10px] text-gray-500">스킬 검증 · 매니페스트 파싱 · 권한 등록</div>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-[10px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20 rounded p-2">
                  ⚠️ 신뢰할 수 있는 출처의 스킬만 업로드하세요. <a href="https://blog.naver.com/metagwc/224253033223" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-200">출처 확인하기</a>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: 업로드 완료 + 테스트 */}
          {step === 5 && (
            <div className="p-5 flex flex-col gap-4">
              <div className="bg-green-500/10 border border-green-500/40 rounded-lg p-3 flex items-center gap-2">
                <Check size={16} className="text-green-400" />
                <div className="text-xs text-green-300 font-bold">스킬 설치 완료! 이제 대화창에서 바로 호출할 수 있습니다.</div>
              </div>

              <div className="bg-[#1c232b] border border-gray-700 rounded-lg p-3">
                <div className="text-[10px] text-gray-500 mb-2">설치된 스킬 (1개)</div>
                <div className="flex items-center gap-2 bg-gray-900/60 p-2 rounded border border-gray-700">
                  <div className="text-lg">📄</div>
                  <div className="flex-1">
                    <div className="text-xs text-white font-semibold">HWPX 공문/기안문 자동 채우기 스킬 v2</div>
                    <div className="text-[10px] text-gray-500">활성화됨 · 버전 2.0</div>
                  </div>
                  <div className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded font-bold">ON</div>
                </div>
              </div>

              {/* 대화 테스트 영역 */}
              <div className="bg-[#0a0d12] border border-gray-700 rounded-lg p-3 flex flex-col gap-3">
                <div className="text-[10px] text-gray-500">💬 Claude 대화창에서 테스트</div>

                {chatSent && (
                  <div className="flex justify-end">
                    <div className="bg-canva-purple/20 border border-canva-purple/40 rounded-lg px-3 py-2 max-w-[85%] text-xs text-gray-200">
                      {chatInput}
                    </div>
                  </div>
                )}

                {aiTyping && (
                  <div className="flex gap-1 text-canva-teal text-xs">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce" style={{animationDelay: '0.15s'}}>●</span>
                    <span className="animate-bounce" style={{animationDelay: '0.3s'}}>●</span>
                    <span className="ml-2 text-gray-500">Claude가 스킬을 불러오는 중...</span>
                  </div>
                )}

                {showResponse && (
                  <div className="bg-[#141820] border border-canva-teal/40 rounded-lg p-3 text-xs text-gray-200 leading-relaxed">
                    <div className="text-[10px] text-canva-teal font-bold mb-2">🔧 [HWPX 공문/기안문 자동 채우기 스킬 v2] 실행됨</div>
                    <div className="whitespace-pre-wrap">{`기안문을 작성했습니다.

✓ 수신: 교장
✓ 참조: 교감, 교무부장
✓ 제목: 4학년 현장체험학습 실시 계획
✓ 본문: 목적·일시·장소·예산·안전관리
✓ 붙임: 참가 동의서, 안전교육 자료

📎 생성 파일: 현장체험학습_기안문.hwpx
 (한글 2020 이상에서 바로 열림)`}</div>
                  </div>
                )}

                {!chatSent && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="예: 4학년 현장체험학습 기안문 작성해줘"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-canva-purple focus:outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                    />
                    <button
                      onClick={handleChatSend}
                      disabled={!chatInput.trim()}
                      className="px-3 py-2 bg-canva-purple text-white rounded text-xs font-bold hover:bg-opacity-90 disabled:opacity-30"
                    >
                      전송
                    </button>
                  </div>
                )}

                {!chatSent && (
                  <div className="flex flex-wrap gap-1.5">
                    {['4학년 현장체험학습 기안문 작성해줘', '학부모 총회 개최 공문 써줘', '교육청 보고용 예산 집행 기안문'].map((suggest, i) => (
                      <button
                        key={i}
                        onClick={() => setChatInput(suggest)}
                        className="text-[10px] px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded border border-gray-700"
                      >
                        {suggest}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {showResponse && (
                <button
                  onClick={handleComplete}
                  className="py-2.5 bg-canva-teal text-white rounded-lg text-sm font-bold hover:bg-opacity-90 transition-colors"
                >
                  ✓ Skill 연결 전/후 차이 확인하기
                </button>
              )}
            </div>
          )}
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

[1] 학교 시스템 프롬프트
당신은 ○○초등학교 도우미입니다... (4-1 내용)

[2] 가정통신문 프롬프트 템플릿
형식: [학교명]+[날짜]+[제목]... (4-2 내용)

[3] 공문 회신 프롬프트 템플릿
어조: 행정 어체 준수... (4-2 내용)

[사용 방법]
1. 새 AI 대화 창 열기
2. [1] 학교 시스템 프롬프트 붙여넣기
3. 해당 업무의 프롬프트 템플릿 붙여넣기
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
          <li>3월: 학교 시스템 프롬프트(4-1) 세팅 완료</li>
          <li>4월: 체험학습용 가정통신문 프롬프트 템플릿(4-2) 적극 활용</li>
          <li>6월: 통지표 작성 시 나만의 AI 앱(4-3) 활용</li>
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
