import re

file_path = 'frontend/src/components/pedigree/CertificateDocument.tsx'
with open(file_path, 'r') as f:
    content = f.read()

old_glow = """    {/* Faint color glow at the bottom */}
    <div className={`absolute bottom-0 right-0 w-16 h-16  rounded-full opacity-30 pointer-events-none ${getBandColorCircleClass(chicken.bandColor || 'แดง')}`}></div>"""

content = content.replace(old_glow, "")

with open(file_path, 'w') as f:
    f.write(content)

print("Removed glow circle")
