import re

file_path = 'src/components/vip/VipBreedingDashboard.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Increase pixelRatio to 2.5
content = re.sub(r'pixelRatio: 2,', 'pixelRatio: 2.5,', content)

with open(file_path, 'w') as f:
    f.write(content)
print(f"Updated {file_path}")
