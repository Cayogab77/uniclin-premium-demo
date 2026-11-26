import { describe, expect, it } from 'vitest';
import { faixaDoDia, horaLocal, statusHorario } from './horario';

// America/Fortaleza = UTC-3 o ano todo. 2026-11-23 é segunda-feira.
const fortaleza = (dia: string, hora: string) => new Date(`${dia}T${hora}:00-03:00`);

describe('statusHorario (America/Fortaleza)', () => {
  it('converte o instante para o fuso da clínica, mesmo vindo de UTC', () => {
    expect(horaLocal(new Date('2026-11-23T14:59:00Z'))).toEqual({ dia: 1, minuto: 11 * 60 + 59 });
  });
  it('11:59 de segunda: dentro do horário, até 12h', () => {
    const s = statusHorario(fortaleza('2026-11-23', '11:59'));
    expect(s.aberto).toBe(true);
    expect(s.texto).toContain('até 12h');
  });
  it('12:00 de segunda: intervalo, reabre hoje às 14h', () => {
    const s = statusHorario(fortaleza('2026-11-23', '12:00'));
    expect(s.aberto).toBe(false);
    expect(s.texto).toContain('hoje, às 14h');
  });
  it('14:00 de segunda: dentro do horário, até 18h', () => {
    const s = statusHorario(fortaleza('2026-11-23', '14:00'));
    expect(s.aberto).toBe(true);
    expect(s.texto).toContain('até 18h');
  });
  it('18:00 de sexta: fora, próximo período amanhã (sábado) às 08h', () => {
    const s = statusHorario(fortaleza('2026-11-27', '18:00'));
    expect(s.aberto).toBe(false);
    expect(s.texto).toContain('amanhã, às 08h');
  });
  it('sábado 08:00 aberto até 12h; 12:00 fechado até segunda', () => {
    expect(statusHorario(fortaleza('2026-11-28', '08:00')).aberto).toBe(true);
    const s = statusHorario(fortaleza('2026-11-28', '12:00'));
    expect(s.aberto).toBe(false);
    expect(s.texto).toContain('segunda, às 08h');
  });
  it('domingo: sem horário informado, próximo período amanhã', () => {
    const s = statusHorario(fortaleza('2026-11-29', '10:00'));
    expect(s.aberto).toBe(false);
    expect(s.texto).toContain('Domingo sem horário informado');
    expect(s.texto).toContain('amanhã, às 08h');
  });
  it('07:59 de terça: fora, abre hoje às 08h', () => {
    expect(statusHorario(fortaleza('2026-11-24', '07:59')).texto).toContain('hoje, às 08h');
  });
  it('faixas por dia', () => {
    expect(faixaDoDia(1)).toBe('08h–12h e 14h–18h');
    expect(faixaDoDia(6)).toBe('08h–12h');
    expect(faixaDoDia(0)).toBe('Sem horário informado');
  });
});
