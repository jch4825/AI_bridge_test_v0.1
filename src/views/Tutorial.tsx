import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight, PlayCircle, Clock, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { modules, lessons, Lesson } from '../data/tutorialData';
import { Module } from '../types';

interface LessonViewerProps {
  lesson: Lesson;
  onBack: () => void;
  onComplete: (lessonId: string) => void;
  isCompleted: boolean;
}

const LEARNING_POINTS: Record<string, string[]> = {
  'l1-4': [
    "**보안의 핵심:** API 키는 여러분의 인공지능 계정에 접속하는 '비밀번호'와 같습니다. 절대로 타인에게 공유하지 마세요.",
    "**비용 관리:** API 사용량에 따라 비용이 발생할 수 있으므로(무료 티어 제외), 사용량을 주기적으로 확인하는 습관이 필요합니다.",
    "**연결의 힘:** API를 활용하면 챗봇뿐만 아니라 엑셀, 구글 문서 등 다양한 도구에서 AI의 힘을 빌릴 수 있습니다.",
    "**환경 설정:** API 키를 환경 변수(.env) 등에 안전하게 저장하는 것이 개발의 기본 소양입니다.",
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
    "**모델별 특성:** 다양한 AI 모델을 사용해보며 각 모델의 특징과 장단점을 파악하는 것이 중요합니다.",
    "**지속적인 학습:** AI 기술은 빠르게 발전합니다. 새로운 기능과 업데이트 소식에 관심을 가져보세요."
  ]
};

function LessonViewer({ lesson, onBack, onComplete, isCompleted }: LessonViewerProps) {
  const [userInput, setUserInput] = useState(lesson.interactive?.initialInput || '');
  const [aiResponse, setAiResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [learningPoint, setLearningPoint] = useState('');

  useEffect(() => {
    const points = LEARNING_POINTS[lesson.id] || LEARNING_POINTS['default'];
    const randomPoint = points[Math.floor(Math.random() * points.length)];
    setLearningPoint(randomPoint);
  }, [lesson.id]);

  const handleRun = async (forcedInput?: string) => {
    if (!lesson.interactive) return;
    const inputToUse = forcedInput !== undefined ? forcedInput : userInput;
    
    setIsTyping(true);
    setAiResponse('');

    // Special handling for lesson 1-4: Save API Key
    if (lesson.id === 'l1-4') {
      const apiKey = inputToUse.trim();
      if (apiKey.startsWith('AIza')) {
        localStorage.setItem('gemini-api-key', apiKey);
      }
    }

    // Special handling for lesson 1-5: Call Gemini API
    if (lesson.id === 'l1-5') {
      const savedKey = localStorage.getItem('gemini-api-key');
      let fullText = "";

      if (!savedKey || savedKey.length < 10) {
        fullText = "API키가 제대로 작동하지 않아, default 답변을 생성합니다. 반갑습니다. 여러분이 이 튜토리얼을 통해 인공지능을 더욱 잘 이해하실 수 있으면 좋겠습니다.";
      } else {
        try {
          const genAI = new GoogleGenerativeAI(savedKey);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent(inputToUse);
          fullText = result.response.text();
        } catch (error) {
          console.error("Gemini API Error:", error);
          fullText = "API키가 제대로 작동하지 않아, default 답변을 생성합니다. 반갑습니다. 여러분이 이 튜토리얼을 통해 인공지능을 더욱 잘 이해하실 수 있으면 좋겠습니다.";
        }
      }

      // Simulate typing effect for Gemini response
      let i = 0;
      const interval = setInterval(() => {
        if (i < fullText.length) {
          const char = fullText[i];
          if (char !== undefined) {
            setAiResponse(prev => prev + char);
          }
          i++;
        }
        
        if (i >= fullText.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 20);
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
        fullText = "죄송합니다. 목록에 있는 모델 중 하나를 선택하거나 정확히 입력해주세요.";
      }
    }

    // Simulate typing effect
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        const char = fullText[i];
        if (char !== undefined) {
          setAiResponse(prev => prev + char);
        }
        i++;
      }
      
      if (i >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0e1318]">
      {/* Left Side (1 & 4): Explanation */}
      <div className="w-1/2 border-r border-gray-800 flex flex-col bg-white min-w-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-xs font-bold text-canva-purple uppercase tracking-widest">설명</span>
          <div className="w-10"></div>
        </div>
        <div className="flex-1 overflow-y-auto p-10 min-w-0 bg-white">
          <div className="w-full" style={{ maxWidth: '40em' }}>
            <h2 className="text-3xl font-bold text-canva-ink mb-8 break-words">{lesson.title}</h2>
            <div className="markdown-container text-canva-ink leading-relaxed text-base">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  ),
                }}
              >
                {lesson.content.replace(/\. /g, '.\n\n')}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side (2 & 3) */}
      <div className="w-1/2 flex flex-col">
        {/* Top Right (2): Problem Input */}
        <div className="h-1/2 border-b border-gray-800 flex flex-col bg-[#1c232b]">
          <div className="p-4 border-b border-gray-800 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">문제 입력</span>
          </div>
          <div className="flex-1 p-8 flex flex-col overflow-hidden">
            {lesson.interactive ? (
              <>
                <div className="mb-6">
                  <span className="text-canva-teal font-bold text-sm mb-3 block">{lesson.interactive.prompt}</span>
                  <div className="bg-[#0e1318] rounded-xl p-5 border border-gray-800 text-gray-300 font-mono text-sm">
                    {lesson.id === 'l1-3' ? (
                      <div className="flex gap-4">
                        {['ChatGPT', 'Gemini', 'Claude'].map(model => (
                          <button
                            key={model}
                            onClick={() => {
                              setUserInput(model);
                              handleRun(model);
                            }}
                            className="px-4 py-2 bg-[#1c232b] hover:bg-canva-teal/20 border border-gray-700 rounded-lg text-canva-teal font-bold transition-all"
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    ) : (
                      lesson.interactive.initialInput
                    )}
                  </div>
                </div>
                <div className="flex-1 bg-[#0e1318] rounded-xl p-5 border border-gray-800 relative group">
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="w-full h-full bg-transparent text-white font-mono text-sm outline-none resize-none"
                    placeholder={lesson.id === 'l1-5' ? "아무런 질문이나 작성해 보세요..." : "여기에 질문을 입력하거나 위 문장을 따라 써보세요..."}
                  />
                  <button 
                    onClick={() => handleRun()}
                    disabled={isTyping}
                    className="absolute bottom-5 right-5 px-8 py-3 bg-canva-teal text-white rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-teal-900/20"
                  >
                    실행 (Run)
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 italic">
                이 레슨은 실습이 포함되어 있지 않습니다.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Right (3): Answer Guide */}
        <div className="h-1/2 flex flex-col bg-[#0e1318]">
          <div className="p-4 border-b border-gray-800 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">답변 안내</span>
          </div>
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="bg-[#1c232b] rounded-xl p-8 border border-gray-800 min-h-[160px]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 bg-canva-teal rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-canva-teal uppercase tracking-widest">AI Response</span>
              </div>
              <div className="text-gray-300 font-mono text-sm leading-relaxed markdown-container">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" />
                    ),
                  }}
                >
                  {aiResponse}
                </ReactMarkdown>
                {isTyping && <span className="inline-block w-2 h-4 bg-canva-teal ml-1 animate-pulse"></span>}
                {!aiResponse && !isTyping && <span className="text-gray-600 italic">실행 버튼을 눌러 AI의 답변을 확인하세요.</span>}
              </div>
            </div>
            
            {aiResponse && !isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-canva-purple/10 border border-canva-purple/20 rounded-xl"
              >
                <h5 className="text-canva-purple font-bold text-xs mb-3 uppercase tracking-wider">학습 포인트</h5>
                <div className="text-sm text-gray-400 leading-relaxed markdown-container">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" />
                      ),
                    }}
                  >
                    {learningPoint}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}
          </div>
          <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-[#0e1318]">
            <button 
              onClick={() => onComplete(lesson.id)}
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
                onComplete(lesson.id);
                onBack();
              }}
              className="px-6 py-3 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition-all flex items-center gap-2"
            >
              다음 레슨 <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tutorial() {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai-teachers-progress');
    if (saved) {
      setCompletedLessons(JSON.parse(saved));
    }
  }, []);

  const toggleComplete = (lessonId: string) => {
    const newProgress = completedLessons.includes(lessonId)
      ? completedLessons.filter(id => id !== lessonId)
      : [...completedLessons, lessonId];
    
    setCompletedLessons(newProgress);
    localStorage.setItem('ai-teachers-progress', JSON.stringify(newProgress));
  };

  const renderModuleList = () => (
    <div className="max-w-4xl mx-auto p-10">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-canva-ink mb-4">학습 튜토리얼</h1>
        <p className="text-canva-gray">LLM 이해부터 윤리 점검까지, 초등교사를 위한 5단계 로드맵입니다.</p>
      </header>

      <div className="space-y-6">
        {modules.map((module, index) => {
          const moduleLessons = lessons.filter(l => l.moduleId === module.id);
          const completedInModule = moduleLessons.filter(l => completedLessons.includes(l.id)).length;
          const isCompleted = completedInModule === module.lessonsCount && module.lessonsCount > 0;

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedModule(module)}
              className="bg-white border border-canva-border rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer group flex items-center gap-6"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                isCompleted ? 'bg-canva-teal text-white' : 'bg-canva-bg text-canva-purple'
              }`}>
                {isCompleted ? <CheckCircle2 size={24} /> : module.order}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-canva-ink group-hover:text-canva-purple transition-colors">
                  {module.title}
                </h3>
                <p className="text-sm text-canva-gray mt-1">{module.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-[11px] font-bold text-canva-gray uppercase flex items-center gap-1">
                    <BookOpen size={12} /> {module.lessonsCount} 레슨
                  </span>
                  <span className="text-[11px] font-bold text-canva-gray uppercase flex items-center gap-1">
                    <Clock size={12} /> {module.estimatedTime}
                  </span>
                  {completedInModule > 0 && (
                    <span className="text-[11px] font-bold text-canva-teal uppercase">
                      진행도: {completedInModule}/{module.lessonsCount}
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="text-canva-border group-hover:text-canva-purple transition-colors" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderLessonList = (module: Module) => {
    const moduleLessons = lessons.filter(l => l.moduleId === module.id);

    return (
      <div className="max-w-4xl mx-auto p-10">
        <button 
          onClick={() => setSelectedModule(null)}
          className="flex items-center gap-2 text-canva-gray hover:text-canva-ink mb-8 font-bold text-sm transition-colors"
        >
          <ArrowLeft size={16} /> 모듈 목록으로 돌아가기
        </button>

        <header className="mb-12">
          <span className="text-xs font-bold text-canva-purple uppercase tracking-widest mb-2 block">모듈 {module.order}</span>
          <h1 className="text-3xl font-bold text-canva-ink mb-4">{module.title}</h1>
          <p className="text-canva-gray">{module.description}</p>
        </header>

        <div className="space-y-4">
          {moduleLessons.length > 0 ? (
            moduleLessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => setCurrentLesson(lesson)}
                className="bg-white border border-canva-border rounded-xl p-5 hover:border-canva-purple transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    completedLessons.includes(lesson.id) ? 'bg-canva-teal text-white' : 'bg-canva-bg text-canva-gray'
                  }`}>
                    {completedLessons.includes(lesson.id) ? <CheckCircle2 size={16} /> : <PlayCircle size={16} />}
                  </div>
                  <span className="font-bold text-canva-ink group-hover:text-canva-purple transition-colors">{lesson.title}</span>
                </div>
                <span className="text-xs text-canva-gray font-medium">{lesson.estimatedMinutes}분</span>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-canva-bg rounded-2xl border border-dashed border-canva-border">
              <p className="text-canva-gray">이 모듈의 레슨은 준비 중입니다.</p>
            </div>
          )}
        </div>
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
              onComplete={toggleComplete}
              isCompleted={completedLessons.includes(currentLesson.id)}
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
