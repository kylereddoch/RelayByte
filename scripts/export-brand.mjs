import { readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';
import sharp from 'sharp';
import { openSync } from 'fontkit';

// Generate production assets from the editable symbol and licensed Manrope font.
const out = 'src/assets/brand';
await mkdir(out, { recursive: true });
await mkdir('src/assets/fonts', { recursive: true });
const fontRoot = 'node_modules/@fontsource-variable/manrope';
await copyFile(`${fontRoot}/files/manrope-latin-wght-normal.woff2`, 'src/assets/fonts/manrope-latin-variable.woff2');
await copyFile(`${fontRoot}/LICENSE`, 'src/assets/fonts/OFL-Manrope.txt');
const master = await readFile('brand/symbol-master.svg', 'utf8');
const paths = master.match(/<path[^>]+\/>/g).join('');
const palette = { orange: '#ef623f', ink: '#151718', paper: '#f4f2ed' };
const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>\n`;
const mark = (x, y, size, color) => `<g transform="translate(${x} ${y}) scale(${size / 1254})" fill="${color}">${paths}</g>`;
const writeSVG = async (name, data) => writeFile(`${out}/${name}.svg`, data);
const png = async (name, data, width) => sharp(Buffer.from(data)).resize({ width }).png().toFile(`${out}/${name}.png`);
const font = openSync('node_modules/@fontsource/manrope/files/manrope-latin-700-normal.woff2');
const run = font.layout('RelayByte');
const fontScale = 123 / font.unitsPerEm;
let cursor = 0;
const letters = run.glyphs.map((glyph, i) => {
  const p = run.positions[i];
  const shape = `<path d="${glyph.path.toSVG()}" transform="translate(${cursor + p.xOffset * fontScale} ${-p.yOffset * fontScale}) scale(${fontScale} ${-fontScale})"/>`;
  cursor += p.xAdvance * fontScale - 3;
  return shape;
}).join('');

for (const [name, color] of Object.entries(palette)) {
  const symbol = svg(1254, 1254, mark(0, 0, 1254, color));
  await writeSVG(`relaybyte-symbol-${name}`, symbol);
  await png(`relaybyte-symbol-${name}-1024`, symbol, 1024);
  const wordmark = svg(620, 180, `<g transform="translate(12 126)" fill="${color}">${letters}</g>`);
  await writeSVG(`relaybyte-wordmark-${name}`, wordmark);
  const lockup = svg(860, 240, mark(-11, -11, 262, palette.orange) + `<g transform="translate(254 151)" fill="${color}">${letters}</g>`);
  if (name !== 'orange') {
    await writeSVG(`relaybyte-lockup-${name}`, lockup);
    await png(`relaybyte-lockup-${name}`, lockup, 860);
  }
}
const icon = svg(512, 512, `<rect width="512" height="512" fill="${palette.ink}"/>` + mark(0, 0, 512, palette.orange));
await writeSVG('favicon', icon);
for (const size of [16, 32, 48, 180, 192, 512]) await png(size === 180 ? 'apple-touch-icon' : `icon-${size}`, icon, size);
await png('stripe-icon-512', icon, 512);
// PNG-compressed favicon is supported by modern browsers and Windows.
const faviconData = await readFile(`${out}/icon-32.png`);
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
header[6] = 32; header[7] = 32;
header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
header.writeUInt32LE(faviconData.length, 14); header.writeUInt32LE(22, 18);
await writeFile(`${out}/favicon.ico`, Buffer.concat([header, faviconData]));

const social = svg(1200, 630, `<rect width="1200" height="630" fill="${palette.ink}"/>` + mark(53, 30, 420, palette.orange) + `<g transform="translate(492 282)" fill="${palette.paper}">${letters}</g><text x="130" y="521" font-family="sans-serif" font-size="28" fill="${palette.paper}">Independent apps by Kyle Reddoch.</text>`);
await png('social-card', social, 1200);
for (const name of ['stripe-icon-512', 'relaybyte-lockup-ink', 'relaybyte-lockup-paper']) {
  const file = `${out}/${name}.png`;
  const { width, height } = await sharp(file).metadata();
  const { size } = await stat(file);
  if (width < 128 || height < 128 || size >= 512_000) throw new Error(`Stripe asset out of bounds: ${file}`);
  console.log(`${file}: ${width} × ${height}, ${size} bytes`);
}
console.log('Brand exports regenerated from the editable symbol and licensed, outlined Manrope wordmark.');
