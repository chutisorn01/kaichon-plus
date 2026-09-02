import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Add state
    if 'const [generatedImage, setGeneratedImage]' not in content:
        content = re.sub(r'const \[downloadSuccessPdf, setDownloadSuccessPdf\] = useState\(false\);',
                         'const [downloadSuccessPdf, setDownloadSuccessPdf] = useState(false);\n  const [generatedImage, setGeneratedImage] = useState<string | null>(null);',
                         content)

    # Update fallback in handleDownloadJpg
    old_fallback = """      if (!shared) {
        const res = await fetch(image);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }"""
      
    new_fallback = """      if (!shared) {
        setGeneratedImage(image);
      }"""
      
    content = content.replace(old_fallback, new_fallback)

    # Add modal UI at the end, before final closing div if it's CertificateModal
    if 'CertificateModal.tsx' in file_path:
        modal_ui = """
      {generatedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 right-4 z-10">
            <button onClick={() => setGeneratedImage(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="w-full max-w-[500px] bg-slate-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
            <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 text-center">
              <p className="text-amber-400 font-bold mb-1">สร้างใบประวัติสำเร็จ!</p>
              <p className="text-sm text-slate-300">แตะค้างที่รูปภาพด้านล่าง ➜ เลือก <span className="text-white font-bold">"บันทึกรูปภาพ"</span></p>
            </div>
            <div className="p-4 flex justify-center items-center overflow-auto max-h-[60vh] bg-black">
              <img src={generatedImage} alt="Certificate" className="max-w-full h-auto rounded shadow-lg select-none" style={{ WebkitTouchCallout: 'default' }} />
            </div>
            <div className="p-4 bg-slate-900 text-center border-t border-white/5">
              <button onClick={() => {
                const link = document.createElement('a');
                link.href = generatedImage;
                link.download = `Certificate_${chicken.code || 'Kaichon'}.jpg`;
                link.click();
              }} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
                <Download className="w-4 h-4" /> ลองดาวน์โหลดปกติ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"""
        # Replace the very last `  </div>\n  );\n}` with the modal UI
        content = re.sub(r'    </div>\n  \);\n}\n$', modal_ui, content)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/pedigree/CertificateModal.tsx')
