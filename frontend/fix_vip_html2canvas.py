import re

with open('src/components/vip/VipBreedingDashboard.tsx', 'r') as f:
    content = f.read()

# Replace import
content = content.replace("import { toPng } from 'html-to-image';", "import html2canvas from 'html2canvas';")

# Replace toPng call
old_call = """          toPng(exportElement, { quality: 1.0, backgroundColor: exportTheme === 'dark' ? '#0f172a' : '#ffffff', useCORS: true, cacheBust: true })
            .then(async (dataUrl) => {"""

new_call = """          html2canvas(exportElement, {
            scale: 2, // High quality scale
            backgroundColor: exportTheme === 'dark' ? '#0f172a' : '#ffffff',
            useCORS: true,
            allowTaint: false,
            logging: false
          }).then(async (canvas) => {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);"""

content = content.replace(old_call, new_call)

with open('src/components/vip/VipBreedingDashboard.tsx', 'w') as f:
    f.write(content)
print("Updated VIP to html2canvas successfully")
