import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Increase pixelRatio to 2.5
    content = re.sub(r'pixelRatio: 1\.5,', 'pixelRatio: 2.5,', content)

    # Fix JPG download fallback
    if 'link.href = image;' in content:
        old_fallback = """ if (!shared) {
 const link = document.createElement('a');
 link.href = image;
 link.download = fileName;
 link.click();
 }"""
        
        new_fallback = """ if (!shared) {
 const res = await fetch(image);
 const blob = await res.blob();
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = fileName;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 setTimeout(() => URL.revokeObjectURL(url), 100);
 }"""
        content = content.replace(old_fallback, new_fallback)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/pedigree/CertificateModal.tsx')
update_file('src/components/pedigree/ChickRegistry.tsx')
