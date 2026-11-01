# The Typst corpus-family sources (session 115 — the reconstruction protocol)

The r111 originals were compiled from ad-hoc sources never committed (the
reproducibility gap this round closed). These are the standing sources:

    typst compile resume.typ        # → /tmp/typst-cv/resume.pdf (the hunt target)
    typst compile resume2.typ
    typst compile coverletter.typ   # the letters ride the resume() form — the
    typst compile coverletter2.typ  # modern-cv coverletter()'s linguify layer is
                                    # incompatible with typst 0.15.1; the
                                    # engine-level writer forms (octal-literal
                                    # CID codes, lowercase /f0 bindings, raw
                                    # nested parens) are identical

Pinned toolchain: typst 0.15.1 + @preview/modern-cv 0.6.0 (the package
downloads on first compile). The compile date is PINNED to October 31 2026
inside the sources (the r113 determinism fix — `datetime.today()` in the
template footer would drift the pins across days).

The reconstructed pins (extraction alnums, ours = pdftotext = 100.00%):
resume 793 · resume2 793 · coverletter 897 · coverletter2 871.
