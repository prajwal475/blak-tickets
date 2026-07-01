"""
Extract transparent-PNG brand assets from the black-on-white BLAK Tickets lockup.

  imagge/Invert_the_color_theme_of_*1243.jpeg  (black ink on white)
        -> public/brand/lockup.png    (full mark + wordmark, transparent bg)
        -> public/brand/mark.png      (hand holding tickets)
        -> public/brand/wordmark.png  ("BLAK Tickets")

White -> transparent via alpha = 255 - luminance. The mark/wordmark split is the
widest empty vertical gap to the right of the mark.
"""
import os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "imagge", "Invert_the_color_theme_of_202606171243.jpeg")
OUT = os.path.join(ROOT, "public", "brand")
os.makedirs(OUT, exist_ok=True)


def to_rgba_keyed(img):
    """Black ink -> opaque ink; white paper -> transparent."""
    rgb = np.asarray(img.convert("RGB")).astype(np.float32)
    luma = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]
    alpha = np.clip(255.0 - luma, 0, 255).astype(np.uint8)
    h, w = alpha.shape
    out = np.zeros((h, w, 4), np.uint8)
    out[..., 0:3] = 20  # near-black ink colour
    out[..., 3] = alpha
    return out, alpha


def bbox(alpha, thr=18):
    ys, xs = np.where(alpha > thr)
    if len(xs) == 0:
        return None
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def crop(arr, box, pad=8):
    x0, y0, x1, y1 = box
    h, w = arr.shape[:2]
    x0 = max(0, x0 - pad); y0 = max(0, y0 - pad)
    x1 = min(w, x1 + pad); y1 = min(h, y1 + pad)
    return arr[y0:y1, x0:x1]


def find_split(alpha, thr=18):
    """First WIDE empty gap right of the mark -> mark | wordmark split.

    Word-spaces (mark|BLAK, BLAK|Tickets) are wide runs of empty columns; the
    thin gaps between fingers are not. Taking the first wide gap lands between
    the hand-mark and "BLAK".
    """
    h, w = alpha.shape
    col_ink = (alpha > thr).sum(axis=0)
    empty = col_ink < max(2, int(0.004 * h))
    start_search = int(0.20 * w)
    # mark|BLAK gap is only ~9px (hand nearly touches the B); finger-gaps are <8px
    min_gap = 6

    i = start_search
    while i < w:
        if empty[i]:
            j = i
            while j < w and empty[j]:
                j += 1
            if (j - i) >= min_gap and j < w - 1:
                return (i + j) // 2
            i = j
        else:
            i += 1
    return None


def flood_from_left(ink, split, reach=280):
    """2D flood-fill of the ink connected to the mark region (x < split).

    Captures the hand+tickets AND the thin stray stroke that curls past the
    split, while leaving the (vertically separate) letters untouched. Windowed
    to [0 : split+reach] for speed; letters further right stay in the wordmark.
    """
    h, w = ink.shape
    x1 = min(w, split + reach)
    sub = ink[:, :x1]
    visited = sub & (np.arange(x1)[None, :] < split)
    while True:
        g = visited.copy()
        g[1:, :] |= visited[:-1, :]
        g[:-1, :] |= visited[1:, :]
        g[:, 1:] |= visited[:, :-1]
        g[:, :-1] |= visited[:, 1:]
        g &= sub
        if g.sum() == visited.sum():
            break
        visited = g
    mask = np.zeros((h, w), bool)
    mask[:, :x1] = visited
    return mask


def masked_crop(rgba, mask, pad=8):
    out = rgba.copy()
    out[..., 3] = np.where(mask, rgba[..., 3], 0)
    box = bbox(out[..., 3], thr=1)
    return crop(out, box, pad)


def save(arr, name):
    Image.fromarray(arr, "RGBA").save(os.path.join(OUT, name))
    print("wrote", name, arr.shape[1], "x", arr.shape[0])


def main():
    img = Image.open(SRC)
    rgba, alpha = to_rgba_keyed(img)

    full_box = bbox(alpha)
    lockup = crop(rgba, full_box)
    save(lockup, "lockup.png")

    split = find_split(alpha)
    if split is None:
        print("! no split found; wordmark/mark fall back to lockup")
        save(lockup, "mark.png")
        save(lockup, "wordmark.png")
        return

    # mark = ink connected to the left region (hand+tickets+stray);
    # wordmark = everything else (the letters), via connected-component flood.
    ink = alpha > 18
    mark_mask = flood_from_left(ink, split)
    word_mask = ink & ~mark_mask

    save(masked_crop(rgba, mark_mask), "mark.png")
    save(masked_crop(rgba, word_mask), "wordmark.png")


if __name__ == "__main__":
    main()
