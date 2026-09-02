import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Remove state variables
    content = re.sub(r"const \[downloadSuccessJpg, setDownloadSuccessJpg\] = useState\(false\);\n", "", content)
    content = re.sub(r"const \[downloadSuccessPdf, setDownloadSuccessPdf\] = useState\(false\);\n", "", content)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/pedigree/CertificateModal.tsx')
