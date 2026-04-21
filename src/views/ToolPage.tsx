import React, { useState } from 'react';
import { ArrowLeft, Copy, FileText, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoogleGenAI } from '@google/genai';
import { ToolDefinition } from '../tools/ToolRegistry';
import { friendlyApiError } from '../utils/apiError';
import SpeakButton from '../components/SpeakButton';

interface ToolPageProps {
  tool: ToolDefinition;
  onBack: () => void;
}

export default function ToolPage({ tool, onBack }: ToolPageProps) {
  const Icon = tool.icon;
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(tool.inputs.map(i => [i.id, i.options?.[0]?.value ?? '']))
  );
  const [result, setResult] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const setValue = (id: string, val: string) =>
    setValues(prev => ({ ...prev, [id]: val }));

  const buildUserMessage = () =>
    tool.inputs
      .map(input => {
        const val = values[input.id];
        if (!val) return null;
        return `${input.label}: ${val}`;
      })
      .filter(Boolean)
      .join('\n');

  const hasApiKey = (() => {
    const key = localStorage.getItem('gemini-api-key');
    return !!(key && key.length > 10);
  })();

  const handleRun = async () => {
    if (!hasApiKey) {
      alert('API 키가 없습니다. 좌측 메뉴 하단의 "API 키 등록" 버튼을 눌러 먼저 등록해주세요.');
      return;
    }
    const required = tool.inputs.filter(i => i.required);
    const missing = required.find(i => !values[i.id]?.trim());
    if (missing) {
      alert(`"${missing.label}" 항목을 입력해주세요.`);
      return;
    }

    setIsRunning(true);
    setResult('');

    try {
      const apiKey = localStorage.getItem('gemini-api-key') || '';
      const ai = new GoogleGenAI({ apiKey });
      const userMessage = buildUserMessage();
      const response = await ai.models.generateContentStream({
        model: 'gemini-2.0-flash',
        config: { systemInstruction: tool.systemPrompt },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      });

      let full = '';
      for await (const chunk of response) {
        full += chunk.text ?? '';
        setResult(full);
      }
    } catch (e: any) {
      setResult(friendlyApiError(e, { markdown: true }));
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportDocs = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      window.open('https://docs.new', '_blank');
    } catch {
      alert('클립보드 복사에 실패했습니다. 수동으로 텍스트를 복사해주세요.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={16} /> 도구 목록으로
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shrink-0`}>
          <Icon size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{tool.title}</h1>
          <p className="text-sm text-gray-500">{tool.description}</p>
        </div>
        <SpeakButton text={`${tool.title}. ${tool.description}`} label="도구 설명 듣기" />
      </div>

      {!hasApiKey && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6 text-sm text-red-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold mb-1">API 키가 등록되지 않았습니다.</p>
            <p className="text-xs opacity-90">AI 도구 모음을 사용하려면 좌측 하단의 'API 키 등록' 버튼을 통해 키를 먼저 입력해주세요.</p>
          </div>
          <button 
            onClick={() => window.location.href = '?lesson=l1-4'}
            className="text-xs bg-red-100 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-bold whitespace-nowrap"
          >
            등록 방법 알아보기
          </button>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-xs text-amber-700 space-y-1">
        <p>⚠️ <strong>개인 정보를 입력하지 마세요.</strong></p>
        <p>🔍 인공지능은 실수를 합니다. 내용을 꼭 확인해 주세요.</p>
      </div>

      <div className="space-y-5 mb-6">
        {tool.inputs.map(input => (
          <div key={input.id}>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {input.label}
              {input.required && <span className="text-red-400 ml-1">*</span>}
            </label>

            {input.type === 'textarea' && (
              <textarea
                value={values[input.id]}
                onChange={e => setValue(input.id, e.target.value)}
                placeholder={input.placeholder}
                rows={input.rows ?? 3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-canva-purple/30 bg-white"
              />
            )}

            {input.type === 'text' && (
              <input
                type="text"
                value={values[input.id]}
                onChange={e => setValue(input.id, e.target.value)}
                placeholder={input.placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-canva-purple/30 bg-white"
              />
            )}

            {input.type === 'number' && (
              <input
                type="number"
                value={values[input.id]}
                onChange={e => setValue(input.id, e.target.value)}
                placeholder={input.placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-canva-purple/30 bg-white"
              />
            )}

            {input.type === 'select' && input.options && (
              <select
                value={values[input.id]}
                onChange={e => setValue(input.id, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-canva-purple/30 bg-white"
              >
                {input.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleRun}
        disabled={isRunning || !hasApiKey}
        className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
          !hasApiKey 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : `bg-gradient-to-r ${tool.gradient} text-white disabled:opacity-60`
        }`}
      >
        {isRunning ? (
          <>
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            생성 중...
          </>
        ) : !hasApiKey ? (
          <>
            <Sparkles size={18} />
            API 키 등록 후 사용 가능
          </>
        ) : (
          <>
            <Sparkles size={18} />
            생성하기
          </>
        )}
      </button>

      {(result || isRunning) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-700">결과</span>
            {result && !isRunning && (
              <div className="flex gap-2">
                <SpeakButton text={result} label="결과 읽어주기" />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                >
                  <Copy size={13} />
                  {copied ? '복사됨!' : '복사'}
                </button>
                <button
                  onClick={handleExportDocs}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
                >
                  <FileText size={13} />
                  구글 Docs로
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-sm text-gray-800 leading-relaxed markdown-container">
            {result ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <span className="w-2 h-2 bg-canva-purple rounded-full animate-pulse" />
                생성 중...
              </div>
            )}
            {isRunning && result && (
              <span className="inline-block w-1.5 h-4 bg-canva-purple ml-1 animate-pulse" />
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
