import re

def rewrite_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Create getCertificateImage function
    helper = """
  const getCertificateImage = async () => {
    if (generatedImage) return generatedImage;
    if (!certificateRef.current) throw new Error('Ref not found');
    
    // Safari workaround: Wait a tiny bit for UI to settle
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const image = await toJpeg(certificateRef.current, {
      quality: 0.95,
      backgroundColor: '#0f172a',
      width: 794,
      height: 1123,
      pixelRatio: 2,
      useCORS: true,
      style: { transform: 'scale(1)', transformOrigin: 'top left' }
    });
    
    setGeneratedImage(image);
    return image;
  };
"""
    # Insert helper before handleDownload
    content = content.replace(" const handleDownload = async () => {", helper + "\n const handleDownload = async () => {")

    # Rewrite handleDownload body
    old_handleDownload = """      // Safari workaround: Wait a tiny bit for UI to settle
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const image = await toJpeg(certificateRef.current, {
 quality: 0.95,
 backgroundColor: '#0f172a',
 width: 794,
 height: 1123,
 pixelRatio: 2,
 useCORS: true,
 style: { transform: 'scale(1)', transformOrigin: 'top left' }
 });"""
    content = content.replace(old_handleDownload, "      const image = await getCertificateImage();")

    # Rewrite handleDownloadPdf body
    old_handleDownloadPdf = """      const image = await toJpeg(certificateRef.current, {
 quality: 0.95,
 backgroundColor: '#0f172a',
 width: 794,
 height: 1123,
 pixelRatio: 2,
 useCORS: true,
 style: { transform: 'scale(1)', transformOrigin: 'top left' }
 });"""
    content = content.replace(old_handleDownloadPdf, "      const image = await getCertificateImage();")

    # Remove setGeneratedImage(image) from the fallback block in handleDownload because getCertificateImage already sets it
    old_fallback = """      if (!shared) {
        setGeneratedImage(image);
      }"""
    content = content.replace(old_fallback, "      // generatedImage is already set by getCertificateImage")

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

rewrite_file('src/components/pedigree/CertificateModal.tsx')
