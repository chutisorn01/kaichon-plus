import re

def fix_chicken_list(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # We need to replace the image src and add an onError fallback
    # Find the img tag block:
    # <img src={chicken.image} alt={chicken.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    
    old_img = '<img src={chicken.image} alt={chicken.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />'
    new_img = """<img 
              src={`${import.meta.env.VITE_API_URL}/api/${chicken.gender === 'chick' ? 'chicks' : 'chickens'}/${chicken._id}/image`} 
              alt={chicken.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-700" style={{ display: 'none' }}>
              <ChickenIcon className="w-12 h-12 mb-2 opacity-50" />
              <span className="text-xs font-medium">ไม่มีรูปภาพ</span>
            </div>"""

    content = content.replace(old_img, new_img)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

def fix_chicken_detail(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # The detailed view has a huge banner image and a thumbnail in the modal.
    # Banner:
    # <img src={chick.image} alt={chick.name} className="w-full h-full object-cover" />
    # Fallback is already handled by condition:
    # {chick.image ? ( <img /> ) : ( <div /> )}
    
    # We should change `chick.image ?` to just render the img with onError since we don't know if it has an image.
    # Actually, we can check if `chick.image` is truthy, but wait... `chick.image` won't be returned by the API anymore!
    # Wait, `getChickenById` STILL returns `image` because we didn't remove it from `getChickenById`!
    # Is it okay to return `image` in `getChickenById`? Yes, because it's only ONE chicken! It's fast!
    # Let's check `chicken.controller.ts` getChickenById.
    pass

fix_chicken_list('frontend/src/components/chickens/ChickenList.tsx')
