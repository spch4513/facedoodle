import { useEffect, useRef } from 'react';

/** Calls `frame(now)` every animation frame while `active`. Latest callback always wins. */
export function useAnimationLoop(frame: (now: number) => void, active = true) {
  const cb = useRef(frame);
  cb.current = frame;
  useEffect(() => {
    if (!active) return;
    let id = 0;
    const tick = (now: number) => {
      cb.current(now);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [active]);
}
