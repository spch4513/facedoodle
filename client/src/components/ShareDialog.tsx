import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Link2, Loader2, Share2, X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose(): void;
  onCreate(withThumbnail: boolean): void;
  url: string | null;
  busy: boolean;
  error: string | null;
  thumbNote: string | null;
  effectCount: number;
}

export function ShareDialog({ open, onClose, onCreate, url, busy, error, thumbNote, effectCount }: Props) {
  const [thumb, setThumb] = useState(false);
  const [copied, setCopied] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    dialog.current?.querySelector<HTMLElement>('button, input')?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const i = dialog.current?.querySelector<HTMLInputElement>('#share-url');
      i?.select();
      document.execCommand('copy');
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const text = 'I FaceDoodled someone into a demon 😈';
  const tweet = url ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` : '#';
  const whatsapp = url ? `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` : '#';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="share-title" className="panel relative w-full max-w-md animate-pop bg-paper p-5">
        <button className="absolute right-3 top-3 p-1" onClick={onClose} aria-label="Close share dialog">
          <X />
        </button>
        <h2 id="share-title" className="marker flex items-center gap-2 text-2xl text-blood">
          <Link2 /> Summon a share link
        </h2>
        {!url ? (
          <>
            <p className="mt-2 font-hand text-lg leading-snug">
              We'll save your <b>{effectCount} effects</b> (positions, colors, intensity) — <u>not your photo</u>. Whoever opens the
              link uploads their own face and gets the same curse. Links self-destruct after 7 days. 💣
            </p>
            <label className="mt-3 flex items-start gap-2 font-hand text-lg">
              <input type="checkbox" className="mt-1.5 h-4 w-4 accent-blood" checked={thumb} onChange={(e) => setThumb(e.target.checked)} />
              <span>
                Also attach a small preview picture
                <span className="block text-sm text-ink/60">
                  This uploads a 500px snapshot of your doodle (which includes the photo) so the link has a preview. Off by default.
                </span>
              </span>
            </label>
            {error && <p role="alert" className="mt-3 font-hand text-lg text-blood">{error}</p>}
            <button className="ink-btn-red mt-4 w-full" disabled={busy} onClick={() => onCreate(thumb)}>
              {busy ? <Loader2 className="animate-spin" size={18} /> : <Share2 size={18} />}
              {busy ? 'Chanting the incantation…' : 'Create link'}
            </button>
          </>
        ) : (
          <>
            <p className="mt-2 font-hand text-lg">Your curse is ready. Send it only to people who deserve it.</p>
            <div className="mt-3 flex gap-2">
              <input id="share-url" readOnly value={url} className="sketch-alt min-w-0 flex-1 bg-white px-3 py-2 font-mono text-sm" onFocus={(e) => e.target.select()} />
              <button className="ink-btn-red shrink-0" onClick={copy} aria-label="Copy link to clipboard">
                {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {thumbNote && <p className="mt-2 text-sm text-ink/70">{thumbNote}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <a className="ink-btn" href={tweet} target="_blank" rel="noopener noreferrer">𝕏 Post</a>
              <a className="ink-btn" href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              {typeof navigator.share === 'function' && (
                <button className="ink-btn" onClick={() => navigator.share({ title: 'FaceDoodle', text, url }).catch(() => {})}>
                  <Share2 size={18} /> More…
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
