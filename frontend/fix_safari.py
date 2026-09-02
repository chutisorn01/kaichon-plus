import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    safari_workaround = """      // Safari workaround: Call toJpeg twice to force image caching inside the SVG context
      try { await toJpeg(certificateRef.current, { quality: 0.1, pixelRatio: 0.5 }); } catch (e) {}
      
      const image = await toJpeg(certificateRef.current, {"""
      
    safari_workaround_pdf = """      // Safari workaround: Call toJpeg twice to force image caching inside the SVG context
      try { await toJpeg(certificateRef.current, { quality: 0.1, pixelRatio: 0.5 }); } catch (e) {}
      
      const image = await toJpeg(certificateRef.current, {"""
      
    content = content.replace("const image = await toJpeg(certificateRef.current, {", safari_workaround, 1)
    
    # We need to replace the second instance for PDF as well
    content = content.replace("const image = await toJpeg(certificateRef.current, {", safari_workaround_pdf)
    
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/pedigree/CertificateModal.tsx')
