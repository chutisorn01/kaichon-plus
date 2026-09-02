import re

file_path = 'src/controllers/chicken.controller.ts'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace(
    "const shouldFetchChicks = includeChicks === 'true' || gender === 'chick';",
    "const shouldFetchChicks = (includeChicks === 'true' && (!gender || gender === 'all')) || gender === 'chick';"
)

with open(file_path, 'w') as f:
    f.write(content)
print(f"Updated {file_path}")
