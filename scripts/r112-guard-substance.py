#!/usr/bin/env python3
# r112-guard-substance.py — replace the retired-minority comment + add the
# suffix-substance guard (k <= 0.75n): blocks the ReportLab TOC class
# (k=67/70, the trailing-header suffix) while passing the short-CV probe
# class (k=68/128 = 53%).
P = "/home/z/my-project/eon-hr/src/lib/cv-text.ts"
s = open(P).read()

old_comment = (
    "//   (c) [retired in design] a piece-count minority bound was the first\n"
    "//       column guard — dropped after the probe class: a SHORT CV's floated\n"
    "//       date column ran 53% of the stream's pieces and misfired it. The\n"
    "//       column protection lives in (d) alone (a second column starts at\n"
    "//       the SAME height as the first — suffixTop <= prefixTop + margin);\n"
)
assert s.count(old_comment) == 1, "comment anchor"
s = s.replace(
    old_comment,
    "//   (c) the hoisted run is at most THREE-QUARTERS of the stream's pieces\n"
    "//       — the suffix it merges into must be a substantial flow, not a\n"
    "//       trailing header (the ReportLab TOC pages paint the whole TOC body\n"
    "//       first and the running header LAST: k=67 of 70, 96%). A plain\n"
    "//       minority bound misfired on the SHORT-CV probe class (a floated\n"
    "//       date column at 53% of a one-page stream — floats are not minority\n"
    "//       content on short documents);\n",
)

old_k = "  const k = ascentAt + 1; // the suffix starts here\n  // (e): the suffix must CONTINUE the flow\n"
assert s.count(old_k) == 1, "k anchor"
s = s.replace(
    old_k,
    "  const k = ascentAt + 1; // the suffix starts here\n"
    "  if (k > 0.75 * n) return pieces; // (c) the suffix-substance guard\n"
    "  // (e): the suffix must CONTINUE the flow\n",
)
open(P, "w").write(s)
print("suffix-substance guard installed")
