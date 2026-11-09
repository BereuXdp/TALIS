// Recorta a foto de uma coluna grega (fundo liso claro) e gera WebP com transparência.
// O fundo é estimado linha a linha pelas bordas esquerda/direita; o que se liga à borda
// e é parecido com esse fundo vira transparente (flood fill), então sombras escuras da
// coluna e brilhos no interior são preservados.
// Uso: node tools/column.mjs <entrada> [nome-de-saida]
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const [input, outName = 'coluna'] = process.argv.slice(2)
const outDir = path.resolve(import.meta.dirname, '..', 'public', 'site')
fs.mkdirSync(outDir, { recursive: true })

const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H, channels: C } = info
// luminância suavizada (σ 2.5) para o granulado do fundo não parecer "diferente"
const grey = await sharp(input).removeAlpha().greyscale().blur(2.5).raw().toBuffer()
const lum = (k) => grey[k]

// fundo por linha: média de uma faixa de 24px em cada borda, interpolada na horizontal
const band = 24
const left = new Float32Array(H)
const right = new Float32Array(H)
for (let y = 0; y < H; y++) {
  let a = 0
  let b = 0
  for (let x = 0; x < band; x++) {
    a += lum(y * W + x)
    b += lum(y * W + (W - 1 - x))
  }
  left[y] = a / band
  right[y] = b / band
}
// suaviza na vertical (evita listras)
const smooth = (arr) => {
  const out = new Float32Array(H)
  for (let y = 0; y < H; y++) {
    let s = 0
    let n = 0
    for (let d = -25; d <= 25; d++) {
      const yy = y + d
      if (yy >= 0 && yy < H) { s += arr[yy]; n++ }
    }
    out[y] = s / n
  }
  return out
}
const L = smooth(left)
const R = smooth(right)
const bgAt = (x, y) => L[y] + (R[y] - L[y]) * (x / (W - 1))

// silhueta: a coluna jônica tem forma simples e simétrica, e o lado iluminado dela tem o mesmo cinza do
// fundo (a cor não separa). A forma é desenhada com as medidas da foto original (736x986) e suavizada.
// Se trocar a foto, ajuste os pontos abaixo (x esquerdo, x direito) por altura (y).
const S = W / 736
const ROWS = [
  // y,   xEsq, xDir
  [222, 296, 438], // topo do ábaco
  [244, 292, 442],
  [254, 274, 462], // voluta (capitel)
  [290, 272, 464],
  [306, 284, 452],
  [318, 299, 434], // pescoço
  [330, 300, 434],
  [738, 302, 431], // fuste afina um pouco
  [748, 286, 446], // toro (base)
  [772, 284, 448],
  [786, 268, 463], // plinto
  [836, 266, 465],
]
const pts = []
for (const [y, xl] of ROWS) pts.push([xl, y])
for (const [y, , xr] of [...ROWS].reverse()) pts.push([xr, y])
const poly = pts.map(([x, y]) => `${(x * S).toFixed(1)},${(y * S).toFixed(1)}`).join(' ')
let alpha = await sharp(
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#000"/><polygon points="${poly}" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>`),
)
  .greyscale()
  .blur(1.2)
  .extractChannel(0)
  .raw()
  .toBuffer()

// cor: leve realce de brilho (a foto original é escura) e franja escurecida nas bordas:
// qualquer resto do fundo claro perto do contorno some no preto da página
const innerRaw = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } }).blur(7).raw().toBuffer({ resolveWithObject: true })
const inner = innerRaw.data
const ic = innerRaw.info.channels
const rgb = await sharp(input).removeAlpha().modulate({ brightness: 1.12, saturation: 0.85 }).raw().toBuffer({ resolveWithObject: true })
const px = Buffer.alloc(W * H * 4)
for (let k = 0; k < W * H; k++) {
  const f = Math.min(1, Math.max(0.12, (inner[k * ic] - 150) / 90))
  px[k * 4] = rgb.data[k * rgb.info.channels] * f
  px[k * 4 + 1] = rgb.data[k * rgb.info.channels + 1] * f
  px[k * 4 + 2] = rgb.data[k * rgb.info.channels + 2] * f
  px[k * 4 + 3] = alpha[k]
}
const png = await sharp(px, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer()
const trimmed = await sharp(png).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true })
await sharp(trimmed.data).resize({ height: 1100, withoutEnlargement: true }).webp({ quality: 86, alphaQuality: 95 }).toFile(path.join(outDir, `${outName}.webp`))
console.log(`${W}x${H} → ${trimmed.info.width}x${trimmed.info.height}`)

// prévia sobre fundo escuro
const fg = await sharp(path.join(outDir, `${outName}.webp`)).png().toBuffer()
const m = await sharp(fg).metadata()
await sharp({ create: { width: m.width + 80, height: m.height + 80, channels: 3, background: '#0b0b0b' } })
  .composite([{ input: fg, left: 40, top: 40 }])
  .png()
  .toFile(process.env.PREVIEW || path.join(outDir, `${outName}-preview.png`))
