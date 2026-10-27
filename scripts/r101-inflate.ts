// r101-inflate.ts — a tiny Node-inflate helper for the probe scripts (the
// browser DecompressionStream exists in Node 18+ too, but the probe needs a
// sync-friendly shared import; this mirrors cv-text.ts's inflate contract).
export async function inflate(bytes: Uint8Array, raw = false): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream(raw ? "deflate-raw" : "deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
