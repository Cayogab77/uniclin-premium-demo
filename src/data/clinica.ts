// Dados factuais: somente o que foi fornecido em CONTEUDO-E-FONTES.md e no briefing.
// Nada aqui foi validado de forma independente; ver PENDENCIAS.

export const CLINICA = {
  nome: 'UniClin',
  descricao: 'Clínica médica, estética e odontológica',
  cidade: 'Camocim, Ceará',
  endereco: { rua: 'Rua João Pessoa, 1293', bairro: 'Centro', cidade: 'Camocim', uf: 'CE', pais: 'Brasil' },
  instagram: { usuario: '@uniclin.camocim', url: 'https://www.instagram.com/uniclin.camocim/' },
  whatsapp: {
    exibicao: '+55 (88) 99373-9416',
    // Link real mantido desativado até aprovação da clínica.
    url: 'https://wa.me/5588993739416',
    ativo: false,
  },
  responsavelTecnica: 'Ana Theresa Queiroz — CRO/CE 8.283 | EPAO/CE 2.857',
} as const;

export const AVISO_DEMO = 'Demonstração conceitual privada — não é o site oficial da UniClin';
export const ROTULO_ILUSTRATIVA = 'Imagem ilustrativa — conceito para demonstração';

export const PENDENCIAS = [
  'Aprovação e autorização da clínica e de cada profissional',
  'Logotipo original em vetor',
  'Fotografias reais da estrutura e retratos originais autorizados',
  'História institucional',
  'Confirmação de registros profissionais, equipe atual e escopo de cada serviço',
  'RQE (endocrinologia), CRP (psicologia) e registro da nutricionista',
  'Condições de atendimento, convênios e horários em feriados',
  'Revisão das normas de publicidade de cada profissão, privacidade e acessibilidade',
  'Autorização para ativar o contato real e publicar o site',
] as const;
