import { useId, useState } from 'react';
import { AREAS, GRUPOS } from '../data/areas';
import { CLINICA } from '../data/clinica';
import { EQUIPE } from '../data/equipe';
import { montarMensagem } from '../lib/texto';

type Props = { area: string | null; prof: string | null; setArea: (a: string | null) => void; setProf: (p: string | null) => void };
type Copia = 'ocioso' | 'copiando' | 'copiado' | 'manual';

export function Agendamento({ area, prof, setArea, setProf }: Props) {
  const uid = useId();
  const mensagem = montarMensagem(area, prof);
  // o estado da cópia vale só para a mensagem que foi copiada; mudar a escolha volta a "Copiar mensagem"
  const [copiaInfo, setCopiaInfo] = useState<{ estado: Copia; msg: string }>({ estado: 'ocioso', msg: '' });
  const copia: Copia = copiaInfo.msg === mensagem ? copiaInfo.estado : 'ocioso';
  const setCopia = (estado: Copia) => setCopiaInfo({ estado, msg: mensagem });
  const areaAtual = AREAS.find((a) => a.id === area);
  const profs = areaAtual ? areaAtual.profissionais.map((id) => EQUIPE.find((p) => p.id === id)!) : [];

  const copiar = async () => {
    setCopia('copiando');
    try {
      await navigator.clipboard.writeText(mensagem);
      setCopia('copiado');
    } catch {
      // sem permissão de área de transferência: seleciona o texto para cópia manual
      const el = document.getElementById(`${uid}-previa`);
      if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s?.removeAllRanges(); s?.addRange(r); }
      setCopia('manual');
    }
  };

  return (
    <section id="agendar" className="sec agenda" aria-labelledby="agenda-titulo">
      <div className="wrap agenda__grade">
        <header className="agenda__cab">
          <h2 id="agenda-titulo" className="titulo-sec">Monte sua mensagem de agendamento.</h2>
          <p className="sec__intro">
            Escolha a área e, se quiser, um profissional. Você copia o texto pronto e decide como usar. Nada é enviado por aqui.
          </p>
          <p className="agenda__aviso">
            Demonstração: sem envio, sem cadastro e sem confirmação de consulta ou horário. Não pedimos nome, telefone nem informações de saúde.
          </p>
        </header>

        <form className="agenda__form" onSubmit={(e) => e.preventDefault()} aria-describedby={`${uid}-passos`}>
          <p id={`${uid}-passos`} className="sr">Três passos: área, profissional opcional e prévia da mensagem.</p>

          <fieldset className="passo">
            <legend><span className="passo__num">1</span> Área de atendimento</legend>
            {GRUPOS.map((g) => (
              <div key={g.id} className="passo__grupo">
                <p className="passo__grupo-nome" id={`${uid}-g-${g.id}`}>{g.nome}</p>
                <div className="opcoes" role="radiogroup" aria-labelledby={`${uid}-g-${g.id}`}>
                  {AREAS.filter((a) => a.grupo === g.id).map((a) => (
                    <label key={a.id} className="opcao">
                      <input
                        type="radio"
                        name={`${uid}-area`}
                        value={a.id}
                        checked={area === a.id}
                        onChange={() => { setArea(a.id); setProf(a.profissionais.length === 1 ? a.profissionais[0] : null); }}
                      />
                      <span>{a.nome}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </fieldset>

          <fieldset className="passo" disabled={!areaAtual}>
            <legend><span className="passo__num">2</span> Profissional <span className="passo__opcional">(opcional)</span></legend>
            {!areaAtual && <p className="passo__dica">Escolha uma área para ver quem atende.</p>}
            {areaAtual && profs.length === 0 && <p className="passo__dica">A clínica ainda não informou o profissional desta área.</p>}
            {areaAtual && profs.length > 0 && (
              <div className="opcoes" role="radiogroup" aria-label="Profissional">
                <label className="opcao">
                  <input type="radio" name={`${uid}-prof`} checked={prof === null} onChange={() => setProf(null)} />
                  <span>Sem preferência</span>
                </label>
                {profs.map((p) => (
                  <label key={p.id} className="opcao">
                    <input type="radio" name={`${uid}-prof`} checked={prof === p.id} onChange={() => setProf(p.id)} />
                    <span>{p.nome}</span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <div className="passo passo--previa">
            <h3 className="passo__titulo"><span className="passo__num">3</span> Prévia da mensagem</h3>
            <blockquote id={`${uid}-previa`} className="previa" aria-live="polite">{mensagem}</blockquote>
            <div className="previa__acoes">
              <button type="button" className="botao botao--claro" onClick={copiar} disabled={copia === 'copiando'}>
                {copia === 'copiando' ? 'Copiando…' : copia === 'copiado' ? 'Mensagem copiada' : 'Copiar mensagem'}
              </button>
              <p className="previa__status" role="status">
                {copia === 'copiado' && 'Mensagem copiada. Cole onde preferir.'}
                {copia === 'manual' && 'Não foi possível copiar automaticamente. O texto está selecionado: use Ctrl+C ou Copiar.'}
              </p>
            </div>
            <div className="contato-ref">
              <p>
                WhatsApp divulgado pela clínica: <strong>{CLINICA.whatsapp.exibicao}</strong>
                <span className="contato-ref__nota"> — apenas referência nesta demonstração.</span>
              </p>
              <button type="button" className="botao botao--fantasma" disabled aria-describedby={`${uid}-wa`}>
                Abrir WhatsApp
              </button>
              <p id={`${uid}-wa`} className="contato-ref__nota">Link desativado até a aprovação da clínica.</p>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
