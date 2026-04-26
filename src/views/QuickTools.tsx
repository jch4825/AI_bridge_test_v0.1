import React, { useState } from 'react';
import { Search, Zap, ExternalLink, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';
import { TOOLS, ToolDefinition } from '../tools/ToolRegistry';
import ToolPage from './ToolPage';
import SpeakButton from '../components/SpeakButton';
import { getTheme, moduleIdFromLesson } from '../utils/moduleThemes';
import { lessons as allLessons } from '../data/tutorialData';

// 한 도구가 여러 레슨에 등장할 때, 모듈 단위로 묶어서 라벨 생성
function lessonsToModuleLabels(lessonIds: string[]): { moduleId: string; label: string }[] {
  const byModule = new Map<string, string[]>();
  for (const id of lessonIds) {
    const m = moduleIdFromLesson(id);
    if (!byModule.has(m)) byModule.set(m, []);
    byModule.get(m)!.push(id);
  }
  return Array.from(byModule.entries()).map(([moduleId, ids]) => {
    const nums = ids
      .map(id => id.replace('l', '').replace('-', '.'))
      .sort();
    return { moduleId, label: `모듈 ${nums.join(', ')}` };
  });
}

export default function QuickTools() {
  const [query, setQuery] = useState('');
  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);

  if (activeTool) {
    return <ToolPage tool={activeTool} onBack={() => setActiveTool(null)} />;
  }

  const filtered = TOOLS.filter(t =>
    query === '' ||
    t.title.includes(query) ||
    t.description.includes(query) ||
    t.tags.some(tag => tag.includes(query))
  );

  const handleOpen = (tool: ToolDefinition) => {
    if (tool.kind === 'external' && tool.externalUrl) {
      window.open(tool.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setActiveTool(tool);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">AI 도구 모음</h1>
        <p className="text-sm text-gray-500">입력하고 버튼 누르면 끝. 결과는 구글 Docs로 바로 이동.</p>
      </div>

      <div className="relative mb-8">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="도구 검색..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-canva-purple/30 bg-white"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          "{query}"에 해당하는 도구가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((tool, i) => {
            const Icon = tool.icon;
            const isExternal = tool.kind === 'external';
            const moduleLabels = tool.usedInLessons && tool.usedInLessons.length > 0
              ? lessonsToModuleLabels(tool.usedInLessons)
              : [];

            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleOpen(tool)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpen(tool);
                  }
                }}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all text-left group cursor-pointer focus:outline-none focus:ring-2 focus:ring-canva-purple/40 flex flex-col"
              >
                {/* Header — 종류에 따라 다른 시각 처리 */}
                {isExternal ? (
                  // 외부 도구: 흰색/옅은 헤더 + 우상단 ↗ 외부 링크 표시
                  <div className="relative h-28 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-b border-gray-100">
                    <Icon size={36} className="text-gray-500" strokeWidth={1.5} />
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[9px] font-bold text-gray-600">
                      <ExternalLink size={9} /> 외부
                    </span>
                  </div>
                ) : (
                  // API 도구: 풀 그라데이션 헤더 + 우상단 ⚡ API 표시
                  <div className={`relative h-28 bg-gradient-to-br ${tool.gradient} flex items-center justify-center`}>
                    <Icon size={40} className="text-white/90" />
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 text-[9px] font-bold text-white">
                      <Zap size={9} /> API
                    </span>
                  </div>
                )}

                <div className="p-4 flex-1 flex flex-col">
                  <p className={`font-bold text-sm leading-tight mb-1 transition-colors ${isExternal ? 'text-gray-900 group-hover:text-gray-700' : 'text-gray-900 group-hover:text-canva-purple'}`}>
                    {tool.title}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed mb-2">{tool.description}</p>

                  {isExternal && tool.hostLabel && (
                    <p className="text-[10px] text-gray-400 font-mono mb-2 truncate">
                      ↗ {tool.hostLabel}
                    </p>
                  )}

                  <div className="mt-auto flex flex-col gap-2">
                    {/* 배워보기 등장 메달 (작은 outline pill) */}
                    {moduleLabels.length > 0 && (
                      <div className="flex flex-wrap gap-1" onClick={e => e.stopPropagation()}>
                        {moduleLabels.map(({ moduleId, label }) => {
                          const theme = getTheme(moduleId);
                          const firstLesson = tool.usedInLessons?.find(id => moduleIdFromLesson(id) === moduleId);
                          return (
                            <a
                              key={moduleId}
                              href={firstLesson && allLessons.find(l => l.id === firstLesson) ? `?lesson=${firstLesson}` : undefined}
                              onClick={e => {
                                if (!firstLesson) return;
                                e.preventDefault();
                                window.location.search = `?lesson=${firstLesson}`;
                              }}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border bg-white text-[9px] font-bold transition-colors hover:opacity-80"
                              style={{ borderColor: theme.accent + '66', color: theme.accent }}
                              title="배워보기에서 사용된 도구입니다. 클릭하면 해당 레슨으로 이동합니다."
                            >
                              <GraduationCap size={9} />
                              {label}
                            </a>
                          );
                        })}
                      </div>
                    )}

                    <div onClick={e => e.stopPropagation()}>
                      <SpeakButton
                        text={`${tool.title}. ${tool.description}`}
                        label="설명 듣기"
                        stopPropagation
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
