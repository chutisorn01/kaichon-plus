import re

file_path = 'backend/src/controllers/chicken.controller.ts'
with open(file_path, 'r') as f:
    content = f.read()

fallback_svg = """<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="background-color: #f1f5f9;">
  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
  <circle cx="8.5" cy="8.5" r="1.5"/>
  <polyline points="21 15 16 10 5 21"/>
</svg>"""

# Find the old fallback_svg definition and replace it
# The old one had <rect width="200" ... fill="#f1f5f9"/> and 🐓
old_svg = """<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#f1f5f9"/>
  <text x="50%" y="50%" font-size="60" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle" fill="#cbd5e1">🐓</text>
</svg>"""

if old_svg in content:
    content = content.replace(old_svg, fallback_svg)
    with open(file_path, 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Code not found")
