// Indicador do HORÁRIO DIVULGADO, calculado no fuso America/Fortaleza.
// Não confirma vagas, agenda real nem funcionamento em feriados.

export const FUSO = 'America/Fortaleza';

/** 0 = domingo … 6 = sábado; minutos desde 00:00. Intervalos [início, fim). */
export const HORARIOS: Record<number, [number, number][]> = {
  0: [],
  1: [[480, 720], [840, 1080]],
  2: [[480, 720], [840, 1080]],
  3: [[480, 720], [840, 1080]],
  4: [[480, 720], [840, 1080]],
  5: [[480, 720], [840, 1080]],
  6: [[480, 720]],
};

export const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const WD: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function horaLocal(data: Date): { dia: number; minuto: number } {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: FUSO, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(data);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return { dia: WD[get('weekday')], minuto: Number(get('hour')) * 60 + Number(get('minute')) };
}

export const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}h${m % 60 ? String(m % 60).padStart(2, '0') : ''}`;

export type Status =
  | { aberto: true; ate: number; texto: string }
  | { aberto: false; proximo: { dia: number; inicio: number } | null; texto: string };

export function statusHorario(data: Date): Status {
  const { dia, minuto } = horaLocal(data);
  const atual = HORARIOS[dia].find(([a, b]) => minuto >= a && minuto < b);
  if (atual) return { aberto: true, ate: atual[1], texto: `Dentro do horário divulgado, até ${hhmm(atual[1])}` };
  // próximo período: mais tarde hoje ou nos próximos dias
  for (let d = 0; d < 7; d++) {
    const diaAlvo = (dia + d) % 7;
    const per = HORARIOS[diaAlvo].find(([a]) => d > 0 || a > minuto);
    if (per) {
      const quando = d === 0 ? 'hoje' : d === 1 ? 'amanhã' : DIAS[diaAlvo].toLowerCase();
      const motivo = dia === 0 && d > 0 ? 'Domingo sem horário informado' : 'Fora do horário divulgado';
      return { aberto: false, proximo: { dia: diaAlvo, inicio: per[0] }, texto: `${motivo}. Próximo período: ${quando}, às ${hhmm(per[0])}` };
    }
  }
  return { aberto: false, proximo: null, texto: 'Fora do horário divulgado' };
}

export function faixaDoDia(dia: number): string {
  const p = HORARIOS[dia];
  if (!p.length) return 'Sem horário informado';
  return p.map(([a, b]) => `${hhmm(a)}–${hhmm(b)}`).join(' e ');
}
