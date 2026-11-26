import { EQUIPE, type Profissional } from '../data/equipe';
import { Modal } from './Modal';

function Retrato({ p, grande = false }: { p: Profissional; grande?: boolean }) {
  if (!p.foto) {
    const inicial = p.nome.replace(/^Dra?\.\s*/, '').charAt(0);
    return (
      <div className={`retrato retrato--monograma${grande ? ' retrato--grande' : ''}`} role="img" aria-label={`${p.nome}: sem fotografia disponível`}>
        <span aria-hidden="true">{inicial}</span>
      </div>
    );
  }
  return (
    <div className={`retrato${grande ? ' retrato--grande' : ''}`}>
      <img src={p.foto.src} width={p.foto.w} height={p.foto.h} alt={`Retrato de ${p.nome}`} loading="lazy" decoding="async" />
    </div>
  );
}

type Props = { perfil: string | null; setPerfil: (id: string | null) => void; aoAgendar: (areaId: string, profId?: string) => void };

export function Equipe({ perfil, setPerfil, aoAgendar }: Props) {
  const p = EQUIPE.find((x) => x.id === perfil) ?? null;
  return (
    <section id="equipe" className="sec equipe" aria-labelledby="equipe-titulo">
      <div className="wrap">
        <header className="sec__cab sec__cab--lado">
          <h2 id="equipe-titulo" className="titulo-sec">Pessoas antes de procedimentos.</h2>
          <p className="sec__intro">Seis profissionais na mensagem de atendimento mais recente da clínica. Abra um perfil para ver o que cada um divulga.</p>
        </header>

        <ul className="equipe__grade">
          {EQUIPE.map((x) => (
            <li key={x.id}>
              <button type="button" className="pessoa" onClick={() => setPerfil(x.id)} aria-haspopup="dialog">
                <Retrato p={x} />
                <span className="pessoa__nome">{x.nome}</span>
                <span className="pessoa__area">{x.area}</span>
                <span className="pessoa__registro">{x.registro ?? 'Registro a confirmar'}</span>
              </button>
            </li>
          ))}
        </ul>

        <p className="nota equipe__nota">
          Retratos recortados de publicações da clínica, só para esta apresentação. Registros transcritos das artes, sem validação nos conselhos profissionais.
        </p>
      </div>

      <Modal aberto={!!p} aoFechar={() => setPerfil(null)} rotulo={p ? `Perfil de ${p.nome}` : 'Perfil'} classe="perfil">
        {p && (
          <article className="perfil__corpo">
            <button type="button" className="botao-fechar perfil__fechar" onClick={() => setPerfil(null)}>Fechar</button>
            <Retrato p={p} grande />
            <div className="perfil__texto">
              <h2 className="perfil__nome">{p.nome}</h2>
              <p className="perfil__area">{p.area}</p>
              <p className="perfil__registro">
                {p.registro ?? 'Registro a confirmar'}
                {p.notaRegistro && <span> — {p.notaRegistro}</span>}
              </p>
              <p>{p.resumo}</p>
              {p.divulgado.length > 0 && (
                <>
                  <h3 className="perfil__sub">Divulgado pela clínica</h3>
                  <ul className="lista-fina">{p.divulgado.map((d) => <li key={d}>{d}</li>)}</ul>
                </>
              )}
              {p.pendente.length > 0 && (
                <>
                  <h3 className="perfil__sub">A confirmar antes da publicação</h3>
                  <ul className="lista-fina lista-fina--pendente">{p.pendente.map((d) => <li key={d}>{d}</li>)}</ul>
                </>
              )}
              <button type="button" className="botao botao--escuro" onClick={() => { setPerfil(null); aoAgendar(p.areaIds[0], p.id); }}>
                Montar mensagem para {p.nome}
              </button>
            </div>
          </article>
        )}
      </Modal>
    </section>
  );
}
