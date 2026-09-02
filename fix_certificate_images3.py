import re

def insert_helpers(file_path, find_str):
    with open(file_path, 'r') as f:
        content = f.read()

    helpers = """
  const getMainImg = () => chicken?.image || (chicken?._id ? `${import.meta.env.VITE_API_URL}/api/${chicken?._sourceCollection || (chicken?.gender === 'chick' ? 'chicks' : chicken?.gender === 'female' ? 'mothers' : chicken?.gender === 'male' ? 'fathers' : 'chickens')}/${chicken?._id}/image` : null);
  const getFatherImg = () => chicken?.father?.image || (chicken?.father?._id ? `${import.meta.env.VITE_API_URL}/api/fathers/${chicken.father._id}/image` : null);
  const getMotherImg = () => chicken?.mother?.image || (chicken?.mother?._id ? `${import.meta.env.VITE_API_URL}/api/mothers/${chicken.mother._id}/image` : null);
"""
    if "const getMainImg =" not in content:
        content = content.replace(find_str, find_str + helpers)
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"Updated {file_path}")

insert_helpers('frontend/src/components/pedigree/CertificateDocument.tsx', "export const CertificateDocument = React.forwardRef<HTMLDivElement, CertificateDocumentProps>(({ chicken, scale = 1 }, ref) => {\n")
insert_helpers('frontend/src/components/pedigree/CertificateModal.tsx', "export default function CertificateModal({ chicken, onClose }: CertificateModalProps) {\n")
