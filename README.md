# UniClin — protótipo premium (demonstração privada)

> **Demonstração conceitual privada — não é o site oficial da UniClin.** Não publicar sem aprovação da clínica e dos profissionais.

Homepage editorial navegável para a UniClin (Camocim-CE), com especialidades, equipe, ambientes conceituais, agendamento demonstrativo, horários e localização.
Entrega, decisões, funcionalidades, origem dos assets, pendências e testes: **[docs/ENTREGA.md](docs/ENTREGA.md)**.

## Rodar localmente

Requer Node 20+.

```bash
npm ci
npm run build      # typecheck + build + HTML pré-renderizado
npm run preview    # abre em http://127.0.0.1:4173
```

Durante o desenvolvimento: `npm run dev`.

## Verificações

```bash
npm run typecheck
npm run lint
npm test           # unitários (horário em America/Fortaleza, busca, mensagem, dados)
npm run e2e        # interface real no Chromium (precisa do Playwright instalado no ambiente)
```

## Onde editar

| O quê | Arquivo |
|---|---|
| Dados da clínica, aviso e pendências | `src/data/clinica.ts` |
| Áreas e grupos | `src/data/areas.ts` |
| Equipe | `src/data/equipe.ts` |
| Horários | `src/lib/horario.ts` |
| Cores, fontes e espaçamentos | `src/styles/tokens.css` |
| Imagens | `public/img` (geradas por `npm run render` + `npm run assets`; origem em `public/img/ORIGEM.json`) |

Para reutilizar com outra clínica, troque os três arquivos de dados, os tokens e as imagens.
