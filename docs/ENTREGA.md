# Entrega — UniClin Premium (demonstração privada)

Branch `demo/uniclin-premium` · sem merge, sem publicação · noindex + `robots.txt` bloqueando indexação (isso **não** é controle de acesso).

## Direção artística (uma proposta)

**Ateliê de cuidado: luxo orgânico editorial.**
1. Porcelana e marfim como chão; verde floresta como tinta e numa única faixa (agendamento); oliva da marca em superfícies e títulos grandes; champagne só como linha e detalhe.
2. Tipografia: **Newsreader** (serifa editorial, OFL) nos títulos e **Manrope** (OFL) no texto e na interface. A Cormorant Garamond sugerida foi testada e trocada: o circunflexo dela fica alto e solto em "você" e "essência" nos tamanhos de título (comparação feita em captura real).
3. O **arco** é o motivo que amarra tudo: moldura do hero, retratos da equipe, janelas das maquetes.
4. Ousadia concentrada em dois pontos: a **escultura cerâmica** do hero (uma linha contínua inspirada nas curvas do dente da marca, sobre travertino, diante de um arco oliva, com um círculo champagne que se desenha na entrada) e o momento **"photo-chapters"** dos ambientes (a seção fica presa e cada maquete se revela de baixo para cima).
5. Grade de 12 colunas, alinhamento à esquerda e assimetria intencional; nada de cards repetidos, gradientes, ícones decorativos ou números inventados.
6. Movimento com propósito: entrada única do hero, parallax leve só na arte (nunca no texto) e microinterações. Com `prefers-reduced-motion`, tudo fica estático e visível.

**Técnica real do 3D:** renders **estáticos** feitos com Three.js no Chromium headless (`tools/render/`), exportados em AVIF/WebP. O site não carrega WebGL nem Three.js.

## Stack

React 19 + Vite + TypeScript. Foi escolhida porque o protótipo é uma página estática, sem backend: a stack fica mais simples que Next.js e entrega o mesmo resultado. O HTML é **pré-renderizado no build** (`tools/prerender.mjs`), e o React só hidrata depois, por isso o hero aparece antes do JavaScript. Dependências de runtime: apenas `react`, `react-dom` e duas fontes locais (@fontsource). Não há banco de dados, analytics, cookies nem chamadas externas: o teste e2e confirma 0 requisições para outros domínios.

## Funcionalidades

| Seção | O que faz |
|---|---|
| Aviso | Faixa no topo e no rodapé: "Demonstração conceitual privada — não é o site oficial da UniClin" |
| Cabeçalho | Marca, navegação, "Agendar"; no celular, menu em tela cheia (`<dialog>`: foco preso, Esc fecha, foco volta ao botão) |
| Hero | Headline, CTA para o agendamento, status do horário divulgado, escultura 3D com parallax leve |
| A clínica | Texto institucional **provisório** (só a partir das áreas divulgadas) + índice dos 5 grupos, que filtra o catálogo |
| Especialidades | 9 áreas em 5 grupos; **busca** com palavras do paciente ("aparelho", "cabelo", "tireoide"…, sem acento), filtros, estado vazio com sugestões, painéis expansíveis com o que foi divulgado e o que falta confirmar |
| Equipe | 6 perfis em modal (registro transcrito, divulgado, a confirmar); Luana com monograma; Indyra e Lizandra fora |
| Ambientes | 4 maquetes 3D conceituais com selo **"Imagem ilustrativa — conceito para demonstração"** |
| Agendamento | Área → profissional (opcional) → prévia → **copiar**. Sem nome, telefone, sintomas ou envio. WhatsApp apenas como texto; botão desativado |
| Horários | Indicador calculado em **America/Fortaleza** (sem alegar vagas nem feriados), tabela da semana com o dia de hoje |
| Visite | Endereço em destaque, Instagram e prévia da rota **sem mapa** e sem rastreamento |
| Rodapé | Contatos, RT divulgada, aviso, pendências e créditos das imagens |

## Origem dos assets

| Arquivo | Origem | Observação |
|---|---|---|
| `public/img/logo-uniclin.*` | `logo-recorte-provisorio.png` do kit, **sem alteração de geometria** | Substituir pelo vetor oficial |
| `public/img/equipe-*.webp` | Recortes 4:5 dos stories e da publicação fornecidos (`tools/build_assets.py`, coordenadas registradas) | Sem texto do story, sem reconstrução por IA, só leve ajuste de saturação no CSS. Resolução de origem baixa (232–280 px), exibidos no máximo a ~300 px |
| `public/img/hero-*`, `recepcao-*`, `odontologia-*`, `medico-*`, `estetica-*` | **Renders 3D próprios** (`tools/render/scenes.js`) | Criados para este protótipo. Não são fotos da UniClin |
| Fontes | Newsreader e Manrope via @fontsource, licença **SIL OFL** | Servidas localmente |

Procedência detalhada: `public/img/ORIGEM.json`. Originais preservados em `tools/source-assets/` (só os usados). Nada de hotlink nem scraping.

**Imagens que faltam (vêm da clínica):** fotos reais da recepção, dos consultórios odontológico e médico e da sala de estética; retratos originais em alta resolução e autorizados; foto da Dra. Luana, se ela desejar.

## Pendências antes de uma publicação oficial

- Aprovação da clínica e de cada profissional; autorização de uso dos retratos.
- Logotipo vetorial; fotos reais.
- História institucional (o texto atual é provisório).
- Confirmações:
  - RQE do Dr. Solario (o título de especialista não aparece);
  - CRP e nome completo da Dra. Luana;
  - registro da Dra. Ana Ruth;
  - escopo da Dra. Amanda (os procedimentos de estética avançada da arte foram omitidos);
  - registro e escopo da Evele (o CNEC foi transcrito como aparece na arte);
  - responsável e modalidades de ultrassonografia e de exames laboratoriais.
- Convênios, horários em feriados, revisão das normas de publicidade de cada conselho, política de privacidade.
- Domínio, canonical, remoção do noindex e ativação dos links reais de WhatsApp e rota.

## Testes e evidências (reais)

| Verificação | Resultado |
|---|---|
| `npm run typecheck` / `npm run lint` | sem erros |
| `npm test` (Vitest) | **18/18**, com os limites de horário 11:59, 12:00, 14:00, 18:00, sábado e domingo |
| `npm run e2e` (Playwright, build de produção) | **23/23**: 360, 390, 768 e 1440 px sem rolagem horizontal; menu; busca, filtros e vazio; perfis com foco e Esc; agendamento e cópia (área de transferência verificada); horário com relógio fixado em 6 instantes; movimento reduzido; selo nas imagens; noindex; 0 requisições externas; skip link; console sem erros |
| axe-core (WCAG 2.1 A/AA) | **0 violações** em 1440 e 390 px |
| Lighthouse 12 (local, sem limitação de rede real) | Celular: desempenho **96**, acessibilidade **100**, boas práticas **100**. Desktop: **100 / 100 / 100**. SEO 58 **de propósito** (noindex e `robots.txt` bloqueando) |
| Impeccable `detect` na página renderizada (telemetria desligada) | **0 anti-padrões**. Antes da correção: faixa lateral na tabela, contraste do placeholder e listras decorativas |
| Web Design Guidelines (revisão manual com a skill) | Corrigidos: reticências no placeholder, `name` na busca, `touch-action`, `overscroll-behavior` nos modais, `translate="no"` na marca, hover só com `transform` |
| Vercel React Best Practices | Sem problemas relevantes: sem cascatas de requisição, ouvintes passivos, parallax por variáveis CSS, estado derivado, hidratação segura com `useSyncExternalStore` |

Capturas e relatórios em `docs/evidencias/`:
- telas iniciais em 360, 390, 768 e 1440 px;
- menu, especialidades, busca vazia, perfil, ambientes e agendamento em 1440 e 390 px;
- `lighthouse-*.html`, `axe-*.json`, `impeccable-detect.txt` e `e2e-resultado.txt`.

## Skills usadas

| Skill | Uso |
|---|---|
| Taste Lite | Direção (kind "service"), sorteio do hero `split` e do momento `photo-chapters`. Regras da skill que conflitavam com o briefing (legenda nas imagens, endereço e telefone reais) seguiram o briefing |
| UI/UX Pro Max | Recomendação genérica (ciano, neumorfismo, depoimentos) descartada por contrariar o briefing; aproveitada só a checklist de acessibilidade |
| Frontend Design | Plano de tokens, crítica contra os padrões genéricos e revisão por captura |
| Impeccable | Detecção na página renderizada, com telemetria desligada |
| Web Design Guidelines | Revisão de acessibilidade e usabilidade |
| Vercel React Best Practices | Revisão de React |
| Webapp Testing | Não estava sincronizada nesta sessão; usei o Playwright diretamente, como o prompt permite |
| Canvas Design | Não foi necessária: os grafismos autorais saíram dos renders 3D |

## Bloqueios e decisões

- **Preview privado:** não publiquei em nenhum serviço. O site usa nome, marca e retratos reais, e repositório privado ou noindex não restringem acesso. Para ver, rode localmente (README). Um preview com acesso restrito (por exemplo, uma prévia protegida por senha na Vercel) depende de autorização do proprietário.
- **Imagens geradas por IA:** não havia gerador de imagens disponível, então os ambientes são renders 3D conceituais próprios, identificados como ilustrativos.
- **Referências externas do briefing** (Studio Brusco, LYLA, Aventura, Velour): não consultadas. Os princípios usados vieram do próprio briefing, e nada foi copiado.
