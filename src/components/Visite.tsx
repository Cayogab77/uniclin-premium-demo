import { useId, useState } from 'react';
import { CLINICA } from '../data/clinica';
import { useAgora } from '../hooks';
import { DIAS, faixaDoDia, horaLocal } from '../lib/horario';
import { StatusHorario } from './StatusHorario';

const ORDEM = [1, 2, 3, 4, 5, 6, 0];

export function Visite() {
  const agora = useAgora();
  const hoje = agora ? horaLocal(agora).dia : -1;
  const [rota, setRota] = useState(false);
  const uid = useId();
  const e = CLINICA.endereco;

  return (
    <section id="visite" className="sec visite" aria-labelledby="visite-titulo">
      <div className="wrap visite__grade">
        <div className="visite__endereco">
          <h2 id="visite-titulo" className="titulo-sec">Visite a UniClin.</h2>
          <address>
            <span className="visite__rua">{e.rua}</span>
            <span className="visite__bairro">{e.bairro}, {e.cidade} — {e.uf}</span>
          </address>
          <div className="visite__acoes">
            <button type="button" className="botao botao--contorno" aria-expanded={rota} aria-controls={`${uid}-rota`} onClick={() => setRota(!rota)}>
              {rota ? 'Ocultar prévia da rota' : 'Ver prévia da rota'}
            </button>
            <a className="link link--forte" href={CLINICA.instagram.url} target="_blank" rel="noopener noreferrer">
              Instagram {CLINICA.instagram.usuario}<span className="sr"> (abre em nova aba)</span>
            </a>
          </div>
          <div id={`${uid}-rota`} className="rota" hidden={!rota}>
            <p>
              Na versão publicada, este botão abrirá o aplicativo de mapas com o endereço acima. Nesta demonstração nenhum serviço de mapa é carregado e
              nada é rastreado.
            </p>
            <button type="button" className="botao botao--fantasma-escuro" disabled>Abrir rota no mapa</button>
          </div>
        </div>

        <div className="horarios">
          <h3 className="horarios__titulo">Horário divulgado</h3>
          <StatusHorario />
          <table className="horarios__tabela">
            <caption className="sr">Horário divulgado por dia da semana</caption>
            <tbody>
              {ORDEM.map((d) => (
                <tr key={d} aria-current={d === hoje ? 'date' : undefined} className={d === hoje ? 'hoje' : undefined}>
                  <th scope="row">{DIAS[d]}{d === hoje && <span className="horarios__hoje"> · hoje</span>}</th>
                  <td>{faixaDoDia(d)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="nota">
            Calculado no fuso de Fortaleza a partir do horário divulgado. Não indica vagas, agenda nem funcionamento em feriados.
          </p>
        </div>
      </div>
    </section>
  );
}
