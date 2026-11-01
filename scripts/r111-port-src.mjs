// r111-build-proto.mjs — build the CLEAN R111 prototype (A+B+C') from
// src/lib/cv-text.ts using LINE-BASED edits and String.raw regex lines:
//   R111-A — the literal-form CID decode (raw bytes + own-binding chain)
//   R111-B — the lowercase f-name class at the five pair-regex sites
//   R111-C' — the one-level nested-paren literal class at the three
//             string alternatives (ops show-literal, array body, atomRe)
// Run: node scripts/r111-build-proto.mjs
import fs from "node:fs";

const SRC = "/home/z/my-project/eon-hr/src/lib/cv-text.ts";
const OUT = "/home/z/my-project/eon-hr/src/lib/cv-text.ts";
let s = fs.readFileSync(SRC, "utf8");
const lines = s.split("\n");

function findLine(substr, from = 0) {
  for (let i = from; i < lines.length; i++) if (lines[i].includes(substr)) return i;
  throw new Error("line not found: " + substr);
}

// ---------- R111-A ----------
{
  const i = findLine("type TextPiece = { sep: string; font?: string; condGap?: boolean }");
  lines[i] = lines[i].replace(
    '{ kind: "lit"; text: string }',
    '{ kind: "lit"; text: string; raw?: string }'
  );
}
{
  const i = findLine("line continuation");
  if (!lines[i + 1].includes("}") || !lines[i + 2].includes(");")) throw new Error("unescape close shape unexpected");
  const rawFn = [
    "  // R111-A: the RAW byte string — escapes resolved to TRUE bytes (octal to",
    "  // the byte value, ws shortforms to the control byte, escaped delimiters",
    "  // to the literal char, EOL continuation to nothing), NO printable scrub.",
    "  // The 2-byte Identity-H codes a CID writer carries in LITERAL strings",
    "  // survive only here — unescape's latin1Printable turns every control",
    "  // byte into a space and destroys the code pairing.",
    "  const unescapeRaw = (s2: string): string => {",
    String.raw`    const re = /\\(?:([0-7]{1,3})|([nrtbf])|([()\\])|(\r?\n))/g;`,
    '    let out = "";',
    "    let last = 0;",
    "    let m2: RegExpExecArray | null;",
    "    while ((m2 = re.exec(s2))) {",
    "      out += s2.slice(last, m2.index);",
    '      if (m2[1] !== undefined) out += String.fromCharCode(parseInt(m2[1], 8) % 256);',
    '      else if (m2[2] !== undefined)',
    '        out += String.fromCharCode(m2[2] === "n" ? 10 : m2[2] === "r" ? 13 : m2[2] === "t" ? 9 : m2[2] === "b" ? 8 : 12);',
    "      else if (m2[3] !== undefined) out += m2[3];",
    "      last = re.lastIndex;",
    "    }",
    "    out += s2.slice(last);",
    "    return out;",
    "  };",
    "",
  ];
  lines.splice(i + 3, 0, ...rawFn);
}
{
  const i = findLine("const text = unescape(m[4]);");
  lines.splice(i + 1, 0, "      const rawText = unescapeRaw(m[4]);");
  const j = findLine('pieces.push({ sep: pieces.length === 0 ? "" : "\\n", font: curFont, kind: "lit", text });');
  lines[j] = lines[j].replace('kind: "lit", text });', 'kind: "lit", text, raw: rawText });');
  const k = findLine('push({ kind: "lit", text });');
  lines[k] = lines[k].replace('push({ kind: "lit", text });', 'push({ kind: "lit", text, raw: rawText });');
}
{
  const i = findLine('push(a[1] !== undefined ? { kind: "lit", text: unescape(a[1]) }');
  lines[i] = lines[i].replace(
    '{ kind: "lit", text: unescape(a[1]) }',
    '{ kind: "lit", text: unescape(a[1]), raw: unescapeRaw(a[1]) }'
  );
}

s = lines.join("\n");

// the own-chain resolver + the assembly lit-CID decode
{
  const anchor = "    const localFor = (font?: string): CodeMap[] => {";
  if (!s.includes(anchor)) throw new Error("A5 anchor missing");
  const ownChain = [
    "    // R111-A: the OWN-BINDING chain — the pageMap + candidate resolutions",
    "    // (real font bindings), never the global all-cmaps fallback: the loose",
    "    // first-covering walk produced the dvipdfmx/IRS false-cover class (a",
    "    // literal whose bytes happened to pair into a foreign CJK map's codes).",
    "    const ownChainFor = (font?: string): CodeMap[] => {",
    "      if (!font) return [];",
    "      const out: CodeMap[] = [];",
    "      const pageMap = pageFonts.get(objNum);",
    "      if (pageMap) {",
    "        const fontObj = pageMap.get(font);",
    "        if (fontObj !== undefined) {",
    "          const tu = objToTu.get(fontObj);",
    "          if (tu !== undefined) {",
    "            const cm = tuToCmap.get(tu);",
    "            if (cm) out.push(cm);",
    "          }",
    "        }",
    "        if (out.length) return out;",
    "      }",
    "      const cands = fCandidates.get(font);",
    "      if (cands?.length) {",
    "        for (const c of [...cands].sort((a, b) => a.pos - b.pos)) {",
    "          const tu = objToTu.get(c.obj);",
    "          if (tu !== undefined) {",
    "            const cm = tuToCmap.get(tu);",
    "            if (cm) out.push(cm);",
    "          }",
    "        }",
    "      }",
    "      return out;",
    "    };",
    "",
  ].join("\n");
  s = s.replace(anchor, ownChain + anchor);
}
{
  const hexLine = '      if (p.kind === "hex") return { p, text: decodeHexString(p.hex, localFor(p.font)) };';
  if (!s.includes(hexLine)) throw new Error("A5b hex line missing");
  const litCID = [
    "      // R111-A: the LITERAL-form CID decode — a literal whose font's OWN",
    "      // binding chain resolves a codeLen-2 CMap that FULLY covers its",
    "      // byte-paired codes decodes through it (the Typst 16th-writer class:",
    "      // Identity-H codes as octal-escaped literals, not hex atoms). The",
    "      // full-coverage guard keeps every 1-byte-font literal verbatim.",
    '      if (p.kind === "lit" && p.raw && p.raw.length >= 2 && p.raw.length % 2 === 0) {',
    "        const chain = ownChainFor(p.font);",
    "        for (const cm of chain) {",
    "          if (cm.codeLen !== 2) continue;",
    "          const codes: number[] = [];",
    "          let covered = true;",
    "          for (let i = 0; i < p.raw.length; i += 2) {",
    "            const c = p.raw.charCodeAt(i) * 256 + p.raw.charCodeAt(i + 1);",
    "            if (!cm.map.has(c)) { covered = false; break; }",
    "            codes.push(c);",
    "          }",
    '          if (covered) return { p, text: codes.map((c) => cm.map.get(c) ?? "").join("") };',
    "        }",
    "      }",
  ].join("\n");
  s = s.replace(hexLine, hexLine + "\n" + litCID);
}

// ---------- R111-B ----------
{
  const from = "(F\\w+(?:\\.\\w+)*)\\s+(\\d+)\\s+0\\s+R";
  const to = "([Ff]\\w+(?:\\.\\w+)*)\\s+(\\d+)\\s+0\\s+R";
  const nB = s.split(from).length - 1;
  s = s.split(from).join(to);
  console.log("R111-B pair-regex sites:", nB);
}

// ---------- R111-C' (wholesale regex-line replacement via String.raw) ----------
{
  const oldOps = String.raw`    /\/\S+\s+([\d.+-]+)\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|T\*|\bBT\b|\(((?:\\.|[^\\()])*)\)\s*(Tj|TJ|'|")|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()])*\))*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*(Tj|TJ|'|")|(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+Tm/g;`;
  const newOps = String.raw`    /\/\S+\s+([\d.+-]+)\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+T[dD]|T\*|\bBT\b|\(((?:\\.|[^\\()]|\((?:\\.|[^\\()])*\))*)\)\s*(Tj|TJ|'|")|\[((?:\\.|[^\[\]\\()]|\((?:\\.|[^\\()]|\((?:\\.|[^\\()])*\))*\))*)\]\s*TJ|<([0-9A-Fa-f\s]+)>\s*(Tj|TJ|'|")|(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+Tm/g;`;
  if (!s.includes(oldOps)) throw new Error("C' ops line not found");
  s = s.replace(oldOps, newOps);
  console.log("C' ops line replaced");
}
{
  const oldAtom = String.raw`      const atomRe = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>|(-?[\d.]+)/g;`;
  const newAtom = String.raw`      const atomRe = /\(((?:\\.|[^\\()]|\((?:\\.|[^\\()])*\))*)\)|<([0-9A-Fa-f\s]+)>|(-?[\d.]+)/g;`;
  if (!s.includes(oldAtom)) throw new Error("C' atomRe line not found");
  s = s.replace(oldAtom, newAtom);
  console.log("C' atomRe line replaced");
}

fs.writeFileSync(OUT, s);
console.log("clean prototype written to", OUT);
