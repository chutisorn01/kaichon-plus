with open('src/components/vip/VipBreedingDashboard.tsx', 'r') as f:
    content = f.read()

# Update toPng options
content = content.replace(
    "toPng(exportElement, { quality: 1.0, backgroundColor: exportTheme === 'dark' ? '#0f172a' : '#ffffff' })",
    "toPng(exportElement, { quality: 1.0, backgroundColor: exportTheme === 'dark' ? '#0f172a' : '#ffffff', useCORS: true, cacheBust: true })"
)

# Replace the `.then` block
old_then = """            .then((dataUrl) => {
              if (exportFormat === 'pdf') {
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (exportElement.offsetHeight * pdfWidth) / exportElement.offsetWidth;
                pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`VIP-Breeding-${exportingRecord.queueNo}.pdf`);
              } else {
                const link = document.createElement('a');
                link.download = `VIP-Breeding-${exportingRecord.queueNo}.png`;
                link.href = dataUrl;
                link.click();
              }
              setExportingRecord(null);
            })"""

new_then = """            .then(async (dataUrl) => {
              const fileName = `VIP-Breeding-${exportingRecord.queueNo}.${exportFormat === 'pdf' ? 'pdf' : 'png'}`;
              let shared = false;

              if (navigator.share) {
                try {
                  let file;
                  if (exportFormat === 'pdf') {
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (exportElement.offsetHeight * pdfWidth) / exportElement.offsetWidth;
                    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    const blob = pdf.output('blob');
                    file = new File([blob], fileName, { type: 'application/pdf' });
                  } else {
                    const res = await fetch(dataUrl);
                    const blob = await res.blob();
                    file = new File([blob], fileName, { type: 'image/png' });
                  }

                  if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                      files: [file],
                      title: 'เอกสาร VIP Breeding',
                      text: `เอกสาร VIP Breeding หมายเลข ${exportingRecord.queueNo}`
                    });
                    shared = true;
                  }
                } catch (shareError: any) {
                  if (shareError.name === 'AbortError' || (shareError.message && shareError.message.includes('abort'))) {
                    shared = true;
                  } else {
                    console.error('Share API Error:', shareError);
                  }
                }
              }

              if (!shared) {
                if (exportFormat === 'pdf') {
                  const pdf = new jsPDF('p', 'mm', 'a4');
                  const pdfWidth = pdf.internal.pageSize.getWidth();
                  const pdfHeight = (exportElement.offsetHeight * pdfWidth) / exportElement.offsetWidth;
                  pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
                  pdf.save(fileName);
                } else {
                  const link = document.createElement('a');
                  link.download = fileName;
                  link.href = dataUrl;
                  link.click();
                }
              }
              setExportingRecord(null);
            })"""

if old_then in content:
    content = content.replace(old_then, new_then)
    with open('src/components/vip/VipBreedingDashboard.tsx', 'w') as f:
        f.write(content)
    print("Updated successfully")
else:
    print("Could not find block to replace")
