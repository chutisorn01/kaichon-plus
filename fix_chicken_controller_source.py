import re

file_path = 'backend/src/controllers/chicken.controller.ts'
with open(file_path, 'r') as f:
    content = f.read()

# Fix chickens mapping
content = content.replace(
    ".populate('user', 'name farmName farmCode isVerified phone lineId facebook address description stampText')",
    ".populate('user', 'name farmName farmCode isVerified phone lineId facebook address description stampText')"
)
# I will use multi_replace_file_content instead because it's safer.
