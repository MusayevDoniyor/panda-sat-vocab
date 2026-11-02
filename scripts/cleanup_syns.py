import json

with open(r"C:\dev\panda-sat-vocab\src\data\vocabulary.json", encoding="utf-8") as f:
    vocab = json.load(f)

for v in vocab:
    # clean synonyms: remove anything longer than 3 words, remove duplicates
    clean_syns = []
    seen = set()
    for s in v["synonyms"]:
        s_clean = s.strip()
        s_lower = s_clean.lower()
        if len(s_clean.split()) <= 3 and s_lower not in seen and s_lower != v["word"].lower():
            clean_syns.append(s_clean)
            seen.add(s_lower)
    v["synonyms"] = clean_syns[:5]

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

print("Cleaned up synonyms successfully!")
