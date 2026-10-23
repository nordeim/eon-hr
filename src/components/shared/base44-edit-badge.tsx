"use client";

import * as React from "react";
import { X } from "lucide-react";

/**
 * Session 85 (R85-B): the reference's platform-injected "Edit with
 * Base44" badge — replicated for visual parity.
 *
 * The reference (a Base44-hosted app) injects a fixed bottom-right black
 * pill on EVERY page (login + the authed shell + mobile — live-measured
 * at 1440 (197x39 @ x=1227 y=845), 390 (x=177 y=789), and on the
 * authed dashboard). It had never been replicated: invisible to the
 * per-side PNG byte chains (each side is compared against ITSELF across
 * rounds — the badge rode the REF's own baselines for 20+ rounds, 323
 * dark corner pixels in every standing login capture vs 0 on the clone)
 * and to the text-bearing DOM census (the close button's textContent is
 * empty). Found by this round's keyboard tab-walk (the REF's 9th tab
 * stop) + the focused-state cross-side pixel diff.
 *
 * Structure + geometry measured verbatim off the live reference:
 *   #base44-edit-badge dir=ltr — fixed bottom/right 16px, z-999999,
 *   black pill (border 1px rgb(38,38,38), radius 6px, padding 8px 12px,
 *   gap 8px, the twin box-shadow, -apple-system stack, 14px), carrying
 *   the orange symbol img (20x20), the "Edit with" span (12px nowrap,
 *   the inner 14px flex gap-6 div with the wordmark img 56x14 and its
 *   margin-bottom 2px), and #badge-close (18x18, aria-label "Close
 *   badge", the X at 14px).
 *
 * The assets are VENDORED (public/base44-symbol-orange.png +
 * public/base44-wordmark.png) — the zero-external-resources doctrine
 * holds (the REF hotlinks media.base44.com + a base64 wordmark; the
 * clone self-hosts both).
 *
 * Behavior:
 *   - the close is SESSION-ONLY (React state, no storage key — the
 *     REF's close unmounts the node with no localStorage/cookie write
 *     and the badge reappears on reload; live-verified on the REF);
 *   - the pill body is an anchor to https://base44.app (target=_blank)
 *     with tabIndex={-1} — the FUNCTIONAL SUPERSET over the REF's
 *     click-inert badge (probed: no window.open, no navigation for this
 *     user) while keeping the REF's exact tab order (the close button
 *     enters LAST; the pill itself is never a tab stop);
 *   - print-hidden (see globals.css @media print) — the platform chrome
 *     does not belong in the session-29 print-optimized output.
 *
 * Pinned RED-first by tests/e2e/session85-keyboard.spec.ts
 * (R85-B1/B2/B3 + the R85-C tab-order contract).
 */
export function Base44EditBadge() {
  const [open, setOpen] = React.useState(true);
  if (!open) return null;
  return (
    <div
      id="base44-edit-badge"
      dir="ltr"
      style={{
        position: "fixed",
        zIndex: 999999,
        bottom: 16,
        right: 16,
        display: "flex",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgb(0, 0, 0)",
        color: "rgb(255, 255, 255)",
        padding: "8px 12px",
        borderRadius: 6,
        boxShadow:
          "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
        border: "1px solid rgb(38, 38, 38)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: 14,
      }}
    >
      {/* the pill body: the functional superset (the REF's is
          click-inert) — tabIndex -1 keeps the REF's tab order */}
      <a
        href="https://base44.app"
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "inherit",
          textDecoration: "none",
        }}
      >
        <img
          src="/base44-symbol-orange.png"
          alt="base44"
          width={20}
          height={20}
          style={{ width: 20, height: 20 }}
        />
        <span style={{ whiteSpace: "nowrap", fontSize: 12 }}>
          <span id="badge-content">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              <span>Edit with </span>
              <span style={{ marginBottom: 2 }}>
                <img
                  src="/base44-wordmark.png"
                  alt="Base44"
                  width={56}
                  height={14}
                  style={{ width: 56, height: 14 }}
                />
              </span>
            </div>
          </span>
        </span>
      </a>
      <button
        id="badge-close"
        aria-label="Close badge"
        type="button"
        onClick={() => setOpen(false)}
        style={{
          padding: 2,
          marginLeft: 2,
          borderRadius: 9999,
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          transition: "background-color 0.2s",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X className="h-[14px] w-[14px]" aria-hidden="true" />
      </button>
    </div>
  );
}
