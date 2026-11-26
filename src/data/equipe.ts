// Equipe conforme a mensagem de atendimento mais recente (fonte: CONTEUDO-E-FONTES.md).
// Indyra Prado (presença não confirmada) e Lizandra Ramos (substituída) ficam fora de propósito.

export type Profissional = {
  id: string;
  nome: string;
  area: string;
  areaIds: string[];
  registro: string | null;
  /** Como o registro deve ser lido (transcrição de arte, não validação de conselho). */
  notaRegistro?: string;
  resumo: string;
  divulgado: string[];
  pendente: string[];
  foto: { src: string; w: number; h: number } | null;
};

export const EQUIPE: Profissional[] = [
  {
    id: 'ana-theresa',
    nome: 'Dra. Ana Theresa Queiroz',
    area: 'Odontologia, ortodontia e harmonização facial',
    areaIds: ['odontologia', 'ortodontia'],
    registro: 'CRO/CE 8.283',
    notaRegistro: 'Responsável técnica divulgada. Registro transcrito da arte da clínica.',
    resumo: 'A arte da clínica cita especialização em Ortodontia e Ortopedia dos Maxilares e atuação em Harmonização Facial.',
    divulgado: ['Aparelho ortodôntico fixo', 'Invisalign', 'Ortopedia dos maxilares', 'Limpeza', 'Restauração', 'Clareamento', 'Prótese dentária', 'Harmonização facial'],
    pendente: ['Confirmar títulos de especialista antes da publicação'],
    foto: { src: '/img/equipe-ana-theresa.webp', w: 232, h: 290 },
  },
  {
    id: 'solario-neto',
    nome: 'Dr. Solario Neto',
    area: 'Endocrinologia (área divulgada)',
    areaIds: ['endocrinologia'],
    registro: 'CRM/CE 17977',
    notaRegistro: 'Registro transcrito da arte da clínica. RQE não informado.',
    resumo: 'Área divulgada pela clínica. O título de especialista só deve ser publicado após confirmação do RQE.',
    divulgado: ['Obesidade e perda de peso', 'Diabetes', 'Alterações de colesterol', 'Distúrbios da tireoide', 'Menopausa', 'Osteoporose e osteopenia', 'Distúrbios hormonais'],
    pendente: ['Informar o RQE para divulgar o título de especialista'],
    foto: { src: '/img/equipe-solario-neto.webp', w: 248, h: 310 },
  },
  {
    id: 'amanda-costa',
    nome: 'Dra. Amanda Costa',
    area: 'Farmácia e tricologia',
    areaIds: ['tricologia'],
    registro: 'CRF/CE 8.285',
    notaRegistro: 'Registro transcrito da arte da clínica.',
    resumo: 'Farmacêutica e tricologista, segundo a mensagem da clínica. A arte destaca saúde capilar e terapias para o couro cabeludo.',
    divulgado: ['Oleosidade excessiva', 'Caspa', 'Quedas capilares', 'Enfraquecimento e quebra dos fios'],
    pendente: ['A arte também cita procedimentos de estética avançada; a lista será publicada depois da confirmação do escopo'],
    foto: { src: '/img/equipe-amanda-costa.webp', w: 280, h: 350 },
  },
  {
    id: 'evele-araujo',
    nome: 'Evele Araújo',
    area: 'Estética',
    areaIds: ['estetica'],
    registro: 'CNEC/CE 7.449',
    notaRegistro: 'Como informado na arte da clínica; não equivale necessariamente a conselho profissional.',
    resumo: 'Esteticista. A arte fala em tratamentos voltados à saúde da pele e ao bem-estar, com atendimento individualizado.',
    divulgado: ['Massagem modeladora', 'Massagem relaxante', 'Drenagem linfática corporal e facial', 'Drenagem linfática pós-operatória', 'Limpeza de pele', 'HidraGlow (revitalização facial)'],
    pendente: ['Confirmar registro e escopo'],
    foto: { src: '/img/equipe-evele-araujo.webp', w: 272, h: 340 },
  },
  {
    id: 'ana-ruth',
    nome: 'Dra. Ana Ruth',
    area: 'Nutrição',
    areaIds: ['nutricao'],
    registro: null,
    resumo: 'Nutricionista indicada na mensagem atual da clínica. Uma publicação dela fala em acompanhamento para emagrecimento.',
    divulgado: ['Acompanhamento para emagrecimento (citado em publicação)'],
    pendente: ['Registro profissional e demais serviços não informados'],
    foto: { src: '/img/equipe-ana-ruth.webp', w: 232, h: 290 },
  },
  {
    id: 'luana',
    nome: 'Dra. Luana',
    area: 'Psicologia',
    areaIds: ['psicologia'],
    registro: null,
    resumo: 'Psicóloga indicada na mensagem atual da clínica.',
    divulgado: [],
    pendente: ['Nome completo, CRP, foto e abordagem não informados'],
    foto: null,
  },
];
