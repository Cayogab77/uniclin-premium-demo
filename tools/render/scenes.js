// Cenas renderizadas offline (Three.js em Chromium headless) para imagens estáticas.
// Nada aqui vai para o bundle do site: o site recebe só os arquivos WebP/AVIF gerados.
// Linguagem: maquete de argila/cerâmica fosca, madeira clara, pedra, luz natural, tons oliva.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const C = {
  porcelain: 0xf3efe6, ivory: 0xece5d6, plaster: 0xe9e2d3, olive: 0x7c8a6a, forest: 0x3a4836,
  champagne: 0xc9b183, oak: 0xc9a878, stone: 0xcfc6b6, linen: 0xe4dccb,
};

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function canvasTex(draw, size = 1024, repeat = [1, 1]) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

const woodTex = (rep = [1, 1]) => canvasTex((g, s) => {
  const r = rng(7); g.fillStyle = '#cdae80'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 260; i++) {
    const y = r() * s, a = 0.04 + r() * 0.08;
    g.strokeStyle = `rgba(${120 + r() * 30},${85 + r() * 20},${50},${a})`; g.lineWidth = 1 + r() * 4;
    g.beginPath(); g.moveTo(0, y);
    for (let x = 0; x <= s; x += 32) g.lineTo(x, y + Math.sin(x / (90 + r() * 60) + i) * (3 + r() * 5));
    g.stroke();
  }
}, 1024, rep);

const stoneTex = (rep = [1, 1], base = '#d4cbbb') => canvasTex((g, s) => {
  const r = rng(11); g.fillStyle = base; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 9000; i++) {
    const v = r() > 0.5 ? 255 : 90; g.fillStyle = `rgba(${v},${v - 8},${v - 20},${0.03 + r() * 0.05})`;
    const w = 1 + r() * 3; g.fillRect(r() * s, r() * s, w, w);
  }
  for (let i = 0; i < 40; i++) {
    g.strokeStyle = `rgba(150,140,120,${0.05 + r() * 0.06})`; g.lineWidth = 0.6 + r();
    g.beginPath(); let x = r() * s, y = r() * s; g.moveTo(x, y);
    for (let k = 0; k < 8; k++) { x += (r() - 0.5) * 140; y += (r() - 0.5) * 140; g.lineTo(x, y); }
    g.stroke();
  }
}, 1024, rep);

const plasterTex = (rep = [1, 1]) => canvasTex((g, s) => {
  const r = rng(3); g.fillStyle = '#ebe4d5'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 14000; i++) { const v = 200 + r() * 55; g.fillStyle = `rgba(${v},${v - 6},${v - 18},0.05)`; g.fillRect(r() * s, r() * s, 2, 2); }
}, 512, rep);

const linenTex = (rep = [1, 1]) => canvasTex((g, s) => {
  g.fillStyle = '#e6decd'; g.fillRect(0, 0, s, s); const r = rng(5);
  for (let i = 0; i < s; i += 3) { g.fillStyle = `rgba(170,155,130,${0.05 + r() * 0.05})`; g.fillRect(i, 0, 1, s); g.fillRect(0, i, s, 1); }
}, 512, rep);

function mat(color, o = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.78, metalness: 0, clearcoat: 0.05, ...o });
}

function mesh(geo, m, pos = [0, 0, 0], rot = [0, 0, 0]) {
  const x = new THREE.Mesh(geo, m); x.position.set(...pos); x.rotation.set(...rot);
  x.castShadow = true; x.receiveShadow = true; return x;
}

function setup(w, h, bg) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(w, h, false); renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.02;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(bg);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  return { renderer, scene };
}

function sun(scene, pos, target = [0, 0, 0], intensity = 3.2, color = 0xfff1dc, area = 6) {
  const d = new THREE.DirectionalLight(color, intensity); d.position.set(...pos); d.target.position.set(...target);
  d.castShadow = true; d.shadow.mapSize.set(4096, 4096); d.shadow.radius = 14; d.shadow.blurSamples = 25; d.shadow.bias = -0.0004;
  const s = d.shadow.camera; s.left = -area; s.right = area; s.top = area; s.bottom = -area; s.near = 0.5; s.far = 40;
  scene.add(d, d.target);
  const fill = new THREE.HemisphereLight(0xfffaf0, 0xb9ad94, 0.55); scene.add(fill);
  return d;
}

function sweepGeo(width, depth, radius, height) {
  // perfil: piso (z de +depth até 0), quarto de círculo, parede (y de radius até height)
  const prof = [];
  for (let i = 0; i <= 20; i++) prof.push([0, depth - (depth * i) / 20]);
  for (let i = 1; i <= 24; i++) { const a = (i / 24) * Math.PI / 2; prof.push([radius - Math.cos(a) * radius, -Math.sin(a) * radius]); }
  for (let i = 1; i <= 10; i++) prof.push([radius + ((height - radius) * i) / 10, -radius]);
  const g = new THREE.PlaneGeometry(width, 1, 40, prof.length - 1); const p = g.attributes.position;
  for (let j = 0; j < prof.length; j++) for (let i = 0; i <= 40; i++) { const k = j * 41 + i; p.setY(k, prof[j][0]); p.setZ(k, prof[j][1]); }
  g.computeVertexNormals(); return g;
}

function archShape(w, h) {
  const s = new THREE.Shape(); const r = w / 2;
  s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, h - r); s.absarc(0, h - r, r, 0, Math.PI, false); s.lineTo(-r, 0); return s;
}

// ---------------------------------------------------------------- hero: escultura cerâmica
// Uma fita contínua inspirada nas curvas do dente do logotipo (sem reproduzir a marca), sobre base de travertino.
function hero(w, h) {
  const { renderer, scene } = setup(w, h, 0xf2ede2);
  const cam = new THREE.PerspectiveCamera(30, w / h, 0.1, 100); cam.position.set(1.3, 2.7, 11.0); cam.lookAt(-0.05, 1.85, 0);

  const bgMat = mat(0xefe9dd, { roughness: 0.96, side: THREE.DoubleSide });
  const sweep = mesh(sweepGeo(40, 14, 3.2, 14), bgMat, [0, 0, -2.6]); sweep.castShadow = false; scene.add(sweep);
  // base de travertino
  const plinth = mesh(new THREE.CylinderGeometry(1.55, 1.62, 0.42, 96), mat(0xffffff, { map: stoneTex([1, 0.4], '#d8ccb5'), roughness: 0.9 }), [0, 0.21, 0]);
  scene.add(plinth);
  const plinthTop = mesh(new THREE.CylinderGeometry(1.32, 1.32, 0.06, 96), mat(C.champagne, { roughness: 0.55, metalness: 0.1 }), [0, 0.45, 0]);
  scene.add(plinthTop);

  // a fita: contorno de dente estilizado (coroa com dois lobos, raízes que se encontram)
  const P = (x, y) => new THREE.Vector3(x, y, 0);
  const pts = [
    P(0, 2.55), P(-0.35, 2.92), P(-0.95, 3.02), P(-1.28, 2.62), P(-1.25, 1.95), P(-0.98, 1.25),
    P(-0.62, 0.86), P(-0.28, 1.05), P(-0.08, 1.5), P(0.08, 1.5), P(0.28, 1.05), P(0.62, 0.86),
    P(0.98, 1.25), P(1.25, 1.95), P(1.28, 2.62), P(0.95, 3.02), P(0.35, 2.92),
  ];
  pts.forEach((p, i) => { p.z = Math.sin(i / pts.length * Math.PI * 2) * 0.55 + Math.cos(i / pts.length * Math.PI * 4) * 0.18; });
  const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal', 0.5);
  const ribbon = mesh(new THREE.TubeGeometry(curve, 700, 0.095, 64, true), mat(C.porcelain, { roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.4, sheen: 0.3 }));
  ribbon.position.y = 0.48 - 0.86 + 0.095; ribbon.rotation.y = -0.62; ribbon.rotation.z = 0.04; scene.add(ribbon);

  // arco interno, como o detalhe central da marca
  const inner = new THREE.CatmullRomCurve3([P(-0.55, 2.62), P(-0.25, 2.25), P(0, 2.2), P(0.25, 2.25), P(0.55, 2.62)]);
  const arc = mesh(new THREE.TubeGeometry(inner, 200, 0.06, 32, false), mat(C.champagne, { roughness: 0.35, metalness: 0.35 }));
  arc.position.set(0, 0.48 - 0.86 + 0.095, 0.32); arc.rotation.y = -0.62; scene.add(arc);

  // arco de pedra ao fundo (profundidade e eco das janelas em arco das maquetes)
  const slab = mesh(new THREE.ExtrudeGeometry(archShape(2.5, 4.4), { depth: 0.35, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 4 }), mat(0xffffff, { map: stoneTex([0.6, 0.6], '#a9b096'), roughness: 0.95 }), [-1.35, 0, -1.9]);
  scene.add(slab);
  // seixos cerâmicos
  const peb = (r, sx, sy, sz, color, pos) => { const m = mesh(new THREE.SphereGeometry(r, 96, 64), mat(color, { roughness: 0.6, clearcoat: 0.2 }), pos); m.scale.set(sx, sy, sz); scene.add(m); };
  peb(0.42, 1.25, 0.62, 1, C.olive, [1.75, 0.26, 0.75]);
  peb(0.26, 1.1, 0.7, 1, C.porcelain, [2.3, 0.18, 1.35]);
  peb(0.18, 1, 0.8, 1, C.champagne, [-1.95, 0.14, 0.9]);

  sun(scene, [-6.5, 6.2, 5], [0, 1.0, 0], 3.6, 0xfff0d8, 6);
  const rim = new THREE.DirectionalLight(0xe8f0dc, 0.9); rim.position.set(5, 4, -6); scene.add(rim);
  renderer.render(scene, cam);
}

// ---------------------------------------------------------------- maquetes de ambientes
function room(w, h, opts) {
  const { renderer, scene } = setup(w, h, 0xf1ece2);
  const W = 8, D = 6.5, H = 3.4;
  const floorMat = mat(0xffffff, { map: woodTex([3, 3]), roughness: 0.7 });
  const wallMat = mat(0xffffff, { map: plasterTex([2, 2]), roughness: 0.95 });
  scene.add(mesh(new THREE.BoxGeometry(W, 0.12, D), floorMat, [0, -0.06, 0]));
  // parede de fundo
  scene.add(mesh(new THREE.BoxGeometry(W, H, 0.2), wallMat, [0, H / 2, -D / 2]));
  // parede lateral com janela em arco (vazada por recorte)
  const side = new THREE.Shape(); side.moveTo(-D / 2, 0); side.lineTo(D / 2, 0); side.lineTo(D / 2, H); side.lineTo(-D / 2, H); side.lineTo(-D / 2, 0);
  const hole = new THREE.Path(); const hx = opts.windowZ ?? 0.6, hw = 0.85, hb = 0.55, ht = 2.35;
  hole.moveTo(hx - hw, hb); hole.lineTo(hx + hw, hb); hole.lineTo(hx + hw, ht); hole.absarc(hx, ht, hw, 0, Math.PI, false); hole.lineTo(hx - hw, hb);
  side.holes.push(hole);
  const sideGeo = new THREE.ExtrudeGeometry(side, { depth: 0.25, bevelEnabled: false });
  const sideWall = mesh(sideGeo, wallMat, [-W / 2, 0, 0], [0, Math.PI / 2, 0]); sideWall.position.z = 0; scene.add(sideWall);
  sideWall.position.x = -W / 2 - 0.12;
  const cam = new THREE.PerspectiveCamera(opts.fov ?? 34, w / h, 0.1, 100);
  cam.position.set(...(opts.cam ?? [3.0, 2.9, 6.2])); cam.lookAt(...(opts.look ?? [-0.7, 1.0, -1.2]));
  sun(scene, [-14, 6.5, 2.6], [0, 0.6, 0], 4.2, 0xffecd2, 7);
  const amb = new THREE.DirectionalLight(0xfff7ea, 0.35); amb.position.set(6, 6, 9); scene.add(amb);
  return { renderer, scene, cam, W, D, H, wallMat, floorMat };
}

const oak = () => mat(0xffffff, { map: woodTex([1, 1]), roughness: 0.62 });
const stone = (b) => mat(0xffffff, { map: stoneTex([1, 1], b), roughness: 0.85 });
const rbox = (w, h, d, r = 0.06) => new RoundedBoxGeometry(w, h, d, 6, r);

function plant(scene, x, z, s = 1) {
  scene.add(mesh(new THREE.CylinderGeometry(0.28 * s, 0.22 * s, 0.6 * s, 48), stone('#cbbfaa'), [x, 0.3 * s, z]));
  const leaf = mat(C.olive, { roughness: 0.7 });
  const r = rng(Math.round(x * 100 + z * 10));
  for (let i = 0; i < 9; i++) {
    const l = mesh(new THREE.SphereGeometry(0.22 * s, 32, 16), leaf, [x + (r() - 0.5) * 0.5 * s, (0.85 + r() * 0.9) * s, z + (r() - 0.5) * 0.5 * s]);
    l.scale.set(1, 0.35, 0.6); l.rotation.set(r() * 2, r() * 3, r() * 2); scene.add(l);
  }
  scene.add(mesh(new THREE.CylinderGeometry(0.02 * s, 0.02 * s, 1.3 * s), mat(C.forest), [x, 0.95 * s, z]));
}

function pendant(scene, x, y, z, r = 0.32) {
  scene.add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 3.4 - y), mat(0x333333), [x, y + (3.4 - y) / 2, z]));
  const shade = mesh(new THREE.SphereGeometry(r, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), mat(C.champagne, { roughness: 0.4, metalness: 0.25, side: THREE.DoubleSide }), [x, y, z]);
  scene.add(shade);
  const glow = new THREE.PointLight(0xffe2b8, 2.2, 5, 2); glow.position.set(x, y - 0.12, z); scene.add(glow);
}

function recepcao(w, h) {
  const R = room(w, h, { windowZ: 0.2 });
  const { scene } = R;
  // balcão curvo com ripas de madeira
  const counter = new THREE.Group();
  for (let i = 0; i < 46; i++) {
    const a = Math.PI * 0.12 + (i / 45) * Math.PI * 0.76;
    const s = mesh(new THREE.BoxGeometry(0.05, 1.05, 0.09), oak(), [Math.cos(a) * 1.6, 0.525, Math.sin(a) * 1.0]);
    s.rotation.y = -a + Math.PI / 2; counter.add(s);
  }
  const top = mesh(new THREE.CylinderGeometry(1.72, 1.72, 0.06, 96, 1, false, -Math.PI * 0.4 + Math.PI / 2, Math.PI * 0.8), stone('#e1d8c7'), [0, 1.08, 0]);
  top.scale.set(1, 1, 0.66); counter.add(top);
  counter.position.set(1.2, 0, -1.4); counter.rotation.y = Math.PI; scene.add(counter);
  // banco de pedra e almofadas de linho
  scene.add(mesh(rbox(2.6, 0.42, 0.62, 0.04), stone('#d6ccb8'), [-1.4, 0.21, -2.6]));
  scene.add(mesh(rbox(1.15, 0.12, 0.55, 0.05), mat(0xffffff, { map: linenTex([2, 2]) }), [-2.0, 0.48, -2.6]));
  scene.add(mesh(rbox(1.15, 0.12, 0.55, 0.05), mat(C.olive, { roughness: 0.9 }), [-0.8, 0.48, -2.6]));
  // nicho em arco (painel oliva)
  const niche = mesh(new THREE.ExtrudeGeometry(archShape(1.35, 1.9), { depth: 0.05, bevelEnabled: false }), mat(C.olive, { roughness: 0.92 }), [-1.4, 0.95, -3.18]);
  scene.add(niche);
  plant(scene, -3.2, -2.4, 1.15);
  pendant(scene, 1.2, 2.3, -1.1, 0.3); pendant(scene, 0.4, 2.45, -1.6, 0.22);
  R.renderer.render(scene, R.cam);
}

function odontologia(w, h) {
  const R = room(w, h, { windowZ: 0.9 });
  const { scene } = R;
  // marcenaria em madeira na parede de fundo
  scene.add(mesh(rbox(5.2, 0.9, 0.55, 0.02), oak(), [0.4, 0.45, -2.95]));
  scene.add(mesh(rbox(5.3, 0.05, 0.6, 0.01), stone('#e4dccd'), [0.4, 0.92, -2.92]));
  scene.add(mesh(rbox(2.2, 0.7, 0.3, 0.02), oak(), [1.8, 2.1, -3.05]));
  // cadeira estilizada (formas abstratas, sem equipamento)
  const chair = new THREE.Group();
  chair.add(mesh(new THREE.CylinderGeometry(0.28, 0.38, 0.5, 48), mat(C.porcelain, { roughness: 0.5 }), [0, 0.25, 0]));
  const seat = mesh(rbox(0.78, 0.22, 1.25, 0.1), mat(C.olive, { roughness: 0.75 }), [0, 0.62, 0.15]); chair.add(seat);
  const back = mesh(rbox(0.74, 0.2, 1.15, 0.1), mat(C.olive, { roughness: 0.75 }), [0, 0.95, -0.82], [0.62, 0, 0]); chair.add(back);
  const legs = mesh(rbox(0.7, 0.18, 0.9, 0.09), mat(C.olive, { roughness: 0.75 }), [0, 0.6, 1.1], [-0.35, 0, 0]); chair.add(legs);
  chair.position.set(0.2, 0, -0.4); chair.rotation.y = 0.5; scene.add(chair);
  // luminária circular suspensa
  const ring = mesh(new THREE.TorusGeometry(0.55, 0.035, 24, 128), mat(C.champagne, { roughness: 0.35, metalness: 0.4 }), [0.1, 2.55, -0.4], [Math.PI / 2, 0, 0]);
  scene.add(ring);
  const glow = new THREE.PointLight(0xfff0d8, 2.0, 5, 2); glow.position.set(0.1, 2.45, -0.4); scene.add(glow);
  // banqueta
  scene.add(mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.08, 48), mat(C.porcelain), [1.6, 0.55, 0.4]));
  scene.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 16), mat(C.champagne, { metalness: 0.4, roughness: 0.4 }), [1.6, 0.27, 0.4]));
  plant(scene, -3.1, -2.5, 1.0);
  R.renderer.render(scene, R.cam);
}

function medico(w, h) {
  const R = room(w, h, { windowZ: 0.4 });
  const { scene } = R;
  // mesa: tampo de madeira sobre pedestal de pedra
  scene.add(mesh(rbox(2.4, 0.08, 1.05, 0.03), oak(), [0.2, 0.78, -1.3]));
  scene.add(mesh(rbox(0.5, 0.74, 0.8, 0.04), stone('#d2c8b4'), [-0.6, 0.37, -1.3]));
  scene.add(mesh(rbox(0.5, 0.74, 0.8, 0.04), stone('#d2c8b4'), [1.0, 0.37, -1.3]));
  // cadeiras
  const chair = (x, z, ry) => {
    const g = new THREE.Group();
    g.add(mesh(rbox(0.6, 0.12, 0.58, 0.05), mat(C.olive, { roughness: 0.85 }), [0, 0.48, 0]));
    g.add(mesh(rbox(0.6, 0.6, 0.1, 0.05), mat(C.olive, { roughness: 0.85 }), [0, 0.82, -0.26]));
    for (const [lx, lz] of [[-0.25, -0.22], [0.25, -0.22], [-0.25, 0.22], [0.25, 0.22]]) g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.44, 12), oak(), [lx, 0.22, lz]));
    g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
  };
  chair(0.2, -2.25, 0); chair(-0.3, -0.25, Math.PI + 0.25); chair(0.75, -0.25, Math.PI - 0.25);
  // estante e livros neutros
  scene.add(mesh(rbox(1.6, 0.05, 0.35, 0.01), oak(), [2.4, 1.9, -3.0]));
  scene.add(mesh(rbox(1.6, 0.05, 0.35, 0.01), oak(), [2.4, 1.4, -3.0]));
  const r = rng(9);
  for (let i = 0; i < 9; i++) scene.add(mesh(rbox(0.08, 0.32 + r() * 0.08, 0.26, 0.01), mat([C.ivory, C.linen, C.olive, C.champagne][i % 4], { roughness: 0.9 }), [1.85 + i * 0.12, 1.58, -3.0]));
  scene.add(mesh(new THREE.SphereGeometry(0.14, 32, 16), mat(C.porcelain), [2.8, 2.06, -3.0]));
  // tapete de linho
  scene.add(mesh(rbox(3.4, 0.015, 2.4, 0.005), mat(0xffffff, { map: linenTex([3, 3]) }), [0.2, 0.01, -1.1]));
  plant(scene, -3.1, -2.4, 1.2);
  pendant(scene, 0.2, 2.2, -1.3, 0.34);
  R.renderer.render(scene, R.cam);
}

function estetica(w, h) {
  const R = room(w, h, { windowZ: -0.2 });
  const { scene } = R;
  // maca: estofado sobre base de madeira
  scene.add(mesh(rbox(0.85, 0.5, 2.1, 0.04), oak(), [0.3, 0.25, -1.0]));
  scene.add(mesh(rbox(0.9, 0.18, 2.15, 0.08), mat(0xffffff, { map: linenTex([2, 3]), roughness: 0.95 }), [0.3, 0.6, -1.0]));
  scene.add(mesh(rbox(0.55, 0.12, 0.32, 0.06), mat(C.porcelain), [0.3, 0.74, -1.85]));
  scene.add(mesh(rbox(0.9, 0.05, 0.7, 0.02), mat(C.olive, { roughness: 0.9 }), [0.3, 0.72, 0.0]));
  // prateleira de pedra com cerâmicas
  scene.add(mesh(rbox(1.8, 0.1, 0.4, 0.02), stone('#d9d0bf'), [2.0, 1.25, -3.0]));
  scene.add(mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.3, 32), mat(C.porcelain), [1.5, 1.45, -3.0]));
  scene.add(mesh(new THREE.SphereGeometry(0.13, 32, 16), mat(C.olive), [1.85, 1.43, -3.0]));
  scene.add(mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.42, 32), mat(C.champagne, { roughness: 0.5 }), [2.3, 1.51, -3.0]));
  // cortina de linho (painel ondulado)
  const cg = new THREE.PlaneGeometry(2.0, 3.1, 80, 1); const p = cg.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 9) * 0.06);
  cg.computeVertexNormals();
  const curtain = mesh(cg, mat(0xffffff, { map: linenTex([2, 2]), side: THREE.DoubleSide, roughness: 1, transparent: true, opacity: 0.92 }), [-2.6, 1.6, -3.0]);
  scene.add(curtain);
  // banqueta e espelho redondo
  scene.add(mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.45, 48), mat(C.champagne, { roughness: 0.6 }), [1.5, 0.225, 0.2]));
  scene.add(mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 64), mat(0xe8e2d4, { roughness: 0.18, metalness: 0.55 }), [2.0, 2.3, -3.07], [Math.PI / 2, 0, 0]));
  plant(scene, -1.4, -2.5, 0.9);
  pendant(scene, 0.3, 2.3, -1.0, 0.28);
  R.renderer.render(scene, R.cam);
}

export const SCENES = { hero, recepcao, odontologia, medico, estetica };
