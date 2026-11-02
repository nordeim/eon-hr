// make-r120-diag.mjs — build the THROWAWAY diagnosis proto (/tmp/r120-diag/)
// from src/lib/cv-text.ts + an instrumentation hook capturing the per-part
// width-resolution state: each font name the pieces use, its pageMap
// binding, the objWidths entry, and the widthFor verdict. Diagnosis-only
// (never committed as the census proto — the committed proto carries only
// the piece-dump hook).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SRC = "/home/z/my-project/eon-hr/src/lib/cv-text.ts";
const OUT = "/tmp/r120-diag/cv-text.ts";
const src = readFileSync(SRC, "utf8");

// instrument widthFor inside the parts map — right after its definition
const ANCHOR = `    const widthFor = (font?: string): WidthEntry | undefined => {
      if (!font) return undefined;
      const fo = pageMap?.get(font);
      if (fo === undefined) return undefined;
      return objWidths.get(fo);
    };`;
const REPLACEMENT = ANCHOR + `
    // R120 DIAG (throwaway): the per-part width-resolution trace
    {
      const __seen = new Map<string, { pageMap: boolean; fo?: number; widths: boolean; pieces: number; blindAfter: number }>();
      for (const piece of pieces) {
        const f = piece.font ?? "(none)";
        const rec = __seen.get(f) ?? { pageMap: pageMap?.has(f) ?? false, fo: pageMap?.get(f), widths: false, pieces: 0, blindAfter: 0 };
        rec.pieces++;
        const we = widthFor(piece.font);
        if (we) rec.widths = true; else rec.blindAfter++;
        __seen.set(f, rec);
      }
      const __g = globalThis as unknown as { __r120diag?: unknown[] };
      (__g.__r120diag ??= []).push({ objNum, pageMapKeys: [...(pageMap?.keys() ?? [])], fonts: [...__seen.entries()] });
    }`;

if (!src.includes(ANCHOR)) throw new Error("widthFor anchor missing");
const out = src.replace(ANCHOR, REPLACEMENT);
mkdirSync("/tmp/r120-diag", { recursive: true });
writeFileSync(OUT, out);
console.log(`diag proto written: ${OUT}`);
