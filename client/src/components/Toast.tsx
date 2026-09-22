import { useCallback, useRef, useState } from 'react';

export interface ToastMsg {
  id: number;
  text: string;
  tone: 'info' | 'error';
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const n = useRef(0);
  const push = useCallback((text: string, tone: ToastMsg['tone'] = 'info') => {
    const id = ++n.current;
    setToasts((t) => [...t.slice(-2), { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 5000 : 3200);
  }, []);
  return { toasts, push };
}

export function Toasts({ toasts }: { toasts: ToastMsg[] }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-3 z-40 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`sketch max-w-md animate-pop px-4 py-2 font-hand text-xl shadow-ink ${
            t.tone === 'error' ? 'bg-blood text-white' : 'bg-white'
          }`}
          style={{ rotate: `${(t.id % 3) - 1}deg` }}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
