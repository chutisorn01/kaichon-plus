import re

files_to_fix = [
    'src/components/pedigree/CertificateModal.tsx',
    'src/components/pedigree/CertificateDocument.tsx'
]

for file_path in files_to_fix:
    try:
        with open(file_path, 'r') as f:
            content = f.read()

        # Remove Tailwind drop-shadow utilities
        content = re.sub(r'\bdrop-shadow-[a-zA-Z0-9-]+\b', '', content)
        # Remove custom drop-shadow-[...]
        content = re.sub(r'drop-shadow-\[[^\]]+\]', '', content)
        # Clean up any double spaces that might be left
        content = re.sub(r'  +', ' ', content)

        with open(file_path, 'w') as f:
            f.write(content)
        print(f"Fixed shadows in {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

