import re

def clean_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Remove the duplicate
    content = content.replace("""      try { await toJpeg(certificateRef.current, { quality: 0.1, pixelRatio: 0.5 }); } catch (e) {}
      
            // Safari workaround: Call toJpeg twice to force image caching inside the SVG context
      try { await toJpeg(certificateRef.current, { quality: 0.1, pixelRatio: 0.5 }); } catch (e) {}""", """      // Safari workaround: Call toJpeg twice to force image caching inside the SVG context
      try { await toJpeg(certificateRef.current, { quality: 0.1, pixelRatio: 0.5 }); } catch (e) {}""")

    with open(file_path, 'w') as f:
        f.write(content)

clean_file('src/components/pedigree/CertificateModal.tsx')
