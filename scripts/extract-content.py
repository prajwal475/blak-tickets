# Convert the uploaded legal/marketing PDFs into structured JSON content files
# under src/content/. Each file: { "title", "blocks": [{type:'heading'|'para'|'list', ...}] }
# Run:  python scripts/extract-content.py
import json
import os
import re
import subprocess
import sys
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "content")
os.makedirs(OUT, exist_ok=True)

# slug -> (pdf filename, human title)
JOBS = {
    "about":   ("About Blak tickets.pdf",            "About BLAK Tickets"),
    "privacy": ("Blaktickets privacy policy.pdf",    "Privacy Policy"),
    "terms":   ("BlakticktesTerms & Conditions.pdf", "Terms & Conditions"),
    "safety":  ("Safety Guidelines.pdf",             "Safety Guidelines"),
    "press":   ("Press blaktickets.pdf",             "Press Room"),
    "blog-1":  ("blog 1.pdf",                         "BLAK Blog"),
    "blog-2":  ("blog2.pdf",                          None),  # title = first line
}

# brand/title prefixes stripped from the doc's first line to derive a tagline
PREFIXES = ["BLAK Blog", "BLAK Tickets", "BlakTickets", "Press"]

BULLET = "•"  # •


def clean(t: str) -> str:
    t = unicodedata.normalize("NFKC", t)
    repl = {
        "’": "'", "‘": "'", "“": '"', "”": '"',
        " ": " ", "ﬁ": "fi", "ﬂ": "fl", "·": BULLET,
    }
    for a, b in repl.items():
        t = t.replace(a, b)
    return t


def extract_text(pdf_path: str) -> str:
    out = subprocess.run(
        ["pdftotext", "-enc", "UTF-8", pdf_path, "-"],
        capture_output=True, check=True,
    )
    return clean(out.stdout.decode("utf-8", "replace"))


def to_lines(text: str):
    """Collapse page-break splits, return clean non-empty lines."""
    raw = [ln.strip() for ln in text.split("\n")]
    merged = []
    for ln in raw:
        if ln == "":
            continue
        # join a continuation: previous line didn't end a sentence and this
        # line starts lowercase (a wrap broken across a page boundary)
        if (
            merged
            and merged[-1][-1] not in ".!?:;"
            and not merged[-1].startswith(BULLET)
            and ln[0].islower()
        ):
            merged[-1] = merged[-1] + " " + ln
        else:
            merged.append(ln)
    return merged


def is_heading(line: str) -> bool:
    if line.startswith(BULLET):
        return False
    if line.startswith("Published by"):  # byline, render as paragraph
        return False
    if line[-1] in ".!?:;,":
        return False
    if len(line) > 70:
        return False
    # numbered section ("1. Ticket Authenticity", "3.2 Refunds") or a short
    # Title-case label — both read as headings
    return True


def derive_lead(first: str, title: str):
    """Strip a brand/title prefix off the first line to get a tagline."""
    rest = first
    for p in PREFIXES:
        if rest.startswith(p):
            rest = rest[len(p):].strip(" :–—-")
            break
    if rest and rest.lower() != (title or "").lower():
        return rest
    return None


def build_blocks(lines):
    blocks = []
    list_buf = []

    def flush_list():
        nonlocal list_buf
        if list_buf:
            blocks.append({"type": "list", "items": list_buf})
            list_buf = []

    for line in lines:
        if line.startswith(BULLET):
            list_buf.append(line.lstrip(BULLET).strip())
            continue
        flush_list()
        if is_heading(line):
            blocks.append({"type": "heading", "text": line})
        else:
            blocks.append({"type": "para", "text": line})
    flush_list()
    return blocks


def main():
    summary = []
    for slug, (fname, title) in JOBS.items():
        pdf_path = os.path.join(ROOT, fname)
        if not os.path.exists(pdf_path):
            print(f"!! missing {fname}", file=sys.stderr)
            continue
        lines = to_lines(extract_text(pdf_path))
        first = lines[0]
        doc_title = title or first
        # the first line is the document's own title line whenever it carries a
        # brand prefix or matches our title — drop it from the body and turn it
        # into a tagline so we don't repeat the page's H1
        starts_branded = any(first.startswith(p) for p in PREFIXES)
        lead = None
        if starts_branded or first == doc_title:
            lines = lines[1:]
            lead = derive_lead(first, doc_title)
        blocks = build_blocks(lines)
        data = {"title": doc_title, "lead": lead, "blocks": blocks}
        with open(os.path.join(OUT, f"{slug}.json"), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        headings = [b["text"] for b in blocks if b["type"] == "heading"]
        summary.append((slug, doc_title, lead, len(blocks), headings[:6]))

    for slug, t, lead, n, hs in summary:
        print(f"\n=== {slug} :: {t} ({n} blocks)")
        print(f"    lead: {lead}")
        print(f"    headings: {hs}")


if __name__ == "__main__":
    main()
