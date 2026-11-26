import { useEffect, useRef, useState } from 'react';
import { ROTULO_ILUSTRATIVA } from '../data/clinica';
import { useMovimentoReduzido, useTelaBaixa } from '../hooks';

const CAPITULOS = [
  { id: 'recepcao', titulo: 'Recepção', texto: 'Balcão curvo em ripas de madeira, banco de pedra e luz que entra pelo arco.' },
  { id: 'odontologia', titulo: 'Consultório odontológico', texto: 'Marcenaria clara, tons oliva e luz difusa sobre a cadeira.' },
  { id: 'medico', titulo: 'Consultório médico', texto: 'Mesa de madeira sobre pedra e uma conversa sem pressa.' },
  { id: 'estetica', titulo: 'Sala de estética', texto: 'Linho, cerâmica e um ritmo mais lento.' },
];

function Imagem({ id, prioridade = false }: { id: string; prioridade?: boolean }) {
  const cap = CAPITULOS.find((c) => c.id === id)!;
  return (
    <picture>
      <source type="image/avif" srcSet={`/img/${id}-900.avif 900w, /img/${id}-1600.avif 1600w`} sizes="100vw" />
      <source type="image/webp" srcSet={`/img/${id}-900.webp 900w, /img/${id}-1600.webp 1600w`} sizes="100vw" />
      <img
        src={`/img/${id}-1600.webp`}
        width="1600"
        height="1120"
        alt={`Maquete 3D conceitual: ${cap.titulo.toLowerCase()} com ${cap.texto.charAt(0).toLowerCase()}${cap.texto.slice(1)} Não é foto da clínica.`}
        loading={prioridade ? 'eager' : 'lazy'}
        decoding="async"
      />
    </picture>
  );
}

/** Momento "photo-chapters": a seção fica presa enquanto cada maquete é revelada de baixo para cima. */
export function Ambientes() {
  const secao = useRef<HTMLElement>(null);
  const reduzido = useMovimentoReduzido();
  const [ativo, setAtivo] = useState(0);
  const baixa = useTelaBaixa();

  const animado = !reduzido && !baixa;

  useEffect(() => {
    const el = secao.current;
    if (!el || !animado) return;
    let raf = 0;
    const camadas = Array.from(el.querySelectorAll<HTMLElement>('.cap__camada'));
    const aplicar = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / total));
      const k = CAPITULOS.length - 1;
      let atual = 0;
      camadas.forEach((c, i) => {
        if (i === 0) return;
        const t = Math.min(1, Math.max(0, (p * k - (i - 1)) / 0.55));
        c.style.setProperty('--rev', String(t));
        if (t >= 0.5) atual = i;
      });
      setAtivo(atual);
    };
    const pedir = () => { if (!raf) raf = requestAnimationFrame(aplicar); };
    aplicar();
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    return () => { window.removeEventListener('scroll', pedir); window.removeEventListener('resize', pedir); cancelAnimationFrame(raf); };
  }, [animado]);

  const cab = (
    <header className="wrap amb__cab">
      <h2 id="amb-titulo" className="titulo-sec">Ambientes em conceito.</h2>
      <p className="sec__intro">
        Ainda não há fotos da estrutura. Estas maquetes mostram a linguagem proposta: madeira clara, pedra, linho e luz natural. Elas serão trocadas por fotografias reais.
      </p>
    </header>
  );

  if (!animado) {
    return (
      <section id="ambientes" className="sec amb amb--estatico" aria-labelledby="amb-titulo">
        {cab}
        <ul className="wrap amb__grade">
          {CAPITULOS.map((c) => (
            <li key={c.id} className="amb__item">
              <div className="amb__moldura">
                <Imagem id={c.id} />
                <span className="selo-ilustrativa">{ROTULO_ILUSTRATIVA}</span>
              </div>
              <h3>{c.titulo}</h3>
              <p>{c.texto}</p>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section id="ambientes" ref={secao} className="amb amb--capitulos" aria-labelledby="amb-titulo" style={{ '--n': CAPITULOS.length } as React.CSSProperties}>
      <div className="amb__fixo">
        {cab}
        <div className="wrap amb__palco-wrap">
          <div className="amb__palco">
            <div className="cap__imagens">
            {CAPITULOS.map((c, i) => (
              <div key={c.id} className="cap__camada" style={{ '--rev': i === 0 ? 1 : 0, zIndex: i } as React.CSSProperties} aria-hidden={i !== ativo}>
                <Imagem id={c.id} prioridade={i === 0} />
              </div>
            ))}
            <span className="selo-ilustrativa">{ROTULO_ILUSTRATIVA}</span>
            </div>
            <div className="cap__painel" aria-live="polite">
              <p className="cap__num">{ativo + 1} de {CAPITULOS.length}</p>
              <h3>{CAPITULOS[ativo].titulo}</h3>
              <p>{CAPITULOS[ativo].texto}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
