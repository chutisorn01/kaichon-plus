import re

file_path = 'frontend/src/components/pedigree/ChickenDetail.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace the setLoading(true) in fetchDetail
content = content.replace(
    "setLoading(true);",
    "if (!chick) setLoading(true);"
)

with open(file_path, 'w') as f:
    f.write(content)
print(f"Updated {file_path}")
