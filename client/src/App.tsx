import { useCallback, useRef, useState } from 'react';
import { Editor } from './components/Editor';
import { ManualAnchorOverlay } from './components/ManualAnchorOverlay';
import { Toasts, useToasts } from './components/Toast';
import { UploadScreen } from './components/UploadScreen';
import { useFaceDetection } from './hooks/useFaceDetection';
import { newLayerId } from './hooks/useEffectStore';
import { useIncomingShare } from './hooks/useShareLink';
import { fromManualAnchors, type ManualAnchors } from './lib/faceLandmarks';
import { DETECTING } from './lib/jokes';
import { fileToCanvas } from './lib/loadImage';
import { makeGerald } from './lib/sampleFace';
import { getEffect } from './effects/registry';
import type { FaceData, LayerItem } from './types';

type Phase =
  | { kind: 'upload' }
  | { kind: 'manual'; image: HTMLCanvasElement; reason: string }
  | { kind: 'editor'; image: HTMLCanvasElement; face: FaceData; key: number };

export default function App() {
  const [phase, setPhase] = useState<Phase>({ kind: 'upload' });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { detect } = useFaceDetection();
  const incoming = useIncomingShare();
  const { toasts, push } = useToasts();
  const editorKey = useRef(0);
  const [consumedShare, setConsumedShare] = useState(false);

  const openEditor = useCallback((image: HTMLCanvasElement, face: FaceData) => {
    editorKey.current += 1;
    setPhase({ kind: 'editor', image, face, key: editorKey.current });
  }, []);

  const onFile = useCallback(
    async (file: File) => {
      setError(null);
      let msgIdx = Math.floor(Math.random() * DETECTING.length);
      setBusy('Loading your victim…');
      const spin = setInterval(() => setBusy(DETECTING[msgIdx++ % DETECTING.length]), 1100);
      try {
        const image = await fileToCanvas(file);
        setBusy(DETECTING[msgIdx++ % DETECTING.length]);
        const face = await detect(image);
        if (face) openEditor(image, face);
        else
          setPhase({
            kind: 'manual',
            image,
            reason: "Couldn't find a face automatically (is it a cat? a potato? a very abstract selfie?). Point it out for me:",
          });
      } catch (e) {
        setError((e as Error).message);
      } finally {
        clearInterval(spin);
        setBusy(null);
      }
    },
    [detect, openEditor],
  );

  const onGerald = useCallback(async () => {
    await document.fonts?.load('44px "Permanent Marker"').catch(() => {});
    const { canvas, face } = makeGerald();
    openEditor(canvas, face);
    push('Gerald has consented to this. Probably.');
  }, [openEditor, push]);

  const onManual = useCallback(
    (image: HTMLCanvasElement, a: ManualAnchors) => openEditor(image, fromManualAnchors(a)),
    [openEditor],
  );

  // Shared configs get re-stamped so they animate in on the new face.
  let initialLayers: LayerItem[] | undefined;
  if (phase.kind === 'editor' && incoming.shared && !consumedShare) {
    const now = performance.now();
    initialLayers = incoming.shared.effects
      .filter((l) => getEffect(l.effectId))
      .map((l, i) => ({ ...l, id: newLayerId(), startTime: now + 300 + i * 250 }));
  }

  return (
    <>
      <Toasts toasts={toasts} />
      {phase.kind === 'upload' && (
        <UploadScreen onFile={onFile} onGerald={onGerald} busy={!!busy} busyText={busy ?? undefined} error={error} share={incoming} />
      )}
      {phase.kind === 'manual' && (
        <ManualAnchorOverlay
          image={phase.image}
          reason={phase.reason}
          onDone={(a) => onManual(phase.image, a)}
          onCancel={() => setPhase({ kind: 'upload' })}
        />
      )}
      {phase.kind === 'editor' && (
        <Editor
          key={phase.key}
          image={phase.image}
          face={phase.face}
          initialLayers={initialLayers}
          initialIntensity={initialLayers ? incoming.shared?.intensity : undefined}
          toast={push}
          onNewPhoto={() => {
            if (initialLayers) setConsumedShare(true);
            setPhase({ kind: 'upload' });
          }}
        />
      )}
    </>
  );
}
