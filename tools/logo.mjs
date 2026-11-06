// Gera a logo do TALIS em todas as variantes (SVG + PNG) a partir de geometria limpa.
// Uso: node tools/logo.mjs
import fs from 'node:fs'
import path from 'node:path'
import opentype from 'opentype.js'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'Design', 'logo')
fs.mkdirSync(path.join(OUT, 'png'), { recursive: true })

const DARK = '#262626'
const LIGHT = '#F2EFE9'

/* ---------- Cérebro ----------
   Traçado da imagem original e limpo: só a metade esquerda é desenhada,
   a direita é espelhada para ficar perfeitamente simétrica. */
const W = 181
const H = 159
const LEFT = [
  [48, 0, 38, 9], [48, 0, 12, 24],
  [30, 15, 30, 9], [30, 15, 12, 33], [30, 39, 34, 9],
  [12, 38, 12, 24], [12, 53, 55, 9], [12, 53, 12, 31],
  [0, 74, 24, 10], [0, 74, 12, 30], [0, 94, 31, 10],
  [39, 72, 25, 9], [39, 72, 12, 31], [39, 103, 49, 9],
  [56, 72, 8, 23], [56, 86, 32, 9],
  [76, 28, 12, 58],
  [14, 112, 37, 9],
  [63, 118, 25, 10], [76, 118, 12, 41],
  [33, 133, 31, 9],
  [51, 150, 37, 9],
]
const RECTS = [...LEFT, ...LEFT.map(([x, y, w, h]) => [W - x - w, y, w, h])]
const brainPath = (dx = 0, dy = 0, s = 1) =>
  RECTS.map(([x, y, w, h]) => `M${r(dx + x * s)} ${r(dy + y * s)}h${r(w * s)}v${r(h * s)}h${r(-w * s)}z`).join('')
const r = (n) => Math.round(n * 100) / 100

/* ---------- Palavra "TALIS" em contorno ---------- */
const fontBuf = fs.readFileSync(path.join(ROOT, 'node_modules/@fontsource/cinzel/files/cinzel-latin-400-normal.woff'))
const font = opentype.parse(fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.byteLength))
function word(capHeight) {
  // mede em tamanho 1000 e escala para a altura de maiúscula pedida
  const p = font.getPath('TALIS', 0, 0, 1000, { letterSpacing: 0 })
  const bb = p.getBoundingBox()
  const s = capHeight / (bb.y2 - bb.y1)
  return { s, bb, width: (bb.x2 - bb.x1) * s, height: capHeight }
}
function wordPath(x, y, capHeight) {
  const { s, bb } = word(capHeight)
  const p = font.getPath('TALIS', 0, 0, 1000, { letterSpacing: 0 })
  for (const c of p.commands) {
    for (const k of ['x', 'x1', 'x2']) if (k in c) c[k] = x + (c[k] - bb.x1) * s
    for (const k of ['y', 'y1', 'y2']) if (k in c) c[k] = y + (c[k] - bb.y1) * s
  }
  // Monta o "d" à mão: o toPathData do opentype.js gerava NaN no fim do "S".
  const f = (n) => {
    if (!Number.isFinite(n)) throw new Error('coordenada inválida no contorno')
    return String(Math.round(n * 100) / 100)
  }
  return p.commands
    .map((c) =>
      c.type === 'M' || c.type === 'L'
        ? `${c.type}${f(c.x)} ${f(c.y)}`
        : c.type === 'Q'
          ? `Q${f(c.x1)} ${f(c.y1)} ${f(c.x)} ${f(c.y)}`
          : c.type === 'C'
            ? `C${f(c.x1)} ${f(c.y1)} ${f(c.x2)} ${f(c.y2)} ${f(c.x)} ${f(c.y)}`
            : 'Z',
    )
    .join('')
}

const svg = (vw, vh, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(vw)} ${r(vh)}" role="img" aria-label="${title}">\n${body}\n</svg>\n`

/* ---------- Composições ---------- */
const files = {}

// 1) Só o ícone
for (const [name, color] of [['icone', DARK], ['icone-branco', LIGHT]])
  files[`talis-${name}.svg`] = svg(W, H, `<path fill="${color}" d="${brainPath()}"/>`, 'TALIS')

// 2) Só o texto
{
  const cap = 60
  const { width } = word(cap)
  for (const [name, color] of [['texto', DARK], ['texto-branco', LIGHT]])
    files[`talis-${name}.svg`] = svg(width, cap, `<path fill="${color}" d="${wordPath(0, 0, cap)}"/>`, 'TALIS')
}

// 3) Logo completa (cérebro em cima, texto embaixo — como a original)
{
  const cap = 60
  const { width: tw } = word(cap)
  const gap = 24
  const vw = Math.max(W, tw)
  const vh = H + gap + cap
  for (const [name, color] of [['logo', DARK], ['logo-branco', LIGHT]])
    files[`talis-${name}.svg`] = svg(
      vw,
      vh,
      `<g fill="${color}"><path d="${brainPath((vw - W) / 2, 0)}"/><path d="${wordPath((vw - tw) / 2, H + gap, cap)}"/></g>`,
      'TALIS',
    )
}

// 4) Logo horizontal (para cabeçalhos e menus)
{
  const cap = 64
  const { width: tw } = word(cap)
  const gap = 40
  const vw = W + gap + tw
  for (const [name, color] of [['horizontal', DARK], ['horizontal-branco', LIGHT]])
    files[`talis-${name}.svg`] = svg(
      vw,
      H,
      `<g fill="${color}"><path d="${brainPath()}"/><path d="${wordPath(W + gap, (H - cap) / 2, cap)}"/></g>`,
      'TALIS',
    )
}

// 5) Ícone de app (quadrado arredondado, 1024)
const appIcon = (bg, fg) => {
  const S = 1024
  const s = (S * 0.58) / W
  const dx = (S - W * s) / 2
  const dy = (S - H * s) / 2
  return svg(S, S, `<rect width="${S}" height="${S}" rx="230" fill="${bg}"/><path fill="${fg}" d="${brainPath(dx, dy, s)}"/>`, 'TALIS')
}
// versão sem cantos (Android/PWA "maskable" e lojas aplicam a máscara)
const appIconFull = (bg, fg) => {
  const S = 1024
  const s = (S * 0.5) / W
  return svg(S, S, `<rect width="${S}" height="${S}" fill="${bg}"/><path fill="${fg}" d="${brainPath((S - W * s) / 2, (S - H * s) / 2, s)}"/>`, 'TALIS')
}
files['talis-app.svg'] = appIcon(DARK, LIGHT)
files['talis-app-claro.svg'] = appIcon(LIGHT, DARK)
files['talis-app-maskable.svg'] = appIconFull(DARK, LIGHT)

for (const [f, c] of Object.entries(files)) fs.writeFileSync(path.join(OUT, f), c)

/* ---------- PNGs ---------- */
const png = (file, width, out, bg) =>
  sharp(Buffer.from(files[file]), { density: 600 })
    .resize({ width, ...(bg ? { background: bg } : {}) })
    .png()
    .toFile(path.join(OUT, 'png', out))

await Promise.all([
  png('talis-logo.svg', 1600, 'talis-logo.png'),
  png('talis-logo-branco.svg', 1600, 'talis-logo-branco.png'),
  png('talis-icone.svg', 1024, 'talis-icone.png'),
  png('talis-icone-branco.svg', 1024, 'talis-icone-branco.png'),
  png('talis-texto.svg', 1600, 'talis-texto.png'),
  png('talis-texto-branco.svg', 1600, 'talis-texto-branco.png'),
  png('talis-horizontal.svg', 2000, 'talis-horizontal.png'),
  png('talis-horizontal-branco.svg', 2000, 'talis-horizontal-branco.png'),
  ...[1024, 512, 192].map((n) => png('talis-app.svg', n, `talis-app-${n}.png`)),
  png('talis-app-claro.svg', 1024, 'talis-app-claro-1024.png'),
  png('talis-app-maskable.svg', 512, 'talis-app-maskable-512.png'),
  png('talis-app-maskable.svg', 180, 'apple-touch-icon.png'),
])

/* ---------- Para o painel (React) e favicon ---------- */
const pub = path.join(ROOT, 'public')
fs.writeFileSync(path.join(pub, 'favicon.svg'), files['talis-app.svg'])
fs.copyFileSync(path.join(OUT, 'png', 'apple-touch-icon.png'), path.join(pub, 'apple-touch-icon.png'))
fs.copyFileSync(path.join(OUT, 'png', 'talis-app-192.png'), path.join(pub, 'icon-192.png'))
fs.copyFileSync(path.join(OUT, 'png', 'talis-app-512.png'), path.join(pub, 'icon-512.png'))

const cap = 60
fs.writeFileSync(
  path.join(ROOT, 'src', 'brand.js'),
  `// Gerado por tools/logo.mjs — não edite à mão.
export const BRAIN = { w: ${W}, h: ${H}, d: ${JSON.stringify(brainPath())} }
export const WORD = { w: ${r(word(cap).width)}, h: ${cap}, d: ${JSON.stringify(wordPath(0, 0, cap))} }
`,
)
console.log('ok:', Object.keys(files).length, 'SVGs')
