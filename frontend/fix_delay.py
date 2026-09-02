import re

def fix_delay(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Remove duplicate delay
    duplicate = """      // Safari workaround: Wait 300ms for DOM to settle, then call toJpeg twice to force image caching inside the SVG context
      await new Promise(resolve => setTimeout(resolve, 300));
      // Safari workaround: Wait 300ms for DOM to settle, then call toJpeg twice to force image caching inside the SVG context
      await new Promise(resolve => setTimeout(resolve, 300));"""
      
    fixed = """      // Safari workaround: Wait 300ms for DOM to settle, then call toJpeg twice to force image caching inside the SVG context
      await new Promise(resolve => setTimeout(resolve, 300));"""
      
    content = content.replace(duplicate, fixed)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

fix_delay('src/components/pedigree/CertificateModal.tsx')
