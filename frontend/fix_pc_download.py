import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    is_mobile_check = "const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);\n  if (isMobile && navigator.share) {"

    # Replace for handleDownload
    content = content.replace("if (navigator.share) {", is_mobile_check)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/pedigree/CertificateModal.tsx')
