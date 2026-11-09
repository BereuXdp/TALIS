// Prepara a estátua da cena "Ouve. Entende. Vende." (busto de perfil com raios de luz, fundo escuro).
// A transparência vem do brilho: o fundo escuro some no preto da página, os raios ficam suaves,
// e as bordas (base e lado esquerdo cortados pela foto) somem num degradê.
// Uso: node tools/cine-statue.mjs <entrada>
import path from 'node:path'
import sharp from 'sharp'

const [input] = process.argv.slice(2)
const out = path.resolve(import.meta.dirname, '..', 'public', 'site', 'cine-estatua.webp')

const { data: rgb, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const grey = await sharp(input).removeAlpha().greyscale().blur(1.5).raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info
const px = Buffer.alloc(W * H * 4)
const edge = (d, n) => Math.min(1, d / n)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const k = y * W + x
    const l = grey.data[k * grey.info.channels]
    const t = Math.min(1, Math.max(0, (l - 30) / 70))
    const fade = edge(H - y, H * 0.22) * edge(x, W * 0.14) * edge(W - x, W * 0.06) * edge(y, H * 0.04)
    const a = t * t * (3 - 2 * t) * fade
    for (let c = 0; c < 3; c++) px[k * 4 + c] = rgb[k * info.channels + c]
    px[k * 4 + 3] = Math.round(a * 255)
  }
}
await sharp(px, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 86, alphaQuality: 95 }).toFile(out)
console.log(`${W}x${H} → ${out}`)
