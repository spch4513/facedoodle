// Tiny WebAudio synth: every sound is generated on the fly, so there are no audio files to ship.
import type { SoundName } from '../types';

let ac: AudioContext | null = null;
let muted = (() => {
  try {
    return localStorage.getItem('facedoodle:muted') === '1';
  } catch {
    return false;
  }
})();

export const isMuted = () => muted;
export function setMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem('facedoodle:muted', m ? '1' : '0');
  } catch {
    /* private mode: stay quiet about it */
  }
}

function ctx(): AudioContext | null {
  if (muted) return null;
  try {
    ac ??= new AudioContext();
    if (ac.state === 'suspended') void ac.resume();
    return ac;
  } catch {
    return null;
  }
}

function tone(a: AudioContext, type: OscillatorType, f0: number, f1: number, dur: number, vol = 0.2, at = 0) {
  const t = a.currentTime + at;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
  return o;
}

function noise(a: AudioContext, dur: number, filterFreq: number, vol = 0.3, at = 0, wobble = 0) {
  const t = a.currentTime + at;
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.setValueAtTime(filterFreq, t);
  if (wobble) {
    const lfo = a.createOscillator();
    const lg = a.createGain();
    lfo.frequency.value = wobble;
    lg.gain.value = filterFreq * 0.8;
    lfo.connect(lg).connect(f.frequency);
    lfo.start(t);
    lfo.stop(t + dur);
  }
  const g = a.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
}

const SOUNDS: Record<SoundName, (a: AudioContext) => void> = {
  growl: (a) => {
    tone(a, 'sawtooth', 120, 45, 0.7, 0.18);
    tone(a, 'square', 90, 40, 0.7, 0.06);
    noise(a, 0.6, 300, 0.12, 0, 18);
  },
  boing: (a) => {
    const o = tone(a, 'sine', 180, 180, 0.5, 0.3);
    const lfo = a.createOscillator();
    const lg = a.createGain();
    lfo.frequency.setValueAtTime(14, a.currentTime);
    lfo.frequency.linearRampToValueAtTime(4, a.currentTime + 0.5);
    lg.gain.value = 90;
    lfo.connect(lg).connect(o.frequency);
    lfo.start();
    lfo.stop(a.currentTime + 0.5);
  },
  chime: (a) => [880, 1320, 1760].forEach((f, i) => tone(a, 'triangle', f, f, 0.6, 0.12, i * 0.07)),
  pop: (a) => tone(a, 'sine', 900, 200, 0.12, 0.35),
  pbbt: (a) => {
    // The raspberry. Scientifically calibrated for maximum childishness.
    tone(a, 'sawtooth', 110, 70, 0.45, 0.1);
    noise(a, 0.45, 500, 0.35, 0, 38);
  },
  zap: (a) => tone(a, 'square', 1800, 90, 0.25, 0.12),
  whoosh: (a) => noise(a, 0.5, 1400, 0.25, 0, 3),
  thud: (a) => {
    tone(a, 'sine', 140, 40, 0.3, 0.5);
    noise(a, 0.15, 400, 0.25);
  },
  cackle: (a) => [0, 0.11, 0.22, 0.33, 0.44].forEach((t, i) => tone(a, 'sawtooth', 520 - i * 30, 300 - i * 20, 0.09, 0.08, t)),
};

export function play(name: SoundName | undefined) {
  if (!name) return;
  const a = ctx();
  if (!a) return;
  try {
    SOUNDS[name](a);
  } catch {
    /* audio is a nice-to-have */
  }
}
