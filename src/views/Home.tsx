import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Wrench, GraduationCap, PlayCircle, Clock, CheckCircle } from 'lucide-react';
import { ViewType } from '../types';

interface HomeProps {
  onViewChange: (view: ViewType) => void;
}

export default function Home({ onViewChange }: HomeProps) {
  const parts = [
    {
      id: 'resources',
      title: '자료실',
      subtitle: '리소스 허브',
      description: 'AI 디지털 교재, 심의 서류 등 실무 자료를 즉시 활용하세요.',
      icon: BookOpen,
      iconBg: 'bg-[#ffe8e8]',
    },
    {
      id: 'tools',
      title: 'Quick Tools',
      subtitle: '즉시 활용 도구',
      description: '생기부 초안, 수업안 생성 등 지금 당장 쓸 수 있는 AI 도구 모음입니다.',
      icon: Wrench,
      iconBg: 'bg-[#e8f0fe]',
    },
    {
      id: 'tutorial',
      title: '튜토리얼',
      subtitle: '핵심 학습 경로',
      description: 'LLM 이해부터 윤리 점검까지, 초등교사를 위한 체계적인 로드맵입니다.',
      icon: GraduationCap,
      iconBg: 'bg-[#f3e8fd]',
    },
  ] as const;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 py-20 px-10 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold mb-8 tracking-tight">
            무엇을 배우고 싶으신가요?
          </h1>
          
          <div className="max-w-2xl mx-auto mb-12 relative">
            <div className="bg-white rounded-lg h-14 flex items-center px-6 shadow-xl">
              <span className="text-canva-gray text-sm font-medium">콘텐츠 또는 템플릿 검색</span>
            </div>
          </div>

          <div className="flex justify-center gap-10">
            {parts.map((part) => {
              const Icon = part.icon;
              return (
                <button 
                  key={part.id}
                  onClick={() => onViewChange(part.id as ViewType)}
                  className="flex flex-col items-center gap-3 group cursor-pointer"
                >
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 backdrop-blur-sm">
                    <Icon size={24} />
                  </div>
                  <span className="text-xs font-bold tracking-tight">{part.title}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Content Section */}
      <main className="p-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-canva-ink">AI Bridge: Zero-Gap Toolkit</h2>
          <button className="text-sm font-bold text-canva-purple hover:underline">모두 보기</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {parts.map((part, index) => {
            const Icon = part.icon;
            return (
              <motion.div
                key={part.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-xl border border-canva-border overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => onViewChange(part.id as ViewType)}
              >
                <div className={`h-40 ${part.iconBg} flex items-center justify-center transition-colors group-hover:opacity-90`}>
                  <Icon size={48} className="text-canva-ink opacity-20" />
                </div>
                <div className="p-6">
                  <h3 className="text-base font-bold mb-2 text-canva-ink">{part.title}</h3>
                  <p className="text-sm text-canva-gray leading-relaxed">{part.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
