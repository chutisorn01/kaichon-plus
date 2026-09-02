import re

file_path = 'frontend/src/components/chickens/ChickenList.tsx'
with open(file_path, 'r') as f:
    content = f.read()

old_block = """{chicken.image ? (
                    <img src={chicken.image} alt={chicken.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                      <ChickenIcon size={28} />
                    </div>
                  )}"""

new_block = """<img 
                    src={`${import.meta.env.VITE_API_URL}/api/${chicken.gender === 'chick' ? 'chicks' : 'chickens'}/${chicken._id}/image`} 
                    alt={chicken.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hidden-fallback" style={{ display: 'none' }}>
                    <ChickenIcon size={28} />
                  </div>"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")
else:
    print("Could not find old block in ChickenList.tsx")
