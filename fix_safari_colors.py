import re

file_path = 'frontend/src/components/pedigree/CertificateDocument.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace transparent with correct zero-alpha colors for Safari
replacements = {
    "to-transparent pointer-events-none z-[5]": "to-slate-900/0 pointer-events-none z-[5]",
    "from-transparent via-amber-100/10 to-transparent": "from-amber-100/0 via-amber-100/10 to-amber-100/0",
    "from-transparent to-amber-500/50": "from-amber-500/0 to-amber-500/50",
    "from-transparent via-amber-500/80 to-transparent": "from-amber-500/0 via-amber-500/80 to-amber-500/0",
    "from-transparent via-amber-500/10 to-transparent": "from-amber-500/0 via-amber-500/10 to-amber-500/0",
    "from-amber-500/5 via-transparent to-amber-500/5": "from-amber-500/5 via-amber-500/0 to-amber-500/5",
    "blur-md": "",
    "blur-xl": "",
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w') as f:
    f.write(content)

print("Patch applied")
