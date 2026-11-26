import { useEffect, useState } from 'react';
import { AVISO_DEMO } from '../data/clinica';
import { Modal } from './Modal';

export const LINKS = [
  { href: '#especialidades', texto: 'Especialidades' },
  { href: '#equipe', texto: 'Equipe' },
  { href: '#ambientes', texto: 'Ambientes' },
  { href: '#visite', texto: 'Horários e endereço' },
];

export function AvisoDemo() {
  return (
    <div className="aviso-demo" role="note">
      <p className="wrap">{AVISO_DEMO}</p>
    </div>
  );
}

export function Topo() {
  const [rolado, setRolado] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const on = () => setRolado(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const irPara = (href: string) => {
    setMenu(false);
    // espera o diálogo fechar e devolver o foco; então rola até a seção
    requestAnimationFrame(() => document.querySelector(href)?.scrollIntoView());
  };

  return (
    <header className={`topo${rolado ? ' topo--solido' : ''}`}>
      <div className="wrap topo__linha">
        <a className="marca" href="#inicio" aria-label="UniClin, ir para o início">
          <img src="/img/logo-uniclin.webp" width="46" height="46" alt="" />
          <span className="marca__nome" aria-hidden="true" translate="no">UniClin</span>
        </a>
        <nav className="topo__nav" aria-label="Principal">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}><a className="link" href={l.href}>{l.texto}</a></li>
            ))}
          </ul>
        </nav>
        <a className="botao botao--escuro topo__cta" href="#agendar">Agendar</a>
        <button
          type="button"
          className="topo__menu"
          aria-expanded={menu}
          aria-controls="menu-movel"
          onClick={() => setMenu(true)}
        >
          <span className="topo__menu-icone" aria-hidden="true"><i /><i /></span>
          Menu
        </button>
      </div>

      <Modal aberto={menu} aoFechar={() => setMenu(false)} rotulo="Menu" classe="menu-movel">
        <div id="menu-movel" className="menu-movel__corpo">
          <div className="menu-movel__topo">
            <img src="/img/logo-uniclin.webp" width="46" height="46" alt="UniClin" />
            <button type="button" className="botao-fechar" onClick={() => setMenu(false)}>Fechar</button>
          </div>
          <nav aria-label="Menu">
            <ul>
              {[{ href: '#inicio', texto: 'Início' }, ...LINKS, { href: '#agendar', texto: 'Agendar' }].map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={(e) => { e.preventDefault(); irPara(l.href); }}>{l.texto}</a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="menu-movel__nota">{AVISO_DEMO}</p>
        </div>
      </Modal>
    </header>
  );
}
