// Unpacks WOFF1 (zlib) fonts from @fontsource/inter into plain TTFs for troika-three-text,
// which cannot parse these WOFF files. Runs before `next build`; output goes to public/fonts.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const out = process.argv[2] ?? 'public/fonts';
mkdirSync(out, { recursive: true });

function woffToSfnt(buf) {
  if (buf.toString('ascii', 0, 4) !== 'wOFF') throw new Error('not a WOFF file');
  const flavor = buf.readUInt32BE(4);
  const n = buf.readUInt16BE(12);
  const tables = [];
  for (let i = 0; i < n; i++) {
    const o = 44 + i * 20;
    const tag = buf.toString('ascii', o, o + 4);
    const off = buf.readUInt32BE(o + 4), comp = buf.readUInt32BE(o + 8), orig = buf.readUInt32BE(o + 12), sum = buf.readUInt32BE(o + 16);
    const raw = buf.subarray(off, off + comp);
    tables.push({ tag, sum, data: comp < orig ? inflateSync(raw) : raw });
  }
  tables.sort((a, b) => (a.tag < b.tag ? -1 : 1));
  let offset = 12 + n * 16;
  const head = Buffer.alloc(offset);
  head.writeUInt32BE(flavor, 0); head.writeUInt16BE(n, 4);
  const pow = 2 ** Math.floor(Math.log2(n));
  head.writeUInt16BE(pow * 16, 6); head.writeUInt16BE(Math.log2(pow), 8); head.writeUInt16BE(n * 16 - pow * 16, 10);
  const parts = [head];
  tables.forEach((t, i) => {
    const o = 12 + i * 16;
    head.write(t.tag, o, 'ascii'); head.writeUInt32BE(t.sum, o + 4); head.writeUInt32BE(offset, o + 8); head.writeUInt32BE(t.data.length, o + 12);
    const pad = (4 - (t.data.length % 4)) % 4;
    parts.push(t.data, Buffer.alloc(pad)); offset += t.data.length + pad;
  });
  return Buffer.concat(parts);
}

for (const w of [500, 800]) {
  const src = `node_modules/@fontsource/inter/files/inter-latin-${w}-normal.woff`;
  writeFileSync(`${out}/inter-${w}.ttf`, woffToSfnt(readFileSync(src)));
}
console.log('fonts written to', out);
