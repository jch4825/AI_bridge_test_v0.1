import React, { useState } from 'react';
import { Home, BookOpen, Wrench, GraduationCap, CheckCircle2, Key, X } from 'lucide-react';
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
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  
  const hasApiKey = (() => {
    const key = localStorage.getItem('gemini-api-key');
    return !!(key && key.length > 10);
  })();

  const saveApiKey = () => {
    if (apiKeyInput.trim().length > 10) {
      localStorage.setItem('gemini-api-key', apiKeyInput.trim());
      setShowApiModal(false);
      setApiKeyInput('');
      window.location.reload();
    }
  };

  const totalLessons = lessons.length;
  const completedCount = completedLessons.filter(id => lessons.some(l => l.id === id)).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const menuItems = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'resources', label: '자료실', icon: BookOpen },
    { id: 'tools', label: 'AI 도구 모음', icon: Wrench },
    { id: 'tutorial', label: '인공지능 배워보기', icon: GraduationCap },
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
                  onViewChange(item.id as ViewType);
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
        <button
          onClick={() => setShowApiModal(true)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border transition-colors w-full ${
            hasApiKey
              ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
              : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <Key size={16} />
          {hasApiKey ? 'API 연결됨' : 'API 키 등록'}
        </button>
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

      {showApiModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">Gemini API 키 등록</h3>
              <button onClick={() => setShowApiModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-canva-purple font-bold hover:underline">Google AI Studio</a>에서 발급한 API 키를 입력하세요.<br />
              키는 브라우저에만 저장되며 서버로 전송되지 않습니다.
            </p>
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => {
                  window.location.href = '?lesson=l1-4';
                }}
                className="text-[11px] font-bold text-canva-purple bg-canva-purple/10 px-2.5 py-1 rounded hover:bg-canva-purple/20 transition-colors"
              >
                💡 API 등록 방법 안내
              </button>
            </div>
            <input
              type="password"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveApiKey()}
              placeholder="AIza..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono mb-4 focus:outline-none focus:ring-2 focus:ring-canva-purple/30"
              autoFocus
            />
            <button
              onClick={saveApiKey}
              disabled={apiKeyInput.trim().length <= 10}
              className="w-full py-3 bg-canva-purple text-white rounded-xl font-bold text-sm disabled:opacity-40 transition-opacity mb-3"
            >
              저장하기
            </button>
            {hasApiKey && (
              <>
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-500 mb-2">
                    공용 PC를 사용 중이라면 사용 후 키를 꼭 해제해 주세요.
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('저장된 API 키를 삭제하시겠습니까?\n브라우저에서 완전히 제거됩니다.')) {
                        localStorage.removeItem('gemini-api-key');
                        setShowApiModal(false);
                        window.location.reload();
                      }
                    }}
                    className="w-full py-2.5 border border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors"
                  >
                    API 연결 끊기
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
