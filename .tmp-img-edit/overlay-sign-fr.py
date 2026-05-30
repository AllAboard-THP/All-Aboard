#!/usr/bin/env python3
"""Overlay French hero copy inside the sign panel — preserves source PNG elsewhere."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "pylibs"))

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "Docs/branding/assets/concept-2.png"
OUT = ROOT / "Docs/branding/assets/concept-2-sign-fr.png"

# Blue inner panel on the A-frame sign (1536×1024)
PANEL_LEFT = 122
PANEL_RIGHT = 306
TEXT_TOP = 702
TEXT_BOTTOM = 838
PANEL_CENTER_X = (PANEL_LEFT + PANEL_RIGHT) // 2
PANEL_WIDTH = PANEL_RIGHT - PANEL_LEFT - 16
SIGN_BG = (27, 50, 78)

WHITE = (255, 255, 255)
INDIGO = (99, 102, 241)
PINK = (236, 72, 153)
GRAY = (180, 188, 200)

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def text_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> float:
    return draw.textlength(text, font=font)


def wrap_line(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if text_width(draw, trial, font) <= PANEL_WIDTH:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_centered_line(
    draw: ImageDraw.ImageDraw,
    y: int,
    parts: list[tuple[str, tuple[int, int, int]]],
    font: ImageFont.FreeTypeFont,
) -> int:
    total = sum(text_width(draw, t, font) for t, _ in parts)
    x = PANEL_CENTER_X - total / 2
    for text, color in parts:
        draw.text((x, y), text, fill=color, font=font)
        x += text_width(draw, text, font)
    bbox = font.getbbox("Ay")
    return y + (bbox[3] - bbox[1]) + 3


def main() -> None:
    img = Image.open(SRC).convert("RGB")
    draw = ImageDraw.Draw(img)

    draw.rectangle(
        (PANEL_LEFT, TEXT_TOP, PANEL_RIGHT, TEXT_BOTTOM),
        fill=SIGN_BG,
    )

    font_head = load_font(FONT_BOLD, 13)
    font_body = load_font(FONT_REG, 8)

    y = TEXT_TOP + 6
    y = draw_centered_line(draw, y, [("L'espace où les", WHITE)], font_head)
    y = draw_centered_line(
        draw,
        y,
        [("étudiants ", WHITE), ("s'aident", INDIGO)],
        font_head,
    )
    y = draw_centered_line(draw, y, [("vraiment.", PINK)], font_head)
    y += 4

    body = (
        "Publiez une requête, recevez des réponses ciblées, "
        "obtenez de l'aide de professionnels confirmés, échangez vos savoirs !"
    )
    for line in wrap_line(draw, body, font_body):
        w = text_width(draw, line, font_body)
        draw.text((PANEL_CENTER_X - w / 2, y), line, fill=GRAY, font=font_body)
        bbox = font_body.getbbox("Ay")
        y += (bbox[3] - bbox[1]) + 2

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, format="PNG", optimize=False)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
