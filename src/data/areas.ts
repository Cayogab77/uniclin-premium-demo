// As nove áreas divulgadas na mensagem de atendimento, agrupadas como no briefing (p. 6).
// "termos" alimentam a busca (palavras que um paciente digitaria), sem prometer procedimento.

export type Grupo = { id: string; nome: string; frase: string };
export type Area = {
  id: string;
  nome: string;
  grupo: string;
  profissionais: string[];
  resumo: string;
  topicos: string[];
  nota?: string;
  termos: string[];
};

export const GRUPOS: Grupo[] = [
  { id: 'odonto', nome: 'Odontologia', frase: 'Do cuidado de rotina ao alinhamento do sorriso.' },
  { id: 'medica', nome: 'Saúde médica', frase: 'Consulta e exame de imagem no mesmo endereço.' },
  { id: 'estetica', nome: 'Estética e tricologia', frase: 'Pele, cabelo e bem-estar.' },
  { id: 'bem-estar', nome: 'Nutrição e psicologia', frase: 'Alimentação e saúde emocional.' },
  { id: 'exames', nome: 'Exames', frase: 'Exames laboratoriais.' },
];

export const AREAS: Area[] = [
  {
    id: 'odontologia', nome: 'Odontologia', grupo: 'odonto', profissionais: ['ana-theresa'],
    resumo: 'Atendimento odontológico. Os serviços abaixo aparecem na arte da Dra. Ana Theresa.',
    topicos: ['Limpeza', 'Restauração', 'Clareamento', 'Prótese dentária'],
    termos: ['dente', 'dentes', 'dentista', 'boca', 'sorriso', 'limpeza', 'restauracao', 'clareamento', 'protese', 'carie'],
  },
  {
    id: 'ortodontia', nome: 'Ortodontia e harmonização facial', grupo: 'odonto', profissionais: ['ana-theresa'],
    resumo: 'Área divulgada com a Dra. Ana Theresa.',
    topicos: ['Aparelho ortodôntico fixo', 'Invisalign', 'Ortopedia dos maxilares', 'Harmonização facial'],
    termos: ['aparelho', 'alinhador', 'invisalign', 'ortodontia', 'ortopedia', 'maxilar', 'harmonizacao', 'face', 'rosto'],
  },
  {
    id: 'endocrinologia', nome: 'Endocrinologia', grupo: 'medica', profissionais: ['solario-neto'],
    resumo: 'Área divulgada com o Dr. Solario Neto.',
    topicos: ['Obesidade e perda de peso', 'Diabetes', 'Colesterol', 'Tireoide', 'Menopausa', 'Osteoporose e osteopenia', 'Distúrbios hormonais'],
    nota: 'Título de especialista a validar (RQE não informado).',
    termos: ['hormonio', 'hormonal', 'tireoide', 'diabetes', 'glicose', 'peso', 'obesidade', 'colesterol', 'menopausa', 'osteoporose', 'endocrino'],
  },
  {
    id: 'ultrassonografia', nome: 'Ultrassonografia', grupo: 'medica', profissionais: [],
    resumo: 'Serviço divulgado pela clínica.',
    topicos: [],
    nota: 'Tipos de exame e profissional responsável a confirmar.',
    termos: ['ultrassom', 'ultrassonografia', 'ultrasom', 'imagem', 'ecografia', 'exame de imagem'],
  },
  {
    id: 'tricologia', nome: 'Farmácia e tricologia', grupo: 'estetica', profissionais: ['amanda-costa'],
    resumo: 'Área divulgada com a Dra. Amanda Costa, com foco em saúde capilar.',
    topicos: ['Oleosidade excessiva', 'Caspa', 'Quedas capilares', 'Enfraquecimento e quebra dos fios'],
    nota: 'Outros procedimentos citados na arte aguardam confirmação de escopo.',
    termos: ['cabelo', 'capilar', 'queda', 'caspa', 'couro cabeludo', 'fios', 'tricologia', 'farmacia', 'farmaceutica'],
  },
  {
    id: 'estetica', nome: 'Estética', grupo: 'estetica', profissionais: ['evele-araujo'],
    resumo: 'Área divulgada com a esteticista Evele Araújo.',
    topicos: ['Massagem modeladora', 'Massagem relaxante', 'Drenagem linfática corporal e facial', 'Drenagem pós-operatória', 'Limpeza de pele', 'HidraGlow'],
    termos: ['pele', 'massagem', 'drenagem', 'limpeza de pele', 'facial', 'corporal', 'relaxante', 'hidraglow', 'estetica'],
  },
  {
    id: 'nutricao', nome: 'Nutrição', grupo: 'bem-estar', profissionais: ['ana-ruth'],
    resumo: 'Área divulgada com a Dra. Ana Ruth.',
    topicos: ['Acompanhamento para emagrecimento (citado em publicação)'],
    nota: 'Registro e demais serviços a confirmar.',
    termos: ['nutricao', 'nutricionista', 'dieta', 'alimentacao', 'emagrecer', 'emagrecimento', 'peso'],
  },
  {
    id: 'psicologia', nome: 'Psicologia', grupo: 'bem-estar', profissionais: ['luana'],
    resumo: 'Área divulgada com a Dra. Luana.',
    topicos: [],
    nota: 'Abordagem e registro (CRP) a confirmar.',
    termos: ['psicologia', 'psicologa', 'terapia', 'ansiedade', 'emocional', 'saude mental', 'conversa'],
  },
  {
    id: 'exames', nome: 'Exames laboratoriais', grupo: 'exames', profissionais: [],
    resumo: 'Serviço divulgado pela clínica.',
    topicos: [],
    nota: 'Tipos de exame, preparo e responsável a confirmar.',
    termos: ['exame', 'exames', 'sangue', 'laboratorio', 'laboratorial', 'coleta', 'hemograma'],
  },
];
