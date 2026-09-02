import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Add state for localChickenUrl
    state_decl = "const [scale, setScale] = useState(1);\n const [isReady, setIsReady] = useState(false);\n const [localChickenUrl, setLocalChickenUrl] = useState<string | null>(null);"
    content = content.replace("const [scale, setScale] = useState(1);\n const [isReady, setIsReady] = useState(false);", state_decl)

    # Replace the pre-warm useEffect to first fetch the chicken image as an Object URL, wait for it, then pre-warm
    old_effect = """  // Pre-warm Safari SVG Cache & Control UI Readiness
  useEffect(() => {
    if (certificateRef.current) {
      const timer = setTimeout(() => {
        try {
          toJpeg(certificateRef.current, { quality: 0.1, pixelRatio: 0.1 })
            .finally(() => setIsReady(true))
            .catch(() => setIsReady(true));
        } catch (e) {
          setIsReady(true);
        }
      }, 1500); // Wait for SafeImages to load
      return () => clearTimeout(timer);
    } else {
      setIsReady(true);
    }
  }, []);"""

    new_effect = """  // Pre-fetch chicken image as Blob Object URL as requested, then Pre-warm SVG Cache
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

    content = content.replace(old_effect, new_effect)

    # Replace SafeImage for chicken with standard img using localChickenUrl
    # Locate: <SafeImage src={chicken.image} alt="Chicken" className="w-full h-full object-cover" />
    old_img = """<SafeImage src={chicken.image} alt="Chicken" className="w-full h-full object-cover" />"""
    new_img = """{localChickenUrl ? (
                <img src={localChickenUrl} alt="Chicken" className="w-full h-full object-cover" crossOrigin="anonymous" />
              ) : (
                <SafeImage src={chicken.image} alt="Chicken" className="w-full h-full object-cover" />
              )}"""
    
    content = content.replace(old_img, new_img)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/pedigree/CertificateModal.tsx')
