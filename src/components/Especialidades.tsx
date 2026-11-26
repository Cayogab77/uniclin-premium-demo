import { useId, useMemo, useState } from 'react';
import { GRUPOS } from '../data/areas';
import { EQUIPE } from '../data/equipe';
import { buscarAreas } from '../lib/texto';

type Props = {
  grupo: string | null;
  setGrupo: (g: string | null) => void;
  aoVerPerfil: (id: string) => void;
  aoAgendar: (areaId: string, profId?: string) => void;
};

const SUGESTOES = ['dente', 'cabelo', 'tireoide', 'exame'];

export function Especialidades({ grupo, setGrupo, aoVerPerfil, aoAgendar }: Props) {
  const [busca, setBusca] = useState('');
  const [aberta, setAberta] = useState<string | null>(null);
  const uid = useId();
  const resultado = useMemo(() => buscarAreas(busca, grupo), [busca, grupo]);
  const grupos = GRUPOS.filter((g) => resultado.some((a) => a.grupo === g.id));

  return (
    <section id="especialidades" className="sec esp" aria-labelledby="esp-titulo">
      <div className="wrap">
        <header className="sec__cab">
          <h2 id="esp-titulo" className="titulo-sec">Nove áreas, cinco caminhos.</h2>
          <p className="sec__intro">Procure por uma palavra do dia a dia ou filtre por grupo. Cada área mostra apenas o que a clínica já divulgou.</p>
        </header>

        <div className="esp__ferramentas">
          <div className="campo-busca" role="search">
            <label htmlFor={`${uid}-busca`}>Buscar área</label>
            <input
              id={`${uid}-busca`}
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              name="busca"
              placeholder="Ex.: aparelho, pele, exame…"
              autoComplete="off"
            />
          </div>
          <div className="filtros" role="group" aria-label="Filtrar por grupo">
            <button type="button" className="filtro" aria-pressed={grupo === null} onClick={() => setGrupo(null)}>Todas</button>
            {GRUPOS.map((g) => (
              <button key={g.id} type="button" className="filtro" aria-pressed={grupo === g.id} onClick={() => setGrupo(grupo === g.id ? null : g.id)}>
                {g.nome}
              </button>
            ))}
          </div>
        </div>

        <p className="esp__contagem" aria-live="polite">
          {resultado.length === 0 ? 'Nenhuma área encontrada.' : resultado.length === 1 ? '1 área' : `${resultado.length} áreas`}
        </p>

        {resultado.length === 0 ? (
          <div className="vazio">
            <p className="vazio__titulo">Nada com “{busca}”{grupo ? ' neste grupo' : ''}.</p>
            <p>Tente outra palavra:</p>
            <div className="vazio__sugestoes">
              {SUGESTOES.map((s) => (
                <button key={s} type="button" className="filtro" onClick={() => { setBusca(s); setGrupo(null); }}>{s}</button>
              ))}
              <button type="button" className="link" onClick={() => { setBusca(''); setGrupo(null); }}>Limpar busca</button>
            </div>
          </div>
        ) : (
          <div className="esp__lista">
            {grupos.map((g) => (
              <div className="esp__grupo" key={g.id}>
                <div className="esp__grupo-cab">
                  <h3>{g.nome}</h3>
                  <p>{g.frase}</p>
                </div>
                <ul className="esp__areas">
                  {resultado.filter((a) => a.grupo === g.id).map((a) => {
                    const profs = a.profissionais.map((id) => EQUIPE.find((p) => p.id === id)!).filter(Boolean);
                    const aberto = aberta === a.id;
                    const painel = `${uid}-${a.id}`;
                    return (
                      <li key={a.id} className={`area${aberto ? ' area--aberta' : ''}`}>
                        <h4 className="area__cab">
                          <button type="button" aria-expanded={aberto} aria-controls={painel} onClick={() => setAberta(aberto ? null : a.id)}>
                            <span className="area__nome">{a.nome}</span>
                            <span className="area__quem">{profs.length ? profs.map((p) => p.nome).join(', ') : 'Profissional a confirmar'}</span>
                            <span className="area__sinal" aria-hidden="true" />
                          </button>
                        </h4>
                        <div id={painel} className="area__painel" hidden={!aberto}>
                          <p>{a.resumo}</p>
                          {a.topicos.length > 0 && (
                            <ul className="lista-fina">
                              {a.topicos.map((t) => <li key={t}>{t}</li>)}
                            </ul>
                          )}
                          {a.nota && <p className="nota">{a.nota}</p>}
                          <div className="area__acoes">
                            <button type="button" className="botao botao--contorno" onClick={() => aoAgendar(a.id, profs.length === 1 ? profs[0].id : undefined)}>
                              Montar mensagem para {a.nome.toLowerCase()}
                            </button>
                            {profs.map((p) => (
                              <button key={p.id} type="button" className="link" onClick={() => aoVerPerfil(p.id)}>Ver perfil de {p.nome}</button>
                            ))}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
