"""logo-mark.png is immutable for automation — read-only helpers only."""

from __future__ import annotations

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
LOGO_MARK_PNG = REPO_ROOT / "Docs/branding/assets/logo-mark.png"


class ImmutableLogoMarkPngError(RuntimeError):
    """Raised when code attempts to write or replace logo-mark.png."""


def assert_never_write_logo_mark_png(target: Path) -> None:
    if target.resolve() == LOGO_MARK_PNG.resolve():
        raise ImmutableLogoMarkPngError(
            f"Refusing to write {LOGO_MARK_PNG.relative_to(REPO_ROOT)} — "
            "human replacement only; scripts may read, never save."
        )


def read_logo_mark_bytes() -> bytes:
    if not LOGO_MARK_PNG.is_file():
        raise FileNotFoundError(LOGO_MARK_PNG)
    return LOGO_MARK_PNG.read_bytes()
