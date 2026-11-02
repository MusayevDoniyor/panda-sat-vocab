import json
import re

# Load raw 400 entries
with open(r"C:\Users\doniy\.gemini\antigravity-cli\brain\72ea3973-c90a-4edf-bfec-d0f637a0a1bd\scratch\raw_400.json", encoding="utf-8") as f:
    raw_data = json.load(f)

print(f"Loaded {len(raw_data)} raw words.")
