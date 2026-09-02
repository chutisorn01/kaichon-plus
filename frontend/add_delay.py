import re

def add_delay(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Add a 300ms delay before the first toJpeg call in handleDownloadJpg
    old_call = """      // Safari workaround: Call toJpeg twice to force image caching inside the SVG context"""
    new_call = """      // Safari workaround: Wait 300ms for DOM to settle, then call toJpeg twice to force image caching inside the SVG context
      await new Promise(resolve => setTimeout(resolve, 300));"""
      
    content = content.replace(old_call, new_call)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

add_delay('src/components/pedigree/CertificateModal.tsx')
