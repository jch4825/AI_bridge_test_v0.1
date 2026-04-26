import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight, PlayCircle, Clock, ArrowRight, Copy, Info, FileText, Lock, Check, School } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoogleGenAI } from "@google/genai";
import { modules, lessons, Lesson } from '../data/tutorialData';
import { Module } from '../types';
import { friendlyApiError } from '../utils/apiError';
import { getTheme } from '../utils/moduleThemes';
import SpeakButton from '../components/SpeakButton';
import {
  Lesson41Interactive,
  Lesson42Interactive,
  Lesson43Interactive,
  Lesson44Interactive,
  Lesson45Interactive,
  Lesson46Interactive,
  Lesson47Interactive
} from './Module4Components';
import {
  Lesson51Interactive,
  Lesson52Interactive,
  Lesson53Interactive,
  Lesson54Interactive,
  Lesson55Interactive,
  Lesson56Interactive,
  Lesson57Interactive
} from './Module5Components';

let module4PrinciplesShown = false;

interface LessonViewerProps {
  lesson: Lesson;
  onBack: () => void;
  onModuleComplete: () => void;
  onToggleComplete: (lessonId: string) => void;
  onMarkComplete: (lessonId: string) => void;
  isCompleted: boolean;
  onNavigateToLesson: (lessonId: string) => void;
  completedLessons: string[];
}

const LEARNING_POINTS: Record<string, string[]> = {
  'l1-4': [
    "**보안의 핵심:** API 키는 여러분의 인공지능 계정에 접속하는 '비밀번호'와 같습니다. 절대로 타인에게 공유하지 마세요.",
    "**비용 관리:** API 사용량에 따라 비용이 발생할 수 있으므로(무료 티어 제외), 사용량을 주기적으로 확인하는 습관이 필요합니다.",
    "**연결의 힘:** API를 활용하면 챗봇뿐만 아니라 엑셀, 구글 문서 등 다양한 도구에서 AI의 힘을 빌릴 수 있습니다.",
    "**API는 무엇:** API 키는 전자 출입증과 같습니다. API키를 통해 여러분이 누구인지 서버가 인식합니다.",
    "**무료 티어 활용:** Google AI Studio는 교육용으로 충분한 무료 한도를 제공하므로, 부담 없이 실습해볼 수 있습니다."
  ],
  'l1-5': [
    "**실시간 상호작용:** 지금 여러분은 API를 통해 전 세계에서 가장 강력한 AI 중 하나와 실시간으로 대화하고 있습니다.",
    "**프롬프트의 중요성:** 질문을 어떻게 하느냐에 따라 AI의 답변 품질이 달라집니다. 다음 모듈에서 이를 자세히 배울 예정입니다.",
    "**기술적 연결:** 여러분이 입력한 텍스트가 API를 통해 구글 서버로 전달되고, 다시 답변이 돌아오는 과정을 직접 체험하신 것입니다.",
    "**활용의 시작:** 이제 여러분은 자신만의 AI 도구를 만들 수 있는 첫 번째 열쇠(API 키)를 손에 넣으셨습니다.",
    "**데이터 보안:** API를 통한 대화는 학습에 사용되지 않도록 설정할 수 있어, 개인정보 보호 측면에서 유리할 수 있습니다."
  ],
  'default': [
    "**도구로서의 AI:** AI는 도구일 뿐입니다. 최종적인 판단과 책임은 항상 사용자(교사)에게 있음을 잊지 마세요.",
    "**구체적인 지시:** 프롬프트를 구체적으로 작성할수록 AI는 더 정확하고 유용한 답변을 제공합니다.",
    "**교차 검증 필수:** AI의 답변에는 '할루시네이션(환각)'이 있을 수 있으니, 중요한 정보는 반드시 교차 검증하세요.",
    "**개인정보 보호:** 인공지능에게 무심코 학생의 개인정보나 기밀을 넘기고 있지는 않나요?",
    "**지속적인 학습:** AI 기술은 빠르게 발전합니다. 새로운 기능과 업데이트 소식에 관심을 가져보세요."
  ]
};

function LessonViewer({ lesson, onBack, onModuleComplete, onToggleComplete, onMarkComplete, isCompleted, onNavigateToLesson, completedLessons }: LessonViewerProps) {
  const theme = getTheme(lesson.moduleId);
  const currentModule = modules.find(m => m.id === lesson.moduleId);
  const [userInput, setUserInput] = useState(lesson.interactive?.initialInput || '');
  const [aiResponse, setAiResponse] = useState<any>('');
  const [isTyping, setIsTyping] = useState(false);
  const [learningPoint, setLearningPoint] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(() => {
    const key = localStorage.getItem('gemini-api-key');
    return !!(key && key.length > 10);
  });
  const [metaPromptCopied, setMetaPromptCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runIdRef = useRef(0);
  const leftScrollRef = useRef<HTMLDivElement | null>(null);
  const hasReachedEndRef = useRef(false);
  const mountTimeRef = useRef<number>(Date.now());
  const manualToggleClickedRef = useRef(false);

  useEffect(() => {
    hasReachedEndRef.current = false;
    mountTimeRef.current = Date.now();
    manualToggleClickedRef.current = false;

    const el = leftScrollRef.current;
    if (!el) return;
    const check = () => {
      const ratio = (el.scrollTop + el.clientHeight) / Math.max(el.scrollHeight, 1);
      if (ratio >= 0.95) {
        hasReachedEndRef.current = true;
        el.removeEventListener('scroll', check);
      }
    };
    if (el.scrollHeight <= el.clientHeight + 4) {
      hasReachedEndRef.current = true;
      return;
    }
    el.addEventListener('scroll', check, { passive: true });
    return () => el.removeEventListener('scroll', check);
  }, [lesson.id]);

  // 현재 모듈의 레슨 순서에서 다음 레슨 계산 (l1-4 숏컷 제외)
  const nextLesson = (() => {
    const moduleLessons = lessons
      .filter(l => l.moduleId === lesson.moduleId)
      .sort((a, b) => a.order - b.order);
    const currentIndex = moduleLessons.findIndex(l => l.id === lesson.id);
    return currentIndex >= 0 ? moduleLessons[currentIndex + 1] ?? null : null;
  })();

  // M4 Popup State
  const [m4PopupData, setM4PopupData] = useState<{title: string, content: React.ReactNode, point: string, hideDocsButton?: boolean} | null>(null);

  const handleM4Execute = (data: {title: string, content: React.ReactNode, point: string, hideDocsButton?: boolean}) => {
    setM4PopupData(data);
  };

  const closeM4Popup = () => {
    setM4PopupData(null);
  };

  useEffect(() => {
    if (lesson.moduleId === 'm4' && !module4PrinciplesShown) {
      setShowOverlay(true);
    }
  }, [lesson.moduleId]);

  const handleCloseOverlay = () => {
    module4PrinciplesShown = true;
    setShowOverlay(false);
  };

  useEffect(() => {
    // Cancel any in-progress typing animation before switching lessons
    runIdRef.current++;
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const points = LEARNING_POINTS[lesson.id] || LEARNING_POINTS['default'];
    const randomPoint = points[Math.floor(Math.random() * points.length)];
    setLearningPoint(randomPoint);

    // Reset state when navigating to a different lesson
    setUserInput(lesson.interactive?.initialInput || '');
    setAiResponse('');
    setIsTyping(false);
  }, [lesson.id, lesson.interactive?.initialInput]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      runIdRef.current++;
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const handleRun = async (forcedInput?: string) => {
    if (!lesson.interactive) return;
    const inputToUse = forcedInput !== undefined ? forcedInput : userInput;

    // Cancel any previous typing animation
    runIdRef.current++;
    const myRunId = runIdRef.current;
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsTyping(true);
    setAiResponse('');

    // Helper: starts a character-by-character typing animation.
    // Cancels itself if a newer run has started (runIdRef > myRunId).
    const startTyping = (text: string, speed = 15) => {
      let i = 0;
      intervalRef.current = setInterval(() => {
        // Stale-run guard: stop if a newer handleRun or lesson change occurred
        if (myRunId !== runIdRef.current) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return;
        }
        if (i < text.length) {
          const char = text.charAt(i);
          if (char) setAiResponse(prev => prev + char);
          i++;
        }
        if (i >= text.length) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsTyping(false);
        }
      }, speed);
    };

    if (inputToUse.trim() === '') {
      startTyping('입력창에 내용을 작성해 주세요.');
      return;
    }

    // Special handling for lesson 1-4: Save API Key
    if (lesson.id === 'l1-4') {
      const apiKey = inputToUse.replace(/\s+/g, '');
      if (apiKey.startsWith('AIza') && apiKey.length >= 30) {
        localStorage.setItem('gemini-api-key', apiKey);
        setHasApiKey(true);
        // 사이드바·상단 네비 등 다른 곳의 hasApiKey 상태가 즉시 반영되도록
        window.dispatchEvent(new Event('api-key-changed'));
      }
    }

    // Special handling for lessons that call Gemini API
    if (lesson.id === 'l1-5' || lesson.interactive.systemPrompt) {
      const savedKey = localStorage.getItem('gemini-api-key');
      let fullText = "";

      if (!savedKey || savedKey.length < 10) {
        if (lesson.interactive.simulationAnswer) {
          fullText = lesson.interactive.simulationAnswer;
        } else {
          fullText = "(API키가 제대로 작동하지 않아, default 답변을 생성합니다.) API키를 입력한 후 실습을 진행해 보세요.";
        }
      } else {
        // 모든 AI 답변에 공통 적용되는 가독성 포맷 규칙
        const FORMAT_RULE = "\n\n[형식 규칙] 가독성을 위해 ① 글자 색깔 변경(HTML 태그·인라인 스타일 포함)은 절대 사용하지 않습니다. ② 표(마크다운 테이블 포함)는 만들지 않습니다.";

        let systemInstruction = "";

        if (lesson.interactive.systemPrompt) {
          systemInstruction = lesson.interactive.systemPrompt + FORMAT_RULE;
        } else if (lesson.id === 'l1-5') {
          systemInstruction = "답변은 반드시 5줄 이내로 간결하게 작성해주세요." + FORMAT_RULE;
        }

        const callOnce = async () => {
          const ai = new GoogleGenAI({ apiKey: savedKey });
          return await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: inputToUse,
            config: systemInstruction ? { systemInstruction } : undefined
          });
        };

        // 신규 키 전파 지연(Google 측) 대응: API_KEY_INVALID 만 1회 자동 재시도
        const isPropagationError = (e: any) => {
          const msg = (e?.message ?? '').toString();
          return /API_KEY_INVALID|API key expired|API key not valid|key expired/i.test(msg);
        };

        try {
          let response;
          try {
            response = await callOnce();
          } catch (firstErr) {
            if (isPropagationError(firstErr)) {
              // 1.8초 대기 후 재시도 (Google 인증 서버 전파 시간)
              await new Promise(r => setTimeout(r, 1800));
              response = await callOnce();
            } else {
              throw firstErr;
            }
          }

          fullText = response.text || "답변을 생성할 수 없습니다.";

          // Save l2-6 meta-prompt output so l3-8 can reuse it
          if (lesson.id === 'l2-6' && response.text) {
            try {
              localStorage.setItem('meta-prompt-l2-6', response.text);
            } catch {}
          }
        } catch (error: any) {
          console.error("Gemini API Error:", error);
          fullText = friendlyApiError(error);
        }
      }

      // Guard: if lesson changed while awaiting the API response, abort
      if (myRunId !== runIdRef.current) return;

      startTyping(fullText, 10);
      return;
    }

    // Determine the answer based on user input for dynamic lessons
    let fullText = lesson.interactive.answer;
    if (lesson.interactive.answers) {
      const trimmedInput = inputToUse.trim();
      // Case-insensitive check
      const matchedKey = Object.keys(lesson.interactive.answers).find(
        key => key.toLowerCase() === trimmedInput.toLowerCase()
      );
      if (matchedKey) {
        fullText = lesson.interactive.answers[matchedKey];
      } else if (lesson.interactive.answers["default"]) {
        fullText = lesson.interactive.answers["default"];
      } else {
        fullText = "정확한 값을 입력하거나 버튼을 클릭해주세요.";
      }
    }

    startTyping(fullText);
  };

  return (
    <div
      className="flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden"
      style={{
        background: `radial-gradient(ellipse 60% 50% at 100% 0%, ${theme.glowA}, transparent 60%), radial-gradient(ellipse 50% 50% at 0% 100%, ${theme.glowB}, transparent 60%), #0e1318`,
      }}
    >
      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 overflow-y-auto" style={{ minHeight: '100vh' }}>
          <div className="bg-white rounded-xl max-w-[480px] w-full p-8 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 text-center flex-1">모듈 4를 시작하기 전에</h3>
              <SpeakButton
                text="모듈 4를 시작하기 전에. 첫째, 개인정보는 AI에 넣지 않습니다. 학생 이름, 주민번호, 연락처, 교사 인사 정보는 절대 AI에 입력하지 않고, 가명 혹은 익명화하여 사용합니다. 둘째, AI 결과물은 반드시 교사가 검토합니다. 공문, 가정통신문 등은 법적 효력이 발생할 수 있습니다. AI는 어디까지나 초안을 제시할 뿐 최종 책임은 작성자 본인에게 있습니다. 셋째, 학교 공식 시스템 연동은 승인이 필요합니다. 나이스나 업무관리시스템 등 학교 자체 공식망에 AI를 직접 연결하는 행위는 교육청 승인 없이 개인이 임의로 해선 안 됩니다."
                label="원칙 전체 듣기"
              />
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start p-4 border-b border-gray-100">
                <div className="text-2xl mt-1">🔒</div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">개인정보는 AI에 넣지 않습니다</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">학생 이름·주민번호·연락처, 교사 인사 정보는 절대 AI에 입력하지 않고, 가명 혹은 익명화하여 사용합니다.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 border-b border-gray-100">
                <div className="text-2xl mt-1">✅</div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">AI 결과물은 반드시 교사가 검토합니다</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">공문, 가정통신문 등은 법적 효력이 발생할 수 있습니다. AI는 어디까지나 초안을 제시할 뿐 최종 책임은 작성자 본인에게 있습니다.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 border-b border-gray-100">
                <div className="text-2xl mt-1"><School size={24} className="text-canva-purple" /></div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">학교 공식 시스템 연동은 승인이 필요합니다</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">나이스(NEIS)나 업무관리시스템 등 학교 자체 공식망에 AI를 직접 연결하는 행위는 교육청 승인 없이 개인이 임의로 해선 안 됩니다.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCloseOverlay}
              className="w-full mt-8 py-3 bg-canva-purple text-white font-bold rounded-lg hover:bg-opacity-90 transition-all text-sm"
            >
              확인했습니다
            </button>
          </div>
        </div>
      )}
      {/* Left Side (1 & 4): Explanation */}
      <div className="w-full lg:w-2/5 lg:border-r border-gray-800 flex flex-col bg-white min-w-0 md:min-h-auto lg:h-full lg:overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pr-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors flex-shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center py-1">
              {(() => {
                let moduleLessons = lessons
                  .filter(l => l.moduleId === lesson.moduleId)
                  .sort((a, b) => a.order - b.order);

                if (lesson.moduleId === 'm2' || lesson.moduleId === 'm3' || lesson.moduleId === 'm5') {
                  const apiLesson = lessons.find(l => l.id === 'l1-4');
                  if (apiLesson) {
                    moduleLessons = [apiLesson, ...moduleLessons];
                  }
                }

                return moduleLessons.map((ml, idx) => {
                  const isCurrent = ml.id === lesson.id;
                  const isDone = completedLessons.includes(ml.id);
                  const isShortcut = ml.id === 'l1-4' && lesson.moduleId !== 'm1';
                  const filled = isCurrent || isDone;
                  return (
                    <React.Fragment key={ml.id}>
                      {idx > 0 && (
                        <div
                          className="w-3 h-px transition-colors"
                          style={{ backgroundColor: filled ? theme.accent + '60' : '#e5e7eb' }}
                        />
                      )}
                      <button
                        onClick={() => onNavigateToLesson(ml.id)}
                        title={ml.title}
                        className={`relative h-7 px-2.5 min-w-[2.25rem] rounded-full flex items-center justify-center gap-1 text-[10px] font-bold transition-all flex-shrink-0 ${
                          isCurrent ? 'text-white scale-105 shadow-md ring-2 ring-offset-1' :
                          isDone ? 'text-white hover:scale-105' :
                          'bg-white border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600'
                        }`}
                        style={
                          isCurrent
                            ? { backgroundColor: theme.accent, boxShadow: `0 4px 14px ${theme.accentSoft}` }
                            : isDone
                              ? { backgroundColor: theme.accent + 'cc' }
                              : undefined
                        }
                      >
                        <span className="relative flex items-center gap-1">
                          {isShortcut ? (
                            <><Lock size={10} /> 1.4</>
                          ) : (
                            <>
                              {isDone && !isCurrent && <Check size={10} />}
                              {ml.id.replace('l', '').replace('-', '.')}
                            </>
                          )}
                        </span>
                      </button>
                    </React.Fragment>
                  );
                });
              })()}
            </div>
          </div>
          <span className="text-[10px] font-bold text-canva-purple uppercase tracking-widest flex-shrink-0 ml-2 hidden md:inline">Explanation</span>
        </div>
        <div ref={leftScrollRef} className="flex-1 overflow-y-auto min-w-0 bg-white relative">
          <div
            className={`relative px-10 pt-10 pb-8 mb-2 overflow-hidden bg-gradient-to-br ${theme.gradient}`}
          >
            <div
              className="pointer-events-none absolute -top-10 -right-6 text-[160px] font-black select-none leading-none"
              style={{ color: theme.accent, opacity: 0.10 }}
            >
              {lesson.id.replace('l', '').replace('-', '.')}
            </div>
            <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)',
              backgroundSize: '18px 18px',
            }} />
            <div className="relative" style={{ maxWidth: '40em' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{theme.emoji}</span>
                <span
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: theme.accent }}
                >
                  Module {currentModule?.order ?? '·'} · Lesson {lesson.order}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-3xl font-bold text-canva-ink break-words flex-1 leading-tight">{lesson.title}</h2>
                <SpeakButton text={`${lesson.title}. ${lesson.content}`} label="레슨 본문 듣기" />
              </div>
              <div className="mt-5 h-1 w-16 rounded-full" style={{ backgroundColor: theme.accent }} />
            </div>
          </div>
          <div className="w-full px-10 pb-20" style={{ maxWidth: '40em' }}>
            <div className="markdown-container text-canva-ink leading-relaxed text-base">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, href, children, ...props }) => {
                    if (href && href.startsWith('#lesson:')) {
                      const lessonId = href.replace('#lesson:', '');
                      return (
                        <a
                          {...props}
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigateToLesson(lessonId);
                          }}
                          className="text-canva-purple font-semibold hover:underline cursor-pointer"
                        >
                          {children}
                        </a>
                      );
                    }
                    return <a {...props} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
                  },
                }}
              >
                {lesson.content.replace(/^[ \t]+/gm, '')}
              </ReactMarkdown>
            </div>
            {lesson.tip && (
              <div className="mt-10 p-5 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl shadow-sm">
                <div className="flex items-center gap-2 mb-3 justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-100 p-1.5 rounded-md">
                      <Info size={16} className="text-amber-600" />
                    </div>
                    <span className="text-sm font-bold text-amber-700">현명하게 활용하기</span>
                  </div>
                  <SpeakButton text={lesson.tip} label="팁 듣기" />
                </div>
                <p className="text-[13px] text-gray-800 leading-relaxed font-medium">
                  {lesson.tip}
                </p>
              </div>
            )}
          </div>
          
          {/* Technique Connection Feature (Spec Requirement) */}
          {lesson.technique && (
            <div className="sticky bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
              <div className="flex items-start gap-4">
                <div className="bg-canva-purple/10 text-canva-purple p-2 rounded-lg flex-shrink-0">
                  <Info size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-canva-ink mb-1">기법 연결: {lesson.technique.label}</h4>
                  <p className="text-xs text-canva-gray leading-relaxed">{lesson.technique.description}</p>
                </div>
                <SpeakButton text={`기법 연결 ${lesson.technique.label}. ${lesson.technique.description}`} label="기법 설명 듣기" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side (2 & 3) */}
      <div className="w-full lg:w-3/5 flex flex-col lg:h-full lg:overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          {/* Main interactive area: full height for m4, otherwise top half */}
          <div className={`flex flex-col border-gray-800 min-h-0 ${lesson.moduleId === 'm4' ? 'flex-1' : 'lg:flex-[3] lg:border-b md:flex-1'}`}>
            <div className="p-4 border-b border-gray-800 flex items-center justify-between shrink-0 hidden md:flex">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">문제 입력</span>
              {(lesson.id === 'l1-5' || lesson.id === 'l2-6' || lesson.id === 'l2-7' || (lesson.moduleId === 'm3' && lesson.id !== 'l3-1') || lesson.id === 'l5-5') && (
                <div className="flex items-center gap-2">
                  <div className={`text-[10px] px-2 py-1 rounded-full font-bold ${hasApiKey ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {hasApiKey ? '● API 연결됨' : '○ API 키 미등록'}
                  </div>
                  {hasApiKey && (
                    <button
                      onClick={() => {
                        if (window.confirm('저장된 API 키를 삭제하시겠습니까?\n공용 PC에서는 사용 후 꼭 해제해 주세요.')) {
                          localStorage.removeItem('gemini-api-key');
                          setHasApiKey(false);
                          window.dispatchEvent(new Event('api-key-changed'));
                        }
                      }}
                      className="text-[10px] px-2 py-1 rounded-full font-bold border border-red-500/40 text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      연결 끊기
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className={`flex-1 p-8 flex flex-col overflow-y-auto no-scrollbar`}>
              {lesson.interactive ? (
                <>
                  {lesson.moduleId !== 'm4' && (
                    <div className="mb-6">
                      <span className="text-canva-teal font-bold text-sm mb-3 block">{lesson.interactive.prompt}</span>
                      <div className="bg-[#1c232b] rounded-xl p-5 border border-gray-800 text-gray-300 font-mono text-sm">
                        {lesson.id === 'l1-3' ? (
                          <div className="flex gap-4">
                            {['ChatGPT', 'Gemini', 'Claude'].map(model => (
                              <button
                                key={model}
                                disabled={isTyping}
                                onClick={() => {
                                  setUserInput(model);
                                  handleRun(model);
                                }}
                                className="px-4 py-2 bg-[#0e1318] hover:bg-canva-teal/20 border border-gray-700 rounded-lg text-canva-teal font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {model}
                              </button>
                            ))}
                          </div>
                        ) : lesson.interactive.predefinedInputs ? (
                          <div className="flex flex-col gap-3">
                            {lesson.interactive.predefinedInputs.map((input, idx) => (
                              <button
                                key={idx}
                                disabled={isTyping}
                                onClick={() => {
                                  setUserInput(input);
                                  handleRun(input);
                                }}
                                className="text-left px-4 py-3 bg-[#0e1318] hover:bg-canva-teal/20 border border-gray-700 rounded-lg text-canva-teal font-bold transition-all text-xs leading-relaxed disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {input}
                              </button>
                            ))}
                          </div>
                        ) : (
                          lesson.interactive.initialInput
                        )}
                      </div>
                    </div>
                  )}
                  {lesson.moduleId === 'm4' ? (
                    <>
                      {lesson.id === 'l4-1' && <Lesson41Interactive onExecute={handleM4Execute} />}
                      {lesson.id === 'l4-2' && <Lesson42Interactive onExecute={handleM4Execute} />}
                      {lesson.id === 'l4-3' && <Lesson43Interactive onExecute={handleM4Execute} />}
                      {lesson.id === 'l4-4' && <Lesson44Interactive onExecute={handleM4Execute} />}
                      {lesson.id === 'l4-5' && <Lesson45Interactive onExecute={handleM4Execute} />}
                      {lesson.id === 'l4-6' && <Lesson47Interactive onExecute={handleM4Execute} />}
                      {lesson.id === 'l4-7' && <Lesson46Interactive onExecute={handleM4Execute} />}
                    </>
                  ) : lesson.moduleId === 'm5' ? (
                    <>
                      {lesson.id === 'l5-1' && <Lesson51Interactive />}
                      {lesson.id === 'l5-2' && <Lesson52Interactive />}
                      {lesson.id === 'l5-3' && <Lesson53Interactive />}
                      {lesson.id === 'l5-4' && <Lesson54Interactive />}
                      {lesson.id === 'l5-5' && <Lesson55Interactive onRun={handleRun} setUserInput={setUserInput} onNavigateToLesson={onNavigateToLesson} />}
                      {/* l5-6 = AI Slop (Lesson57Interactive), l5-7 = 가이드라인 (Lesson56Interactive) — 원래 코드 만들 때 순서가 반대였어서 매핑이 cross-됨 */}
                      {lesson.id === 'l5-6' && <Lesson57Interactive />}
                      {lesson.id === 'l5-7' && <Lesson56Interactive />}
                    </>
                  ) : lesson.id !== 'l2-1' && lesson.id !== 'l2-2' && lesson.id !== 'l2-3' && lesson.id !== 'l2-4' && lesson.id !== 'l2-5' && lesson.id !== 'l3-1' && (
                    <div
                      className="flex-1 rounded-xl p-[1px] relative group min-h-[200px]"
                      style={{ background: `linear-gradient(135deg, ${theme.accent}55, transparent 40%, ${theme.accent}30)` }}
                    >
                    <div className="w-full h-full bg-[#1c232b] rounded-[11px] p-5 relative">
                      <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        className="w-full h-full bg-transparent text-white font-mono text-sm outline-none resize-none"
                        placeholder={lesson.id === 'l1-5' ? "아무런 질문이나 작성해 보세요..." : "여기에 질문을 입력하거나 위 문장을 따라 써보세요..."}
                      />
                      <div className="absolute bottom-5 right-5 flex gap-3 flex-wrap justify-end">
                        {lesson.id === 'l3-8' && localStorage.getItem('meta-prompt-l2-6') && (
                          <button
                            onClick={async () => {
                              const saved = localStorage.getItem('meta-prompt-l2-6') || '';
                              try {
                                await navigator.clipboard.writeText(saved);
                                setMetaPromptCopied(true);
                                setTimeout(() => setMetaPromptCopied(false), 2500);
                              } catch {
                                alert('클립보드 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
                              }
                            }}
                            className="px-4 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all shadow-lg"
                            title="2-6에서 생성한 메타 프롬프트를 클립보드에 복사합니다. Gems의 요청 사항 칸에 붙여넣으세요."
                          >
                            {metaPromptCopied ? '✓ 복사됨! Gems 요청 사항에 붙여넣기' : '2-6에서 만든 프롬프트 복사'}
                          </button>
                        )}
                        {(lesson.id === 'l2-6' || lesson.id === 'l2-7' || lesson.moduleId === 'm3') && (
                          <button
                            onClick={() => onNavigateToLesson('l1-4')}
                            className="px-6 py-3 bg-canva-purple text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-lg"
                          >
                            API 키 입력
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setUserInput('');
                            setAiResponse('');
                          }}
                          disabled={isTyping}
                          className="px-6 py-3 bg-gray-700 text-white rounded-xl font-bold text-sm hover:bg-gray-600 transition-all disabled:opacity-50 shadow-lg"
                        >
                          초기화
                        </button>
                        <button
                          onClick={() => handleRun()}
                          disabled={isTyping}
                          className="px-8 py-3 bg-canva-teal text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-teal-900/20"
                        >
                          실행 (Run)
                        </button>
                      </div>
                    </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 italic">
                  이 레슨은 실습이 포함되어 있지 않습니다.
                </div>
              )}
            </div>
          </div>

          {/* AI Response area (Hidden for M4 because it uses popup) */}
          {lesson.moduleId !== 'm4' && (
            <div className="lg:flex-[2] flex flex-col min-h-0 md:hidden lg:flex border-t border-gray-800">
              <div className="p-4 border-b border-gray-800 flex items-center justify-center shrink-0 hidden md:flex">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">답변 안내</span>
              </div>
              <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
                <div
                  className="rounded-xl p-[1px] min-h-[160px] relative"
                  style={{ background: `linear-gradient(135deg, ${theme.accent}55, transparent 45%, ${theme.accent}25)` }}
                >
                <div className="bg-[#1c232b] rounded-[11px] p-8 relative">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span
                          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                          style={{ backgroundColor: theme.accent }}
                        />
                        <span
                          className="relative inline-flex rounded-full h-2.5 w-2.5"
                          style={{ backgroundColor: theme.accent }}
                        />
                      </span>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: theme.accent }}
                      >AI Response</span>
                      <span className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(to right, ${theme.accent}80, transparent)` }} />
                    </div>
                    {(lesson.id === 'l2-6' || lesson.id === 'l2-7' || (lesson.moduleId === 'm3' && lesson.id !== 'l3-1') || lesson.id === 'l4-1' || lesson.id === 'l4-2' || lesson.id === 'l5-5') && aiResponse && !isTyping && (
                      <button
                        onClick={async () => {
                          if (!localStorage.getItem('gemini-api-key')) {
                            alert('구글 Docs 문서로 내보낼 수 없습니다.\n\n이유: 사용자의 API 키가 저장되어 있지 않습니다. [1-4. API 키 발급 및 입력] 레슨에서 API 키를 먼저 등록해주세요.');
                            return;
                          }

                          try {
                            await navigator.clipboard.writeText(aiResponse);
                            window.open('https://docs.new', '_blank');
                          } catch (err) {
                            alert('클립보드 자동 복사에 실패했습니다. 수동으로 텍스트를 복사해주세요.');
                          }
                        }}
                        className="text-xs text-white hover:bg-blue-600 transition-colors flex items-center gap-1 bg-blue-500 px-3 py-1.5 rounded-lg font-medium shadow-sm"
                      >
                        <FileText size={14} /> 구글Docs에 ctrl+v 하세요.
                      </button>
                    )}
                  </div>
                  <div className="text-gray-300 font-mono text-sm leading-relaxed markdown-container dark-markdown">
                    {typeof aiResponse === 'object' && aiResponse?.type === 'compare' ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex-1 border border-gray-700 bg-gray-800 rounded-lg p-3 relative">
                          <pre className="text-xs text-gray-400 whitespace-pre-wrap">{aiResponse.before}</pre>
                        </div>
                        <div className="flex-1 border border-canva-teal/50 bg-canva-teal/10 rounded-lg p-3 relative">
                          <pre className="text-xs text-gray-200 whitespace-pre-wrap">{aiResponse.after}</pre>
                        </div>
                      </div>
                    ) : typeof aiResponse === 'object' && aiResponse?.type === 'text' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                        }}
                      >
                        {aiResponse.content}
                      </ReactMarkdown>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                        }}
                      >
                        {aiResponse as string}
                      </ReactMarkdown>
                    )}
                    {isTyping && <span className="inline-block w-2 h-4 bg-canva-teal ml-1 animate-pulse"></span>}
                    {!aiResponse && !isTyping && (
                      <span className="text-gray-400 italic">
                        {lesson.interactive?.answer || '실행 버튼을 눌러 AI의 답변을 확인하세요.'}
                      </span>
                    )}
                  </div>
                </div>
                </div>

                {aiResponse && !isTyping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-canva-purple/10 border border-canva-purple/20 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-canva-purple font-bold text-xs uppercase tracking-wider">학습 포인트</h5>
                      <SpeakButton text={learningPoint} label="학습 포인트 듣기" />
                    </div>
                    <div className="text-sm text-white leading-relaxed markdown-container">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                        }}
                      >
                        {learningPoint}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation / Completion Buttons */}
        <div className="sticky bottom-0 p-6 border-t border-gray-800 flex justify-end gap-3 bg-[#0e1318] shrink-0 z-10">
          <button
            onClick={() => {
              manualToggleClickedRef.current = true;
              onToggleComplete(lesson.id);
            }}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              isCompleted
                ? 'bg-canva-teal text-white'
                : 'bg-canva-purple text-white hover:bg-opacity-90'
            }`}
          >
            {isCompleted ? (
              <><CheckCircle2 size={18} /> 학습 완료됨</>
            ) : (
              '학습 완료하기'
            )}
          </button>
          <button
            onClick={() => {
              const signals = [
                hasReachedEndRef.current,
                !!aiResponse,
                Date.now() - mountTimeRef.current >= 60_000,
                manualToggleClickedRef.current,
              ].filter(Boolean).length;
              if (signals >= 2) {
                onMarkComplete(lesson.id);
              }
              if (nextLesson) {
                onNavigateToLesson(nextLesson.id);
              } else {
                onModuleComplete();
              }
            }}
            className="px-6 py-3 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition-all flex items-center gap-2"
          >
            {nextLesson ? <><span>다음 레슨</span><ArrowRight size={18} /></> : <><span>모듈 완료</span><CheckCircle2 size={18} /></>}
          </button>
        </div>
      </div>

      {/* M4 Result Popup Overlay */}
      {m4PopupData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto" style={{ minHeight: '100vh' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full bg-[#1c232b] rounded-2xl shadow-2xl flex flex-col border border-gray-700 my-auto shadow-canva-purple/10"
          >
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">✨</span> {m4PopupData.title}
              </h3>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] no-scrollbar">
              {typeof m4PopupData.content === 'string' ? (
                <div className="relative">
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    {!m4PopupData.hideDocsButton && (
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(m4PopupData.content as string);
                            window.open('https://docs.new', '_blank');
                          } catch (err) {
                            alert('클립보드 자동 복사에 실패했습니다. 수동으로 텍스트를 복사해주세요.');
                          }
                        }}
                        className="text-xs text-white hover:bg-blue-600 transition-colors flex items-center gap-1 bg-blue-500 px-3 py-1.5 rounded-lg font-medium shadow-sm"
                      >
                        <FileText size={14} /> 구글Docs에 ctrl+v 하세요.
                      </button>
                    )}
                    <div className="text-gray-400 hover:text-white cursor-pointer px-2 py-1.5 bg-[#0e1318] hover:bg-gray-800 transition-colors rounded-lg flex items-center justify-center border border-gray-700" onClick={() => navigator.clipboard.writeText(m4PopupData.content as string)} title="클립보드에 복사">
                      <Copy size={16} />
                    </div>
                  </div>
                  <pre className={`text-sm text-gray-300 font-mono whitespace-pre-wrap bg-[#0e1318] p-6 ${!m4PopupData.hideDocsButton ? 'pt-14' : 'pt-14'} rounded-xl border border-gray-800 leading-relaxed max-w-full`}>
                    {m4PopupData.content}
                  </pre>
                </div>
              ) : (
                m4PopupData.content
              )}
              
              <div className="mt-8 bg-canva-purple/10 border border-canva-purple/20 p-5 rounded-xl flex gap-4 items-start">
                <div className="text-xl mt-1">💡</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-canva-purple font-bold text-sm">학습 포인트</h4>
                    <SpeakButton text={m4PopupData.point} label="학습 포인트 듣기" />
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{m4PopupData.point}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-800 bg-[#141a21] rounded-b-2xl">
              <button
                onClick={closeM4Popup}
                className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all shadow-lg text-lg flex items-center justify-center gap-2"
              >
                창 닫기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

interface TutorialProps {
  selectedModule: Module | null;
  onSelectModule: (module: Module | null) => void;
  completedLessons: string[];
  onToggleComplete: (lessonId: string) => void;
  onMarkComplete: (lessonId: string) => void;
}

export default function Tutorial({ selectedModule, onSelectModule, completedLessons, onToggleComplete, onMarkComplete }: TutorialProps) {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // URL 파라미터에서 레슨 ID를 읽어서 초기화
  useEffect(() => {
    if (initialLoadDone) return;

    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get('lesson');

    if (lessonId) {
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson) {
        const module = modules.find(m => m.id === lesson.moduleId);
        if (module) {
          onSelectModule(module);
          setCurrentLesson(lesson);
        }
      }
    }

    setInitialLoadDone(true);
  }, [initialLoadDone, onSelectModule]);

  // 사이드바에서 모듈이 바뀌면 현재 레슨 초기화
  useEffect(() => {
    if (!initialLoadDone) return;
    
    // 초기 로딩으로 인해 App.tsx의 selectedModule이 뒤늦게 업데이트되었을 때
    // 화면이 튕기는 현상 방지
    if (currentLesson && selectedModule?.id === currentLesson.moduleId) {
      return;
    }
    
    setCurrentLesson(null);
  }, [selectedModule?.id, initialLoadDone]);

  const toggleComplete = onToggleComplete;
  const markComplete = onMarkComplete;

  const renderModuleList = () => (
    <div className="max-w-4xl mx-auto p-10">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-canva-ink mb-4">인공지능 배워보기</h1>
        <p className="text-canva-ink">LLM 이해부터 윤리 점검까지, 초등교사를 위한 5단계 로드맵입니다.</p>
      </header>

      <div className="space-y-5">
        {modules.map((module, index) => {
          const moduleLessons = lessons.filter(l => l.moduleId === module.id);
          const completedInModule = moduleLessons.filter(l => completedLessons.includes(l.id)).length;
          const isCompleted = completedInModule === module.lessonsCount && module.lessonsCount > 0;
          const progressPct = module.lessonsCount ? (completedInModule / module.lessonsCount) * 100 : 0;
          const theme = getTheme(module.id);

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              onClick={() => onSelectModule(module)}
              className="bg-white border border-canva-border rounded-2xl overflow-hidden cursor-pointer group flex transition-shadow hover:shadow-xl"
              style={{ ['--accent' as any]: theme.accent } as React.CSSProperties}
            >
              {/* Left colored panel (1/4) */}
              <div
                className={`relative w-1/4 min-w-[140px] p-5 flex flex-col justify-between bg-gradient-to-br ${theme.gradient} overflow-hidden`}
              >
                <div
                  className="pointer-events-none absolute -bottom-6 -right-2 text-[110px] font-black select-none leading-none"
                  style={{ color: theme.accent, opacity: 0.18 }}
                >
                  {module.order}
                </div>
                <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)',
                  backgroundSize: '14px 14px',
                }} />
                <div className="relative flex items-center gap-2">
                  <span className="text-2xl">{theme.emoji}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.accent }}>
                    Module {module.order}
                  </span>
                </div>
                <div className="relative">
                  {isCompleted ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 text-[10px] font-bold" style={{ color: theme.accent }}>
                      <CheckCircle2 size={12} /> 완료
                    </div>
                  ) : completedInModule > 0 ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 text-[10px] font-bold" style={{ color: theme.accent }}>
                      진행 중 · {completedInModule}/{module.lessonsCount}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 text-[10px] font-bold text-canva-gray">
                      시작 전
                    </div>
                  )}
                </div>
              </div>

              {/* Right content panel (2/3) */}
              <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
                <div>
                  <h3
                    className="text-lg font-bold text-canva-ink mb-1.5 leading-snug transition-colors"
                    style={{ color: undefined }}
                  >
                    <span className="group-hover:opacity-80 transition-opacity">{module.title}</span>
                  </h3>
                  <p className="text-sm text-canva-gray leading-relaxed">{module.description}</p>
                  <div className="mt-2" onClick={e => e.stopPropagation()}>
                    <SpeakButton
                      text={`${module.title}. ${module.description}`}
                      label="모듈 설명 듣기"
                      stopPropagation
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[11px] font-bold text-canva-gray uppercase flex items-center gap-1">
                        <BookOpen size={12} /> {module.lessonsCount} 레슨
                      </span>
                      <span className="text-[11px] font-bold text-canva-gray uppercase flex items-center gap-1">
                        <Clock size={12} /> {module.estimatedTime}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut', delay: index * 0.08 + 0.2 }}
                        style={{ backgroundColor: theme.accent }}
                      />
                    </div>
                  </div>
                  <ChevronRight
                    className="group-hover:translate-x-1 transition-transform flex-shrink-0"
                    style={{ color: theme.accent }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderLessonList = (module: Module) => {
    const moduleLessons = lessons.filter(l => l.moduleId === module.id).sort((a, b) => a.order - b.order);
    const theme = getTheme(module.id);
    const completedCount = moduleLessons.filter(l => completedLessons.includes(l.id)).length;
    const progressPct = moduleLessons.length ? (completedCount / moduleLessons.length) * 100 : 0;

    const getPreview = (content: string) => {
      const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
      const firstProse = lines.find(l => !l.startsWith('#') && !l.startsWith('-') && !l.startsWith('*') && !l.startsWith('>') && !l.startsWith('!'));
      if (!firstProse) return '';
      const cleaned = firstProse.replace(/\*\*/g, '').replace(/`/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      return cleaned.length > 90 ? cleaned.slice(0, 90).trim() + '…' : cleaned;
    };

    return (
      <div className="max-w-4xl mx-auto p-10">
        <button
          onClick={() => onSelectModule(null)}
          className="flex items-center gap-2 text-canva-gray hover:text-canva-ink mb-8 font-bold text-sm transition-colors"
        >
          <ArrowLeft size={16} /> 모듈 목록으로 돌아가기
        </button>

        <header
          className={`relative mb-12 p-8 rounded-2xl bg-gradient-to-br ${theme.gradient} overflow-hidden border border-gray-100`}
        >
          <div
            className="pointer-events-none absolute -top-8 -right-4 text-[140px] font-black select-none leading-none"
            style={{ color: theme.accent, opacity: 0.10 }}
          >
            {module.order}
          </div>
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)',
            backgroundSize: '18px 18px',
          }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{theme.emoji}</span>
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: theme.accent }}>
                Module {module.order}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-canva-ink mb-3 leading-tight">{module.title}</h1>
            <p className="text-canva-gray mb-4 max-w-2xl">{module.description}</p>
            <SpeakButton text={`${module.title}. ${module.description}`} label="모듈 설명 듣기" />
            {moduleLessons.length > 0 && (
              <div className="mt-6 max-w-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-canva-ink/70">진행도</span>
                  <span className="text-xs font-bold" style={{ color: theme.accent }}>
                    {completedCount} / {moduleLessons.length}
                  </span>
                </div>
                <div className="h-1.5 bg-white/70 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ backgroundColor: theme.accent }}
                  />
                </div>
              </div>
            )}
          </div>
        </header>

        {moduleLessons.length > 0 ? (
          <div className="relative pl-14">
            <div
              className="absolute left-[22px] top-4 bottom-4 w-0.5 rounded-full"
              style={{ background: `linear-gradient(to bottom, ${theme.accent}55, ${theme.accent}10)` }}
            />
            <div className="space-y-4">
              {moduleLessons.map((lesson, idx) => {
                const isDone = completedLessons.includes(lesson.id);
                const preview = getPreview(lesson.content);
                const lessonNum = lesson.id.replace('l', '').replace('-', '.');
                const titleNoNum = lesson.title.replace(/^\d+-\d+\.\s*/, '');
                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className="relative group"
                  >
                    <div
                      className="absolute -left-[46px] top-5 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-transform group-hover:scale-110"
                      style={
                        isDone
                          ? { backgroundColor: theme.accent, color: 'white', boxShadow: `0 0 0 4px var(--color-canva-bg, #f7f5fb)` }
                          : { backgroundColor: 'white', border: `2px solid ${theme.accent}55`, color: theme.accent, boxShadow: `0 0 0 4px var(--color-canva-bg, #f7f5fb)` }
                      }
                    >
                      {isDone ? <CheckCircle2 size={18} /> : lesson.order}
                    </div>

                    <div
                      onClick={() => setCurrentLesson(lesson)}
                      className="bg-white border border-canva-border rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
                      style={{ borderLeft: `3px solid ${theme.accent}` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: theme.accent }}
                            >
                              Lesson {lessonNum}
                            </span>
                            {isDone && (
                              <span className="text-[10px] font-bold text-canva-teal flex items-center gap-1">
                                <CheckCircle2 size={10} /> 완료
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-canva-ink mb-1.5 leading-snug group-hover:opacity-80 transition-opacity">
                            {titleNoNum}
                          </h3>
                          {preview && (
                            <p className="text-xs text-canva-gray leading-relaxed line-clamp-2">{preview}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0 pt-0.5">
                          <span className="text-[11px] text-canva-gray font-medium flex items-center gap-1 whitespace-nowrap">
                            <Clock size={11} /> {lesson.estimatedMinutes}분
                          </span>
                          <ChevronRight
                            size={18}
                            className="group-hover:translate-x-1 transition-transform"
                            style={{ color: theme.accent }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-canva-bg rounded-2xl border border-dashed border-canva-border">
            <p className="text-canva-gray">이 모듈의 레슨은 준비 중입니다.</p>
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-canva-bg">
      <AnimatePresence mode="wait">
        {currentLesson ? (
          <motion.div
            key="lesson"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LessonViewer
              lesson={currentLesson}
              onBack={() => setCurrentLesson(null)}
              onModuleComplete={() => {
                setCurrentLesson(null);
                onSelectModule(null);
              }}
              onToggleComplete={toggleComplete}
              onMarkComplete={markComplete}
              isCompleted={completedLessons.includes(currentLesson.id)}
              completedLessons={completedLessons}
              onNavigateToLesson={(id) => {
                const lesson = lessons.find(l => l.id === id);
                if (lesson) {
                  setCurrentLesson(lesson);
                }
              }}
            />
          </motion.div>
        ) : selectedModule ? (
          <motion.div
            key="lessons"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {renderLessonList(selectedModule)}
          </motion.div>
        ) : (
          <motion.div
            key="modules"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {renderModuleList()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
