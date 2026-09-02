with open('src/components/pedigree/CertificateModal.tsx', 'r') as f:
    content = f.read()

# 1. State vars
content = content.replace(
    ' const [downloading, setDownloading] = useState(false);\n const [downloadSuccess, setDownloadSuccess] = useState(false);',
    ' const [downloadingJpg, setDownloadingJpg] = useState(false);\n const [downloadSuccessJpg, setDownloadSuccessJpg] = useState(false);\n const [downloadingPdf, setDownloadingPdf] = useState(false);\n const [downloadSuccessPdf, setDownloadSuccessPdf] = useState(false);'
)

# 2. JPG function
content = content.replace('setDownloading(true);', 'setDownloadingJpg(true);', 1)
content = content.replace('setDownloadSuccess(false);', 'setDownloadSuccessJpg(false);', 1)
content = content.replace('setDownloadSuccess(true);', 'setDownloadSuccessJpg(true);', 1)
content = content.replace('setTimeout(() => setDownloadSuccess(false)', 'setTimeout(() => setDownloadSuccessJpg(false)', 1)
content = content.replace('setDownloading(false);', 'setDownloadingJpg(false);', 1)

# 3. PDF function
content = content.replace('setDownloading(true);', 'setDownloadingPdf(true);', 1)
content = content.replace('setDownloadSuccess(false);', 'setDownloadSuccessPdf(false);', 1)
content = content.replace('setDownloadSuccess(true);', 'setDownloadSuccessPdf(true);', 1)
content = content.replace('setTimeout(() => setDownloadSuccess(false)', 'setTimeout(() => setDownloadSuccessPdf(false)', 1)
content = content.replace('setDownloading(false);', 'setDownloadingPdf(false);', 1)

# 4. Buttons
# We need to replace `downloading` and `downloadSuccess` inside the JSX for the two buttons.
# JPG Button starts with `onClick={handleDownload}`
# PDF Button starts with `onClick={handleDownloadPdf}`

jpg_btn_idx = content.find('onClick={handleDownload}')
pdf_btn_idx = content.find('onClick={handleDownloadPdf}')

# We will just do a targeted regex replace within the buttons
import re

# JPG Button block
jpg_block = content[jpg_btn_idx:pdf_btn_idx]
jpg_block = jpg_block.replace('downloading', 'downloadingJpg')
jpg_block = jpg_block.replace('downloadSuccess', 'downloadSuccessJpg')
content = content[:jpg_btn_idx] + jpg_block + content[pdf_btn_idx:]

pdf_btn_idx = content.find('onClick={handleDownloadPdf}')
# PDF Button block
pdf_block = content[pdf_btn_idx:]
pdf_block = pdf_block.replace('downloading', 'downloadingPdf')
pdf_block = pdf_block.replace('downloadSuccess', 'downloadSuccessPdf')
content = content[:pdf_btn_idx] + pdf_block

with open('src/components/pedigree/CertificateModal.tsx', 'w') as f:
    f.write(content)
print("Updated successfully")
