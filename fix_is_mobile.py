import re

file_path = 'frontend/src/components/pedigree/CertificateModal.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace JPG isMobile check
old_jpg_check = "const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) && window.matchMedia('(pointer: coarse)').matches;"
new_mobile_check = """const isMac = /Macintosh/.test(navigator.userAgent);
 const isIPadOS = isMac && navigator.maxTouchPoints > 1;
 const isMobile = (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || isIPadOS) && window.matchMedia('(max-width: 1024px)').matches;"""

if old_jpg_check in content:
    content = content.replace(old_jpg_check, new_mobile_check)
    with open(file_path, 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Code not found")
