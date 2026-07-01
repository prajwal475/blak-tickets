# Compose the captured screenshots into a branded multi-page PDF.
#   python scripts/make_pdf.py
import json
import os
import img2pdf
from PIL import Image, ImageDraw, ImageFont

SHOTS = r"C:/Users/PRAJWAL/AppData/Local/Temp/claude/C--Users-PRAJWAL-Desktop-Eventx-blaktickets/20da4caa-bc35-45bb-be16-1c2d05780bfb/scratchpad/shots"
OUT = r"C:/Users/PRAJWAL/Desktop/Eventx/blaktickets/BLAK-Tickets-Preview.pdf"

PAGE_W, PAGE_H = 1754, 1240          # A4 landscape @ ~150dpi
MARGIN = 70
INK = (24, 24, 24)
EMERALD = (15, 143, 115)
MUTED = (142, 142, 142)
LINE = (217, 217, 214)
WHITE = (255, 255, 255)
SHADE = (247, 247, 245)

def font(name, size):
    for p in (f"C:/Windows/Fonts/{name}", name):
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            continue
    return ImageFont.load_default()

F_TITLE = font("arialbd.ttf", 84)
F_SUB = font("arial.ttf", 30)
F_CAP = font("arialbd.ttf", 34)
F_SMALL = font("arial.ttf", 22)
F_NUM = font("arial.ttf", 20)

def cover():
    img = Image.new("RGB", (PAGE_W, PAGE_H), WHITE)
    d = ImageDraw.Draw(img)
    # emerald side band
    d.rectangle([0, 0, 16, PAGE_H], fill=EMERALD)
    cx = MARGIN + 30
    d.text((cx, 430), "BLAK Tickets", font=F_TITLE, fill=INK)
    d.text((cx, 540), "every", font=F_TITLE, fill=EMERALD)
    w = d.textlength("every", font=F_TITLE)
    d.text((cx + w + 22, 540), " experience, one ticket.", font=F_TITLE, fill=INK)
    d.text((cx, 680), "Product preview — screens & flows", font=F_SUB, fill=MUTED)
    d.line([cx, 760, cx + 560, 760], fill=LINE, width=2)
    d.text((cx, 790), "Intro · hero · booking flow · explore · pages · mobile", font=F_SMALL, fill=MUTED)
    return img

def content(path, title, mobile, idx, total):
    img = Image.new("RGB", (PAGE_W, PAGE_H), WHITE)
    d = ImageDraw.Draw(img)
    # header
    d.text((MARGIN, MARGIN - 6), title, font=F_CAP, fill=INK)
    brand = "BLAK Tickets"
    bw = d.textlength(brand, font=F_SMALL)
    d.text((PAGE_W - MARGIN - bw, MARGIN + 6), brand, font=F_SMALL, fill=MUTED)
    hy = MARGIN + 58
    d.line([MARGIN, hy, PAGE_W - MARGIN, hy], fill=LINE, width=2)

    # image area
    top = hy + 34
    bottom = PAGE_H - MARGIN - 30
    aw, ah = PAGE_W - 2 * MARGIN, bottom - top
    shot = Image.open(path).convert("RGB")
    sw, sh = shot.size
    scale = min(aw / sw, ah / sh)
    nw, nh = int(sw * scale), int(sh * scale)
    shot = shot.resize((nw, nh), Image.LANCZOS)
    px = MARGIN + (aw - nw) // 2
    py = top + (ah - nh) // 2
    if mobile:  # sit the phone shot on a soft panel so it isn't floating
        pad = 26
        d.rounded_rectangle([px - pad, py - pad, px + nw + pad, py + nh + pad], radius=22, fill=SHADE)
    img.paste(shot, (px, py))
    d.rectangle([px, py, px + nw - 1, py + nh - 1], outline=LINE, width=2)

    # footer
    d.text((MARGIN, PAGE_H - MARGIN + 6), f"{idx:02d} / {total:02d}", font=F_NUM, fill=MUTED)
    tag = "Mobile · 390px" if mobile else "Desktop · 1440px"
    tw = d.textlength(tag, font=F_NUM)
    d.text((PAGE_W - MARGIN - tw, PAGE_H - MARGIN + 6), tag, font=F_NUM, fill=MUTED)
    return img

def main():
    manifest = json.load(open(os.path.join(SHOTS, "manifest.json"), encoding="utf-8"))
    pages = [cover()]
    total = len(manifest)
    for i, m in enumerate(manifest, 1):
        pages.append(content(m["file"], m["title"], m["mobile"], i, total))

    png_paths = []
    for i, page in enumerate(pages):
        p = os.path.join(SHOTS, f"_page_{i:02d}.png")
        page.save(p, dpi=(150, 150))
        png_paths.append(p)
    with open(OUT, "wb") as f:
        f.write(img2pdf.convert(png_paths, dpi=150))
    print("wrote", OUT, "-", len(pages), "pages")

if __name__ == "__main__":
    main()
