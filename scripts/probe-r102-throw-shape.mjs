// probe-r102-throw-shape.mjs — find a COMPACT synthetic garbage shape whose
// inflated form reliably throws in the ops regex (for the E2E M1 leg).
// The deflate trick: a 12MB inflated body can compress to ~KB, so the E2E
// fixture can carry a real crash-class stream cheaply.
const ops = /\/\S+\s+([\d.+-]+)\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|T\*|\(((?:\\.|[^\\()])*)\)\s*(Tj|TJ|'|")|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*(Tj|TJ|'|")|Tm/g;
function test(name, content) {
  ops.lastIndex = 0;
  const t0 = Date.now();
  try { let c = 0; while (ops.exec(content)) { c++; if (c > 5000000) break; } console.log(name, "OK", ((Date.now() - t0) / 1000).toFixed(1) + "s"); }
  catch (e) { console.log(name, "THROWS:", String(e).slice(0, 60)); }
}
// pseudo-random printable+binary chars with occasional parens
let seed = 42;
const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const chars = "abcXYZ019 \u00ff\u00e3\u0104\u4f60\u00fd\u00fe";
function garbage(n) {
  const parts = [];
  for (let i = 0; i < n; i++) {
    const r = rnd();
    if (r < 0.00005) parts.push("(");
    else if (r < 0.0001) parts.push(") Tj");
    else parts.push(chars[Math.floor(rnd() * chars.length)]);
  }
  return parts.join("");
}
test("random-1M", garbage(1_000_000));
test("random-3M", garbage(3_000_000));
test("random-8M", garbage(8_000_000));
