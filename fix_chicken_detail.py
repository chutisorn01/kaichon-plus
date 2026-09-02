import re

file_path = 'backend/src/controllers/chicken.controller.ts'
with open(file_path, 'r') as f:
    content = f.read()

# We need to find all .findById(req.params.id) in getChickenById and add .select('-image')
content = content.replace(
    "await Chicken.findById(req.params.id)",
    "await Chicken.findById(req.params.id).select('-image')"
)
content = content.replace(
    "await Father.findById(req.params.id)",
    "await Father.findById(req.params.id).select('-image')"
)
content = content.replace(
    "await Mother.findById(req.params.id)",
    "await Mother.findById(req.params.id).select('-image')"
)
content = content.replace(
    "await Chick.findById(req.params.id)",
    "await Chick.findById(req.params.id).select('-image')"
)

with open(file_path, 'w') as f:
    f.write(content)
print(f"Updated {file_path}")
