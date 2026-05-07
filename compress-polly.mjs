import sharp from 'sharp';
import { readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const dir = './proyecto-travelyx/src/assets/polly';
const files = readdirSync(dir).filter(f => f.endsWith('.png'));

for (const file of files) {
  const input = join(dir, file);
  console.log(`Compressing ${file}...`);
  const buf = await sharp(input)
    .resize({ width: 600, withoutEnlargement: true })
    .png({ quality: 80, compressionLevel: 9 })
    .toBuffer();
  writeFileSync(input, buf);
  console.log(`✅ ${file}: ${(buf.length / 1024 / 1024).toFixed(2)} MB`);
}
console.log('Done!');
