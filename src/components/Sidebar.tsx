import React from 'react';
import { Home, BookOpen, Wrench, GraduationCap, CheckCircle2 } from 'lucide-react';
import { ViewType, Module } from '../types';
import { modules, lessons } from '../data/tutorialData';
import { motion } from 'motion/react';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  selectedModule: Module | null;
  onSelectModule: (module: Module | null) => void;
  completedLessons: string[];
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ currentView, onViewChange, selectedModule, onSelectModule, completedLessons, isOpen, onClose }: SidebarProps) {
  const totalLessons = lessons.length;
  const completedCount = completedLessons.filter(id => lessons.some(l => l.id === id)).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const menuItems = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'resources', label: '자료실', icon: BookOpen },
    { id: 'tools', label: '퀵툴', icon: Wrench },
    { id: 'tutorial', label: '튜토리얼', icon: GraduationCap },
  ] as const;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
          onClick={onClose}
        />
      )}
      <aside className={`w-64 h-screen bg-white border-r border-canva-border flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 pb-4 shrink-0">
        <h1 className="text-xl font-extrabold text-canva-teal tracking-tighter leading-tight">
          AI Bridge:<br/>Zero-Gap Toolkit
        </h1>
      </div>

      <nav className="flex-1 min-h-0 px-4 flex flex-col overflow-y-auto webkit-scrollbar-hide">
        <div className="space-y-2 shrink-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  onClose?.();
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-canva-bg text-canva-purple'
                    : 'text-canva-ink opacity-70 hover:opacity-100 hover:bg-canva-bg'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-canva-purple' : ''} />
                {item.label}
              </button>
            );
          })}
        </div>

        {currentView === 'tutorial' && (
          <div className="mt-4 border-t border-canva-border pt-4 shrink-0">
            <p className="text-[10px] font-bold text-canva-gray uppercase tracking-wider px-2 mb-2">모듈 이동</p>
            <div className="space-y-1">
              {modules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => {
                    onSelectModule(selectedModule?.id === mod.id ? null : mod);
                    onClose?.();
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-200 text-left ${
                    selectedModule?.id === mod.id
                      ? 'bg-canva-purple/10 text-canva-purple font-bold'
                      : 'text-canva-ink opacity-60 hover:opacity-100 hover:bg-canva-bg'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold flex-shrink-0 ${
                    selectedModule?.id === mod.id ? 'bg-canva-purple text-white' : 'bg-canva-border text-canva-gray'
                  }`}>
                    {mod.order}
                  </span>
                  <span className="truncate">{mod.title.replace(/^모듈 \d+: /, '')}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="p-6 mt-auto border-t border-canva-border flex flex-col gap-4 shrink-0">
        <div className="bg-canva-bg rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-canva-gray uppercase tracking-wider">학습 진도</span>
            <span className="text-xs font-bold text-canva-purple">{progressPercent}%</span>
          </div>
          <div className="w-full bg-canva-border rounded-full h-1.5 overflow-hidden">
            <div className="bg-canva-purple h-1.5 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
        <p className="text-[10px] text-canva-gray text-center leading-relaxed">
          이 프로그램은 Claude Code와 Google AI Studio로 제작되었습니다.
        </p>
      </div>
      </aside>
    </>
  );
}
