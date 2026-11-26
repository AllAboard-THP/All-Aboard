#!/usr/bin/env python3
"""Write logo-mark.svg — vector paths traced from logo-mark.png (PNG read-only)."""

from __future__ import annotations

import sys
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPT_DIR))
from logo_mark_png import LOGO_MARK_PNG, REPO_ROOT  # noqa: E402

SVG_OUT = REPO_ROOT / "packages/ui/src/assets/logo-mark.svg"

# Measured from logo-mark.png (41×54) — straight sails + hull notch
NAVY = "#052775"
MAGENTA = "#dd3465"
WIDTH, HEIGHT = 41, 54

SAIL_NAVY_POINTS = "22,13 22,44 10,44"
SAIL_MAG_POINTS = "25,13 25,44 35,44"
HULL_PATH = "M9 45 L17 45 L17 46 L21 46 L30 46 L29 47 L16 47 Z M22 45 L23 45 L21 46 Z"


def main() -> None:
    svg = f"""<svg width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}"
  xmlns="http://www.w3.org/2000/svg" role="img" aria-label="All-Aboard logo mark">
  <!-- Vector trace from logo-mark.png — {Path(__file__).name} -->
  <polygon points="{SAIL_NAVY_POINTS}" fill="{NAVY}"/>
  <polygon points="{SAIL_MAG_POINTS}" fill="{MAGENTA}"/>
  <path d="{HULL_PATH}" fill="{NAVY}"/>
</svg>
"""
    SVG_OUT.write_text(svg, encoding="utf-8")
    print(f"Read-only: {LOGO_MARK_PNG.relative_to(REPO_ROOT)}")
    print(f"Wrote {SVG_OUT.relative_to(REPO_ROOT)} (vector paths, transparent)")


if __name__ == "__main__":
    main()
