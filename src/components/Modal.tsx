import { useEffect, useRef, type ReactNode } from 'react';

type Props = { aberto: boolean; aoFechar: () => void; rotulo: string; classe?: string; children: ReactNode };

/** <dialog> nativo: torna o resto da página inerte, fecha com Esc e devolve o foco a quem abriu. */
export function Modal({ aberto, aoFechar, rotulo, classe = '', children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const origem = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) {
      origem.current = document.activeElement as HTMLElement;
      d.showModal();
      document.documentElement.classList.add('sem-rolagem');
    } else if (!aberto && d.open) {
      d.close();
    }
  }, [aberto]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const fechou = () => {
      document.documentElement.classList.remove('sem-rolagem');
      origem.current?.focus?.();
      aoFechar();
    };
    d.addEventListener('close', fechou);
    return () => d.removeEventListener('close', fechou);
  }, [aoFechar]);

  return (
    <dialog
      ref={ref}
      aria-label={rotulo}
      className={`modal ${classe}`}
      onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
    >
      {aberto && children}
    </dialog>
  );
}
