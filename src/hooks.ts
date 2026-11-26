import { useSyncExternalStore } from 'react';

// Hooks compatíveis com o HTML pré-renderizado: no servidor (e na hidratação) devolvem um valor neutro;
// depois o React troca pelo valor real do navegador, sem erro de hidratação.

function useMedia(query: string) {
  return useSyncExternalStore(
    (on) => { const m = matchMedia(query); m.addEventListener('change', on); return () => m.removeEventListener('change', on); },
    () => matchMedia(query).matches,
    () => false,
  );
}

export const useMovimentoReduzido = () => useMedia('(prefers-reduced-motion: reduce)');
export const usePonteiroFino = () => useMedia('(hover: hover) and (pointer: fine)');
export const useTelaBaixa = () => useMedia('(max-height: 599px)');

/** Relógio compartilhado que avança a cada 30 s; null no HTML pré-renderizado. */
let agora: Date | null = null;
const ouvintes = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
function assinar(on: () => void) {
  ouvintes.add(on);
  if (!timer) timer = setInterval(() => { agora = new Date(); ouvintes.forEach((f) => f()); }, 30_000);
  return () => { ouvintes.delete(on); if (!ouvintes.size) { clearInterval(timer); timer = undefined; } };
}
export function useAgora(): Date | null {
  return useSyncExternalStore(assinar, () => (agora ??= new Date()), () => null);
}
