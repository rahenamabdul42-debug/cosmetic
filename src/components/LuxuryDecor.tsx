import React from 'react';

export function GoldDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF70]/45 to-[#D4AF70]/85" />
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#D4AF70] shrink-0">
        <path
          d="M12 2C12.9 7.2 16.8 11.1 22 12C16.8 12.9 12.9 16.8 12 22C11.1 16.8 7.2 12.9 2 12C7.2 11.1 11.1 7.2 12 2Z"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="#D4AF70"
          fillOpacity="0.28"
        />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#D4AF70]/45 to-[#D4AF70]/85" />
    </div>
  );
}

export function BotanicalFlourish({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 60"
      fill="none"
      className={`text-[#D4AF70]/70 pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <path
        d="M10 45C42 42 66 20 90 12C114 20 138 42 170 45"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M90 12C84 26 86 42 90 54C94 42 96 26 90 12Z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M65 27C74 22 83 24 88 33C79 34 70 33 65 27Z"
        stroke="#E8A1B2"
        strokeWidth="0.9"
      />
      <path
        d="M115 27C106 22 97 24 92 33C101 34 110 33 115 27Z"
        stroke="#E8A1B2"
        strokeWidth="0.9"
      />
    </svg>
  );
}

export function FloatingGoldenSparkles() {
  const motes = [
    { left: '8%', top: '18%', delay: '0s', size: 11, color: '#D4AF70' },
    { left: '22%', top: '64%', delay: '1.2s', size: 8, color: '#E8A1B2' },
    { left: '46%', top: '14%', delay: '2.4s', size: 10, color: '#D4AF70' },
    { left: '74%', top: '26%', delay: '0.7s', size: 12, color: '#D4AF70' },
    { left: '88%', top: '68%', delay: '1.9s', size: 9, color: '#F4C6D0' },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {motes.map((m, i) => (
        <svg
          key={i}
          style={{ left: m.left, top: m.top, animationDelay: m.delay, color: m.color }}
          width={m.size}
          height={m.size}
          viewBox="0 0 24 24"
          fill="none"
          className="absolute animate-sparkle-slow"
        >
          <path
            d="M12 1L14.3 9.7L23 12L14.3 14.3L12 23L9.7 14.3L1 12L9.7 9.7L12 1Z"
            fill="currentColor"
            fillOpacity="0.8"
          />
        </svg>
      ))}
    </div>
  );
}
