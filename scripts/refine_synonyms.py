import json
import re

with open(r"C:\dev\panda-sat-vocab\src\data\vocabulary.json", encoding="utf-8") as f:
    vocab = json.load(f)

# Ensure synonyms include the direct terms from the PDF definition
updated_count = 0
for v in vocab:
    pdf_def = v["definition"]
    existing_syns = list(v.get("synonyms", []))
    
    # Extract comma-separated parts from definition if they are concise words/phrases
    # Remove number prefixes like '1)', '2)'
    cleaned_def = re.sub(r"\b\d+\)\s*", "", pdf_def)
    cleaned_def = re.sub(r"\(.*?\)", "", cleaned_def)
    parts = [p.strip() for p in re.split(r"[,;]", cleaned_def) if p.strip()]
    
    # Direct synonyms from definition
    def_syns = []
    for p in parts:
        p_clean = re.sub(r"^to\s+", "", p).strip()
        if p_clean and len(p_clean.split()) <= 4 and not p_clean.startswith("in reference") and not p_clean.startswith("particularly"):
            def_syns.append(p_clean)
            
    # Combine def_syns and existing_syns preserving order and uniqueness
    combined = []
    for s in def_syns + existing_syns:
        s_lower = s.lower().strip()
        if s_lower and s_lower not in [c.lower() for c in combined] and s_lower != v["word"].lower():
            combined.append(s.strip())
            
    if combined != v["synonyms"]:
        v["synonyms"] = combined
        updated_count += 1

print(f"Refined synonyms for {updated_count} words.")

# Save back to vocabulary.json and vocabulary.ts
with open(r"C:\dev\panda-sat-vocab\src\data\vocabulary.json", "w", encoding="utf-8") as f:
    json.dump(vocab, f, ensure_ascii=False, indent=2)

ts_content = """export interface VocabWord {
  id: number;
  unit: number;
  word: string;
  raw_word: string;
  pos: string;
  definition: string;
  synonyms: string[];
  uzbek: string;
  example: string;
}

export const VOCABULARY_DATA: VocabWord[] = """ + json.dumps(vocab, ensure_ascii=False, indent=2) + ";\n\nexport const TOTAL_UNITS = 16;\nexport const WORDS_PER_UNIT = 25;\n"

with open(r"C:\dev\panda-sat-vocab\src\data\vocabulary.ts", "w", encoding="utf-8") as f:
    f.write(ts_content)

print("Updated vocabulary.json and vocabulary.ts successfully!")
