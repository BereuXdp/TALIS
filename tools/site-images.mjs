// Converte as imagens enviadas pelo Gabriel para WebP (usadas na landing).
// Uso: node tools/site-images.mjs <busto.png> <leitor.png>
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const [busto, leitor] = process.argv.slice(2)
const out = path.resolve(import.meta.dirname, '..', 'public', 'site')
fs.mkdirSync(out, { recursive: true })

await sharp(busto).resize({ width: 1200 }).webp({ quality: 82 }).toFile(path.join(out, 'busto.webp'))
await sharp(leitor).resize({ width: 1800 }).webp({ quality: 82 }).toFile(path.join(out, 'leitor.webp'))
await sharp(leitor).resize({ width: 900 }).webp({ quality: 80 }).toFile(path.join(out, 'leitor-900.webp'))
console.log(fs.readdirSync(out).map((f) => `${f} ${Math.round(fs.statSync(path.join(out, f)).size / 1024)} KB`).join('\n'))
