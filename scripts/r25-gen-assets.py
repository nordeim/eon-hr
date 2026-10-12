#!/usr/bin/env python3
"""r25 asset generator — the SEO/meta asset family from public/eon-logo.png.

Recipes (measured against REF, docs/remediation-plan-session26.md):
- og-image.png   1200x630: white #FEFEFE canvas, the square logo scaled to
                 ~1202x1202 centered (content lands ~1107x429 like REF's
                 supabase /render/image/ output — same composition).
- icon-192.png   192x192 square, full logo (REF's manifest icon = the raw
                 square logo).
- icon-512.png   512x512 square, full logo.
- apple-touch-icon.png 180x180 (login distribution).
"""
from PIL import Image

SRC = "public/eon-logo.png"
OUT = "public/"

logo = Image.open(SRC).convert("RGB")

# og-image: 1200x630 white canvas + logo resized to 1202 square, centered.
canvas = Image.new("RGB", (1200, 630), (254, 254, 254))
scaled = logo.resize((1202, 1202), Image.LANCZOS)
canvas.paste(scaled, ((1200 - 1202) // 2, (630 - 1202) // 2))
canvas.save(OUT + "og-image.png", optimize=True)

# square icons: full logo with its margins, LANCZOS downscales
for size, name in [(192, "icon-192.png"), (512, "icon-512.png"), (180, "apple-touch-icon.png")]:
    logo.resize((size, size), Image.LANCZOS).save(OUT + name, optimize=True)

print("generated: og-image.png 1200x630, icon-192.png, icon-512.png, apple-touch-icon.png")
