import re

file_path = 'frontend/src/components/pedigree/ChickenDetail.tsx'
with open(file_path, 'r') as f:
    content = f.read()

old_block = """{chick.image ? (
                <>
                  <img src={chick.image} alt={chick.name} className="w-full h-full object-cover" />
                  {!isPublic && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-2">
                    <Swords className="w-8 h-8" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">
                    {!isPublic ? 'เพิ่มรูปภาพ' : 'ไม่มีรูปภาพ'}
                  </span>
                </>
              )}"""

new_block = """<>
                <img 
                  src={chick.image || `${import.meta.env.VITE_API_URL}/api/${chick._sourceCollection || 'chickens'}/${chick._id}/image`}
                  alt={chick.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div className="w-full h-full flex-col items-center justify-center text-slate-400 hidden-fallback bg-slate-50 dark:bg-slate-800" style={{ display: 'none' }}>
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-2">
                    <Swords className="w-8 h-8" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">
                    {!isPublic ? 'เพิ่มรูปภาพ' : 'ไม่มีรูปภาพ'}
                  </span>
                </div>
                {!isPublic && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                )}
              </>"""

if "{chick.image ? (" in content:
    content = content.replace(old_block, new_block)
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")
else:
    print("Could not find old block in ChickenDetail.tsx")
