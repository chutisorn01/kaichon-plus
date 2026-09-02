import re

files_to_fix = [
    'src/components/pedigree/CertificateModal.tsx',
    'src/components/pedigree/CertificateDocument.tsx'
]

for file_path in files_to_fix:
    try:
        with open(file_path, 'r') as f:
            content = f.read()

        content = content.replace('text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-400 to-amber-100', 'text-amber-300')
        content = content.replace('text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400', 'text-amber-300')
        content = content.replace('text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300', 'text-white')
        content = content.replace('text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-orange-500', 'text-amber-500')

        with open(file_path, 'w') as f:
            f.write(content)
        print(f"Fixed gradients in {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

