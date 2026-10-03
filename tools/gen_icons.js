import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const NAVY = [27, 42, 74, 255];
const WHITE = [255, 255, 255, 255];
const TEAL = [31, 122, 140, 255];

function createPNG(width, height, rgbaBuffer) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgbaBuffer.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const compressed = zlib.deflateSync(raw);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const toCrc = buf.subarray(4, 8 + len);
  buf.writeUInt32BE(crc32(toCrc), 8 + len);
  return buf;
}

function fillRoundedRect(buffer, width, height, x1, y1, x2, y2, radius, color) {
  const minX = Math.max(0, Math.min(x1, x2));
  const maxX = Math.min(width - 1, Math.max(x1, x2));
  const minY = Math.max(0, Math.min(y1, y2));
  const maxY = Math.min(height - 1, Math.max(y1, y2));
  const r = Math.min(radius, (maxX - minX) / 2, (maxY - minY) / 2);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      let inside = true;
      if (x < minX + r && y < minY + r) {
        const dx = x - (minX + r);
        const dy = y - (minY + r);
        inside = (dx * dx + dy * dy) <= (r * r);
      } else if (x > maxX - r && y < minY + r) {
        const dx = x - (maxX - r);
        const dy = y - (minY + r);
        inside = (dx * dx + dy * dy) <= (r * r);
      } else if (x < minX + r && y > maxY - r) {
        const dx = x - (minX + r);
        const dy = y - (maxY - r);
        inside = (dx * dx + dy * dy) <= (r * r);
      } else if (x > maxX - r && y > maxY - r) {
        const dx = x - (maxX - r);
        const dy = y - (maxY - r);
        inside = (dx * dx + dy * dy) <= (r * r);
      }
      if (inside) {
        const idx = (y * width + x) * 4;
        buffer[idx] = color[0];
        buffer[idx + 1] = color[1];
        buffer[idx + 2] = color[2];
        buffer[idx + 3] = color[3];
      }
    }
  }
}

function renderIcon(size, scale = 1.0) {
  const buffer = Buffer.alloc(size * size * 4);
  // Fill background NAVY
  for (let i = 0; i < size * size; i++) {
    buffer[i * 4] = NAVY[0];
    buffer[i * 4 + 1] = NAVY[1];
    buffer[i * 4 + 2] = NAVY[2];
    buffer[i * 4 + 3] = NAVY[3];
  }

  const s = scale * size / 1024.0;
  let ox = 0;
  let oy = 0;
  if (scale !== 1.0) {
    ox = (size - 684 * s) / 2.0 - 170 * s;
    oy = (size - 412 * s) / 2.0 - 360 * s;
  }

  const X = (v) => Math.round(ox + v * s);
  const Y = (v) => Math.round(oy + v * s);
  const rad = (v) => Math.max(1, Math.round(v * s));

  // Left page
  fillRoundedRect(buffer, size, size, X(170), Y(360), X(490), Y(720), rad(26), WHITE);
  // Right page
  fillRoundedRect(buffer, size, size, X(534), Y(360), X(854), Y(720), rad(26), WHITE);
  // Middle binding
  fillRoundedRect(buffer, size, size, X(494), Y(360), X(530), Y(720), rad(14), TEAL);

  // Lines on pages
  for (const y of [440, 520, 600]) {
    fillRoundedRect(buffer, size, size, X(215), Y(y), X(445), Y(y + 26), rad(13), NAVY);
    fillRoundedRect(buffer, size, size, X(579), Y(y), X(809), Y(y + 26), rad(13), NAVY);
  }

  // Stand/shelf below
  fillRoundedRect(buffer, size, size, X(300), Y(748), X(724), Y(772), rad(12), TEAL);

  return createPNG(size, size, buffer);
}

const targets = [
  path.resolve('./icons'),
  path.resolve('./public/icons')
];

for (const dir of targets) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'icon-180.png'), renderIcon(180, 1.0));
  fs.writeFileSync(path.join(dir, 'icon-192.png'), renderIcon(192, 1.0));
  fs.writeFileSync(path.join(dir, 'icon-512.png'), renderIcon(512, 1.0));
  fs.writeFileSync(path.join(dir, 'icon-512-maskable.png'), renderIcon(512, 0.62));
  console.log('Generated icons in', dir);
}
