import { useCallback, useReducer } from 'react';
import type { LayerItem, LayerMeta } from '../types';

const HISTORY_LIMIT = 50;

interface State {
  layers: LayerItem[];
  past: LayerItem[][];
  future: LayerItem[][];
}

type Action =
  | { type: 'add'; items: LayerItem[] }
  | { type: 'remove'; id: string }
  | { type: 'toggle'; id: string }
  | { type: 'move'; id: string; dir: -1 | 1 }
  | { type: 'meta'; id: string; meta: Partial<LayerMeta>; record: boolean }
  | { type: 'checkpoint' }
  | { type: 'replace'; layers: LayerItem[] }
  | { type: 'clear' }
  | { type: 'restamp'; now: number }
  | { type: 'undo' }
  | { type: 'redo' };

function commit(s: State, layers: LayerItem[]): State {
  return { layers, past: [...s.past, s.layers].slice(-HISTORY_LIMIT), future: [] };
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'add':
      return a.items.length ? commit(s, [...s.layers, ...a.items]) : s;
    case 'remove':
      return commit(s, s.layers.filter((l) => l.id !== a.id));
    case 'toggle':
      return commit(s, s.layers.map((l) => (l.id === a.id ? { ...l, visible: !l.visible } : l)));
    case 'move': {
      const i = s.layers.findIndex((l) => l.id === a.id);
      const j = i + a.dir;
      if (i < 0 || j < 0 || j >= s.layers.length) return s;
      const next = [...s.layers];
      [next[i], next[j]] = [next[j], next[i]];
      return commit(s, next);
    }
    case 'meta': {
      const layers = s.layers.map((l) => (l.id === a.id ? { ...l, metadata: { ...l.metadata, ...a.meta } } : l));
      return a.record ? commit(s, layers) : { ...s, layers };
    }
    case 'checkpoint':
      return { ...s, past: [...s.past, s.layers].slice(-HISTORY_LIMIT), future: [] };
    case 'replace':
      return commit(s, a.layers);
    case 'restamp':
      // Replays every intro animation without touching history.
      return { ...s, layers: s.layers.map((l, i) => ({ ...l, startTime: a.now + i * 180 })) };
    case 'clear':
      return s.layers.length ? commit(s, []) : s;
    case 'undo': {
      if (!s.past.length) return s;
      return { layers: s.past[s.past.length - 1], past: s.past.slice(0, -1), future: [s.layers, ...s.future] };
    }
    case 'redo': {
      if (!s.future.length) return s;
      return { layers: s.future[0], past: [...s.past, s.layers], future: s.future.slice(1) };
    }
  }
}

let counter = 0;
export const newLayerId = () => `L${Date.now().toString(36)}${(counter++).toString(36)}`;

export function useEffectStore(initial: LayerItem[] = []) {
  const [state, dispatch] = useReducer(reducer, { layers: initial, past: [], future: [] });
  return {
    layers: state.layers,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    add: useCallback((items: LayerItem[]) => dispatch({ type: 'add', items }), []),
    remove: useCallback((id: string) => dispatch({ type: 'remove', id }), []),
    toggle: useCallback((id: string) => dispatch({ type: 'toggle', id }), []),
    move: useCallback((id: string, dir: -1 | 1) => dispatch({ type: 'move', id, dir }), []),
    setMeta: useCallback(
      (id: string, meta: Partial<LayerMeta>, record = true) => dispatch({ type: 'meta', id, meta, record }),
      [],
    ),
    checkpoint: useCallback(() => dispatch({ type: 'checkpoint' }), []),
    replace: useCallback((layers: LayerItem[]) => dispatch({ type: 'replace', layers }), []),
    clear: useCallback(() => dispatch({ type: 'clear' }), []),
    replay: useCallback(() => dispatch({ type: 'restamp', now: performance.now() }), []),
    undo: useCallback(() => dispatch({ type: 'undo' }), []),
    redo: useCallback(() => dispatch({ type: 'redo' }), []),
  };
}

export type EffectStore = ReturnType<typeof useEffectStore>;
