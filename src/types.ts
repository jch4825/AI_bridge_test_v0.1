export type ViewType = 'home' | 'resources' | 'tools' | 'tutorial';

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'AI 교재' | '심의 서류' | '정책 자료' | '기타';
  tags: string[];
  url: string;
  type: 'pdf' | 'link' | 'hwp' | 'ppt';
  updatedAt: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  target: string;
  estimatedTime: string;
  icon: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessonsCount: number;
  estimatedTime: string;
  order: number;
}
