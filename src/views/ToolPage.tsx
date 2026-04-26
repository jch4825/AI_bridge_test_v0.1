import React, { useState } from 'react';
import { ArrowLeft, Copy, FileText, Sparkles, BookCheck, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoogleGenAI } from '@google/genai';
import { ToolDefinition } from '../tools/ToolRegistry';
import { friendlyApiError } from '../utils/apiError';
import SpeakButton from '../components/SpeakButton';
import { getStandardPreview, formatStandardForPrompt } from '../utils/curriculumLookup';

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

  const buildUserMessage = () => {
    const lines = tool.inputs
      .map(input => {
        const val = values[input.id];
        if (!val) return null;
        const display = input.type === 'multiselect' ? val.split('|||').filter(Boolean).join(', ') : val;
        return `${input.label}: ${display}`;
      })
      .filter(Boolean);

    // enrichWith === 'curriculumStandard' 인 입력이 있고 매칭되면 공식 데이터 주입
    const enrichments: string[] = [];
    for (const input of tool.inputs) {
      if (input.enrichWith === 'curriculumStandard') {
        const result = getStandardPreview(values[input.id] || '');
        if (result.found) {
          enrichments.push(formatStandardForPrompt(result.standard));
        }
      }
    }

    return enrichments.length > 0
      ? lines.join('\n') + '\n\n---\n\n' + enrichments.join('\n\n')
      : lines.join('\n');
  };

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

    const apiKey = localStorage.getItem('gemini-api-key') || '';
    const userMessage = buildUserMessage();

    const startStream = async () => {
      const ai = new GoogleGenAI({ apiKey });
      return await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: tool.systemPrompt },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      });
    };

    // 신규 키 전파 지연 대응: API_KEY_INVALID만 1회 자동 재시도
    const isPropagationError = (e: any) => {
      const msg = (e?.message ?? '').toString();
      return /API_KEY_INVALID|API key expired|API key not valid|key expired/i.test(msg);
    };

    try {
      let response;
      try {
        response = await startStream();
      } catch (firstErr) {
        if (isPropagationError(firstErr)) {
          await new Promise(r => setTimeout(r, 1800));
          response = await startStream();
        } else {
          throw firstErr;
        }
      }

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
                <option value="">선택해 주세요</option>
                {input.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}

            {input.type === 'multiselect' && input.options && (
              (() => {
                const current = (values[input.id] || '').split('|||').filter(Boolean);
                const toggle = (v: string) => {
                  const next = current.includes(v) ? current.filter(x => x !== v) : [...current, v];
                  setValue(input.id, next.join('|||'));
                };
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {input.options.map(opt => {
                      const checked = current.includes(opt.value);
                      return (
                        <label
                          key={opt.value}
                          onClick={() => toggle(opt.value)}
                          className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                            checked
                              ? 'bg-canva-purple/5 border-canva-purple/50 text-canva-purple'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center text-[10px] flex-shrink-0 ${
                            checked ? 'bg-canva-purple border-canva-purple text-white' : 'border-gray-300 text-transparent'
                          }`}>✓</span>
                          <span className="text-sm leading-snug">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                );
              })()
            )}

            {input.hint && (
              <p className="mt-1.5 text-[11px] text-gray-400">{input.hint}</p>
            )}

            {input.enrichWith === 'curriculumStandard' && (() => {
              const result = getStandardPreview(values[input.id] || '');
              if (result.found) {
                const s = result.standard;
                return (
                  <div className="mt-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
                    <BookCheck size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-emerald-700 mb-0.5">
                        ✓ 인식됨 — {s.code} ({s.gradeGroup}학년 {s.subject} · {s.domain})
                      </div>
                      <div className="text-xs text-emerald-900 leading-snug">{s.title}</div>
                      <div className="text-[10px] text-emerald-700/70 mt-1">
                        호출 시 공식 성취기준 + A·B·C 수준별 평가 기준이 자동으로 함께 전송됩니다.
                      </div>
                    </div>
                  </div>
                );
              }
              // 코드처럼 보이지만 매칭 실패한 경우에만 경고 (자유 텍스트엔 표시 안 함)
              const raw = (values[input.id] || '').trim();
              const looksLikeCode = /\[?\s*\d+[가-힣]+\s*\d+\s*[-‒–—―−]\s*\d+\s*\]?/.test(raw);
              if (result.reason === 'invalid' && looksLikeCode) {
                return (
                  <div className="mt-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-[11px] text-amber-800 leading-snug">
                      코드로 인식되지 않습니다. 직접 기술한 성취기준으로 처리되며, 공식 평가 기준 자동 주입은 적용되지 않습니다.
                      <span className="block text-amber-700/70 mt-0.5">코드 형식 예: <code className="font-mono bg-amber-100 px-1 rounded">[6수01-07]</code>, <code className="font-mono bg-amber-100 px-1 rounded">[4국02-03]</code></span>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
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
