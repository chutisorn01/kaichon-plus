import re

def fix_onload(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # 1. Add isImageLoaded state
    state_decl = "const [isReady, setIsReady] = useState(false);\n const [localChickenUrl, setLocalChickenUrl] = useState<string | null>(null);\n const [isChickenLoaded, setIsChickenLoaded] = useState(false);"
    content = content.replace("const [isReady, setIsReady] = useState(false);\n const [localChickenUrl, setLocalChickenUrl] = useState<string | null>(null);", state_decl)

    # 2. Modify the image pre-fetch useEffect to only fetch and set URL
    old_effect = """  // Pre-fetch chicken image as Blob Object URL as requested, then Pre-warm SVG Cache
  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const prepareImage = async () => {
      try {
        if (chicken?.image) {
          const res = await fetch(chicken.image, { mode: 'cors' });
          const blob = await res.blob();
          objectUrl = URL.createObjectURL(blob);
          if (isMounted) {
            setLocalChickenUrl(objectUrl);
          }
          
          // Wait for the img to decode in the DOM
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (e) {
        console.error("Failed to preload chicken image as blob", e);
      }

      if (isMounted && certificateRef.current) {
        try {
          await toJpeg(certificateRef.current, { quality: 0.1, pixelRatio: 0.1 });
        } catch (e) {}
        setIsReady(true);
      } else if (isMounted) {
        setIsReady(true);
      }
    };

    prepareImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [chicken]);"""

    new_effect = """  // Step 1: Pre-fetch chicken image as Blob Object URL
  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    if (!chicken?.image) {
      setIsChickenLoaded(true); // No image to load
      return;
    }

    const prepareImage = async () => {
      try {
        const res = await fetch(chicken.image, { mode: 'cors' });
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (isMounted) {
          setLocalChickenUrl(objectUrl);
        }
      } catch (e) {
        console.error("Failed to preload chicken image as blob", e);
        if (isMounted) setIsChickenLoaded(true); // Fallback to proceed
      }
    };

    prepareImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [chicken]);

  // Step 2: Pre-warm SVG Cache ONLY AFTER image has fully loaded in DOM
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

    content = content.replace(old_effect, new_effect)

    # 3. Add onLoad handler to the img tag
    old_img = """<img src={localChickenUrl} alt="Chicken" className="w-full h-full object-cover" />"""
    new_img = """<img src={localChickenUrl} alt="Chicken" className="w-full h-full object-cover" onLoad={() => setIsChickenLoaded(true)} onError={() => setIsChickenLoaded(true)} />"""
    
    content = content.replace(old_img, new_img)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

fix_onload('src/components/pedigree/CertificateModal.tsx')
