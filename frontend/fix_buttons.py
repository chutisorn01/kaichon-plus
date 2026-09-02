import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Add guards to handleDownload and handleDownloadPdf
    old_handle_jpg = "const handleDownload = async () => {\n if (!certificateRef.current) return;"
    new_handle_jpg = "const handleDownload = async () => {\n if (!certificateRef.current || downloadingJpg || downloadSuccessJpg || !isReady) return;"
    content = content.replace(old_handle_jpg, new_handle_jpg)

    old_handle_pdf = "const handleDownloadPdf = async () => {\n if (!certificateRef.current) return;"
    new_handle_pdf = "const handleDownloadPdf = async () => {\n if (!certificateRef.current || downloadingPdf || downloadSuccessPdf || !isReady) return;"
    content = content.replace(old_handle_pdf, new_handle_pdf)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/pedigree/CertificateModal.tsx')
