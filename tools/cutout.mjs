// Prepara a foto da estátua (PNG/WebP com fundo transparente) para o hero da landing:
// aplica a luz vinda de cima à direita, mantém a transparência e gera dois tamanhos.
// Se a imagem tiver fundo branco em vez de transparente, ele é removido antes.
// Uso: node tools/cutout.mjs <entrada> [nome-de-saida]
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const [input, outName = 'busto-hero'] = process.argv.slice(2)
const outDir = path.resolve(import.meta.dirname, '..', 'public', 'site')
fs.mkdirSync(outDir, { recursive: true })

const { width: W, height: H } = await sharp(input).metadata()

// transparência: usa a da imagem; se as bordas forem brancas e opacas, recorta o branco ligado à borda
let alpha = await sharp(input).ensureAlpha().extractChannel(3).raw().toBuffer()
const rgba = await sharp(input).ensureAlpha().raw().toBuffer()
const corner = rgba[3]
if (corner > 200) {
  const isBg = (k) => rgba[k * 4] > 238 && rgba[k * 4 + 1] > 238 && rgba[k * 4 + 2] > 238
  const seen = new Uint8Array(W * H)
  const stack = []
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return
    const k = y * W + x
    if (seen[k] || !isBg(k)) return
    seen[k] = 1
    stack.push(k)
  }
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1) }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y) }
  while (stack.length) {
    const k = stack.pop()
    const x = k % W
    const y = (k / W) | 0
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1)
  }
  alpha = Buffer.from(alpha.map((a, k) => (seen[k] ? 0 : a)))
  alpha = await sharp(alpha, { raw: { width: W, height: H, channels: 1 } }).blur(1).extractChannel(0).raw().toBuffer()
}

// luz: feixe quente no alto à direita, sombra no lado esquerdo e na base
const light = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="l" cx="0.74" cy="0.16" r="1">
        <stop offset="0" stop-color="#fff3e0"/>
        <stop offset="0.42" stop-color="#d6cfc3"/>
        <stop offset="0.8" stop-color="#6b665e"/>
        <stop offset="1" stop-color="#3b3833"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#l)"/>
  </svg>`,
)
const litRgb = await sharp(input)
  .removeAlpha()
  .composite([{ input: light, blend: 'multiply' }])
  .modulate({ brightness: 1.15, saturation: 0.85 })
  .removeAlpha()
  .toColourspace('srgb')
  .raw()
  .toBuffer({ resolveWithObject: true })

// monta RGBA à mão (luz aplicada + transparência original)
const ch = litRgb.info.channels
const px = Buffer.alloc(W * H * 4)
for (let k = 0; k < W * H; k++) {
  px[k * 4] = litRgb.data[k * ch]
  px[k * 4 + 1] = litRgb.data[k * ch + 1]
  px[k * 4 + 2] = litRgb.data[k * ch + 2]
  px[k * 4 + 3] = alpha[k]
}
const out = await sharp(px, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer()
const trimmed = await sharp(out).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true })

await sharp(trimmed.data).resize({ height: 1400, withoutEnlargement: true }).webp({ quality: 86, alphaQuality: 95 }).toFile(path.join(outDir, `${outName}.webp`))
await sharp(trimmed.data).resize({ height: 760, withoutEnlargement: true }).webp({ quality: 84, alphaQuality: 92 }).toFile(path.join(outDir, `${outName}-800.webp`))
console.log(`${W}x${H} → ${trimmed.info.width}x${trimmed.info.height}`)
console.log(fs.readdirSync(outDir).filter((f) => f.startsWith(outName)).map((f) => `${f} ${Math.round(fs.statSync(path.join(outDir, f)).size / 1024)} KB`).join('\n'))
