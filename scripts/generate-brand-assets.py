#!/usr/bin/env python3
"""Generate CORTEX AI brand assets (logo, icon, favicon) from vector specs.

Mark: hexagonal neural glyph - hexagon outline, three satellite nodes
connected to a center node. Monochrome + single indigo accent (#6366F1).
"""
import math
import os
from PIL import Image, ImageDraw, ImageFont

INDIGO = (99, 102, 241, 255)  # #6366F1
WHITE = (245, 245, 245, 255)  # #F5F5F5
DARK = (10, 10, 10, 255)  # #0A0A0A

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEDIA_LOGO = os.path.join(ROOT, "frontend/src/media/logo")
PUBLIC = os.path.join(ROOT, "frontend/public")
BRAND = os.path.join(ROOT, "brand")

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def hexagon_points(cx, cy, r):
    return [
        (cx + r * math.cos(math.radians(60 * i - 90)),
         cy + r * math.sin(math.radians(60 * i - 90)))
        for i in range(6)
    ]


def draw_mark(draw, cx, cy, r, fg, accent, stroke):
    """Draw the CORTEX neural hexagon mark."""
    pts = hexagon_points(cx, cy, r)
    draw.polygon(pts, outline=fg, width=stroke)
    sat_r = r * 0.13
    sats = [pts[0], pts[2], pts[4]]
    for sx, sy in sats:
        draw.line([(cx, cy), (sx, sy)], fill=fg, width=max(1, stroke // 2))
    for sx, sy in sats:
        draw.ellipse([sx - sat_r, sy - sat_r, sx + sat_r, sy + sat_r], fill=fg)
    c_r = r * 0.18
    draw.ellipse([cx - c_r, cy - c_r, cx + c_r, cy + c_r], fill=accent)


def render_icon(size, fg=WHITE, accent=INDIGO, bg=None):
    img = Image.new("RGBA", (size, size), bg or (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    stroke = max(2, size // 18)
    draw_mark(d, size / 2, size / 2, size * 0.36, fg, accent, stroke)
    return img


def draw_tracked_text(draw, xy, text, font, fill, tracking):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x


def render_lockup(width, height, text_color, accent=INDIGO, bg=None):
    img = Image.new("RGBA", (width, height), bg or (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = height * 0.34
    cy = height / 2
    draw_mark(d, height / 2, cy, r, text_color, accent,
              max(2, int(height * 0.045)))
    font = ImageFont.truetype(FONT_BOLD, int(height * 0.42))
    x = height + height * 0.12
    y = cy - font.size * 0.62
    tracking = height * 0.045
    x = draw_tracked_text(d, (x, y), "CORTEX", font, text_color, tracking)
    x += tracking * 1.5
    draw_tracked_text(d, (x, y), "AI", font, accent, tracking)
    return img


def main():
    os.makedirs(BRAND, exist_ok=True)
    icon512 = render_icon(512)
    icon512.save(os.path.join(MEDIA_LOGO, "cortex-icon.png"))
    icon512.save(os.path.join(BRAND, "cortex-icon.png"))
    render_icon(64).save(os.path.join(PUBLIC, "favicon.png"))
    render_icon(32).save(os.path.join(PUBLIC, "favicon.ico"),
                         sizes=[(32, 32)])
    render_icon(48).save(os.path.join(BRAND, "favicon-48.png"))

    render_lockup(920, 200, WHITE).save(
        os.path.join(MEDIA_LOGO, "cortex-ai.png"))
    render_lockup(920, 200, WHITE).save(
        os.path.join(PUBLIC, "cortex-ai.png"))
    render_lockup(920, 200, DARK).save(
        os.path.join(MEDIA_LOGO, "cortex-ai-dark.png"))
    render_lockup(920, 200, DARK).save(
        os.path.join(PUBLIC, "cortex-ai-dark.png"))
    render_lockup(920, 200, WHITE).save(os.path.join(BRAND, "cortex-ai.png"))
    print("brand assets generated")


if __name__ == "__main__":
    main()
