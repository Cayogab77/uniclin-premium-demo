import { describe, expect, it } from 'vitest';
import { buscarAreas, montarMensagem, normalizar } from './texto';
import { AREAS } from '../data/areas';
import { EQUIPE } from '../data/equipe';

describe('busca de áreas', () => {
  it('ignora acentos e caixa', () => {
    expect(normalizar('  Ultrassonografia  ÓTIMA ')).toBe('ultrassonografia otima');
  });
  it('encontra pela palavra do paciente', () => {
    expect(buscarAreas('aparelho', null).map((a) => a.id)).toEqual(['ortodontia']);
    expect(buscarAreas('tireóide', null).map((a) => a.id)).toEqual(['endocrinologia']);
    expect(buscarAreas('cabelo', null).map((a) => a.id)).toEqual(['tricologia']);
  });
  it('encontra pelo nome do profissional', () => {
    expect(buscarAreas('evele', null).map((a) => a.id)).toEqual(['estetica']);
  });
  it('combina filtro de grupo e busca; vazio quando nada bate', () => {
    expect(buscarAreas('', 'odonto').length).toBe(2);
    expect(buscarAreas('cabelo', 'odonto')).toEqual([]);
    expect(buscarAreas('xyz', null)).toEqual([]);
  });
  it('lista as nove áreas divulgadas', () => {
    expect(buscarAreas('', null).length).toBe(9);
  });
});

describe('mensagem demonstrativa', () => {
  it('segue o fluxo do briefing (odontologia + Ana Theresa)', () => {
    expect(montarMensagem('odontologia', 'ana-theresa')).toBe('Olá! Gostaria de informações sobre atendimento de odontologia com Dra. Ana Theresa Queiroz.');
  });
  it('sem área: mensagem geral; nunca pede dados pessoais', () => {
    const m = montarMensagem(null, null);
    expect(m).toContain('UniClin');
    for (const a of AREAS) expect(montarMensagem(a.id, null)).not.toMatch(/nome|telefone|cpf|sintoma/i);
  });
});

describe('integridade dos dados', () => {
  it('não exibe Indyra Prado nem Lizandra; Luana sem foto', () => {
    const nomes = EQUIPE.map((p) => p.nome).join(' ');
    expect(nomes).not.toMatch(/Indyra|Lizandra/);
    expect(EQUIPE.find((p) => p.id === 'luana')?.foto).toBeNull();
  });
  it('toda área aponta para profissionais existentes', () => {
    for (const a of AREAS) for (const id of a.profissionais) expect(EQUIPE.some((p) => p.id === id)).toBe(true);
  });
});
