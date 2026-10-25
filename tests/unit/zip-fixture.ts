// A minimal ZIP writer for the cv-text spec fixtures — builds a
// deflate-raw (method 8) zip with a correct End-of-Central-Directory record
// so the production zip walker in src/lib/cv-text.ts can find, inflate, and
// read it — the same shape a real .docx carries. Kept in tests/ (not src/):
// it exists only to craft fixtures; production reads, never writes, zips.

export interface ZipEntry {
  name: string;
  data: Uint8Array;
}

// CRC-32 (IEEE 802.3, reflected) — required by the local + central headers.
const table = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of bytes) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

async function deflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream("deflate-raw");
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(cs);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function cat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

const u16 = (v: number) => new Uint8Array([v & 0xff, (v >>> 8) & 0xff]);
const u32 = (v: number) =>
  new Uint8Array([v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff]);

export async function makeZip(entries: ZipEntry[]): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const locals: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = enc.encode(entry.name);
    const compressed = await deflateRaw(entry.data);
    const crc = crc32(entry.data);

    locals.push(
      cat([
        u32(0x04034b50), // local file header signature
        u16(20), // version needed
        u16(0), // flags
        u16(8), // method 8 = deflate (the real .docx form)
        u16(0), u16(0), // mod time/date
        u32(crc),
        u32(compressed.length),
        u32(entry.data.length),
        u16(nameBytes.length),
        u16(0), // extra length
        nameBytes,
        compressed,
      ])
    );

    central.push(
      cat([
        u32(0x02014b50), // central directory header signature
        u16(20), u16(20), // version made by / needed
        u16(0), u16(8), // flags / method
        u16(0), u16(0), // time / date
        u32(crc), u32(compressed.length), u32(entry.data.length),
        u16(nameBytes.length), u16(0), u16(0), // extra + comment
        u16(0), u16(0), // disk number + internal attrs
        u32(0), // external attrs
        u32(offset),
        nameBytes,
      ])
    );
    offset += locals[locals.length - 1].length;
  }

  const centralBytes = cat(central);
  return cat([
    ...locals,
    centralBytes,
    u32(0x06054b50), // end of central directory signature
    u16(0), u16(0), // disk numbers
    u16(entries.length), u16(entries.length),
    u32(centralBytes.length), u32(offset),
    u16(0), // comment length
  ]);
}
