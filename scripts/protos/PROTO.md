# The census proto (session 120 — the checkout-portability contract)

`cv-text-proto.ts` is the **committed census proto**: a verbatim copy of
`src/lib/cv-text.ts` plus exactly TWO documented insertions that expose the
piece-level debug surfaces the `scripts/` census families read. It exists so
the census scripts never import ephemeral `/tmp` state — the fresh-clone
gate failure class (23 unresolved imports broke `tsc` AND `next build` on
any sandbox reset; the neo-crm s210 checkout-portability genus).

## The two insertions

1. **The flat debug surface** (module level, after
   `const MAX_INFLATED_BYTES = 8 * 1024 * 1024;`):

   ```ts
   export const __r117DebugPieces: Array<Record<string, unknown>> = [];
   ```

2. **The debug-capture hook** (inside the per-part assembly, right after
   the `decoded` map closes, before the R110-D census comment): pushes
   each part's decoded pieces into `globalThis.__r119pages` (the nested
   per-part form), `globalThis.__r118pieces` (the flat spread form), and
   the module's `__r117DebugPieces` export. The census scripts reset
   their own global before each extraction; the hook only ever appends —
   the extraction's own output is untouched.

## The regeneration contract

`sync-proto.mjs` regenerates the proto from the source (anchor-verified;
it refuses a source that already carries the debug surface). **After any
edit to `src/lib/cv-text.ts`, re-run it:**

```
bun scripts/protos/sync-proto.mjs
```

The pin (`tests/unit/script-portability.test.ts`) enforces the contract:
the SYNC arm regenerates the expected content in-test and compares — a
source edit without a re-sync goes RED (and so does every mutation of the
source, by design). The `--also-tmp` flag additionally materializes the
legacy `/tmp/r116-r119-proto/cv-text.ts` paths for one-shot re-runs of
pre-r120 census scripts that still reference them (none do after the r120
repoint; the flag stays for archaeology).

## The consumers

- the r117 census family: `mod.__r117DebugPieces` (flat, piece-level)
- the r118 census family: `globalThis.__r118pieces` (flat, spread)
- the r119/r120 census family: `globalThis.__r119pages` (nested per-part
  — the per-part form avoids the cross-page-adjacency artifact a
  flattened dump manufactures)

The app NEVER imports this file.
