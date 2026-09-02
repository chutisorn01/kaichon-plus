with open('src/components/pedigree/CertificateModal.tsx', 'r') as f:
    content = f.read()

# 1. Lower pixelRatio to prevent memory crashes on large iPhone photos
content = content.replace('pixelRatio: 2,', 'pixelRatio: 1.5,')

# 2. Fix radial gradient bug by moving it off the root node style
old_style = """ className="w-[794px] h-[1123px] bg-slate-900 relative overflow-hidden rounded-sm shadow-2xl flex flex-col border-[12px] border-slate-800 origin-top-left"
 style={{ 
 backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
 fontFamily: "'Inter', sans-serif"
 }}
 >"""

new_style = """ className="w-[794px] h-[1123px] bg-slate-900 relative overflow-hidden rounded-sm shadow-2xl flex flex-col border-[12px] border-slate-800 origin-top-left"
 style={{ fontFamily: "'Inter', sans-serif" }}
 >
 {/* Background Gradient Fixed for iOS */}
 <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)' }}></div>"""

content = content.replace(old_style, new_style)

with open('src/components/pedigree/CertificateModal.tsx', 'w') as f:
    f.write(content)

with open('src/components/pedigree/CertificateDocument.tsx', 'r') as f:
    content_doc = f.read()

content_doc = content_doc.replace(old_style, new_style)

with open('src/components/pedigree/CertificateDocument.tsx', 'w') as f:
    f.write(content_doc)

print("iOS bug fixes applied")
