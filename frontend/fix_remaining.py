import re

file_path = 'src/components/pedigree/CertificateModal.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace html2canvas block
old_block = """ const canvas = await html2canvas(certificateRef.current, {
 backgroundColor: '#0f172a',
 scale: 1.5,
 useCORS: true,
 allowTaint: true
 });
 const image = canvas.toDataURL('image/jpeg', 0.95);"""

new_block = """ const image = await toJpeg(certificateRef.current, {
 quality: 0.95,
 backgroundColor: '#0f172a',
 width: 794,
 height: 1123,
 pixelRatio: 1.5,
 useCORS: true,
 cacheBust: true,
 style: { transform: 'scale(1)', transformOrigin: 'top left' }
 });"""

content = content.replace(old_block, new_block)

with open(file_path, 'w') as f:
    f.write(content)
