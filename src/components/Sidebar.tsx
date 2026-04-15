import React from 'react';
import { Home, BookOpen, Wrench, GraduationCap, CheckCircle2, Circle } from 'lucide-react';
import { ViewType } from '../types';
import { motion } from 'motion/react';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'resources', label: '자료실', icon: BookOpen },
    { id: 'tools', label: '퀵툴', icon: Wrench },
    { id: 'tutorial', label: '튜토리얼', icon: GraduationCap },
  ] as const;

  return (
    <aside className="w-64 h-screen bg-white border-r border-canva-border flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8">
        <h1 className="text-xl font-extrabold text-canva-teal tracking-tighter leading-tight">
          AI Bridge:<br/>Zero-Gap Toolkit
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
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
      </nav>

      <div className="p-6 mt-auto border-t border-canva-border">
        <div className="bg-canva-bg rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-canva-gray uppercase tracking-wider">학습 진도</span>
            <span className="text-xs font-bold text-canva-purple">25%</span>
          </div>
          <div className="w-full bg-canva-border rounded-full h-1.5 overflow-hidden">
            <div className="bg-canva-purple h-1.5 rounded-full w-1/4"></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
