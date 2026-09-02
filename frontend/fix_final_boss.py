import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # We need to completely rewrite the getCertificateImage and the pre-warm useEffect.
    
    # 1. First, replace the pre-warm useEffect (Step 2)
    old_step_2 = """  // Step 2: Pre-warm SVG Cache ONLY AFTER image has fully loaded in DOM
  useEffect(() => {
    if (!isChickenLoaded) return;
    
    let isMounted = true;
    const prewarm = async () => {
      if (certificateRef.current) {
        try {
          // Give a tiny tick for DOM layout to update
          await new Promise(r => setTimeout(r, 100));
          await toJpeg(certificateRef.current, { quality: 0.1, pixelRatio: 0.1 });
        } catch (e) {}
      }
      if (isMounted) setIsReady(true);
    };
    prewarm();
    
    return () => { isMounted = false; };
  }, [isChickenLoaded]);"""

    new_step_2 = """  // Step 2: Generate the final image perfectly in the background BEFORE enabling buttons
  useEffect(() => {
    if (!isChickenLoaded) return;
    if (generatedImage) {
      setIsReady(true);
      return;
    }
    
    let isMounted = true;
    const generatePerfectImage = async () => {
      if (!certificateRef.current) {
        if (isMounted) setIsReady(true);
        return;
      }
      try {
        // Wait for DOM to completely settle
        await new Promise(r => setTimeout(r, 300));
        
        const options = {
          quality: 0.95,
          backgroundColor: '#0f172a',
          width: 794,
          height: 1123,
          pixelRatio: 2,
          useCORS: true,
          style: { transform: 'scale(1)', transformOrigin: 'top left' }
        };

        // 1st Render (Dummy): Forces Safari to parse the SVG and fetch the blob URL into the high-res canvas context.
        // This one might have a blank chicken due to Safari's async rendering. We throw it away.
        await toJpeg(certificateRef.current, options).catch(() => {});
        
        // Wait for Safari's internal SVG thread to catch up and cache the images
        await new Promise(r => setTimeout(r, 400));
        
        // 2nd Render (Real): Safari has now fully cached the SVG. This render will be perfect.
        const perfectImage = await toJpeg(certificateRef.current, options);
        
        if (isMounted) {
          setGeneratedImage(perfectImage);
          setIsReady(true);
        }
      } catch (e) {
        console.error("Failed to generate perfect image", e);
        if (isMounted) setIsReady(true);
      }
    };
    generatePerfectImage();
    
    return () => { isMounted = false; };
  }, [isChickenLoaded, generatedImage]);"""

    content = content.replace(old_step_2, new_step_2)

    # 2. Modify getCertificateImage to NOT generate anything, but just wait for generatedImage
    old_get_cert = """  const getCertificateImage = async () => {
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
  };"""

    new_get_cert = """  const getCertificateImage = async () => {
    if (generatedImage) return generatedImage;
    if (!certificateRef.current) throw new Error('Ref not found');
    
    // Fallback just in case the background generation failed
    const options = {
      quality: 0.95,
      backgroundColor: '#0f172a',
      width: 794,
      height: 1123,
      pixelRatio: 2,
      useCORS: true,
      style: { transform: 'scale(1)', transformOrigin: 'top left' }
    };
    
    const image = await toJpeg(certificateRef.current, options);
    setGeneratedImage(image);
    return image;
  };"""
    content = content.replace(old_get_cert, new_get_cert)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/pedigree/CertificateModal.tsx')
