import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # 1. Add pre-warm useEffect
    prewarm = """
  // Pre-warm Safari SVG Cache
  useEffect(() => {
    if (certificateRef.current) {
      const timer = setTimeout(() => {
        try {
          toJpeg(certificateRef.current, { quality: 0.1, pixelRatio: 0.1 }).catch(() => {});
        } catch (e) {}
      }, 1500); // Wait for SafeImages to load
      return () => clearTimeout(timer);
    }
  }, []);
"""
    # Insert it right before "const handleDownload = async () => {"
    content = content.replace(" const handleDownload = async () => {", prewarm + "\n const handleDownload = async () => {")
    
    # 2. Remove the inline dummy render for JPG
    old_inline = """      // Safari workaround: Wait 300ms for DOM to settle, then call toJpeg twice to force image caching inside the SVG context
      await new Promise(resolve => setTimeout(resolve, 300));
      try { await toJpeg(certificateRef.current, { quality: 0.1, pixelRatio: 0.5 }); } catch (e) {}"""
    content = content.replace(old_inline, "      // Safari workaround: Wait a tiny bit for UI to settle\n      await new Promise(resolve => setTimeout(resolve, 150));")

    # 3. Do the same for PDF just in case it had it
    old_inline_pdf = """      // Safari workaround: Call toJpeg twice to force image caching inside the SVG context
      try { await toJpeg(certificateRef.current, { quality: 0.1, pixelRatio: 0.5 }); } catch (e) {}"""
    content = content.replace(old_inline_pdf, "")

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/pedigree/CertificateModal.tsx')
