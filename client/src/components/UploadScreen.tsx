import { useRef, useState, type DragEvent } from 'react';
import { ImagePlus, Lock, Loader2, Skull, UserRound, X } from 'lucide-react';
import { AnimatedBackground } from './AnimatedBackground';
import { ACCEPTED } from '../lib/loadImage';
import { thumbnailUrl, type SharedConfig } from '../lib/shareApi';

interface Props {
  onFile(file: File): void;
  onGerald(): void;
  busy: boolean;
  busyText?: string;
  error: string | null;
  share: { slug: string | null; shared: SharedConfig | null; error: string | null; loading: boolean; dismiss(): void };
}

export function UploadScreen({ onFile, onGerald, busy, busyText, error, share }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <AnimatedBackground />
      <header className="relative mb-6 text-center">
        <h1 className="marker text-6xl leading-none text-ink sm:text-8xl">
          Face<span className="text-blood">Doodle</span>
          <span className="ml-2 inline-block origin-bottom animate-wiggle text-5xl sm:text-7xl" aria-hidden>
            😈
          </span>
        </h1>
        <p className="mt-3 font-hand text-2xl text-ink/80">
          Give anyone horns, fangs &amp; a snot bubble. <span className="text-blood">Deface responsibly.</span>
        </p>
      </header>

      {share.slug && (
        <div className="panel relative mb-5 w-full max-w-xl animate-pop">
          {share.loading && <p className="font-hand text-xl">Retrieving a cursed link… <Loader2 className="inline animate-spin" size={18} /></p>}
          {share.error && (
            <p className="font-hand text-xl text-blood">
              {share.error} <button className="underline" onClick={share.dismiss}>Start fresh</button>
            </p>
          )}
          {share.shared && (
            <div className="flex items-center gap-4">
              {share.shared.hasThumbnail && (
                <img
                  src={thumbnailUrl(share.slug)}
                  alt="Preview of the shared doodle"
                  className="sketch h-24 w-24 shrink-0 rotate-[-3deg] object-cover shadow-ink-sm"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="marker text-xl text-blood">You've been sent a curse!</p>
                <p className="font-hand text-lg leading-snug">
                  This face was doodled with <b>{share.shared.effects.length} effects</b>. Upload a photo and we'll apply the
                  exact same crimes to it.
                </p>
              </div>
              <button aria-label="Dismiss shared link" className="self-start p-1" onClick={share.dismiss}>
                <X size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        disabled={busy}
        aria-label="Upload a photo of a face"
        className={`sketch relative flex w-full max-w-xl flex-col items-center gap-3 bg-white/85 px-6 py-12 shadow-ink transition-all
          ${over ? 'rotate-1 scale-[1.03] border-blood bg-blood/5 shadow-blood' : 'hover:-rotate-1'}`}
      >
        {busy ? (
          <>
            <Loader2 className="animate-spin text-blood" size={56} />
            <span className="font-hand text-2xl">{busyText ?? 'Working…'}</span>
          </>
        ) : (
          <>
            <ImagePlus size={56} className={over ? 'text-blood' : 'text-ink'} />
            <span className="marker text-2xl sm:text-3xl">{over ? 'Yes! Drop it! DROP IT!' : 'Drop a face here'}</span>
            <span className="font-hand text-xl text-ink/70">or click to upload · JPG, PNG, WebP</span>
          </>
        )}
      </button>
      <input
        ref={input}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = '';
        }}
      />

      {error && (
        <p role="alert" className="mt-4 max-w-xl animate-shake text-center font-hand text-xl text-blood">
          <Skull className="mr-1 inline" size={18} /> {error}
        </p>
      )}

      <div className="relative mt-6 flex flex-col items-center gap-3">
        <button className="ink-btn-gold" onClick={onGerald} disabled={busy}>
          <UserRound size={18} /> No photo? Deface Gerald instead
        </button>
        <p className="flex items-center gap-1.5 text-sm text-ink/70">
          <Lock size={14} /> Photos never leave your browser. No uploads, no server, no judgement.
        </p>
      </div>
    </div>
  );
}
