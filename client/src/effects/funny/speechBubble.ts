import type { EffectModule } from '../../types';
import { easeOutBack, segment } from '../../lib/easing';
import { INK, sizeK } from '../draw';

export const SPEECH_LINES = [
  'I have been possessed. Please leave a message.',
  'Who summoned me before coffee?',
  'This is my LinkedIn photo now.',
  'I regret nothing. Except this.',
  'Per my last email… 😈',
  'Hi, I am your 3pm meeting.',
  'Mom said it was my turn on the portal.',
  'I only came here for the snacks.',
  'Is this the line for the DMV?',
  'You should see the other guy.',
];

export const speechBubble: EffectModule = {
  id: 'speech-bubble',
  name: 'Speech Bubble',
  icon: 'MessageCircle',
  keywords: ['speech', 'bubble', 'say', 'says', 'saying', 'talk', 'quote'],
  duration: 2200,
  category: 'funny',
  sound: 'pop',
  quip: 'They said it. Not us. Legally.',
  anchor: (f) => f.landmarks.mouthCenter,
  draw({ ctx, face, progress, intensity, meta }) {
    const L = face.landmarks;
    const k = sizeK(intensity);
    const text = meta.text || SPEECH_LINES[(meta.seed ?? 0) % SPEECH_LINES.length];
    const fontPx = Math.max(14, Math.round(face.width * 0.095 * k));
    ctx.save();
    ctx.font = `${fontPx}px "Patrick Hand", "Comic Sans MS", cursive`;
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    // Put the bubble on whichever side of the head has more elbow room.
    const gap = face.width * 0.08;
    const spaceR = W - (L.rightCheek.x + gap) - 8;
    const spaceL = L.leftCheek.x - gap - 8;
    const right = spaceR >= spaceL;
    const pad = fontPx * 1.4;
    const maxW = Math.max(fontPx * 5, Math.min(face.width * 0.9 * k, (right ? spaceR : spaceL) - pad));
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    if (line) lines.push(line);
    const bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + pad;
    const bh = lines.length * fontPx * 1.2 + fontPx * 1.1;
    const bx = right ? Math.min(W - bw - 8, L.rightCheek.x + gap) : Math.max(8, L.leftCheek.x - gap - bw);
    const by = Math.max(8, Math.min(H - bh - 8, L.mouthCenter.y - face.height * 0.55 - bh / 2));
    const pop = easeOutBack(segment(progress, 0, 0.25), 2.5);
    const cx = bx + bw / 2;
    const cy = by + bh / 2;
    ctx.translate(cx, cy);
    ctx.scale(pop, pop);
    ctx.translate(-cx, -cy);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(2.5, fontPx * 0.14);
    ctx.lineJoin = 'round';
    const r = fontPx * 0.8;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, r);
    ctx.fill();
    ctx.stroke();
    // Tail pointing at the guilty mouth.
    const tailBase = { x: Math.max(bx + r, Math.min(bx + bw - r, L.mouthCenter.x)), y: by + bh };
    ctx.beginPath();
    ctx.moveTo(tailBase.x - fontPx * 0.5, tailBase.y - 1);
    ctx.lineTo(L.mouthCenter.x + (bx > L.mouthCenter.x ? face.width * 0.05 : -face.width * 0.05), L.mouthCenter.y - face.width * 0.03);
    ctx.lineTo(tailBase.x + fontPx * 0.5, tailBase.y - 1);
    ctx.fill();
    ctx.stroke();
    // Type-out.
    const total = text.length;
    let chars = Math.floor(segment(progress, 0.2, 1) * total);
    ctx.fillStyle = INK;
    ctx.textBaseline = 'top';
    lines.forEach((l, i) => {
      const shown = l.slice(0, Math.max(0, chars));
      chars -= l.length + 1;
      ctx.fillText(shown, bx + fontPx * 0.7, by + fontPx * 0.55 + i * fontPx * 1.2);
    });
    ctx.restore();
  },
};
