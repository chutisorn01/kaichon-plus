import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Remove crossOrigin="anonymous" globally
    content = content.replace('crossOrigin="anonymous"', '')
    # Also clean up double spaces that might result from removal
    content = content.replace('  ', ' ')

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/pedigree/CertificateModal.tsx')
