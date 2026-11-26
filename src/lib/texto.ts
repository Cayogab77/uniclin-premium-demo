import { AREAS, type Area } from '../data/areas';
import { EQUIPE } from '../data/equipe';

/** minúsculas, sem acentos, espaços simples */
export const normalizar = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();

export function buscarAreas(consulta: string, grupo: string | null, areas: Area[] = AREAS): Area[] {
  const q = normalizar(consulta);
  return areas.filter((a) => {
    if (grupo && a.grupo !== grupo) return false;
    if (!q) return true;
    const nomes = a.profissionais.map((id) => EQUIPE.find((p) => p.id === id)?.nome ?? '');
    const campo = normalizar([a.nome, a.resumo, ...a.topicos, ...a.termos, ...nomes].join(' '));
    return q.split(' ').every((t) => campo.includes(t));
  });
}

/** Mensagem genérica, sem dados do paciente. */
export function montarMensagem(areaId: string | null, profId: string | null): string {
  const area = AREAS.find((a) => a.id === areaId);
  const prof = EQUIPE.find((p) => p.id === profId);
  if (!area) return 'Olá! Gostaria de informações sobre o atendimento da UniClin.';
  const com = prof ? ` com ${prof.nome}` : '';
  return `Olá! Gostaria de informações sobre atendimento de ${area.nome.toLowerCase()}${com}.`;
}
