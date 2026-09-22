import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Check, RotateCcw, ScanFace, Undo2 } from 'lucide-react';
import type { ManualAnchors } from '../lib/faceLandmarks';
import type { Point } from '../types';

const STEPS: { key: keyof ManualAnchors; label: string; hint: string; emoji: string }[] = [
  { key: 'leftEye', label: 'Left eye', hint: 'the eye on the LEFT side of the picture', emoji: '👁️' },
  { key: 'rightEye', label: 'Right eye', hint: 'the other one (hopefully there are two)', emoji: '👁️' },
  { key: 'mouth', label: 'Mouth', hint: 'the hole where snacks go', emoji: '👄' },
  { key: 'forehead', label: 'Forehead', hint: 'top of the face, just below the hairline', emoji: '🧠' },
];

interface Props {
  image: HTMLCanvasElement;
  reason: string;
  onDone(a: ManualAnchors): void;
  onCancel(): void;
}

export function ManualAnchorOverlay({ image, reason, onDone, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pts, setPts] = useState<Point[]>([]);

  useEffect(() => {
    const c = canvasRef.current!;
    c.width = image.width;
    c.height = image.height;
    const g = c.getContext('2d')!;
    g.drawImage(image, 0, 0);
    const r = Math.max(8, image.width * 0.012);
    pts.forEach((p, i) => {
      g.fillStyle = '#e63946';
      g.strokeStyle = '#fff';
      g.lineWidth = r * 0.35;
      g.beginPath();
      g.arc(p.x, p.y, r, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.fillStyle = '#fff';
      g.font = `bold ${r * 1.2}px system-ui`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(String(i + 1), p.x, p.y + 1);
    });
  }, [image, pts]);

  const tap = (e: PointerEvent<HTMLCanvasElement>) => {
    if (pts.length >= STEPS.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const p = {
      x: ((e.clientX - rect.left) / rect.width) * image.width,
      y: ((e.clientY - rect.top) / rect.height) * image.height,
    };
    setPts((old) => [...old, p]);
  };

  const step = STEPS[pts.length];
  const done = pts.length === STEPS.length;

  return (
    <div className="flex min-h-screen flex-col items-center gap-4 px-4 py-6">
      <div className="panel w-full max-w-2xl text-center">
        <p className="marker flex items-center justify-center gap-2 text-2xl text-blood">
          <ScanFace /> Manual mode
        </p>
        <p className="font-hand text-lg">{reason}</p>
        <p className="mt-2 font-hand text-2xl">
          {done ? (
            'Perfect. Surgeon-level precision. 🩺'
          ) : (
            <>
              Tap #{pts.length + 1}: <b>{step.emoji} {step.label}</b> — <span className="text-ink/70">{step.hint}</span>
            </>
          )}
        </p>
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={tap}
        className="sketch max-h-[62vh] w-auto max-w-full cursor-crosshair touch-none bg-white shadow-ink"
        aria-label="Photo. Tap to place face anchor points."
      />
      <div className="flex flex-wrap justify-center gap-2">
        <button className="ink-btn" onClick={() => setPts((p) => p.slice(0, -1))} disabled={!pts.length}>
          <Undo2 size={18} /> Oops, undo tap
        </button>
        <button className="ink-btn" onClick={() => setPts([])} disabled={!pts.length}>
          <RotateCcw size={18} /> Start over
        </button>
        <button className="ink-btn" onClick={onCancel}>
          Different photo
        </button>
        <button
          className="ink-btn-red"
          disabled={!done}
          onClick={() => onDone({ leftEye: pts[0], rightEye: pts[1], mouth: pts[2], forehead: pts[3] })}
        >
          <Check size={18} /> Let's doodle
        </button>
      </div>
    </div>
  );
}
