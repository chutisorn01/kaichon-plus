import re

def fix_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Remove old getImageUrl if exists
    content = re.sub(r'const getImageUrl = \(c: any\) => c\?\.image.*?\n', '', content)

    # Insert specific helpers
    helpers = """
  const getMainImg = () => chicken?.image || (chicken?._id ? `${import.meta.env.VITE_API_URL}/api/${chicken?._sourceCollection || (chicken?.gender === 'chick' ? 'chicks' : chicken?.gender === 'female' ? 'mothers' : chicken?.gender === 'male' ? 'fathers' : 'chickens')}/${chicken?._id}/image` : null);
  const getFatherImg = () => chicken?.father?.image || (chicken?.father?._id ? `${import.meta.env.VITE_API_URL}/api/fathers/${chicken.father._id}/image` : null);
  const getMotherImg = () => chicken?.mother?.image || (chicken?.mother?._id ? `${import.meta.env.VITE_API_URL}/api/mothers/${chicken.mother._id}/image` : null);
"""
    if "const getMainImg =" not in content:
        if "export const CertificateDocument =" in content:
            content = content.replace("export const CertificateDocument = React.forwardRef<HTMLDivElement, CertificateProps>(({ chicken, template }, ref) => {\n", "export const CertificateDocument = React.forwardRef<HTMLDivElement, CertificateProps>(({ chicken, template }, ref) => {\n" + helpers)
        elif "export function CertificateModal" in content:
            content = content.replace("export function CertificateModal({ isOpen, onClose, chicken }: CertificateModalProps) {\n", "export function CertificateModal({ isOpen, onClose, chicken }: CertificateModalProps) {\n" + helpers)

    # Replace usages
    content = content.replace("getImageUrl(chicken)", "getMainImg()")
    content = content.replace("getImageUrl(chicken.father)", "getFatherImg()")
    content = content.replace("getImageUrl(chicken.mother)", "getMotherImg()")

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

fix_file('frontend/src/components/pedigree/CertificateDocument.tsx')
fix_file('frontend/src/components/pedigree/CertificateModal.tsx')
