#!/usr/bin/env python3
"""Gera public/img a partir de tools/source-assets (originais preservados) e tools/render/out (renders).

- Retratos: recorte respeitoso (sem texto do story, sem reconstrução por IA), formato 4:5, WebP na resolução de origem.
- Logotipo: recorte provisório fornecido, sem alteração de geometria (só conversão para WebP + PNG de fallback).
- Renders 3D próprios (Three.js): AVIF + WebP em duas larguras.
Gera também public/img/ORIGEM.json com a procedência de cada arquivo.
Uso: npm run assets  (rode `npm run render` antes, se mudar as cenas)
"""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC, REN, OUT = ROOT / "tools/source-assets", ROOT / "tools/render/out", ROOT / "public/img"
OUT.mkdir(parents=True, exist_ok=True)
origem = {}

CROPS = {  # caixa (x0, y0, x1, y1) na captura 707x1536, escolhida para excluir textos e interface
    "ana-theresa": ("ana-theresa-story.jpeg", (396, 262, 628, 552)),
    "solario-neto": ("solario-neto-story.jpeg", (428, 330, 676, 640)),
    "amanda-costa": ("amanda-costa-story.jpeg", (425, 295, 705, 645)),
    "evele-araujo": ("evele-araujo-story.jpeg", (395, 245, 667, 585)),
    "ana-ruth": ("ana-ruth-referencia.jpeg", (108, 405, 340, 695)),
}
for slug, (f, box) in CROPS.items():
    im = Image.open(SRC / f).convert("RGB").crop(box)
    im.save(OUT / f"equipe-{slug}.webp", quality=88, method=6)
    origem[f"equipe-{slug}.webp"] = {"tipo": "recorte de captura fornecida (referência privada)", "fonte": f, "caixa": box,
                                     "tamanho": im.size, "uso": "apresentação privada; substituir por foto original autorizada"}

logo = Image.open(SRC / "logo-recorte-provisorio.png").convert("RGBA")
logo.save(OUT / "logo-uniclin.webp", quality=92, method=6, lossless=False)
logo.save(OUT / "logo-uniclin.png", optimize=True)
origem["logo-uniclin.webp/png"] = {"tipo": "recorte provisório fornecido, sem alteração", "fonte": "logo-recorte-provisorio.png",
                                   "uso": "substituir pelo vetor oficial"}

RENDERS = {"hero": [1600, 800], "recepcao": [1600, 900], "odontologia": [1600, 900], "medico": [1600, 900], "estetica": [1600, 900]}
for name, widths in RENDERS.items():
    im = Image.open(REN / f"{name}.png").convert("RGB")
    for w in widths:
        r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        r.save(OUT / f"{name}-{w}.webp", quality=82, method=6)
        r.save(OUT / f"{name}-{w}.avif", quality=60)
    origem[f"{name}-*.avif/webp"] = {"tipo": "render 3D próprio (Three.js, tools/render/scenes.js)", "licenca": "criado para este protótipo",
                                     "rotulo": "Imagem ilustrativa — conceito para demonstração" if name != "hero" else "arte autoral inspirada nas curvas da marca",
                                     "tamanho_original": im.size}

(OUT / "ORIGEM.json").write_text(json.dumps(origem, indent=2, ensure_ascii=False) + "\n")
tot = sum(p.stat().st_size for p in OUT.iterdir())
print(f"{len(list(OUT.iterdir()))} arquivos em public/img, {tot/1e6:.2f} MB")
