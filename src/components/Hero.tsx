import { useEffect, useRef } from 'react';
import { useMovimentoReduzido, usePonteiroFino } from '../hooks';
import { StatusHorario } from './StatusHorario';

export function Hero() {
  const arte = useRef<HTMLDivElement>(null);
  const reduzido = useMovimentoReduzido();
  const fino = usePonteiroFino();

  // Parallax leve: a arte responde ao ponteiro (desktop) e desliza um pouco com a rolagem. Nunca o texto.
  useEffect(() => {
    const el = arte.current;
    if (!el || reduzido) return;
    let raf = 0, px = 0, py = 0;
    const aplicar = () => {
      raf = 0;
      const y = Math.min(window.scrollY, 900) * 0.06;
      el.style.setProperty('--px', `${px * 10}px`);
      el.style.setProperty('--py', `${py * 8 + y}px`);
    };
    const pedir = () => { if (!raf) raf = requestAnimationFrame(aplicar); };
    const mover = (e: PointerEvent) => {
      px = e.clientX / window.innerWidth - 0.5;
      py = e.clientY / window.innerHeight - 0.5;
      pedir();
    };
    window.addEventListener('scroll', pedir, { passive: true });
    if (fino) window.addEventListener('pointermove', mover, { passive: true });
    return () => {
      window.removeEventListener('scroll', pedir);
      window.removeEventListener('pointermove', mover);
      cancelAnimationFrame(raf);
    };
  }, [reduzido, fino]);

  return (
    <section id="inicio" className="hero" data-enter aria-labelledby="hero-titulo">
      <div className="wrap hero__grade">
        <div className="hero__texto">
          <p className="hero__lugar entra" style={{ '--i': 0 } as React.CSSProperties}>
            Clínica médica, estética e odontológica no Centro de Camocim, Ceará
          </p>
          <h1 id="hero-titulo" className="hero__titulo entra" style={{ '--i': 1 } as React.CSSProperties}>
            Cuidar de você é a nossa essência.
          </h1>
          <p className="hero__lead entra" style={{ '--i': 2 } as React.CSSProperties}>
            Odontologia, consultas médicas, estética, nutrição, psicologia e exames laboratoriais, reunidos no mesmo endereço.
          </p>
          <div className="hero__acoes entra" style={{ '--i': 3 } as React.CSSProperties}>
            <a className="botao botao--escuro" href="#agendar">Montar mensagem de agendamento</a>
            <a className="link link--forte" href="#especialidades">Ver as nove áreas</a>
          </div>
          <div className="entra" style={{ '--i': 4 } as React.CSSProperties}>
            <StatusHorario compacto />
          </div>
        </div>

        <div className="hero__arte" ref={arte}>
          <svg className="hero__circulo" viewBox="0 0 600 600" aria-hidden="true" focusable="false">
            <circle cx="300" cy="300" r="290" pathLength="1" />
          </svg>
          <picture>
            <source type="image/avif" srcSet="/img/hero-800.avif 800w, /img/hero-1600.avif 1600w" sizes="(max-width: 860px) 92vw, 46vw" />
            <source type="image/webp" srcSet="/img/hero-800.webp 800w, /img/hero-1600.webp 1600w" sizes="(max-width: 860px) 92vw, 46vw" />
            <img
              src="/img/hero-1600.webp"
              width="1600"
              height="1800"
              alt="Escultura em cerâmica fosca: uma linha contínua inspirada nas curvas do dente da marca, sobre base de travertino, diante de um arco verde-oliva."
              fetchPriority="high"
            />
          </picture>
        </div>
      </div>
    </section>
  );
}
