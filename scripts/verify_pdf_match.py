import json
import pypdf
import re

pdf_path = r"C:\Users\doniy\Downloads\Telegram Desktop\College Panda 400 Digital SAT Words You Must Know.pdf"
reader = pypdf.PdfReader(pdf_path)
full_text = "\n".join(p.extract_text() for p in reader.pages)

# Extract raw entries from PDF
lines = full_text.splitlines()
pdf_entries = []
curr = None
for l in lines:
    l_str = l.strip()
    if not l_str or "THE COLLEGE PANDA" in l_str:
        continue
    m = re.match(r"^(\d+)\.\s*(.*?)(?::\s*(.*))?$", l_str)
    if m:
        if curr:
            pdf_entries.append(curr)
        num = int(m.group(1))
        w = m.group(2).strip().replace("\u2019", "'")
        d = m.group(3).strip().replace("\u2019", "'") if m.group(3) else ""
        curr = {"id": num, "word": w, "def": d}
    elif curr:
        if re.match(r"^\d{1,2}$", l_str):
            continue
        curr["def"] += " " + l_str.strip().replace("\u2019", "'")
if curr:
    pdf_entries.append(curr)

for e in pdf_entries:
    e["def"] = re.sub(r"\s+\d{1,2}$", "", e["def"]).strip()

# Load our vocabulary.json
with open(r"C:\dev\panda-sat-vocab\src\data\vocabulary.json", encoding="utf-8") as f:
    app_entries = json.load(f)

print(f"PDF count: {len(pdf_entries)}, App count: {len(app_entries)}")

mismatches = []
for p, a in zip(pdf_entries, app_entries):
    if p["id"] != a["id"]:
        mismatches.append(f"ID mismatch: PDF #{p['id']} vs App #{a['id']}")
    
    clean_p_word = re.sub(r"\s*\([a-zA-Z\.\s]+\)", "", p["word"]).strip().lower()
    if clean_p_word != a["word"].lower():
        mismatches.append(f"Word mismatch at #{p['id']}: PDF '{p['word']}' vs App '{a['word']}'")
    
    if p["def"] != a["definition"]:
        mismatches.append(f"Def mismatch at #{p['id']}:\n  PDF: '{p['def']}'\n  APP: '{a['definition']}'")

print(f"Total mismatches: {len(mismatches)}")
if mismatches:
    for m in mismatches[:15]:
        print(" -", m)
else:
    print("100% PERFECT MATCH across all 400 entries in exact order!")
