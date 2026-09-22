import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Wand2 } from 'lucide-react';
import { PLACEHOLDERS } from '../lib/jokes';

export function CommandBar({ onCommand }: { onCommand(text: string): void }) {
  const [value, setValue] = useState('');
  const [ph, setPh] = useState(0);
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);

  useEffect(() => {
    const t = setInterval(() => setPh((p) => (p + 1) % PLACEHOLDERS.length), 3200);
    return () => clearInterval(t);
  }, []);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = value.trim();
    if (!text) return;
    history.current = [text, ...history.current.filter((h) => h !== text)].slice(0, 20);
    cursor.current = -1;
    onCommand(text);
    setValue('');
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const h = history.current;
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowUp' && h.length) {
      e.preventDefault();
      cursor.current = Math.min(h.length - 1, cursor.current + 1);
      setValue(h[cursor.current]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      cursor.current = Math.max(-1, cursor.current - 1);
      setValue(cursor.current < 0 ? '' : h[cursor.current]);
    } else if (e.key === 'Escape') {
      setValue('');
    }
  };

  return (
    <form onSubmit={submit} className="sketch flex w-full items-center gap-2 bg-white py-1.5 pl-4 pr-1.5 shadow-ink" role="search">
      <label htmlFor="cmd" className="sr-only">
        Describe the doodles you want
      </label>
      <Wand2 className="shrink-0 text-blood" size={22} aria-hidden />
      <input
        id="cmd"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKey}
        autoComplete="off"
        placeholder={`Type what you want… e.g. "${PLACEHOLDERS[ph]}"`}
        className="min-w-0 flex-1 bg-transparent py-1.5 font-hand text-xl outline-none placeholder:text-ink/40"
      />
      <button type="submit" className="ink-btn-red shrink-0 px-4" disabled={!value.trim()}>
        Summon
      </button>
    </form>
  );
}
