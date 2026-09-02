import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Revert html2canvas import to html-to-image
    content = content.replace("import html2canvas from 'html2canvas';", "import { toJpeg } from 'html-to-image';")

    # Replace getCertificateImage
    old_get_cert = """ const getCertificateImage = async () => {
  if (generatedImage) return generatedImage;
  if (!certificateRef.current) throw new Error('Ref not found');
  
  // Use html2canvas instead of html-to-image for Safari compatibility
  // html2canvas manually draws DOM to canvas, bypassing SVG strict policies
  const canvas = await html2canvas(certificateRef.current, {
   scale: 2,
   useCORS: true,
   allowTaint: true,
   backgroundColor: '#0f172a',
   width: 794,
   height: 1123,
  });
  
  const image = canvas.toDataURL('image/jpeg', 0.95);
  setGeneratedImage(image);
  return image;
 };"""

    new_get_cert = """ const getCertificateImage = async () => {
  if (generatedImage) return generatedImage;
  if (!certificateRef.current) throw new Error('Ref not found');
  
  const options = {
   quality: 0.95,
   backgroundColor: '#0f172a',
   width: 794,
   height: 1123,
   pixelRatio: 2,
   useCORS: true,
   style: { transform: 'scale(1)', transformOrigin: 'top left' }
  };
  
  // SAFARI FIX: The first render often drops the chicken image due to strict SVG parsing policies.
  // By running it once (dummy) and yielding, we force Safari to cache the decoded image resources.
  // The second render will then draw perfectly.
  await toJpeg(certificateRef.current, options).catch(() => {});
  
  // Yield to browser's event loop to allow Safari to finish decoding the image in its background thread
  await new Promise(r => setTimeout(r, 150));
  
  // Second run: this will be perfect!
  const image = await toJpeg(certificateRef.current, options);
  
  setGeneratedImage(image);
  return image;
 };"""
    
    content = content.replace(old_get_cert, new_get_cert)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/pedigree/CertificateModal.tsx')
