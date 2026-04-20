import React, { useEffect, useRef, useState } from 'react';
import { Type, GripVertical } from 'lucide-react';
import { FontScale, applyFontScale, loadFontScale } from '../utils/a11y';

type Pos = { x: number; y: number };

const POS_KEY = 'ai-bridge-widget-pos';

function loadPos(): Pos | null {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') return parsed;
  } catch {}
  return null;
}

function clampToViewport(p: Pos, w: number, h: number): Pos {
  const maxX = Math.max(0, window.innerWidth - w - 4);
  const maxY = Math.max(0, window.innerHeight - h - 4);
  return {
    x: Math.min(Math.max(4, p.x), maxX),
    y: Math.min(Math.max(4, p.y), maxY),
  };
}

export default function AccessibilityWidget() {
  const [scale, setScale] = useState<FontScale>(() => loadFontScale());
  const [pos, setPos] = useState<Pos | null>(() => loadPos());
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);

  useEffect(() => {
    applyFontScale(scale);
  }, [scale]);

  useEffect(() => {
    const onResize = () => {
      if (!pos || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setPos(clampToViewport(pos, rect.width, rect.height));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [pos]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      if (!dragStart.current || !ref.current) return;
      const dx = e.clientX - dragStart.current.pointerX;
      const dy = e.clientY - dragStart.current.pointerY;
      const rect = ref.current.getBoundingClientRect();
      const next = clampToViewport(
        { x: dragStart.current.x + dx, y: dragStart.current.y + dy },
        rect.width,
        rect.height,
      );
      setPos(next);
    };
    const onUp = () => {
      setDragging(false);
      dragStart.current = null;
      try {
        if (pos) localStorage.setItem(POS_KEY, JSON.stringify(pos));
      } catch {}
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragging, pos]);

  const handleDragStart = (e: React.PointerEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const startPos = pos ?? { x: rect.left, y: rect.top };
    dragStart.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      x: startPos.x,
      y: startPos.y,
    };
    setPos(startPos);
    setDragging(true);
    e.preventDefault();
  };

  const options: { value: FontScale; label: string; size: string }[] = [
    { value: 'normal', label: '보통', size: 'text-xs' },
    { value: 'large', label: '크게', size: 'text-sm' },
    { value: 'xlarge', label: '더 크게', size: 'text-base' },
  ];

  const style: React.CSSProperties = pos
    ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' }
    : { right: 16, bottom: 16 };

  return (
    <div
      ref={ref}
      style={style}
      className={`fixed z-[100] bg-white border border-gray-200 rounded-full shadow-lg pl-1 pr-3 py-2 flex items-center gap-2 select-none ${
        dragging ? 'cursor-grabbing shadow-2xl' : ''
      }`}
    >
      <button
        onPointerDown={handleDragStart}
        aria-label="위젯 이동 (드래그)"
        title="드래그해서 위치 이동"
        className={`flex items-center px-1 py-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <GripVertical size={14} />
      </button>
      <Type size={16} className="text-gray-500" aria-hidden />
      <span className="text-xs text-gray-500 font-medium hidden sm:inline">글자 크기</span>
      <div className="flex items-center gap-1" role="group" aria-label="글자 크기 조절">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => setScale(opt.value)}
            aria-pressed={scale === opt.value}
            className={`${opt.size} px-2 py-1 rounded-full font-bold transition-colors ${
              scale === opt.value
                ? 'bg-canva-purple text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
