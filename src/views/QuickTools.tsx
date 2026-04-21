import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { TOOLS, ToolDefinition } from '../tools/ToolRegistry';
import ToolPage from './ToolPage';
import SpeakButton from '../components/SpeakButton';

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
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setActiveTool(tool)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveTool(tool);
                  }
                }}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all text-left group cursor-pointer focus:outline-none focus:ring-2 focus:ring-canva-purple/40"
              >
                <div className={`h-28 bg-gradient-to-br ${tool.gradient} flex items-center justify-center`}>
                  <Icon size={40} className="text-white/90" />
                </div>
                <div className="p-4">
                  <p className="font-bold text-sm text-gray-900 leading-tight mb-1 group-hover:text-canva-purple transition-colors">
                    {tool.title}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed mb-2">{tool.description}</p>
                  <div onClick={e => e.stopPropagation()}>
                    <SpeakButton
                      text={`${tool.title}. ${tool.description}`}
                      label="설명 듣기"
                      stopPropagation
                    />
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
