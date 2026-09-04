import re

file_path = 'frontend/src/components/pedigree/BreedingBatch.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace maleCount onChange
old_male = "onChange={e => setFormData({...formData, maleCount: Math.max(0, parseInt(e.target.value) || 0)})}"
new_male = "onChange={e => setFormData({...formData, maleCount: e.target.value === '' ? '' as any : Math.max(0, parseInt(e.target.value) || 0)})}"
if old_male in content:
    content = content.replace(old_male, new_male)

# Replace femaleCount onChange
old_female = "onChange={e => setFormData({...formData, femaleCount: Math.max(0, parseInt(e.target.value) || 0)})}"
new_female = "onChange={e => setFormData({...formData, femaleCount: e.target.value === '' ? '' as any : Math.max(0, parseInt(e.target.value) || 0)})}"
if old_female in content:
    content = content.replace(old_female, new_female)

with open(file_path, 'w') as f:
    f.write(content)
print("Updated successfully")
