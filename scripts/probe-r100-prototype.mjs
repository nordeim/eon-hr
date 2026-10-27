// probe-r100-prototype.mjs — validate the R100-A fix design BEFORE the plan:
// the position-aware atom join. A sequential operator walk over the content
// stream: Tf tracks the font size (the em denominator), Td/TD set the pending
// separator by the em rule (|tx|/TfSize < 1.0 && tx >= 0 && ty == 0 → no
// space — the per-glyph advance; >= 1.0 or backwards or ty≠0 → space/newline),
// T* a newline. TJ-array INTERNALS keep the current space-join (the
// R97/R98/R99-verified semantics — their numbers are thousandths, a different
// unit system; the r97 fixture -120 must keep its space). Adjacent shows with
// NO positioning between them keep the standing space join.
import { readFileSync } from "node:fs";

// ---- the prototype walk (mirrors the planned pdfTextAtoms restructure) ----
function protoAtomsJoined(content) {
  const unescape = (s) =>
    s.replace(
      /\\(?:([0-7]{1,3})|([nrtbf])|([()\\])|(\r?\n))/g,
      (_m, oct, ws, lit, eol) =>
        oct !== undefined ? String.fromCharCode(parseInt(oct, 8) % 256)
        : ws !== undefined ? " "
        : lit !== undefined ? lit
        : eol !== undefined ? "" : _m
    );
  let out = "";
  let effSize = 1;
  let pendingEm = 0;
  let pendingTy = 0;
  let anyMove = false;
  const flush = (atomText) => {
    let sep = " ";
    if (anyMove) {
      if (pendingTy !== 0) sep = "\n";
      else if (pendingEm >= 1.0) sep = " ";
      else sep = "";
    }
    out += sep + atomText;
    pendingEm = 0; pendingTy = 0; anyMove = false;
  };
  // group layout: 1=Tf size | 2=tx 3=ty (Td/TD) | 4=literal 5=show-op |
  // 6=TJ-array body | 7=hex
  const ops =
    /\/\S+\s+([\d.+-]+)\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|T\*|\(((?:\\.|[^\\()])*)\)\s*(Tj|TJ|'|")|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*(?:Tj|TJ|'|")/g;
  let m;
  while ((m = ops.exec(content))) {
    if (m[1] !== undefined) { effSize = parseFloat(m[1]) || 1; continue; }
    if (m[2] !== undefined) {
      const tx = parseFloat(m[2]); const ty = parseFloat(m[3]);
      pendingEm += Math.abs(tx) / effSize; pendingTy += ty;
      anyMove = true;
      continue;
    }
    if (m[0] === "T*") { anyMove = true; pendingTy = 1; continue; }
    if (m[4] !== undefined) {
      const t = unescape(m[4]);
      if (m[5] === "'" || m[5] === '"') { out += "\n" + t; } else { flush(t); }
      pendingEm = 0; pendingTy = 0; anyMove = false;
      continue;
    }
    if (m[6] !== undefined) {
      // the TJ array: internals space-joined (the standing semantics)
      const atomRe = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>/g;
      const parts = [];
      let a;
      while ((a = atomRe.exec(m[6]))) parts.push(a[1] !== undefined ? unescape(a[1]) : `<hex:${a[2]}>`);
      flush(parts.join(" "));
      continue;
    }
    if (m[7] !== undefined) { flush(`<hex:${m[7]}>`); continue; }
  }
  return out.replace(/^ /, "");
}

// ---- the fixtures ----
const perGlyphIrs = `BT /T1_0 1 Tf 24 0 0 24 43.2 748.062 Tm
(S)Tj 0.641 0 Td (p)Tj 0.603 0 Td (o)Tj 0.603 0 Td (u)Tj 0.585 0 Td (s)Tj 0.529 0 Td (e)Tj
EMC /Content <</MCID 544 >>BDC /T1_1 1 Tf 2.356 0 Td (IRA distributions )Tj 8.1 0 Td (.)Tj 1.5 0 Td (.)Tj
(Admin )Tj 0.62 0 Td (specialist )Tj 0.61 0 Td (payroll )Tj 0.58 0 Td (experience )Tj
2.5 0 Td (senior )Tj 0.55 0 Td (manager )Tj 5 (years)Tj ET`;

const tf12Variant = `BT /F1 12 Tf 1 0 0 1 72 720 Tm
(p)Tj 6.2 0 Td (a)Tj 5.9 0 Td (y)Tj 6.1 0 Td (r)Tj 4.2 0 Td (o)Tj 5.8 0 Td (l)Tj 3.1 0 Td (l)Tj
14.5 0 Td (admin)Tj 13.0 0 Td (specialist)Tj 15.2 0 Td (payroll)Tj ET`;

const tjArrayRegression = `BT /F1 12 Tf [(Senior HR Manager) -120 (with payroll)] TJ ET`;
const plainAdjacent = `BT /F1 12 Tf (Senior HR Manager)Tj (with)Tj (payroll)Tj ET`;
const lineBreakTy = `BT /F1 12 Tf (admin)Tj 0 -14.4 Td (payroll)Tj ET`;

console.log("1. per-glyph IRS shape:      ", JSON.stringify(protoAtomsJoined(perGlyphIrs)));
console.log("2. Tf-12 point-unit variant: ", JSON.stringify(protoAtomsJoined(tf12Variant)));
console.log("3. TJ array (r97 semantics): ", JSON.stringify(protoAtomsJoined(tjArrayRegression)));
console.log("4. adjacent Tj (no Td):      ", JSON.stringify(protoAtomsJoined(plainAdjacent)));
console.log("5. ty line break:            ", JSON.stringify(protoAtomsJoined(lineBreakTy)));

// ---- the real-file leg: the IRS f1040 through the same walk ----
const { inflateRealStreams } = { inflateRealStreams: async function* (path) {
  const buf = readFileSync(path);
  const bytes = new Uint8Array(buf);
  const ascii = Buffer.from(buf).toString("latin1");
  async function infl(data, fmt){const s=new Blob([data]).stream().pipeThrough(new DecompressionStream(fmt));return new Uint8Array(await new Response(s).arrayBuffer());}
  const streamRe=/stream[ \t]*(?:\r\n|\r|\n)/g; let m;
  while((m=streamRe.exec(ascii))){
    if(m.index>=3 && ascii.startsWith('end',m.index-3)) continue;
    const start=m.index+m[0].length; const end=ascii.indexOf('endstream',start); if(end<0)break;
    streamRe.lastIndex=end+9;
    let ce=end;
    if(ascii.charCodeAt(ce-2)===13&&ascii.charCodeAt(ce-1)===10)ce-=2;
    else if(ascii.charCodeAt(ce-1)===10||ascii.charCodeAt(ce-1)===13)ce-=1;
    const chunk=bytes.subarray(start,ce); let text='';
    for(const t of [chunk, bytes.subarray(start,end)]){try{text=new TextDecoder().decode(await infl(t,'deflate'));break;}catch{try{text=new TextDecoder().decode(await infl(t,'deflate-raw'));break;}catch{text='';}}}
    if(!text)continue;
    if(text.includes('beginbfchar')||text.includes('beginbfrange'))continue;
    if(ascii.slice(Math.max(0,m.index-220),m.index).includes('/ObjStm'))continue;
    yield text;
  }
} };
let irsOut = "";
for await (const s of inflateRealStreams("/home/z/my-project/tmp-r100/irs-f1040.pdf")) {
  irsOut += protoAtomsJoined(s) + "\n";
}
console.log("\n6. real IRS f1040 (prototype): length", irsOut.length);
console.log("   first 260:", JSON.stringify(irsOut.slice(0, 260)));
