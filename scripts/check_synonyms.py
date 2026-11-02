import json

with open(r"C:\dev\panda-sat-vocab\src\data\vocabulary.json", encoding="utf-8") as f:
    vocab = json.load(f)

print("Checking synonyms alignment with PDF definitions:")
for v in vocab[:15]:
    print(f"#{v['id']} {v['word']} ({v['pos']}):")
    print(f"  PDF text : {v['definition']}")
    print(f"  Synonyms : {', '.join(v['synonyms'])}")
    print(f"  Uzbek    : {v['uzbek']}")
    print()
