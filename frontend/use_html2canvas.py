import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Import html2canvas
    content = content.replace("import { toJpeg } from 'html-to-image';", "import html2canvas from 'html2canvas';")

    # Remove the pre-rendering useEffect
    pre_render_regex = r"// Step 2: Generate the final image perfectly.*?return \(\) => \{ isMounted = false; \};\n  \}, \[isChickenLoaded, generatedImage\]\);"
    content = re.sub(pre_render_regex, "", content, flags=re.DOTALL)

    # Rewrite getCertificateImage
    old_get_cert = r"const getCertificateImage = async \(\) => \{.*?return image;\n  \};"
    new_get_cert = """const getCertificateImage = async () => {
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
    
    return canvas.toDataURL('image/jpeg', 0.95);
  };"""
    content = re.sub(old_get_cert, new_get_cert, content, flags=re.DOTALL)

    # Also remove generatedImage from state if it's unused, but it's fine to leave it.
    # Actually, we can remove generatedImage to keep it clean, but let's just leave it to not break anything else.

    # We also need to fix isReady. Since we removed the useEffect that sets isReady, we should just set isReady when the image loads.
    # Where does isReady get set now? 
    # Let's add an effect that just sets isReady to true when isChickenLoaded is true.
    is_ready_effect = """
  useEffect(() => {
    if (isChickenLoaded) {
      setIsReady(true);
    }
  }, [isChickenLoaded]);
"""
    content = content.replace("const b64toBlob = ", is_ready_effect + "\n\n  const b64toBlob = ")


    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/pedigree/CertificateModal.tsx')
