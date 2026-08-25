"""Rasterize icons/icon.svg geometry into toolbar PNG sizes."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "icons"
TEAL = (13, 148, 136, 255)
WHITE = (255, 255, 255, 255)
SIZES = (16, 32, 48, 128)
SUPER = 8


def _scale(n: float, size: int) -> float:
    return n / 128 * size


def _line(draw: ImageDraw.ImageDraw, a: tuple[float, float], b: tuple[float, float], width: float) -> None:
    draw.line([a, b], fill=WHITE, width=max(1, round(width)))
    radius = width / 2
    for x, y in (a, b):
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=WHITE)


def render(size: int) -> Image.Image:
    canvas = size * SUPER
    image = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    radius = _scale(28, canvas)
    draw.rounded_rectangle((0, 0, canvas - 1, canvas - 1), radius=radius, fill=TEAL)
    stroke = _scale(8, canvas)
    _line(draw, (_scale(32, canvas), _scale(50, canvas)), (_scale(58, canvas), _scale(50, canvas)), stroke)
    _line(draw, (_scale(32, canvas), _scale(78, canvas)), (_scale(58, canvas), _scale(78, canvas)), stroke)
    _line(draw, (_scale(45, canvas), _scale(50, canvas)), (_scale(45, canvas), _scale(78, canvas)), stroke)
    _line(draw, (_scale(70, canvas), _scale(64, canvas)), (_scale(100, canvas), _scale(64, canvas)), stroke)
    _line(draw, (_scale(86, canvas), _scale(48, canvas)), (_scale(108, canvas), _scale(64, canvas)), stroke)
    _line(draw, (_scale(108, canvas), _scale(64, canvas)), (_scale(86, canvas), _scale(80, canvas)), stroke)
    return image.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for size in SIZES:
        path = OUT / f"icon-{size}.png"
        render(size).save(path, "PNG")
        print(path.relative_to(ROOT), path.stat().st_size)


if __name__ == "__main__":
    main()
