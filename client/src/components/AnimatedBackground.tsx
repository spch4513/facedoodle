import { useMemo } from 'react';

const DOODLES = [
  // squiggle
  <path key="s" d="M5 30 C 15 5, 25 55, 35 30 S 55 5, 65 30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />,
  // bat
  <path key="b" d="M35 22 Q25 8 5 12 Q14 20 12 30 Q24 22 35 32 Q46 22 58 30 Q56 20 65 12 Q45 8 35 22Z" fill="currentColor" />,
  // horns
  <path key="h" d="M10 40 Q5 15 20 5 Q18 25 28 40Z M60 40 Q65 15 50 5 Q52 25 42 40Z" fill="currentColor" />,
  // star
  <path key="st" d="M35 5 L43 27 L66 27 L47 41 L54 63 L35 50 L16 63 L23 41 L4 27 L27 27Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />,
  // spiral
  <path key="sp" d="M35 35 m0 0 a4 4 0 1 1 8 0 a8 8 0 1 1 -16 0 a12 12 0 1 1 24 0 a16 16 0 1 1 -32 0" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />,
  // pitchfork
  <path key="p" d="M35 65 V20 M22 8 V20 Q35 32 48 20 V8 M35 5 V20" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />,
  // x_x
  <path key="x" d="M8 15 L25 32 M25 15 L8 32 M45 15 L62 32 M62 15 L45 32 M20 52 Q35 44 50 52" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />,
];

export function AnimatedBackground() {
  const items = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 30 + Math.random() * 50,
        delay: -Math.random() * 6,
        dur: 5 + Math.random() * 6,
        rot: Math.random() * 360,
        red: Math.random() > 0.6,
      })),
    [],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {items.map((d) => (
        <svg
          key={d.i}
          viewBox="0 0 70 70"
          className={`absolute animate-float ${d.red ? 'text-blood/25' : 'text-ink/10'}`}
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
            rotate: `${d.rot}deg`,
          }}
        >
          {DOODLES[d.i % DOODLES.length]}
        </svg>
      ))}
    </div>
  );
}
