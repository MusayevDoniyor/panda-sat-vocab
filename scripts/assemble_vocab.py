import json
import re
from unit_data_1_4 import UNIT_1_4
from unit_data_5_8 import UNIT_5_8
from unit_data_9_12 import UNIT_9_12
from unit_data_13_16 import UNIT_13_16

all_units = {}
all_units.update(UNIT_1_4)
all_units.update(UNIT_5_8)
all_units.update(UNIT_9_12)
all_units.update(UNIT_13_16)

with open(r"C:\Users\doniy\.gemini\antigravity-cli\brain\72ea3973-c90a-4edf-bfec-d0f637a0a1bd\scratch\raw_400.json", encoding="utf-8") as f:
    raw_list = json.load(f)

vocab_list = []
for item in raw_list:
    w_id = item["id"]
    unit_id = (w_id - 1) // 25 + 1
    raw_word = item["raw_word"].strip()
    raw_def = item["raw_def"].strip()
    
    # Clean word and handle POS in word like "delegate (verb)"
    pos_match = re.search(r"\(([a-zA-Z\.\s]+)\)", raw_word)
    clean_word = re.sub(r"\s*\([a-zA-Z\.\s]+\)", "", raw_word).strip()
    
    meta = all_units.get(w_id, {})
    pos = meta.get("pos", "verb" if pos_match and "verb" in pos_match.group(1) else ("adj." if pos_match and "adj" in pos_match.group(1) else "noun"))
    uzbek = meta.get("uzbek", "")
    example = meta.get("example", "")
    
    # Synonyms: take from meta, plus any words in definition that look like direct synonyms
    syns = meta.get("synonyms", [])
    if not syns:
        # fallback: split raw_def by commas
        parts = [p.strip() for p in raw_def.replace(";", ",").split(",")]
        syns = [p for p in parts if len(p.split()) <= 3][:4]
    
    entry = {
        "id": w_id,
        "unit": unit_id,
        "word": clean_word,
        "raw_word": raw_word,
        "pos": pos,
        "definition": raw_def,
        "synonyms": syns,
        "uzbek": uzbek,
        "example": example
    }
    vocab_list.append(entry)

print(f"Total processed vocabulary entries: {len(vocab_list)}")

# Verify no missing metadata
missing_uzbek = [v["id"] for v in vocab_list if not v["uzbek"]]
missing_example = [v["id"] for v in vocab_list if not v["example"]]
print(f"Missing uzbek: {len(missing_uzbek)}")
print(f"Missing example: {len(missing_example)}")

# Save JSON
with open(r"C:\dev\panda-sat-vocab\src\data\vocabulary.json", "w", encoding="utf-8") as f:
    json.dump(vocab_list, f, ensure_ascii=False, indent=2)

# Save TypeScript file
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

export const VOCABULARY_DATA: VocabWord[] = """ + json.dumps(vocab_list, ensure_ascii=False, indent=2) + ";\n\nexport const TOTAL_UNITS = 16;\nexport const WORDS_PER_UNIT = 25;\n"

with open(r"C:\dev\panda-sat-vocab\src\data\vocabulary.ts", "w", encoding="utf-8") as f:
    f.write(ts_content)

print("Saved vocabulary.json and vocabulary.ts successfully!")
