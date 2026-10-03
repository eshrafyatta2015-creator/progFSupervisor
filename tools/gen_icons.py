# -*- coding: utf-8 -*-
"""Generate PWA icons (apple-touch 180, 192, 512, 512-maskable) with Pillow."""
import os
from PIL import Image, ImageDraw

NAVY = (27, 42, 74)
WHITE = (255, 255, 255)
TEAL = (31, 122, 140)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "icons")


def draw_book(d: ImageDraw.ImageDraw, s: float, ox: float = 0.0, oy: float = 0.0):
    def X(v):
        return int(round(ox + v * s))

    def Y(v):
        return int(round(oy + v * s))

    def box(x1, y1, x2, y2):
        return (X(x1), Y(y1), X(x2), Y(y2))

    def rad(v):
        return max(1, int(round(v * s)))

    d.rounded_rectangle(box(170, 360, 490, 720), radius=rad(26), fill=WHITE)
    d.rounded_rectangle(box(534, 360, 854, 720), radius=rad(26), fill=WHITE)
    d.rounded_rectangle(box(494, 360, 530, 720), radius=rad(14), fill=TEAL)
    for y in (440, 520, 600):
        d.rounded_rectangle(box(215, y, 445, y + 26), radius=rad(13), fill=NAVY)
        d.rounded_rectangle(box(579, y, 809, y + 26), radius=rad(13), fill=NAVY)
    d.rounded_rectangle(box(300, 748, 724, 772), radius=rad(12), fill=TEAL)


def make(size: int, scale: float = 1.0) -> Image.Image:
    img = Image.new("RGB", (size, size), NAVY)
    d = ImageDraw.Draw(img)
    if scale == 1.0:
        draw_book(d, size / 1024.0)
    else:
        s = scale * size / 1024.0
        ox = (size - 684 * s) / 2.0 - 170 * s
        oy = (size - 412 * s) / 2.0 - 360 * s
        draw_book(d, s, ox, oy)
    return img


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    make(1024).resize((180, 180), Image.LANCZOS).save(
        os.path.join(OUT, "icon-180.png"), "PNG", optimize=True
    )
    make(1024).resize((192, 192), Image.LANCZOS).save(
        os.path.join(OUT, "icon-192.png"), "PNG", optimize=True
    )
    make(1024).resize((512, 512), Image.LANCZOS).save(
        os.path.join(OUT, "icon-512.png"), "PNG", optimize=True
    )
    make(512, scale=0.62).save(os.path.join(OUT, "icon-512-maskable.png"), "PNG", optimize=True)
    print("icons written to", OUT)
