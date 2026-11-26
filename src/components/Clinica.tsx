import { AREAS, GRUPOS } from '../data/areas';

export function Clinica({ aoEscolherGrupo }: { aoEscolherGrupo: (grupo: string) => void }) {
  return (
    <section id="clinica" className="sec clinica" aria-labelledby="clinica-titulo">
      <div className="wrap clinica__grade">
        <div className="clinica__abertura">
          <h2 id="clinica-titulo" className="titulo-sec">O cuidado em todas as suas formas.</h2>
          <p className="texto-grande">
            No Centro de Camocim, a UniClin reúne odontologia, consultas médicas, estética, nutrição, psicologia e exames
            laboratoriais. Profissionais de áreas diferentes, no mesmo endereço.
          </p>
          <p className="nota">
            Texto provisório, escrito apenas a partir das áreas divulgadas pela clínica. A história da UniClin entra aqui quando for contada pela própria equipe.
          </p>
        </div>

        <nav className="indice" aria-label="Áreas por grupo">
          <ul>
            {GRUPOS.map((g) => (
              <li key={g.id}>
                <a
                  className="indice__item"
                  href="#especialidades"
                  onClick={() => aoEscolherGrupo(g.id)}
                >
                  <span className="indice__nome">{g.nome}</span>
                  <span className="indice__areas">{AREAS.filter((a) => a.grupo === g.id).map((a) => a.nome).join(', ')}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
