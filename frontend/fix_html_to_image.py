import re

def update_to_html_to_image(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Replace html2canvas import with html-to-image
    content = re.sub(r"import html2canvas from 'html2canvas';", "import { toJpeg } from 'html-to-image';", content)

    # Replace html2canvas call in CertificateModal.tsx
    if 'CertificateModal.tsx' in file_path:
        old_call = """ const canvas = await html2canvas(certificateRef.current, {
 backgroundColor: '#0f172a',
 scale: 2.5,
 useCORS: true,
 allowTaint: true,
 logging: false
 });
 const image = canvas.toDataURL('image/jpeg', 0.95);"""
        new_call = """ const image = await toJpeg(certificateRef.current, {
 quality: 0.95,
 backgroundColor: '#0f172a',
 width: 794,
 height: 1123,
 pixelRatio: 2,
 useCORS: true,
 style: { transform: 'scale(1)', transformOrigin: 'top left' }
 });"""
        content = content.replace(old_call, new_call)

    # Replace html2canvas call in ChickRegistry.tsx
    if 'ChickRegistry.tsx' in file_path:
        old_call_2 = """            const canvas = await html2canvas(element, {
              backgroundColor: '#0f172a',
              scale: 2.5,
              useCORS: true,
              allowTaint: true,
              logging: false
            });
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);"""
        new_call_2 = """            const dataUrl = await toJpeg(element, {
              quality: 0.95,
              backgroundColor: '#0f172a',
              pixelRatio: 2,
              useCORS: true,
              style: { transform: 'scale(1)', transformOrigin: 'top left' }
            });"""
        content = content.replace(old_call_2, new_call_2)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path} to use html-to-image")

update_to_html_to_image('src/components/pedigree/CertificateModal.tsx')
update_to_html_to_image('src/components/pedigree/ChickRegistry.tsx')
