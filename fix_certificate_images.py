import re

def fix_cert_doc():
    file_path = 'frontend/src/components/pedigree/CertificateDocument.tsx'
    with open(file_path, 'r') as f:
        content = f.read()

    # Add getImageUrl helper
    if "const getImageUrl" not in content:
        content = content.replace(
            "export const CertificateDocument = React.forwardRef<HTMLDivElement, CertificateProps>(({ chicken, template }, ref) => {",
            "export const CertificateDocument = React.forwardRef<HTMLDivElement, CertificateProps>(({ chicken, template }, ref) => {\n  const getImageUrl = (c: any) => c?.image || (c?._id ? `${import.meta.env.VITE_API_URL}/api/${c?._sourceCollection || (c?.gender === 'chick' ? 'chicks' : c?.gender === 'female' ? 'mothers' : c?.gender === 'male' ? 'fathers' : 'chickens')}/${c?._id}/image` : null);\n"
        )
    
    # Replace chicken.image inside <SafeImage ... />
    content = re.sub(
        r'\{chicken\.image \? \(\s*<SafeImage(.*?)src=\{chicken\.image\}',
        r'{getImageUrl(chicken) ? (\n                      <SafeImage\g<1>src={getImageUrl(chicken)}',
        content
    )
    
    # Replace chicken.father?.image
    content = re.sub(
        r'\{chicken\.father\?\.image \? \(\s*<SafeImage(.*?)src=\{chicken\.father\.image\}',
        r'{getImageUrl(chicken.father) ? (\n                                <SafeImage\g<1>src={getImageUrl(chicken.father)}',
        content
    )
    
    # Replace chicken.mother?.image
    content = re.sub(
        r'\{chicken\.mother\?\.image \? \(\s*<SafeImage(.*?)src=\{chicken\.mother\.image\}',
        r'{getImageUrl(chicken.mother) ? (\n                                <SafeImage\g<1>src={getImageUrl(chicken.mother)}',
        content
    )

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

def fix_cert_modal():
    file_path = 'frontend/src/components/pedigree/CertificateModal.tsx'
    with open(file_path, 'r') as f:
        content = f.read()

    # Add getImageUrl helper
    if "const getImageUrl" not in content:
        content = content.replace(
            "export function CertificateModal({ isOpen, onClose, chicken }: CertificateModalProps) {",
            "export function CertificateModal({ isOpen, onClose, chicken }: CertificateModalProps) {\n  const getImageUrl = (c: any) => c?.image || (c?._id ? `${import.meta.env.VITE_API_URL}/api/${c?._sourceCollection || (c?.gender === 'chick' ? 'chicks' : c?.gender === 'female' ? 'mothers' : c?.gender === 'male' ? 'fathers' : 'chickens')}/${c?._id}/image` : null);\n"
        )
    
    # Replace handleDownload logic
    content = content.replace("if (!chicken?.image) {", "if (!getImageUrl(chicken)) {")
    content = content.replace("let fetchUrl = chicken.image;", "let fetchUrl = getImageUrl(chicken);")
    
    # Replace chicken.image ? (
    content = re.sub(
        r'\) : chicken\.image \? \(\s*<SafeImage src=\{chicken\.image\}',
        r') : getImageUrl(chicken) ? (\n                <SafeImage src={getImageUrl(chicken)}',
        content
    )
    
    # Replace chicken.father?.image ? (
    content = re.sub(
        r'\{chicken\.father\?\.image \? \(\s*<SafeImage src=\{chicken\.father\.image\}',
        r'{getImageUrl(chicken.father) ? (\n                                <SafeImage src={getImageUrl(chicken.father)}',
        content
    )
    
    # Replace chicken.mother?.image ? (
    content = re.sub(
        r'\{chicken\.mother\?\.image \? \(\s*<SafeImage src=\{chicken\.mother\.image\}',
        r'{getImageUrl(chicken.mother) ? (\n                                <SafeImage src={getImageUrl(chicken.mother)}',
        content
    )
    
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

fix_cert_doc()
fix_cert_modal()
