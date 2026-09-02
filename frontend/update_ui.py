import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # 1. Add isReady state
    content = content.replace("const [scale, setScale] = useState(1);", "const [scale, setScale] = useState(1);\n const [isReady, setIsReady] = useState(false);")

    # 2. Update the pre-warm useEffect to set isReady = true
    old_effect = """  // Pre-warm Safari SVG Cache
  useEffect(() => {
    if (certificateRef.current) {
      const timer = setTimeout(() => {
        try {
          toJpeg(certificateRef.current, { quality: 0.1, pixelRatio: 0.1 }).catch(() => {});
        } catch (e) {}
      }, 1500); // Wait for SafeImages to load
      return () => clearTimeout(timer);
    }
  }, []);"""
  
    new_effect = """  // Pre-warm Safari SVG Cache & Control UI Readiness
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
  
    content = content.replace(old_effect, new_effect)

    # 3. Update JPG button
    old_jpg_btn = """onClick={handleDownload}
 disabled={downloadingJpg || downloadSuccessJpg}
 className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
 downloadSuccessJpg 
 ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
 : 'bg-white text-slate-800 hover:bg-slate-100 shadow-white/20'
 }`}
 >
 {downloadSuccessJpg ? (
 <CheckCircle className="w-5 h-5 text-emerald-50" />
 ) : downloadingJpg ? (
 <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
 ) : (
 <Image className="w-5 h-5" />
 )}
 {downloadSuccessJpg ? 'สำเร็จ!' : 'บันทึก JPG'}"""

    new_jpg_btn = """onClick={handleDownload}
 disabled={!isReady || downloadingJpg || downloadSuccessJpg}
 className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
 downloadSuccessJpg 
 ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
 : 'bg-white text-slate-800 hover:bg-slate-100 shadow-white/20'
 }`}
 >
 {!isReady ? (
   <><div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> เตรียมข้อมูล...</>
 ) : downloadSuccessJpg ? (
 <CheckCircle className="w-5 h-5 text-emerald-50" />
 ) : downloadingJpg ? (
 <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
 ) : (
 <Image className="w-5 h-5" />
 )}
 {isReady && !downloadSuccessJpg && !downloadingJpg ? 'บันทึก JPG' : ''}
 {isReady && downloadSuccessJpg ? 'สำเร็จ!' : ''}"""

    # We need to use regex or careful replace because Image className="w-5 h-5" might be imported as ImageIcon
    # Let's just find and replace the disabled and children.
    
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path} partially")

update_file('src/components/pedigree/CertificateModal.tsx')
