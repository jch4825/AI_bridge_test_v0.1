import { Module, Resource, Tool } from '../types';

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  estimatedMinutes: number;
  order: number;
  relatedToolId?: string;
  interactive?: {
    prompt: string;
    initialInput: string;
    answer: string;
    answers?: Record<string, string>;
  };
}

export const modules: Module[] = [
  {
    id: 'm1',
    title: '모듈 1: LLM 기초 이해',
    description: 'AI가 어떻게 작동하는지 기술적 용어 없이 이해합니다.',
    lessonsCount: 5,
    estimatedTime: '약 22분',
    order: 1,
  },
  {
    id: 'm2',
    title: '모듈 2: 프롬프트 활용',
    description: 'AI에게 잘 지시하는 법을 익히고 좋은 프롬프트를 만듭니다.',
    lessonsCount: 4,
    estimatedTime: '약 80분',
    order: 2,
  },
  {
    id: 'm3',
    title: '모듈 3: 수업 적용',
    description: '수업 준비 및 교수·학습 자료 제작에 실제로 활용합니다.',
    lessonsCount: 3,
    estimatedTime: '약 60분',
    order: 3,
  },
  {
    id: 'm4',
    title: '모듈 4: 행정 적용',
    description: '생기부, 가정통신문 등 행정 업무 효율화 방법을 익힙니다.',
    lessonsCount: 3,
    estimatedTime: '약 60분',
    order: 4,
  },
  {
    id: 'm5',
    title: '모듈 5: 개인화 & 윤리',
    description: '나만의 AI 활용 기준을 수립하고 윤리적 역량을 갖춥니다.',
    lessonsCount: 4,
    estimatedTime: '약 80분',
    order: 5,
  },
];

export const lessons: Lesson[] = [
  {
    id: 'l1-1',
    moduleId: 'm1',
    title: '1-1. AI는 어떻게 글을 쓸까?',
    content: `
      ## AI는 마법이 아닌 '예측 도구'입니다
      
      많은 분들이 AI가 사람처럼 생각하고 글을 쓴다고 오해하곤 합니다. 
      하지만 기술적으로 보면 AI(특히 LLM)는 
      **'다음에 올 가장 확률 높은 단어를 맞히는 게임'**
      을 하고 있는 것과 같습니다.
      
      ### 자동완성 비유
      스마트폰에서 문자를 보낼 때 다음에 올 단어를 추천해주는 기능을 보신 적 있죠? 
      - "오늘 점심 뭐..." -> "먹을까?"
      - "내일 학교..." -> "가야지"
      
      AI는 이 과정을 수천억 번 반복하며 학습한 거대한 자동완성 기계라고 생각하면 쉽습니다.
    `,
    estimatedMinutes: 2,
    order: 1,
    interactive: {
      prompt: "다음의 문장을 써보세요.",
      initialInput: "너는 어떻게 문장을 완성하니?",
      answer: "AI는 수많은 데이터를 학습하여, 입력된 문장 뒤에 올 가장 확률이 높은 단어를 순차적으로 예측하여 문장을 완성합니다. 마치 아주 똑똑한 '자동완성' 기능과 같죠!"
    }
  },
  {
    id: 'l1-2',
    moduleId: 'm1',
    title: '1-2. 인공지능 삼대장(ChatGPT, Claude, Gemini)',
    content: `
      ## 주요 AI 모델 비교
      
      현재 교육 현장에서 가장 많이 활용되는 삼대장 AI 모델들의 핵심 특징을 알아봅시다.
      
      ### 1) ChatGPT (OpenAI)
      - **특징:** 가장 유명하며, 창의적인 글쓰기와 아이디어 생성에 뛰어납니다.
      - **강점:** 방대한 플러그인과 데이터 분석 능력.
      
      ### 2) Claude (Anthropic)
      - **특징:** 인간과 유사한 자연스러운 문체와 긴 문서를 요약하는 능력이 탁월합니다.
      - **강점:** 가이드라인 준수 능력이 좋아 생기부 작성 등에 유리합니다.
      
      ### 3) Gemini (Google)
      - **특징:** 구글 문서, 스프레드시트 등 구글 생태계와의 연동성이 매우 강력합니다.
      - **강점:** 실시간 정보 검색 및 멀티모달(이미지, 영상 분석) 성능이 우수합니다.

      ---
      * **플러그인(Plugin):** AI의 기본 기능에 추가적인 도구
          (웹 검색, 데이터 분석 등)를 연결하여 능력을 확장하는 기능입니다.
      * **멀티모달(Multimodal):** 텍스트뿐만 아니라 이미지, 음성, 영상 등 
          다양한 형태의 데이터를 동시에 이해하고 처리할 수 있는 능력입니다.
    `,
    estimatedMinutes: 5,
    order: 2,
    interactive: {
      prompt: "궁금한 AI의 이름을 입력해보세요 (ChatGPT, Claude, Gemini).",
      initialInput: "ChatGPT, Claude, 또는 Gemini",
      answer: "입력하신 AI에 대한 상세 설명을 출력합니다.",
      answers: {
        "ChatGPT": "ChatGPT는 OpenAI에서 개발한 모델로, 교육용 아이디어 뱅크 역할을 톡톡히 합니다. 수업 놀이 기획, 복잡한 개념을 초등학생 수준으로 설명하기 등에 최적화되어 있습니다. 또한, 마이크로소프트의 Copilot(또는 Bing Chat)이란 이름으로도 서비스되고 있어 윈도우나 엣지 브라우저에서 쉽게 만나볼 수 있습니다.\n\n🔗 [ChatGPT 바로가기](https://chatgpt.com)",
        "Claude": "Claude는 Anthropic에서 개발한 AI로, '헌법적 AI' 원칙에 따라 설계되었습니다. 특히 한국어 문장이 자연스러워 학생들의 글쓰기 지도나 교사의 행정 업무 문구 다듬기에 가장 추천됩니다. 또한 MCP, Skill 등 유용한 기능이 많아 2026년 현재 인공지능 업계의 선두주자로 각광받고 있으며, 우수한 코딩 능력으로도 많은 사랑을 받고 있습니다.\n\n🔗 [Claude 바로가기](https://claude.ai)",
        "Gemini": "Gemini는 구글의 최신 AI 모델입니다. 구글 계정만 있다면 학교에서 사용하는 구글 문서나 프레젠테이션에서 바로 AI의 도움을 받을 수 있다는 점이 최대 장점입니다. 최신 뉴스를 검색하여 수업 자료에 반영하거나, 유튜브 영상을 요약하여 학습지를 만드는 데 매우 유용합니다.\n\n🔗 [Gemini 바로가기](https://gemini.google.com)"
      }
    }
  },
  {
    id: 'l1-3',
    moduleId: 'm1',
    title: '1-3. 내 요구에 맞는 모델 선택하기',
    content: `
      ## 상황에 맞는 '체급' 선택이 핵심입니다
      
      모든 AI 모델은 성능과 속도에 따라 여러 가지 '체급'으로 나뉩니다. 무조건 가장 똑똑한 모델을 쓰는 것이 항상 정답은 아닙니다.
      
      ### 1) 주요 모델별 라인업
      
      | 제조사 | 빠른 모델 (경량) | 표준/고성능 모델 | 사고/추론 모델 |
      | :--- | :--- | :--- | :--- |
      | **ChatGPT** | GPT-4o mini (Instant) | GPT-4o | o1, o3 (Thinking) |
      | **Gemini** | Gemini Flash (빠른 모델) | Gemini Pro | Gemini Ultra / Thinking |
      | **Claude** | Claude Haiku | Claude Sonnet | Claude Opus |
      
      ### 2) 체급별 장단점 비교
      
      #### ⚡ 빠른 모델 (Haiku, Flash, Mini)
      - **장점:** 답변 속도가 매우 빠르고 토큰 소모량이 적어 경제적입니다.
      - **단점:** 복잡한 논리 구조나 깊이 있는 분석에는 한계가 있습니다.
      - **추천:** 단순 요약, 이메일 초안 작성, 간단한 문구 수정.
      
      #### 🧠 표준/고성능 모델 (Sonnet, Pro, 4o)
      - **장점:** 성능과 속도의 균형이 가장 좋습니다. 대부분의 교육 업무에 최적입니다.
      - **단점:** 빠른 모델보다는 느리고 토큰 사용량이 중간 정도입니다.
      - **추천:** 수업안 설계, 복잡한 문서 분석, 생기부 초안 작성.
      
      #### 🧐 사고/추론 모델 (Opus, o1, Thinking)
      - **장점:** 인간처럼 깊게 '생각'한 뒤 답변합니다. 수학, 코딩, 고도의 논리 문제에 강합니다.
      - **단점:** 답변이 나올 때까지 시간이 오래 걸리며 토큰 소모가 매우 큽니다.
      - **추천:** 어려운 수학 문제 풀이, 복잡한 프로그래밍, 정교한 교육 과정 재구성.
    `,
    estimatedMinutes: 5,
    order: 3,
    interactive: {
      prompt: "궁금한 모델을 클릭하여 상세 추천 상황을 확인해보세요. (2026년 4월 기준)",
      initialInput: "ChatGPT | Gemini | Claude",
      answer: "모델을 선택하면 추천 상황이 나타납니다.",
      answers: {
        "ChatGPT": "### 🤖 ChatGPT 추천 상황\n\n*   **GPT-4o mini (Instant):** 학생들의 짧은 글 피드백, 단순 오타 교정, 대량의 텍스트 빠른 분류.\n*   **GPT-4o:** 수업 놀이 기획, 창의적인 발문 생성, 복잡한 교육 자료 분석.\n*   **o1/o3 (Thinking):** 고난도 수학 문제 풀이 가이드 제작, 복잡한 엑셀 수식 설계, 논리적 오류 검증.",
        "Gemini": "### ♊ Gemini 추천 상황\n\n*   **Flash (빠른 모델):** 구글 문서 요약, 유튜브 영상 내용 퀵 파악, 실시간 뉴스 검색 기반 자료 제작.\n*   **Pro:** 구글 워크스페이스(문서, 시트) 연동 작업, 멀티모달(이미지/표 분석) 수업 자료 제작.\n*   **Ultra/Thinking:** 방대한 양의 연구 자료 분석, 고도의 창의적 프로젝트 기획.",
        "Claude": "### 🎨 Claude 추천 상황\n\n*   **Haiku:** 자연스러운 문구 다듬기, 짧은 알림장 문구 생성, 간단한 코드 수정.\n*   **Sonnet:** **(가장 추천)** 생기부 초안 작성, 학생 상담 일지 정리, 자연스러운 한국어 보고서 작성.\n*   **Opus:** 깊이 있는 문학 작품 분석, 철학적 토론 가이드 제작, 매우 복잡한 데이터 구조화."
      }
    }
  },
  {
    id: 'l1-4',
    moduleId: 'm1',
    title: '1-4. [중요] 여러분의 API가 필요합니다',
    content: `
      ## API란 무엇일까요?
      
      **API(Application Programming Interface)**는 
      서로 다른 소프트웨어가 대화할 수 있게 해주는 '연결 통로'입니다. 
      우리가 식당에서 메뉴판을 보고 주문을 하면 주방에서 음식이 나오듯, 
      우리가 만든 앱이 AI 모델(주방)에게 요청을 보내고 답변을 받기 위해 
      필요한 주문서와 같습니다.
      
      ### Gemini API 키 획득 방법
      
      이 튜토리얼에서 제공하는 도구들을 실제로 사용해 보려면 여러분만의 **API 키**가 필요합니다.
      
      1) [Google AI Studio](https://aistudio.google.com/)에 접속합니다.
      2) 왼쪽 메뉴에서 **'Get API key'** 버튼을 클릭합니다.
      3) **'Create API key'**를 눌러 키를 생성합니다.
      4) 생성된 키(예: AIza...)를 복사하여 안전한 곳에 보관하세요.
      
      > **참고:** 구글의 Gemini API는 현재 일정 한도 내에서 **무료**로 사용할 수 있는 티어를 제공하고 있어 교육용으로 활용하기 매우 좋습니다.
    `,
    estimatedMinutes: 5,
    order: 4,
    interactive: {
      prompt: "여러분의 API 키를 입력해 주세요.",
      initialInput: "AIza...",
      answer: "여러분이 입력해주신 API키를 기반으로 향후 인공지능 활용 튜토리얼을 구동하게 될 것입니다. API 키는 인공지능 서비스를 이용하기 위한 '개인 열쇠'와 같습니다.",
      answers: {
        "default": "⚠️ **보안 주의사항**\n\n인공지능 서비스는 API 키를 통해 사용량을 측정하고 요금을 부과합니다. 따라서 이 키 값을 **절대로 타인에게 노출하거나 공개된 게시판에 올리면 안 됩니다.**\n\n키가 유출되면 타인이 여러분의 권한으로 AI를 사용하고 비용을 발생시킬 수 있으므로, 마치 은행 비밀번호처럼 소중히 관리해 주세요!"
      }
    }
  },
  {
    id: 'l1-5',
    moduleId: 'm1',
    title: '1-5. 인공지능과 시범 대화 해보기',
    content: `
      ## 직접 대화해 봅시다!
      
      이제 여러분이 발급받은 API 키를 사용하여 실제 인공지능(Gemini)과 대화를 나눠볼 시간입니다.
      
      ### 실습 방법
      1) 오른쪽 '문제 입력' 칸에 궁금한 점이나 하고 싶은 말을 자유롭게 입력하세요.
      2) '실행' 버튼을 누르면 여러분의 API 키를 통해 구글의 Gemini 모델이 답변을 생성합니다.
      
      > **알림:** 만약 1-4 단계에서 API 키를 입력하지 않았거나 잘못된 키를 입력했다면, 시스템이 준비한 기본(Default) 답변이 출력됩니다.
    `,
    estimatedMinutes: 5,
    order: 5,
    interactive: {
      prompt: "아무런 질문이나 작성해 보세요.",
      initialInput: "",
      answer: "" 
    }
  },
  // ... 더 많은 레슨 데이터가 필요하지만 일단 예시로 2개만 넣습니다.
];
