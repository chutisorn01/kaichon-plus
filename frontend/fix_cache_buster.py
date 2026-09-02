import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Find the fetch call in the useEffect
    old_fetch = "const res = await fetch(chicken.image, { mode: 'cors' });"
    # Add a cache-buster to bypass Safari's CORS disk-cache bug
    new_fetch = "const cacheBuster = chicken.image.includes('?') ? '&cb=' : '?cb=';\n        const res = await fetch(chicken.image + cacheBuster + new Date().getTime(), { mode: 'cors', cache: 'no-store' });"
    
    content = content.replace(old_fetch, new_fetch)

    # Also, if fetch fails, we MUST NOT fallback to SafeImage if it's going to break.
    # Actually, we should just let it fallback but ensure SafeImage is as safe as possible.
    # We already removed crossOrigin from SafeImage previously, right?
    # Let's check if SafeImage in the fallback still has crossOrigin="anonymous".
    old_fallback_img = """<SafeImage crossOrigin="anonymous" src={chicken.image} alt="Chicken" className="w-full h-full object-cover" />"""
    new_fallback_img = """<SafeImage src={chicken.image} alt="Chicken" className="w-full h-full object-cover" />"""
    content = content.replace(old_fallback_img, new_fallback_img)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/pedigree/CertificateModal.tsx')
