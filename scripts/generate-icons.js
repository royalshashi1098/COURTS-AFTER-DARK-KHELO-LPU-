import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

// Helper to create uncompressed/deflated raw PNG bytes
function createPng(width, height, getPixel) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with filter type 0 per scanline
  const stride = width * 4;
  const rawData = Buffer.alloc(height * (stride + 1));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(length + 12);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcTable = getCrcTable();
  let crc = 0xffffffff;
  for (let i = 4; i < length + 8; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ chunk[i]) & 0xff];
  }
  crc = (crc ^ 0xffffffff) >>> 0;
  chunk.writeUInt32BE(crc, length + 8);
  return chunk;
}

let crcTableCache = null;
function getCrcTable() {
  if (crcTableCache) return crcTableCache;
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[n] = c >>> 0;
  }
  crcTableCache = table;
  return crcTableCache;
}

// Pixel generator for KHELO LPU: Dark navy canvas, lime & white sporty geometry
function getKheloPixel(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const normDist = dist / (w * 0.46);

  // Background gradient: #080E1E (8, 14, 30) to #0F1F3D (15, 31, 61)
  const bgT = Math.min(1, Math.max(0, (y / h) * 0.8 + (x / w) * 0.2));
  let r = Math.round(8 + bgT * 12);
  let g = Math.round(14 + bgT * 22);
  let b = Math.round(30 + bgT * 40);
  let a = 255;

  // Outer stadium ring
  if (Math.abs(normDist - 0.85) < 0.035) {
    return [30, 58, 100, 255];
  }
  if (Math.abs(normDist - 0.65) < 0.02) {
    return [204, 255, 0, 180]; // Electric lime accent ring
  }

  // Draw Letter "K" and sports flash in center
  const scale = w / 512;
  const lx = x / scale;
  const ly = y / scale;

  // Stem of 'K' (x: 160..210, y: 140..370)
  if (lx >= 160 && lx <= 210 && ly >= 140 && ly <= 370) {
    // Electric lime gradient
    return [204, 255, 0, 255];
  }

  // Upper diagonal arm of 'K'
  // Center pivot around (200, 250)
  const arm1Dist = Math.abs((ly - 250) + 0.9 * (lx - 200));
  if (arm1Dist < 26 && lx >= 200 && lx <= 350 && ly >= 135 && ly <= 260) {
    return [255, 255, 255, 255];
  }

  // Lower diagonal arm of 'K'
  const arm2Dist = Math.abs((ly - 250) - 0.9 * (lx - 200));
  if (arm2Dist < 26 && lx >= 200 && lx <= 350 && ly >= 240 && ly <= 370) {
    return [255, 255, 255, 255];
  }

  // Sports dynamic chevron dot / flame
  const fdx = lx - 320;
  const fdy = ly - 250;
  if (fdx * fdx + fdy * fdy < 240) {
    return [204, 255, 0, 255];
  }

  return [r, g, b, a];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons...');
const p192 = createPng(192, 192, (x, y, w, h) => getKheloPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), p192);

const p512 = createPng(512, 512, (x, y, w, h) => getKheloPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), p512);

const pMaskable = createPng(512, 512, (x, y, w, h) => getKheloPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pMaskable);

const appleIcon = createPng(180, 180, (x, y, w, h) => getKheloPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

// Favicon 32x32
const favicon = createPng(32, 32, (x, y, w, h) => getKheloPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon);

console.log('Successfully generated all PWA icons in /public:');
console.log('- pwa-192x192.png');
console.log('- pwa-512x512.png');
console.log('- pwa-maskable-512x512.png');
console.log('- apple-touch-icon.png');
console.log('- favicon.ico');
