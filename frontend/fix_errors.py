import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # 1. Fix the cache buster for Data URIs
    # If it's a data URI, we don't need a cache buster because data URIs aren't cached by disk cache!
    old_fetch = """const cacheBuster = chicken.image.includes('?') ? '&cb=' : '?cb=';
        const res = await fetch(chicken.image + cacheBuster + new Date().getTime(), { mode: 'cors', cache: 'no-store' });"""
    new_fetch = """
        let fetchUrl = chicken.image;
        if (!fetchUrl.startsWith('data:')) {
          const cacheBuster = fetchUrl.includes('?') ? '&cb=' : '?cb=';
          fetchUrl = fetchUrl + cacheBuster + new Date().getTime();
        }
        const res = await fetch(fetchUrl, { mode: 'cors', cache: 'no-store' });"""
    content = content.replace(old_fetch, new_fetch)

    # 2. Completely remove the generatePerfectImage useEffect which calls toJpeg
    regex_to_remove = r"// Step 2: Generate the final image perfectly.*?generatePerfectImage\(\);\n  \n  return \(\) => \{ isMounted = false; \};\n \}, \[isChickenLoaded, generatedImage\]\);"
    content = re.sub(regex_to_remove, "", content, flags=re.DOTALL)

    # Clean up any left over toJpeg calls just in case
    # There shouldn't be any if the regex works, but let's be careful.

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/pedigree/CertificateModal.tsx')
