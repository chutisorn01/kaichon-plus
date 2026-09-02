with open('src/components/pedigree/CertificateModal.tsx', 'r') as f:
    content = f.read()

replacement = """        pixelRatio: 2, // High quality
        useCORS: true,
        cacheBust: true,
        allowTaint: false"""

content = content.replace("        pixelRatio: 2 // High quality", replacement)
content = content.replace("        pixelRatio: 2\n", replacement + "\n")

with open('src/components/pedigree/CertificateModal.tsx', 'w') as f:
    f.write(content)
print("Added useCORS and cacheBust")
