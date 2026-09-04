import re

file_path = 'frontend/src/components/pedigree/ChickRegistry.tsx'
with open(file_path, 'r') as f:
    content = f.read()

old_block_pdf = """          const element = document.getElementById(`cert-export-container`);
          if (element) {
            const dataUrl = await toJpeg(element, {
              quality: 0.95,
              backgroundColor: '#0f172a',
              pixelRatio: 2,
              useCORS: true,
              style: { transform: 'scale(1)', transformOrigin: 'top left' }
            });"""

new_block_pdf = """          const element = document.getElementById(`cert-export-container`);
          if (element) {
            const options = {
              quality: 0.95,
              backgroundColor: '#0f172a',
              pixelRatio: 2,
              useCORS: true,
              style: { transform: 'scale(1)', transformOrigin: 'top left' }
            };
            
            // SAFARI FIX: Dummy run to force image/SVG decoding
            await toJpeg(element, options).catch(() => {});
            await new Promise(r => setTimeout(r, 150));
            
            const dataUrl = await toJpeg(element, options);"""

content = content.replace(old_block_pdf, new_block_pdf)

with open(file_path, 'w') as f:
    f.write(content)

print("Patch applied")
