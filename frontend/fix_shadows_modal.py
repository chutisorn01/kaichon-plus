import re

file_path = 'src/components/pedigree/CertificateModal.tsx'
try:
    with open(file_path, 'r') as f:
        content = f.read()

    # Remove all custom shadows like shadow-[0_0_...]
    content = re.sub(r'shadow-\[[^\]]+\]', 'shadow-lg', content)

    with open(file_path, 'w') as f:
        f.write(content)
    print("Fixed custom shadows in CertificateModal.tsx")
except Exception as e:
    print(f"Error: {e}")
