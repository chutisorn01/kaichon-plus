import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # The new robust check
    robust_check = "const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) && window.matchMedia('(pointer: coarse)').matches;\n  if (isMobile && navigator.share) {"

    # Replace old check
    old_check = "const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);\n  if (isMobile && navigator.share) {"
    
    content = content.replace(old_check, robust_check)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/pedigree/CertificateModal.tsx')
