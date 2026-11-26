import { useAgora } from '../hooks';
import { statusHorario } from '../lib/horario';

export function StatusHorario({ compacto = false }: { compacto?: boolean }) {
  const agora = useAgora();
  const s = agora ? statusHorario(agora) : null;
  return (
    <p className={`status${s?.aberto ? ' status--aberto' : ''}${compacto ? ' status--compacto' : ''}`}>
      <span className="status__ponto" aria-hidden="true" />
      <span>{s ? s.texto : 'Segunda a sexta, 08h–12h e 14h–18h; sábado, 08h–12h'}</span>
    </p>
  );
}
