import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve(process.cwd(), 'public/icon.svg');
const resDir = path.resolve(process.cwd(), 'android/app/src/main/res');

const iconSizes = [
  { folder: 'mipmap-mdpi', size: 48, fgSize: 108 },
  { folder: 'mipmap-hdpi', size: 72, fgSize: 162 },
  { folder: 'mipmap-xhdpi', size: 96, fgSize: 216 },
  { folder: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
  { folder: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
];

async function generateAndroidIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  for (const item of iconSizes) {
    const dir = path.join(resDir, item.folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 1. Standard square/rounded icon
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(path.join(dir, 'ic_launcher.png'));

    // 2. Round icon
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    // 3. Adaptive icon foreground (with padding)
    const paddedInnerSize = Math.round(item.fgSize * 0.72);
    const innerLogo = await sharp(svgBuffer)
      .resize(paddedInnerSize, paddedInnerSize, { fit: 'contain' })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: item.fgSize,
        height: item.fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: innerLogo, gravity: 'center' }])
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));

    console.log(`Generated custom Noor Chat icons for ${item.folder}`);
  }

  console.log('All Android custom icons generated successfully!');
}

generateAndroidIcons().catch((err) => {
  console.error('Failed to generate Android icons:', err);
  process.exit(1);
});
