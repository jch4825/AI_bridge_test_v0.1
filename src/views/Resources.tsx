import React from 'react';
import { Construction } from 'lucide-react';

export default function Resources() {
  return (
    <div className="min-h-screen bg-canva-bg flex items-center justify-center p-10">
      <div className="max-w-md w-full text-center bg-white border border-canva-border rounded-2xl p-12 shadow-sm">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-canva-purple/10 flex items-center justify-center">
          <Construction size={28} className="text-canva-purple" />
        </div>
        <h1 className="text-2xl font-bold text-canva-ink mb-3">자료실은 준비 중입니다</h1>
        <p className="text-sm text-canva-gray leading-relaxed">
          더 알찬 자료를 정리해 곧 공개할 예정입니다.<br />
          그동안 <span className="font-semibold text-canva-ink">인공지능 배워보기</span> 모듈을 먼저 둘러봐 주세요.
        </p>
      </div>
    </div>
  );
}
