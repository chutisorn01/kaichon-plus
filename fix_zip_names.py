import re

file_path = 'frontend/src/components/pedigree/ChickRegistry.tsx'
with open(file_path, 'r') as f:
    content = f.read()

old_zip = "zip.file(`Pedigree_${chick.name || chick.code || 'Chick'}.jpg`, base64Data, { base64: true });"
new_zip = "zip.file(`Pedigree_${chick.name || chick.code || 'Chick'}_${i+1}.jpg`, base64Data, { base64: true });"

if old_zip in content:
    content = content.replace(old_zip, new_zip)
    with open(file_path, 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Code not found")
