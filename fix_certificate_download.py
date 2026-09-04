import re

file_path = 'frontend/src/components/pedigree/CertificateModal.tsx'
with open(file_path, 'r') as f:
    content = f.read()

old_block = """ // 2) Fallback สำหรับ Desktop หรือเบราว์เซอร์ที่ไม่รองรับ Share API
 if (!shared) {
 const blob = b64toBlob(image, 'image/jpeg');
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = fileName;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 setTimeout(() => URL.revokeObjectURL(url), 100);
 }"""

new_block = """ // 2) Fallback สำหรับ Desktop หรือเบราว์เซอร์ที่ไม่รองรับ Share API
 if (!shared) {
   try {
     const blob = b64toBlob(image, 'image/jpeg');
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.style.display = 'none';
     link.href = url;
     link.download = fileName;
     document.body.appendChild(link);
     link.click();
     setTimeout(() => {
       if (document.body.contains(link)) document.body.removeChild(link);
       URL.revokeObjectURL(url);
     }, 10000);
   } catch (fallbackErr) {
     console.error('Blob download failed, trying data URI:', fallbackErr);
     const link = document.createElement('a');
     link.href = image;
     link.download = fileName;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
   }
 }"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open(file_path, 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Code not found")
