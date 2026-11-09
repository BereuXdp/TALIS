// Recorta a estátua do anjo (foto em fundo preto, Unsplash Dx9XoE2xXp0, Adismara Putri Pradiri)
// para a cena "Ouve. Entende. Vende.". O fundo é quase preto: a transparência vem do brilho
// (sombras profundas somem no preto da página) e a base some num degradê.
// Uso: node tools/cine-statue.mjs <entrada.jpg>
import path from 'node:path'
import sharp from 'sharp'

const [input] = process.argv.slice(2)
const out = path.resolve(import.meta.dirname, '..', 'public', 'site', 'cine-estatua.webp')
const crop = { left: 860, top: 260, width: 520, height: 807 }

const base = sharp(input).extract(crop)
const { data: rgb, info } = await base.clone().removeAlpha().raw().toBuffer({ resolveWithObject: true })
const grey = await base.clone().greyscale().blur(1).raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info
const px = Buffer.alloc(W * H * 4)
for (let y = 0; y < H; y++) {
  const fade = Math.min(1, (H - y) / (H * 0.18)) // base some
  for (let x = 0; x < W; x++) {
    const k = y * W + x
    const l = grey.data[k * grey.info.channels]
    const t = Math.min(1, Math.max(0, (l - 14) / 36))
    const a = t * t * (3 - 2 * t) * fade
    for (let c = 0; c < 3; c++) px[k * 4 + c] = Math.min(255, rgb[k * info.channels + c] * 1.06)
    px[k * 4 + 3] = Math.round(a * 255)
  }
}
await sharp(px, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 86, alphaQuality: 95 }).toFile(out)
console.log(`${W}x${H} → ${out}`)
