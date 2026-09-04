import re

def fix_fetch_cache(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Add cache-busting to list fetch
    content = content.replace(
        "const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fathers`, {",
        "const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fathers?t=${Date.now()}`, {"
    )
    content = content.replace(
        "const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mothers`, {",
        "const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mothers?t=${Date.now()}`, {"
    )
    
    # Add cache-busting to individual fetch
    content = content.replace(
        "const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fathers/${father._id}`, {",
        "const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fathers/${father._id}?t=${Date.now()}`, {"
    )
    content = content.replace(
        "const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mothers/${mother._id}`, {",
        "const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mothers/${mother._id}?t=${Date.now()}`, {"
    )

    with open(file_path, 'w') as f:
        f.write(content)

fix_fetch_cache('frontend/src/components/pedigree/FatherRegistry.tsx')
fix_fetch_cache('frontend/src/components/pedigree/MotherRegistry.tsx')
print("Patched fetch caching")
