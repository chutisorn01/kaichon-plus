import re

with open('src/components/pedigree/ChickRegistry.tsx', 'r') as f:
    content = f.read()

# 1. Add html2canvas import if missing, remove toJpeg
content = content.replace("import { toJpeg } from 'html-to-image';", "import html2canvas from 'html2canvas';")
if 'html2canvas' not in content:
    content = "import html2canvas from 'html2canvas';\n" + content

# 2. Increase timeout from 150 to 500
content = content.replace("await new Promise(resolve => setTimeout(resolve, 150));", "await new Promise(resolve => setTimeout(resolve, 500));")

# 3. Replace PDF toJpeg call
old_pdf_call = """            const dataUrl = await toJpeg(element, { 
              quality: 0.95, 
              backgroundColor: '#0f172a',
              width: 794,
              height: 1123,
              pixelRatio: 1
            });"""
new_pdf_call = """            const canvas = await html2canvas(element, {
              scale: 1.5,
              backgroundColor: '#0f172a',
              useCORS: true,
              allowTaint: false,
              logging: false
            });
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);"""
content = content.replace(old_pdf_call, new_pdf_call)

# 4. Replace ZIP toJpeg call
# Same exact string
content = content.replace(old_pdf_call, new_pdf_call)

with open('src/components/pedigree/ChickRegistry.tsx', 'w') as f:
    f.write(content)
print("Updated ChickRegistry.tsx successfully")
