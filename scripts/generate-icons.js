import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve(process.cwd(), 'public');
const svgPath = path.join(publicDir, 'icon.svg');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  console.log('Generating PWA icons from', svgPath);

  // 1. 192x192 standard icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  // 2. 512x512 standard icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  // 3. 180x180 Apple Touch Icon for iOS Safari
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // 4. 512x512 Maskable Icon with 15% safe-zone margin on solid #042f2e background
  // Center the 410x410 inner logo inside a 512x512 canvas
  const innerLogo = await sharp(svgBuffer)
    .resize(410, 410, { fit: 'contain' })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 4, g: 47, b: 46, alpha: 1 } // #042f2e brand theme
    }
  })
    .composite([{ input: innerLogo, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');

  // 5. 64x64 favicon.png and favicon.ico
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Generated favicon.png');

  console.log('All PWA icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
