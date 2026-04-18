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
      className={`p-1.5 bg-gray-700/50 hover:bg-gray-700 rounded-md text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-xs ${className}`}
    >
      {copied ? <><Check size={14} /> 복사됨!</> : <><Copy size={14} /> 복사</>}
    </button>
  );
};

// 5-1: 틀린 정보 찾기 (클릭 선택 + 채점)
export const Lesson51Interactive = () => {
  const [currentText, setCurrentText] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const wrongTexts = [
    {
      sentences: [
        { text: '식물의 광합성은 주로 뿌리에서 이루어집니다.', isWrong: true },
        { text: '식물은 이산화탄소와 물을 흡수하여 포도당과 산소를 만들어냅니다.', isWrong: false },
        { text: '광합성에는 햇빛이 필요하며, 이 과정은 낮과 밤 모두 동일한 속도로 진행됩니다.', isWrong: true },
      ],
      corrections: [
        '"뿌리에서" → 실제로는 잎의 엽록체에서 이루어집니다.',
        '"낮과 밤 모두 동일한 속도로" → 밤에는 빛이 없으므로 광합성이 중단됩니다.',
      ],
    },
    {
      sentences: [
        { text: '훈민정음은 1443년 세종대왕이 창제하였으며, 1446년에 반포되었습니다.', isWrong: false },
        { text: '훈민정음은 처음부터 28자로 구성되었으며 현재까지 동일하게 사용되고 있습니다.', isWrong: true },
      ],
      corrections: [
        '"현재까지 동일하게" → 현재는 24자가 사용됩니다. 창제 당시 28자 중 4자가 소멸되었습니다.',
      ],
    },
    {
      sentences: [
        { text: '초등학교 현장체험학습은 교육부령 제2023-15호에 따라 연간 최대 30일까지 실시할 수 있으며,', isWrong: true },
        { text: '보호자 동의서는 출발 3일 전까지 제출해야 합니다.', isWrong: false },
      ],
      corrections: [
        '"교육부령 제2023-15호" → 존재하지 않는 법령입니다. 구체적인 법령 번호를 AI가 지어낸 전형적인 할루시네이션 사례입니다.',
      ],
    },
  ];

  const current = wrongTexts[currentText];

  const toggle = (idx: number) => {
    if (submitted) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const handleSubmit = () => {
    let roundScore = 0;
    current.sentences.forEach((s, idx) => {
      if (s.isWrong && selected.has(idx)) roundScore += 10;
      if (!s.isWrong && selected.has(idx)) roundScore -= 5;
    });
    setScore(prev => prev + roundScore);
    setRoundScores(prev => [...prev, roundScore]);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentText < wrongTexts.length - 1) {
      setCurrentText(prev => prev + 1);
      setSelected(new Set());
      setSubmitted(false);
    } else {
      setFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentText(0); setSelected(new Set());
    setSubmitted(false); setScore(0);
    setRoundScores([]); setFinished(false);
  };

  if (finished) {
    const maxScore = wrongTexts.reduce((acc, t) => acc + t.sentences.filter(s => s.isWrong).length * 10, 0);
    const grade = score >= maxScore * 0.8 ? { label: '우수', color: 'text-green-400' }
      : score >= maxScore * 0.4 ? { label: '양호', color: 'text-yellow-400' }
      : { label: '개선 필요', color: 'text-red-400' };
    return (
      <div className="flex-1 bg-[#0e1318] rounded-xl p-5 border border-gray-800 flex flex-col gap-5 items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-sm mb-1">검수 완료</div>
          <div className={`text-3xl font-bold mb-3 ${grade.color}`}>{grade.label}</div>
          <div className="bg-gray-800 rounded-xl px-8 py-4">
            <div className="text-gray-400 text-xs mb-1">총 점수</div>
            <div className="text-white font-bold text-3xl">{score}점</div>
            <div className="text-gray-500 text-xs mt-1">최대 {maxScore}점</div>
          </div>
          <div className="mt-3 text-xs text-gray-500">정답 문장 선택 +10점 · 오선택 -5점</div>
        </div>
        <button onClick={handleReset} className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
          다시 시작
        </button>
      </div>
    );
  }

  const lastRoundScore = roundScores[roundScores.length - 1];

  return (
    <div className="flex-1 bg-[#0e1318] rounded-xl p-5 border border-gray-800 flex flex-col gap-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="text-white font-bold text-sm">틀린 정보 찾기</div>
        <div className="text-xs text-gray-500">{currentText + 1} / {wrongTexts.length}</div>
      </div>

      <div className="bg-gray-800/40 rounded-lg p-3 text-xs text-gray-400 leading-relaxed">
        AI가 생성한 텍스트입니다. <span className="text-canva-purple font-semibold">할루시네이션이 포함된 문장을 클릭</span>하여 선택하고 제출하세요.
      </div>

      <div className="flex flex-col gap-2">
        {current.sentences.map((s, idx) => {
          const isSel = selected.has(idx);
          let cls = 'bg-gray-800 hover:bg-gray-700 border border-transparent cursor-pointer';
          if (submitted) {
            if (s.isWrong && isSel) cls = 'bg-green-900/40 border border-green-600 cursor-default';
            else if (!s.isWrong && isSel) cls = 'bg-red-900/40 border border-red-600 cursor-default';
            else if (s.isWrong && !isSel) cls = 'bg-orange-900/30 border border-orange-700 cursor-default';
            else cls = 'bg-gray-800 border border-transparent cursor-default';
          } else if (isSel) {
            cls = 'bg-canva-purple/20 border border-canva-purple cursor-pointer';
          }
          return (
            <div key={idx} onClick={() => toggle(idx)}
              className={`p-3 rounded-lg text-sm text-gray-200 leading-relaxed transition-all ${cls}`}>
              <span>{s.text}</span>
              {submitted && s.isWrong && isSel && <span className="ml-2 text-green-400 text-xs font-bold">✓ +10점</span>}
              {submitted && !s.isWrong && isSel && <span className="ml-2 text-red-400 text-xs font-bold">✗ -5점</span>}
              {submitted && s.isWrong && !isSel && <span className="ml-2 text-orange-400 text-xs font-bold">△ 놓침</span>}
            </div>
          );
        })}
      </div>

      {submitted && (
        <div className="bg-blue-900/20 border border-blue-800/60 rounded-lg p-4 text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-300 font-bold text-xs">해설</span>
            <span className={`text-xs font-bold ${lastRoundScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              이번 라운드 {lastRoundScore > 0 ? '+' : ''}{lastRoundScore}점
            </span>
          </div>
          {current.corrections.map((c, i) => (
            <div key={i} className="text-gray-300 text-xs mb-1">• {c}</div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        {!submitted ? (
          <button onClick={handleSubmit} disabled={selected.size === 0}
            className="flex-1 bg-canva-purple hover:bg-canva-purple/80 disabled:opacity-40 text-white rounded-lg py-2.5 text-sm font-bold transition-colors">
            제출
          </button>
        ) : (
          <button onClick={handleNext}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2.5 text-sm font-bold transition-colors">
            {currentText < wrongTexts.length - 1 ? '다음 →' : '결과 보기'}
          </button>
        )}
      </div>

      <div className="text-xs text-gray-500 text-right">
        누적 점수: <span className="text-white font-bold">{score}점</span>
      </div>
    </div>
  );
};

// 5-2: 편향 탐지 (슬라이더 평가 + 채점)
export const Lesson52Interactive = () => {
  const [currentBias, setCurrentBias] = useState(0);
  const [sliderValue, setSliderValue] = useState(50);
  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [roundResults, setRoundResults] = useState<{ user: number; target: number; diff: number }[]>([]);
  const [finished, setFinished] = useState(false);

  const biases = [
    {
      role: '간호사',
      description: '간호사는 공감 능력이 뛰어나고 세심한 여성입니다. 환자를 돌보고 의사를 보조합니다.',
      biasLevel: 85,
      biasPoints: ['특정 성별(여성)로 고정 서술', '"의사를 보조" — 직업 위계 고정'],
      improvement: '"간호사는 공감 능력이 뛰어난 전문 의료인입니다. 환자를 돌봅니다."',
    },
    {
      role: '수학 천재 학생',
      description: '수학 천재 학생은 안경을 쓰고 있으며, 특정 국적의 학생입니다. 수학 올림피아드에서 메달을 딴 경험이 있습니다.',
      biasLevel: 70,
      biasPoints: ['특정 외모(안경) 고정', '특정 국적 연상'],
      improvement: '"수학 천재 학생은 문제 해결에 열정적입니다. 수학 올림피아드에서 메달을 딴 경험이 있습니다."',
    },
    {
      role: '행복한 가족',
      description: '행복한 가족은 엄마, 아빠, 그리고 두 명의 자녀로 구성됩니다. 함께 저녁 식사를 하는 모습이 따뜻합니다.',
      biasLevel: 60,
      biasPoints: ['핵가족 중심 서술', '한부모·조손가정 등 다양한 가족 형태 배제'],
      improvement: '"행복한 가족은 서로를 아끼고 함께 시간을 보냅니다. 저녁 식사를 함께 하는 모습이 따뜻합니다."',
    },
  ];

  const current = biases[currentBias];

  const getPoints = (diff: number) => {
    if (diff <= 10) return 10;
    if (diff <= 20) return 7;
    if (diff <= 30) return 4;
    return 1;
  };

  const handleSubmit = () => {
    const diff = Math.abs(sliderValue - current.biasLevel);
    const pts = getPoints(diff);
    setTotalScore(prev => prev + pts);
    setRoundResults(prev => [...prev, { user: sliderValue, target: current.biasLevel, diff }]);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentBias < biases.length - 1) {
      setCurrentBias(prev => prev + 1);
      setSliderValue(50);
      setSubmitted(false);
    } else {
      setFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentBias(0); setSliderValue(50);
    setSubmitted(false); setTotalScore(0);
    setRoundResults([]); setFinished(false);
  };

  if (finished) {
    const maxScore = biases.length * 10;
    const pct = Math.round((totalScore / maxScore) * 100);
    const label = pct >= 80 ? '우수' : pct >= 50 ? '양호' : '개선 필요';
    const color = pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400';
    return (
      <div className="flex-1 bg-[#0e1318] rounded-xl p-5 border border-gray-800 flex flex-col gap-5 items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-sm mb-1">편향 탐지 완료</div>
          <div className={`text-3xl font-bold mb-3 ${color}`}>{label}</div>
          <div className="bg-gray-800 rounded-xl px-8 py-4">
            <div className="text-gray-400 text-xs mb-1">정확도</div>
            <div className="text-white font-bold text-3xl">{pct}%</div>
            <div className="text-gray-500 text-xs mt-1">오차 10% 이내 +10점 · 20% 이내 +7점 · 30% 이내 +4점</div>
          </div>
        </div>
        <button onClick={handleReset} className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
          다시 시작
        </button>
      </div>
    );
  }

  const lastResult = roundResults[roundResults.length - 1];

  return (
    <div className="flex-1 bg-[#0e1318] rounded-xl p-5 border border-gray-800 flex flex-col gap-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="text-white font-bold text-sm">편향 탐지</div>
        <div className="text-xs text-gray-500">{currentBias + 1} / {biases.length}</div>
      </div>

      <div className="bg-gray-800/40 rounded-lg p-3 text-xs text-gray-400 leading-relaxed">
        아래 AI 생성 문장의 <span className="text-canva-purple font-semibold">편향 정도를 슬라이더로 평가</span>하고 제출하세요.
      </div>

      <div className="bg-gray-900 rounded-lg p-4">
        <div className="text-gray-400 text-xs mb-2">역할: <span className="text-white font-semibold">{current.role}</span></div>
        <p className="text-gray-200 text-sm leading-relaxed">{current.description}</p>
      </div>

      <div className="bg-gray-800/40 rounded-lg p-4">
        <div className="flex justify-between text-xs text-gray-400 mb-3">
          <span>편향 없음</span>
          <span className="font-bold text-white text-sm">{sliderValue}%</span>
          <span>편향 강함</span>
        </div>
        <input
          type="range" min="0" max="100" value={sliderValue}
          onChange={e => { if (!submitted) setSliderValue(Number(e.target.value)); }}
          disabled={submitted}
          className="w-full h-2 rounded-full cursor-pointer disabled:cursor-default"
          style={{ accentColor: '#7F77DD' }}
        />
        <div className="flex justify-between mt-1 text-[10px] text-gray-600">
          <span>0</span><span>50</span><span>100</span>
        </div>
      </div>

      {submitted && (
        <div className="bg-blue-900/20 border border-blue-800/60 rounded-lg p-4 text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-300 font-bold text-xs">분석 결과</span>
            <span className="text-xs text-gray-400">
              정답 {lastResult.target}% · 내 답 {lastResult.user}% · 오차 {lastResult.diff}%
            </span>
          </div>
          <div className="mb-3">
            {current.biasPoints.map((p, i) => (
              <div key={i} className="text-gray-300 text-xs mb-1">• {p}</div>
            ))}
          </div>
          <div className="bg-gray-800/50 rounded p-2 text-xs">
            <span className="text-green-400 font-semibold">개선 예시: </span>
            <span className="text-gray-300">{current.improvement}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        {!submitted ? (
          <button onClick={handleSubmit}
            className="flex-1 bg-canva-purple hover:bg-canva-purple/80 text-white rounded-lg py-2.5 text-sm font-bold transition-colors">
            제출
          </button>
        ) : (
          <button onClick={handleNext}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2.5 text-sm font-bold transition-colors">
            {currentBias < biases.length - 1 ? '다음 →' : '결과 보기'}
          </button>
        )}
      </div>

      <div className="text-xs text-gray-500 text-right">
        누적 점수: <span className="text-white font-bold">{totalScore}점</span>
      </div>
    </div>
  );
};

// 5-3: 딜레마 시나리오
export const Lesson53Interactive = () => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const scenarios = [
    {
      id: 1,
      situation: '학생 A가 최근 자해 위험 신호를 보이고 있습니다. 담임 교사가 AI에게 상담 방법을 물어보려 합니다. 어떻게 입력해야 할까요?',
      options: [
        '① "홍길동(4-2, 010-0000-0000)이 자해 위험이 있어요. 어떻게 상담해야 하나요?"',
        '② "자해 위험 신호를 보이는 초등 4학년 학생을 상담하는 방법을 알려주세요."',
        '③ AI에게 묻지 않고 학교 상담사에게 직접 연결한다.'
      ],
      correctAnswers: [1, 2],
      explanation: '②③ 모두 가능합니다. ①은 개인정보 입력으로 부적절합니다.'
    },
    {
      id: 2,
      situation: '학교폭력 사안 처리 문서를 작성해야 합니다. AI에게 초안을 요청하려 합니다.',
      options: [
        '① 피해 학생·가해 학생 이름과 구체적 상황을 모두 입력한다.',
        '② 이름을 A·B로 바꾸고 날짜·장소도 일반화해서 입력한다.',
        '③ AI에게 맡기지 않고 직접 작성한다.'
      ],
      correctAnswers: [1],
      explanation: '② 권장합니다. ①은 개인정보 위반입니다. ③도 가능하지만 비효율입니다.'
    },
    {
      id: 3,
      situation: '학급 학생 30명의 알레르기 정보를 AI에게 주고 급식 주의사항 안내문을 만들려 합니다.',
      options: [
        '① 학생 이름과 알레르기 항목을 표로 입력한다.',
        '② 알레르기 유형만 개수로 입력한다. ("달걀 알레르기 5명, 우유 3명")',
        '③ AI를 사용하지 않는다.'
      ],
      correctAnswers: [1],
      explanation: '② 권장합니다. ①은 개인정보 위반입니다.'
    },
    {
      id: 4,
      situation: '새 학기 학부모 상담 내용을 AI로 정리하려 합니다. 상담 내용에는 가정 내 어려움, 부모 연락처가 포함됩니다.',
      options: [
        '① 상담 내용 전체를 AI에게 붙여넣는다.',
        '② 가족 상황은 일반화하고 연락처는 제외해서 입력한다.',
        '③ AI를 사용하지 않고 수기로 정리한다.'
      ],
      correctAnswers: [1],
      explanation: '② 권장합니다. ①은 민감 개인정보 입력입니다. ③도 가능합니다.'
    }
  ];

  const isCorrect = selectedAnswer !== null && scenarios[currentScenario].correctAnswers.includes(selectedAnswer);

  const handleNext = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0e1318] rounded-xl p-5 border border-gray-800 flex flex-col gap-4 overflow-y-auto">
      <div className="text-white font-bold mb-2">딜레마 시나리오</div>

      <div className="bg-gray-900 p-4 rounded-lg text-sm text-gray-200">
        <p className="leading-relaxed">{scenarios[currentScenario].situation}</p>
      </div>

      <div className="space-y-2">
        {scenarios[currentScenario].options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedAnswer(idx);
              setShowExplanation(true);
            }}
            className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
              selectedAnswer === idx
                ? isCorrect
                  ? 'bg-green-900/40 border border-green-700 text-green-100'
                  : 'bg-red-900/40 border border-red-700 text-red-100'
                : 'bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {showExplanation && selectedAnswer !== null && (
        <div className={`p-4 rounded-lg text-sm ${
          isCorrect
            ? 'bg-green-900/30 border border-green-700 text-green-100'
            : 'bg-blue-900/30 border border-blue-700 text-blue-100'
        }`}>
          <div className="font-bold mb-1">{isCorrect ? '✓ 맞습니다' : 'ℹ️ 설명'}</div>
          <p>{scenarios[currentScenario].explanation}</p>
        </div>
      )}

      {currentScenario < scenarios.length - 1 && selectedAnswer !== null && (
        <button
          onClick={handleNext}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 px-3 text-sm font-medium transition-colors"
        >
          다음 시나리오
        </button>
      )}

      <div className="text-xs text-gray-400 mt-auto pt-4 border-t border-gray-700">
        {currentScenario + 1} / {scenarios.length}
      </div>
    </div>
  );
};

// 5-4: 판단 퀴즈
export const Lesson54Interactive = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const quizzes = [
    {
      situation: '학생이 독서 감상문을 AI로 작성해서 제출했습니다.',
      options: ['표기 필요', '표기 불필요', '판단 어려움'],
      answer: '표기 필요',
      explanation: 'AI가 작성한 것을 학생 작품으로 제출하는 것은 학문적 정직성 위반입니다.'
    },
    {
      situation: '교사가 AI로 만든 학습지를 수업에 사용했습니다.',
      options: ['표기 필요', '표기 불필요', '판단 어려움'],
      answer: '표기 필요',
      explanation: '법적 의무는 아니나 투명성 측면에서 권장합니다.'
    },
    {
      situation: '학생이 AI에게 아이디어를 물어보고 자신의 언어로 다시 써서 제출했습니다.',
      options: ['표기 필요', '표기 불필요', '판단 어려움'],
      answer: '판단 어려움',
      explanation: '학교마다 기준이 다릅니다. 명확한 학급 규칙이 필요합니다.'
    },
    {
      situation: '교사가 AI로 만든 학급 안내 가정통신문을 학부모에게 발송했습니다.',
      options: ['표기 필요', '표기 불필요', '판단 어려움'],
      answer: '표기 불필요',
      explanation: '법적 기준에서는 표기 불필요합니다. 다만 검토 후 발송은 필수입니다.'
    },
    {
      situation: '교사가 AI 생성 이미지를 학교 행사 포스터에 사용했습니다.',
      options: ['표기 필요', '표기 불필요', '판단 어려움'],
      answer: '판단 어려움',
      explanation: 'AI 생성 이미지 저작권은 아직 불명확합니다. 공식 행사 자료에는 주의가 필요합니다.'
    }
  ];

  const isCorrect = selectedAnswer === quizzes[currentQuestion].answer;

  const handleAnswer = (option: string) => {
    setSelectedAnswer(option);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestion < quizzes.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0e1318] rounded-xl p-5 border border-gray-800 flex flex-col gap-4 overflow-y-auto">
      <div className="text-white font-bold mb-2">출처 표기 판단 퀴즈</div>

      <div className="bg-gray-900 p-4 rounded-lg text-sm text-gray-200">
        <p className="leading-relaxed">{quizzes[currentQuestion].situation}</p>
      </div>

      <div className="space-y-2">
        {quizzes[currentQuestion].options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
              selectedAnswer === option
                ? isCorrect
                  ? 'bg-green-900/40 border border-green-700 text-green-100'
                  : 'bg-red-900/40 border border-red-700 text-red-100'
                : 'bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {showExplanation && selectedAnswer && (
        <div className={`p-4 rounded-lg text-sm ${
          isCorrect
            ? 'bg-green-900/30 border border-green-700 text-green-100'
            : 'bg-blue-900/30 border border-blue-700 text-blue-100'
        }`}>
          <div className="font-bold mb-1">{isCorrect ? '✓ 맞습니다' : 'ℹ️ 해설'}</div>
          <p>{quizzes[currentQuestion].explanation}</p>
        </div>
      )}

      {currentQuestion < quizzes.length - 1 && selectedAnswer && (
        <button
          onClick={handleNext}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 px-3 text-sm font-medium transition-colors"
        >
          다음 문항
        </button>
      )}

      <div className="text-xs text-gray-400 mt-auto pt-4 border-t border-gray-700">
        {currentQuestion + 1} / {quizzes.length}
      </div>
    </div>
  );
};

// 5-5: 학년별 활동
export const Lesson55Interactive = () => {
  const [activeTab, setActiveTab] = useState<'lower' | 'middle' | 'upper'>('lower');

  const activities = {
    lower: [
      {
        title: '활동 1 — "로봇 친구 대화하기"',
        time: '20분',
        goal: 'AI가 사람과 다르다는 것을 이해한다',
        steps: [
          '교사가 AI와 대화하는 것을 보여줍니다',
          '"AI야, 배고파?"처럼 감정 관련 질문을 합니다',
          'AI의 답변을 보며 사람과 다른 점을 찾습니다',
          '"AI는 배고프지 않아요. 왜 그럴까요?" 토론'
        ]
      },
      {
        title: '활동 2 — "AI야, 틀려봐!"',
        time: '15분',
        goal: 'AI도 틀릴 수 있다는 것을 직접 경험한다',
        steps: [
          '학생들과 함께 말이 안 되는 질문 만들기',
          'AI의 답변 확인',
          '"AI가 이렇게 대답한 이유는 뭘까요?" 토론',
          '"AI가 틀렸을 때 우리는 어떻게 해야 할까요?" 토론'
        ]
      },
      {
        title: '활동 3 — "이건 누가 만들었을까?"',
        time: '20분',
        goal: 'AI 결과물과 사람 결과물을 구분하려는 태도를 기른다',
        steps: [
          'AI 그림 3장, 학생 그림 3장 섞어서 제시',
          '"이 중에 AI가 만든 그림은 어느 것일까요?" 맞히기',
          'AI 그림의 특징 토론',
          '"사람이 만든 것과 AI가 만든 것 중 더 좋은 것은?" 토론'
        ]
      }
    ],
    middle: [
      {
        title: '활동 4 — "사실 탐정단"',
        time: '30분',
        goal: 'AI 정보를 교차 검증하는 습관을 기른다',
        steps: [
          'AI에게 우리 지역 관련 정보 질문',
          'AI 답변을 기록',
          '모둠별로 책·검색으로 AI 답변 확인',
          '맞은 것, 틀린 것, 확인 불가 것 분류 및 발표'
        ]
      },
      {
        title: '활동 5 — "AI 탐정단"',
        time: '30분',
        goal: 'AI 생성 글과 사람이 쓴 글을 비교 분석한다',
        steps: [
          'AI 글 2편, 학생 글 2편 제시 (같은 주제, 작성자 표시 없음)',
          '모둠별로 "AI가 쓴 것 같은 글" 고르기',
          'AI 글의 특징 분석 (어색한 표현, 지나친 완벽함 등)',
          'AI 글의 좋은 점과 부족한 점 토론'
        ]
      },
      {
        title: '활동 6 — "AI에게 좋은 질문 하기"',
        time: '25분',
        goal: '프롬프트에 따라 AI 답변이 달라짐을 이해한다',
        steps: [
          '같은 주제를 다르게 질문해보기',
          '두 답변 비교',
          '"어떤 질문이 더 유용한 답변을 줬는지" 토론',
          '더 좋은 질문 직접 만들어보기'
        ]
      }
    ],
    upper: [
      {
        title: '활동 7 — "AI와 나의 생각 비교"',
        time: '40분',
        goal: 'AI 결과와 자신의 생각을 비교하는 메타인지를 기른다',
        steps: [
          '주제 제시 (예: "환경 문제를 해결하는 방법")',
          '먼저 학생이 자신의 생각을 5분간 작성',
          '같은 주제로 AI에게 질문',
          '내 생각과 AI 답변 비교 분석 (공통점, 차이점, AI에게 없는 내 생각)'
        ]
      },
      {
        title: '활동 8 — "AI 사용 일지 쓰기"',
        time: '15분',
        goal: 'AI 사용 과정을 투명하게 기록하는 습관을 기른다',
        steps: [
          '프로젝트 수업 중 AI 사용 시 일지 작성',
          '일지: 날짜·과제명·질문 내용·수정 사항 등 기록',
          '일지를 바탕으로 "AI를 어떻게 활용했는지" 발표',
          '"AI를 사용했다는 것을 왜 밝혀야 할까요?" 토론'
        ]
      },
      {
        title: '활동 9 — "AI 편향 찾기"',
        time: '40분',
        goal: 'AI의 알고리즘 편향을 인식하고 비판적으로 바라본다',
        steps: [
          'AI에게 다양한 직업·역할을 묘사하도록 요청',
          '각 묘사에서 성별·인종·나이 편향 분석',
          '"AI가 편향된 이유" 추론',
          '편향을 줄이는 프롬프트를 직접 만들어 비교'
        ]
      }
    ]
  };

  const tabConfig = [
    { id: 'lower' as const, label: '저학년 (1~2학년)', emoji: '🌱' },
    { id: 'middle' as const, label: '중학년 (3~4학년)', emoji: '🌿' },
    { id: 'upper' as const, label: '고학년 (5~6학년)', emoji: '🌳' }
  ];

  return (
    <div className="flex-1 bg-[#0e1318] rounded-xl p-5 border border-gray-800 flex flex-col gap-4 overflow-y-auto">
      <div className="text-white font-bold mb-2">학년별 수업 활동</div>

      <div className="sticky top-0 z-10 bg-[#0e1318] py-3 -mx-5 px-5 border-b border-gray-700">
        <div className="flex gap-2 overflow-x-auto">
        {tabConfig.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
        </div>
      </div>

      <div className="space-y-4 pt-3">
        {activities[activeTab].map((activity, idx) => (
          <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="font-bold text-white mb-2">{activity.title}</div>
            <div className="text-xs text-gray-400 mb-3">⏱️ {activity.time} | 목표: {activity.goal}</div>
            <div className="space-y-2 text-sm text-gray-300">
              {activity.steps.map((step, stepIdx) => (
                <div key={stepIdx} className="flex gap-2">
                  <span className="text-gray-500 flex-shrink-0">{stepIdx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <CopyButton
                text={`${activity.title} (${activity.time})\n목표: ${activity.goal}\n\n진행 방법:\n${activity.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5-6: 가이드라인 빌더
export const Lesson56Interactive = () => {
  const [hallucinationChecks, setHallucinationChecks] = useState<string[]>([]);
  const [privacyChecks, setPrivacyChecks] = useState<string[]>([]);
  const [copyrightChecks, setCopyrightChecks] = useState<string[]>([]);
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [generated, setGenerated] = useState('');

  const options = {
    hallucination: [
      'AI 결과물의 핵심 사실은 반드시 교차 검증한다',
      '수치·날짜·법령이 포함된 내용은 출처를 요청한다',
      '중요 문서는 RAG 방식(자료 먼저 제공)으로 요청한다'
    ],
    privacy: [
      '학생 이름·학번은 AI에 입력하지 않는다',
      '학부모 연락처·개인 정보는 AI에 입력하지 않는다',
      'AI 입력 전 익명화를 기본으로 한다'
    ],
    copyright: [
      '수업 자료에 AI 생성물을 사용할 때 출처를 표기한다',
      '학생에게 AI 사용 출처 표기를 요구한다',
      'AI 생성물을 상업적으로 사용하지 않는다'
    ]
  };

  const handleGenerateGuideline = () => {
    const guideline = `○○초등학교 ○학년 ○반 AI 윤리 가이드라인

[할루시네이션 대응 원칙]
${hallucinationChecks.length > 0
  ? hallucinationChecks.map((check, i) => `${i + 1}. ${check}`).join('\n')
  : '(선택된 항목 없음)'}
${customInputs.hallucination ? `\n추가: ${customInputs.hallucination}` : ''}

[데이터 프라이버시 원칙]
${privacyChecks.length > 0
  ? privacyChecks.map((check, i) => `${i + 1}. ${check}`).join('\n')
  : '(선택된 항목 없음)'}
${customInputs.privacy ? `\n추가: ${customInputs.privacy}` : ''}

[저작권·출처 원칙]
${copyrightChecks.length > 0
  ? copyrightChecks.map((check, i) => `${i + 1}. ${check}`).join('\n')
  : '(선택된 항목 없음)'}
${customInputs.copyright ? `\n추가: ${customInputs.copyright}` : ''}

작성일: _________ / 담임: _________`;

    setGenerated(guideline);
  };

  const toggleCheck = (type: 'hallucination' | 'privacy' | 'copyright', item: string) => {
    if (type === 'hallucination') {
      setHallucinationChecks(prev =>
        prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
      );
    } else if (type === 'privacy') {
      setPrivacyChecks(prev =>
        prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
      );
    } else {
      setCopyrightChecks(prev =>
        prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
      );
    }
  };

  return (
    <div className="flex-1 bg-[#0e1318] rounded-xl p-5 border border-gray-800 flex flex-col gap-4 overflow-y-auto">
      <div className="text-white font-bold mb-2">나만의 AI 윤리 가이드라인 빌더</div>

      {!generated ? (
        <div className="space-y-4">
          {/* 할루시네이션 */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="font-bold text-white mb-3 text-sm">할루시네이션 대응 원칙</div>
            <div className="space-y-2">
              {options.hallucination.map((option, idx) => (
                <label key={idx} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hallucinationChecks.includes(option)}
                    onChange={() => toggleCheck('hallucination', option)}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-300">{option}</span>
                </label>
              ))}
              <input
                type="text"
                placeholder="추가 입력..."
                value={customInputs.hallucination || ''}
                onChange={e => setCustomInputs({...customInputs, hallucination: e.target.value})}
                className="w-full mt-2 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 프라이버시 */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="font-bold text-white mb-3 text-sm">데이터 프라이버시 원칙</div>
            <div className="space-y-2">
              {options.privacy.map((option, idx) => (
                <label key={idx} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyChecks.includes(option)}
                    onChange={() => toggleCheck('privacy', option)}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-300">{option}</span>
                </label>
              ))}
              <input
                type="text"
                placeholder="추가 입력..."
                value={customInputs.privacy || ''}
                onChange={e => setCustomInputs({...customInputs, privacy: e.target.value})}
                className="w-full mt-2 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 저작권 */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="font-bold text-white mb-3 text-sm">저작권·출처 원칙</div>
            <div className="space-y-2">
              {options.copyright.map((option, idx) => (
                <label key={idx} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={copyrightChecks.includes(option)}
                    onChange={() => toggleCheck('copyright', option)}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-300">{option}</span>
                </label>
              ))}
              <input
                type="text"
                placeholder="추가 입력..."
                value={customInputs.copyright || ''}
                onChange={e => setCustomInputs({...customInputs, copyright: e.target.value})}
                className="w-full mt-2 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateGuideline}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 px-3 text-sm font-medium transition-colors"
          >
            가이드라인 문서 생성
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-sm text-green-100">
            ✓ 나만의 AI 윤리 가이드라인이 완성되었습니다!
          </div>
          <pre className="bg-gray-900 p-4 rounded-lg text-xs text-gray-300 overflow-x-auto border border-gray-800">
            {generated}
          </pre>
          <div className="flex gap-2">
            <CopyButton text={generated} className="flex-1 justify-center" />
            <button
              onClick={() => setGenerated('')}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 px-3 text-sm font-medium transition-colors"
            >
              다시 작성
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
