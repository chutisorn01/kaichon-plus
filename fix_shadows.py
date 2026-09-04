import re

file_path = 'frontend/src/components/pedigree/CertificateDocument.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace complex shadows that break Safari mobile rendering
replacements = {
    "shadow-[0_0_20px_rgba(59,130,246,0.15)]": "shadow-lg",
    "shadow-[0_0_20px_rgba(236,72,153,0.15)]": "shadow-lg",
    "shadow-[0_0_25px_rgba(251,191,36,0.2)]": "shadow-xl",
    "shadow-[0_0_30px_rgba(251,191,36,0.3)]": "shadow-xl",
    "shadow-[0_0_10px_rgba(59,130,246,0.5)]": "shadow-md",
    "shadow-[0_0_10px_rgba(236,72,153,0.5)]": "shadow-md",
    "shadow-[0_0_15px_rgba(59,130,246,0.4)]": "shadow-md",
    "shadow-[0_0_15px_rgba(236,72,153,0.4)]": "shadow-md",
    "shadow-[0_0_15px_rgba(59,130,246,0.2)]": "shadow-sm",
    "shadow-[0_0_15px_rgba(236,72,153,0.2)]": "shadow-sm",
    "shadow-[0_0_10px_rgba(251,191,36,0.5)]": "shadow-md",
    "shadow-[0_0_15px_rgba(251,191,36,0.2)]": "shadow-sm"
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w') as f:
    f.write(content)

print("Patch applied")
