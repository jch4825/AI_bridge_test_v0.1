import { BookOpen, FileText, MessageCircle, ClipboardCheck, SlidersHorizontal, Shield, Bot, Wand2, Film, Newspaper, Mail } from 'lucide-react';

export interface ToolInput {
  id: string;
  label: string;
  type: 'textarea' | 'text' | 'select' | 'number';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  rows?: number;
}

export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  systemPrompt: string;
  inputs: ToolInput[];
  tags: string[];
}

export const TOOLS: ToolDefinition[] = [
  {
    id: 'lesson-plan',
    title: '수업 지도안 생성',
    description: '교과·단원 입력하면 즉시 생성',
    icon: BookOpen,
    gradient: 'from-blue-500 to-blue-700',
    systemPrompt: `너는 초등 교육과정 설계 전문가야. 사용자의 요청에 '오개념'이나 '분석'이라는 키워드가 포함되어 있다면 반드시 해당 성취기준과 관련된 학생들의 주요 오개념 3가지를 먼저 제시한 후, 이를 해결하기 위한 [도입-전개-정리] 순서의 지도안을 제안해줘. 만약 오개념 분석에 대한 명시적 요청이 없다면 곧바로 지도안 작성 단계로 넘어가줘.`,
    inputs: [
      {
        id: 'request',
        label: '수업 요청',
        type: 'textarea',
        placeholder: '예) 5학년 사회 "우리 국토의 위치" 수업 지도안을 짜줘.',
        required: true,
        rows: 4,
      },
    ],
    tags: ['수업', '지도안'],
  },
  {
    id: 'grade-report',
    title: '세특·생기부 문구',
    description: '에피소드 입력하면 문구 초안 즉시 생성',
    icon: FileText,
    gradient: 'from-emerald-500 to-emerald-700',
    systemPrompt: `너는 초등 생활기록부 작성 전문가야. 학생의 개별적 역량과 성장 과정이 잘 드러나도록 긍정적이고 전문적인 어조로 문구를 작성해줘. 개인정보는 절대 포함하지 마.`,
    inputs: [
      {
        id: 'traits',
        label: '학생 특성',
        type: 'textarea',
        placeholder: '예) 꼼꼼함, 수학 흥미 높음',
        required: true,
        rows: 2,
      },
      {
        id: 'episode',
        label: '관찰 에피소드',
        type: 'textarea',
        placeholder: '예) "비와 비율" 단원에서 실생활 예시를 스스로 찾아내어 발표함',
        required: true,
        rows: 3,
      },
      {
        id: 'length',
        label: '글자 수',
        type: 'select',
        options: [
          { value: '100자 내외', label: '100자' },
          { value: '150자 내외', label: '150자' },
          { value: '200자 내외', label: '200자' },
          { value: '300자 내외', label: '300자' },
        ],
      },
    ],
    tags: ['생기부', '세특', '학생'],
  },
  {
    id: 'questioning',
    title: '소크라테스식 발문',
    description: '단원명 입력하면 핵심 발문 생성',
    icon: MessageCircle,
    gradient: 'from-violet-500 to-violet-700',
    systemPrompt: `너는 학생들의 사고를 촉진하는 '소크라테스식 대화법' 전문가야. 단순히 지식을 묻는 질문이 아니라, 학생들이 스스로 생각하고 의문을 품게 만드는 매력적인 질문들을 제안해줘.`,
    inputs: [
      {
        id: 'request',
        label: '단원 또는 주제',
        type: 'textarea',
        placeholder: '예) 초등 4학년 수학 "각도" 단원에서 학생들의 호기심을 자극할 도입 질문 3가지 만들어줘.',
        required: true,
        rows: 3,
      },
    ],
    tags: ['수업', '발문'],
  },
  {
    id: 'rubric',
    title: '서술형 문제 + 루브릭',
    description: '성취기준·단원 입력하면 즉시 생성',
    icon: ClipboardCheck,
    gradient: 'from-amber-500 to-amber-700',
    systemPrompt: `너는 교육 평가 전문가야. 학생들의 이해도를 정확히 측정할 수 있는 문항을 설계하고, 객관적이고 구체적인 채점 기준(루브릭)을 제공해줘. 단, 사용자의 요청에 '성취기준'의 직접적인 언급이 없다면 성취기준을 절대로 포함하거나 추측해서 적지 않아야 해. 중요: 채점 루브릭을 작성할 때 마크다운 표 기호(|)는 절대 사용하지 말고, 글머리 기호(-, *)를 사용한 개조식 형태로 출력해.`,
    inputs: [
      {
        id: 'request',
        label: '단원 또는 성취기준',
        type: 'textarea',
        placeholder: '예) 초등 4학년 과학 "식물의 한살이" 서술형 문제 1개와 루브릭을 개조식으로 만들어줘.',
        required: true,
        rows: 4,
      },
    ],
    tags: ['평가', '루브릭'],
  },
  {
    id: 'differentiation',
    title: '학습지 수준 조정',
    description: '기초·보통·심화 버전으로 즉시 변환',
    icon: SlidersHorizontal,
    gradient: 'from-rose-500 to-rose-700',
    systemPrompt: `너는 학습 지원 대상 학생이나 영재 학생을 위한 교육 자료 최적화 전문가야. 사용자가 준 내용을 바탕으로 수준에 맞게 어휘, 문제 구조, 난이도를 조절해줘.`,
    inputs: [
      {
        id: 'content',
        label: '원본 학습지 내용',
        type: 'textarea',
        placeholder: '조정할 학습지 내용을 붙여넣으세요.',
        required: true,
        rows: 5,
      },
      {
        id: 'level',
        label: '변환 수준',
        type: 'select',
        options: [
          { value: '기초 학생용으로 아주 쉽게 바꿔줘. 어휘를 낮추고 보기를 제공해줘.', label: '기초 (학습 지원)' },
          { value: '중간 수준으로 적절하게 조정해줘.', label: '보통 (일반)' },
          { value: '심화 학생용으로 바꿔줘. 사고력 문제를 추가해줘.', label: '심화 (영재)' },
        ],
        required: true,
      },
    ],
    tags: ['수업', '학습지'],
  },
  {
    id: 'ethics-lesson',
    title: 'AI 윤리 수업 지도안',
    description: '학교급·학생 수 입력하면 즉시 생성',
    icon: Shield,
    gradient: 'from-teal-500 to-cyan-700',
    systemPrompt: `당신은 초·중등학교 AI 윤리 수업을 설계하는 교육과정 전문가입니다.
사용자가 입력한 '학교급·학생 수·학생 특성·포커스' 정보를 바탕으로, 교실에서 바로 사용할 수 있는 **AI 윤리 수업 지도안**을 한국어로 작성하세요.

다음 형식을 따라 마크다운으로 출력합니다:

# [학교급] AI 윤리 수업 지도안

## 1. 수업 개요
- 대상: (학교급/학년 + 학생 수)
- 학생 특성 반영: (입력된 특성을 짧게 요약)
- 차시: 1차시 40~45분
- 핵심 목표: (비판적 수용 / 구분 태도 / 투명한 공개 중 맞는 것)

## 2. 학습 목표
- 학습 목표 1~2가지 (구체적이고 실천적인 목표 제시)

## 3. 수업 흐름 (도입-전개-정리)
- **도입 (5분):** [활동 내용], 교사 발문: [발문], 유의점: [유의점]
- **전개 (30분):** [활동 내용], 교사 발문: [발문], 유의점: [유의점]
- **정리 (5분):** [활동 내용], 교사 발문: [발문], 유의점: [유의점]

## 4. 핵심 활동 상세
- 학생 특성에 맞춘 활동 1~2개를 상세히 설명

## 5. 평가 계획
- 형성평가 질문 3개

## 6. 유의사항 및 안전 가이드
- 개인정보 보호
- AI 결과물 교차 검증
- '위험 강조' 대신 '현명한 활용' 관점

원칙:
- **중요: 성취기준(2022 개정 등)은 절대로 언급하거나 출력하지 마세요. 사용자가 직접 텍스트로 제공하지 않는 한, 어떤 성취기준도 창작해서는 안 됩니다.**
- 학습 목표는 1~2개면 충분합니다.
- "AI는 위험하다" / "AI는 완벽하다" 같은 단정적 표현 금지
- 학생 특성에 맞춰 용어 난이도와 활동 시간을 조정
- 모든 활동은 교실에서 실제 실행 가능해야 함`,
    inputs: [
      {
        id: 'schoolLevel',
        label: '학교급 / 학년',
        type: 'select',
        options: [
          { value: '초등학교 1-2학년군', label: '초등학교 1-2학년군' },
          { value: '초등학교 3-4학년군', label: '초등학교 3-4학년군' },
          { value: '초등학교 5-6학년군', label: '초등학교 5-6학년군' },
          { value: '중학교 1학년군', label: '중학교 1학년군' },
          { value: '중학교 2학년군', label: '중학교 2학년군' },
          { value: '중학교 3학년군', label: '중학교 3학년군' },
        ],
        required: true,
      },
      {
        id: 'studentCount',
        label: '학생 수',
        type: 'number',
        placeholder: '24',
        required: true,
      },
      {
        id: 'studentTraits',
        label: '학생 특성 (선택)',
        type: 'textarea',
        placeholder: '예) 디지털 기기 사용 익숙, 비판적 분석 경험 적음',
        rows: 2,
      },
      {
        id: 'ethicsFocus',
        label: '윤리 수업 포커스',
        type: 'select',
        options: [
          { value: '종합 (할루시네이션·편향·프라이버시·저작권 균형)', label: '종합' },
          { value: '할루시네이션 — AI가 거짓 정보를 생성하는 현상과 검증 방법 중심', label: '할루시네이션' },
          { value: '편향 — 알고리즘 편향의 사례와 다양성 확보 방법 중심', label: '편향' },
          { value: '프라이버시 — 개인정보 보호와 안전한 AI 사용 방법 중심', label: '프라이버시' },
          { value: '저작권 — AI 생성물의 출처 표기와 학문적 정직성 중심', label: '저작권' },
        ],
        required: true,
      },
    ],
    tags: ['AI교육', '윤리', '지도안'],
  },
  {
    id: 'chatbot',
    title: '나만의 챗봇 만들기',
    description: 'Gemini Gems 시스템 프롬프트 즉시 생성',
    icon: Bot,
    gradient: 'from-indigo-500 to-indigo-700',
    systemPrompt: `너는 맞춤형 커스텀 챗봇(Gemini Gems, GPTs 등)의 요청 사항(Instructions)을 완벽하게 세팅해 주는 최고 수준의 프롬프트 엔지니어링 전문가야. 사용자가 어떤 챗봇을 만들고 싶은지 말하면, 챗봇 설정 화면에 그대로 복사해서 붙여넣을 수 있도록 [역할(Role), 목표(Goal), 어조(Tone), 필수 규칙(Rules), 답변 형식(Format)] 영역으로 구조화된 '완성형 시스템 프롬프트(요청 사항)'를 마크다운 코드 블록으로 작성해줘.`,
    inputs: [
      {
        id: 'idea',
        label: '챗봇 아이디어',
        type: 'textarea',
        placeholder: '예) 학생들의 일기장을 다정하게 검사하고 짧은 코멘트와 칭찬을 남겨주는 "다정한 일기 쌤" 챗봇',
        required: true,
        rows: 3,
      },
    ],
    tags: ['AI도구', '챗봇'],
  },
  {
    id: 'prompt-optimizer',
    title: '프롬프트 최적화',
    description: '요청 내용을 완성도 높은 프롬프트로',
    icon: Wand2,
    gradient: 'from-pink-500 to-pink-700',
    systemPrompt: `너는 초등학교 교사를 위한 프롬프트 전문가야. 사용자가 입력한 '작업 내용'을 바탕으로, 역할·맥락·형식·CoT가 모두 포함된 최적의 프롬프트를 설계해줘.

출력 형식:
1. 설계된 프롬프트의 핵심 전략 설명 (간략히)
2. 완성된 프롬프트 (복사해서 바로 쓸 수 있게 마크다운 코드 블록으로 제시)
3. 이 프롬프트를 사용할 때의 팁

사용자가 원하는 작업: `,
    inputs: [
      {
        id: 'task',
        label: '만들고 싶은 프롬프트 내용',
        type: 'textarea',
        placeholder: '예) 학부모 상담 일지 작성, 체험학습 안전 수칙 만들기',
        required: true,
        rows: 3,
      },
    ],
    tags: ['AI도구', '프롬프트'],
  },
  {
    id: 'media-prompt',
    title: '멀티미디어 프롬프트',
    description: '이미지·영상·음악 AI용 프롬프트 생성',
    icon: Film,
    gradient: 'from-cyan-500 to-blue-700',
    systemPrompt: `너는 이미지/영상/음악 생성 AI 전용 프롬프트 디자이너야.
나의 간단한 아이디어를 바탕으로, 해당 매체(Midjourney, Runway, Suno 등)에서 최고의 결과물을 낼 수 있는 전문 용어가 포함된 영문 프롬프트를 작성해줘.
1. 타겟 서비스 명시
2. 전문 용어 추가
3. 서비스에 맞는 구조로 출력
4. 선택 이유를 한국어로 설명

나의 요청: `,
    inputs: [
      {
        id: 'idea',
        label: '멀티미디어 아이디어',
        type: 'textarea',
        placeholder: '예) 아이들이 점심시간에 들을만한 평화로운 피아노 곡을 만들고 싶어.',
        required: true,
        rows: 3,
      },
    ],
    tags: ['AI도구', '멀티미디어'],
  },
  {
    id: 'press-release',
    title: '보도자료 생성기',
    description: '학교 행사·성과를 보도자료 형식으로 즉시 생성',
    icon: Newspaper,
    gradient: 'from-orange-500 to-red-600',
    systemPrompt: `당신은 교육기관 전문 홍보 담당자이자 보도자료 작성 전문가입니다.
사용자가 입력한 정보를 바탕으로 언론사에 바로 배포할 수 있는 수준의 **보도자료**를 한국어로 작성하세요.

다음 형식을 반드시 따르세요:

---
**보 도 자 료**
배포일시: (오늘 날짜 기준으로 작성)
담당부서: (기관명) 교무행정실 (또는 홍보담당)

# [제목: 핵심 내용을 담은 명확하고 임팩트 있는 제목]
## 부제목: (제목을 보완하는 한 줄 설명)

**[리드문]**
(5W1H — 누가·언제·어디서·무엇을·왜·어떻게 — 를 2~3문장으로 압축. 가장 중요한 정보 우선)

**[본문]**
(행사/성과의 구체적 내용, 배경, 의미를 단락별로 서술. 인용문 1~2개 포함: "…" — 담당자 직책 및 성 표기)

**[배경 및 의의]**
(이 사업/행사가 왜 중요한지, 교육적 맥락과 기대 효과)

**[기관 소개]** (선택)
(기관의 한 줄 소개)

**[문의]**
- 담당: (기관명) (부서명)
- 연락처: 000-0000-0000
---

작성 원칙:
- 공식적이되 읽기 쉬운 문장
- 전문 용어는 괄호로 간단히 풀어서 표기
- 수치·날짜·장소는 구체적으로 (입력된 정보 활용)
- 과장·미화 없이 사실 중심으로 서술
- 인용문은 현실감 있게 자연스럽게 창작 (담당자 이름은 'OOO 교장' 형식으로 익명 처리)`,
    inputs: [
      {
        id: 'orgName',
        label: '기관명 / 학교명',
        type: 'text',
        placeholder: '예) OO초등학교',
        required: true,
      },
      {
        id: 'purpose',
        label: '보도자료 목적',
        type: 'select',
        options: [
          { value: '학교 행사 안내 및 홍보', label: '행사 안내·홍보' },
          { value: '수상·성과·우수 사례 홍보', label: '수상·성과 홍보' },
          { value: '교육 프로그램·사업 소개', label: '프로그램·사업 소개' },
          { value: '정책·제도 변경 안내', label: '정책·제도 안내' },
          { value: '지역사회 협력·MOU 체결', label: '지역사회 협력' },
        ],
        required: true,
      },
      {
        id: 'coreContent',
        label: '핵심 내용',
        type: 'textarea',
        placeholder: '예) 행사명, 일시, 장소, 주요 내용, 참여 대상, 특이사항 등을 자유롭게 적어주세요.',
        required: true,
        rows: 5,
      },
      {
        id: 'audience',
        label: '배포 대상',
        type: 'select',
        options: [
          { value: '지역 언론사 (신문·방송)', label: '지역 언론' },
          { value: '학부모 및 지역사회', label: '학부모·지역사회' },
          { value: '교육청 내부 공문', label: '교육청 내부' },
          { value: '학교 홈페이지·SNS 게시용', label: '홈페이지·SNS' },
        ],
        required: true,
      },
      {
        id: 'length',
        label: '분량',
        type: 'select',
        options: [
          { value: '600자 내외로 간결하게', label: '간결 (~600자)' },
          { value: '1000자 내외 표준 분량으로', label: '표준 (~1000자)' },
          { value: '1500자 이상 상세하게', label: '상세 (~1500자)' },
        ],
      },
    ],
    tags: ['행정', '보도자료', '홍보'],
  },
  {
    id: 'parent-notice',
    title: '가정통신문 문구 생성기',
    description: '주제와 내용 입력하면 완성된 가정통신문 즉시 생성',
    icon: Mail,
    gradient: 'from-sky-500 to-indigo-600',
    systemPrompt: `당신은 초·중등학교 가정통신문 작성 전문가입니다.
사용자가 입력한 정보를 바탕으로 학부모에게 발송할 수 있는 완성형 **가정통신문**을 한국어로 작성하세요.

다음 형식을 따르세요:

---
[학교명] 가정통신문
발송일: (입력된 날짜 또는 '년 월 일' 형식의 빈칸)

**제목: [주제를 담은 명확한 제목]**

학부모님께,

안녕하십니까? [학교명]입니다.
(계절·시기에 맞는 짧은 인사 1~2문장)

[본문]
(핵심 내용을 단락별로 서술. 필요 시 번호 목록 사용. 날짜·장소·준비물 등 구체적 정보는 굵게 표시)

[안내 사항] (있을 경우)
- 항목1
- 항목2

[협조 요청 사항] (있을 경우)
(학부모께 부탁드릴 내용을 공손하게)

궁금한 점은 담임선생님 또는 [담당 부서]로 문의해 주시기 바랍니다.

감사합니다.

[담당 교사/부서] 드림
---

작성 원칙:
- 공손하고 따뜻한 어조, 지나친 격식체 지양
- 학부모가 한눈에 파악할 수 있도록 핵심 정보는 앞에 배치
- 행동이 필요한 항목(회신·준비물·동의서 등)은 별도 줄로 강조
- 불필요한 미화 표현 없이 명확하고 간결하게`,
    inputs: [
      {
        id: 'schoolName',
        label: '학교명',
        type: 'text',
        placeholder: '예) OO초등학교',
        required: true,
      },
      {
        id: 'sendDate',
        label: '발송 날짜',
        type: 'text',
        placeholder: '예) 2026년 4월 22일',
      },
      {
        id: 'subject',
        label: '제목 / 주제',
        type: 'text',
        placeholder: '예) 5월 가정의 달 행사 안내, 현장체험학습 사전 안내',
        required: true,
      },
      {
        id: 'coreContent',
        label: '핵심 내용',
        type: 'textarea',
        placeholder: '예) 일시, 장소, 준비물, 주요 일정, 비용, 동의서 제출 여부 등 알릴 내용을 자유롭게 적어주세요.',
        required: true,
        rows: 5,
      },
      {
        id: 'requests',
        label: '협조 요청 사항 (선택)',
        type: 'textarea',
        placeholder: '예) 동의서 4월 25일까지 제출, 급식비 미납 가정 안내 등',
        rows: 3,
      },
      {
        id: 'contact',
        label: '담당 교사 / 부서',
        type: 'text',
        placeholder: '예) 3학년 4반 담임, 교무행정실',
      },
    ],
    tags: ['행정', '가정통신문', '학부모'],
  },
];
