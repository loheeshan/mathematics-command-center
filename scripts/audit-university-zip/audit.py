#!/usr/bin/env python3
"""Audit the university lecture ZIP and write content/curriculum/source-manifest.json.

Usage (run from repo root, isolated mode so nothing in the ZIP can shadow imports):
    python3 -I scripts/audit-university-zip/audit.py <path-to-zip> content/curriculum

Requires poppler-utils (pdfinfo, pdftotext). The ZIP is extracted to a fresh temp
directory; PDFs are only read, never executed. Counts are sourced from the ZIP
itself -- no chapters are invented.
"""
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import zipfile

SEMESTERS = {
    "First Year Sem 1": {"id": "fy-s1", "label": "First Year · Semester 1", "course": "CM1606 Computational Mathematics"},
    "First Year Sem 2": {"id": "fy-s2", "label": "First Year · Semester 2", "course": "CM1606 Computational Mathematics (Sem 02: Probability & Statistics)"},
    "Second Year Sem 1": {"id": "sy-s1", "label": "Second Year · Semester 1", "course": "CM2607 Advanced Mathematics for Data Science"},
}


def chapter_label(fn: str) -> tuple[str, str]:
    stem = fn[:-4]
    stem = re.sub(r"_annot\w*$", "", stem)
    stem = re.sub(r"\s*\(1\)$", "", stem)
    m = re.match(r"Chapter\s*(\d+[A-C]?)[_ ]+(.*)", stem)
    if m:
        return m.group(1), m.group(2).replace("_", " ").replace("  ", " & ").strip()
    return "", stem.replace("_", " ")


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, check=False).stdout


def main():
    zpath, out_dir = sys.argv[1], sys.argv[2]
    tmp = tempfile.mkdtemp(prefix="mcc-zip-")
    with zipfile.ZipFile(zpath) as z:
        for info in z.infolist():
            # refuse path traversal
            target = os.path.realpath(os.path.join(tmp, info.filename))
            if not target.startswith(os.path.realpath(tmp)):
                raise SystemExit(f"unsafe path in zip: {info.filename}")
        z.extractall(tmp)
    pdfs = []
    for dirpath, _, files in os.walk(tmp):
        for f in files:
            if f.lower().endswith(".pdf"):
                pdfs.append(os.path.join(dirpath, f))
    entries = []
    for p in sorted(pdfs):
        rel = os.path.relpath(p, tmp)
        sem_dir = os.path.basename(os.path.dirname(p))
        sem = SEMESTERS.get(sem_dir)
        if sem is None:
            raise SystemExit(f"unknown semester directory: {sem_dir}")
        pages = int(re.search(r"Pages:\s+(\d+)", run(["pdfinfo", p])).group(1))
        chars = []
        for i in range(1, pages + 1):
            chars.append(len(run(["pdftotext", "-layout", "-f", str(i), "-l", str(i), p, "-"]).strip()))
        low = [i + 1 for i, c in enumerate(chars) if c < 40]
        if sum(chars) < 100:
            quality = "image-only"
        elif len(low) / pages > 0.3:
            quality = "partial"
        else:
            quality = "good"
        num, title = chapter_label(os.path.basename(p))
        entries.append({
            "path": rel,
            "semesterDir": sem_dir,
            "semesterId": sem["id"],
            "semesterLabel": sem["label"],
            "course": sem["course"],
            "chapterNumber": num,
            "chapterTitle": title,
            "sha256": hashlib.sha256(open(p, "rb").read()).hexdigest(),
            "pageCount": pages,
            "lowTextPages": low,
            "extractionQuality": quality,
            "annotated": "annot" in os.path.basename(p).lower(),
        })
    counts = {}
    for e in entries:
        counts[e["semesterId"]] = counts.get(e["semesterId"], 0) + 1
    manifest = {
        "generatedBy": "scripts/audit-university-zip/audit.py",
        "zipFile": os.path.basename(zpath),
        "totalPdfs": len(entries),
        "countsBySemester": counts,
        "qualityLegend": {
            "good": "text layer extracted for most pages",
            "partial": ">30% of pages have no text layer (handwritten/scanned annotations); pages were rendered and read visually",
            "image-only": "no text layer at all; every page rendered and read visually",
        },
        "files": entries,
    }
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "source-manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"{len(entries)} PDFs -> {counts}")


if __name__ == "__main__":
    main()
