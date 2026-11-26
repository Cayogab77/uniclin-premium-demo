import { AVISO_DEMO, CLINICA, PENDENCIAS } from '../data/clinica';

export function Rodape() {
  const e = CLINICA.endereco;
  return (
    <footer className="rodape">
      <div className="wrap rodape__grade">
        <div className="rodape__marca">
          <img src="/img/logo-uniclin.webp" width="88" height="88" alt="UniClin — Clínica médica e odontológica" loading="lazy" />
          <p className="rodape__frase">Cuidar de você é a nossa essência.</p>
        </div>
        <div>
          <h2 className="rodape__titulo">Contato</h2>
          <p>{e.rua} – {e.bairro}<br />{e.cidade}, {e.uf}</p>
          <p>WhatsApp divulgado: {CLINICA.whatsapp.exibicao}<br /><span className="rodape__fraco">referência; link desativado na demonstração</span></p>
          <p><a className="link" href={CLINICA.instagram.url} target="_blank" rel="noopener noreferrer">{CLINICA.instagram.usuario}<span className="sr"> (abre em nova aba)</span></a></p>
        </div>
        <div>
          <h2 className="rodape__titulo">Responsável técnica</h2>
          <p>{CLINICA.responsavelTecnica}</p>
          <p className="rodape__fraco">Conforme divulgado pela clínica.</p>
        </div>
        <div>
          <h2 className="rodape__titulo">Sobre esta página</h2>
          <p><strong>{AVISO_DEMO}.</strong></p>
          <details className="pendencias">
            <summary>Pendências antes de uma publicação oficial</summary>
            <ul>{PENDENCIAS.map((p) => <li key={p}>{p}</li>)}</ul>
          </details>
        </div>
      </div>
      <div className="wrap rodape__creditos">
        <p>Ambientes: maquetes 3D conceituais criadas para esta proposta, não fotos da clínica. Retratos: recortes provisórios de publicações da UniClin. Logotipo: recorte provisório.</p>
      </div>
    </footer>
  );
}
