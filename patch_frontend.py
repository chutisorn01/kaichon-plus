import re

def patch_file(file_path, type_name):
    with open(file_path, 'r') as f:
        content = f.read()

    # 1. Add imports
    imports = f"""import {{ LazyImage }} from '../common/LazyImage';
import {{ compressImage }} from '../../utils/imageUtils';
"""
    # Insert after first import
    content = content.replace("import React,", imports + "import React,")

    # 2. Patch handleImageChange
    old_image_change = """const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };"""
    
    new_image_change = """const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setFormData(prev => ({ ...prev, image: compressedBase64 }));
      } catch (err) {
        console.error("Image compression failed", err);
        alert("ไม่สามารถบีบอัดรูปภาพได้");
      }
    }
  };"""
    content = content.replace(old_image_change, new_image_change)

    # 3. Patch Image Tag in list card
    old_img_block = f"""                  {{{type_name}.image ? (
                    <img src={{{type_name}.image}} alt={{{type_name}.name}} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center text-red-650">
                      <ChickenIcon size={{28}} />
                    </div>
                  )}}"""
    if type_name == 'mother':
        old_img_block = old_img_block.replace("bg-red-100 dark:bg-red-950/40", "bg-pink-100 dark:bg-pink-950/40")
        old_img_block = old_img_block.replace("text-red-650", "text-pink-600")

    fallback = """<div className="w-14 h-14 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center text-red-650">
                      <ChickenIcon size={28} />
                    </div>"""
    if type_name == 'mother':
        fallback = fallback.replace("bg-red-100 dark:bg-red-950/40", "bg-pink-100 dark:bg-pink-950/40")
        fallback = fallback.replace("text-red-650", "text-pink-600")

    new_img_block = f"""                  <LazyImage 
                    url={{`${{import.meta.env.VITE_API_URL}}/api/{type_name}s/${{{type_name}._id}}/image`}} 
                    alt={{{type_name}.name}} 
                    className="w-full h-full object-cover"
                    fallbackIcon={{{fallback}}}
                  />"""
    
    # We need to handle the case where .image is STILL returned (e.g. from the backend revert).
    # Wait, if we use LazyImage, we MUST NOT use the backend image payload. We need .select('-image') back!
    # I already added .select('-image') in setup_backend.py. So father.image will be undefined.
    # Therefore, we just replace the whole block with LazyImage.
    content = content.replace(old_img_block, new_img_block)
    
    # Wait! Sometimes the regex might not match exactly due to formatting. Let's use regex.
    pattern = r"                  \{" + type_name + r"\.image \? \([\s\S]*?\([\s\S]*?ChickenIcon size=\{28\} \/>\s*<\/div>\s*\)\}"
    # Let's print if matched
    if re.search(pattern, content):
        content = re.sub(pattern, new_img_block, content)
    else:
        print(f"Regex failed for {file_path} image block")

    with open(file_path, 'w') as f:
        f.write(content)

patch_file('frontend/src/components/pedigree/FatherRegistry.tsx', 'father')
patch_file('frontend/src/components/pedigree/MotherRegistry.tsx', 'mother')
print("Frontend updated")
