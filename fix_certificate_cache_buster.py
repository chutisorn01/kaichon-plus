import re

def fix_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # We need to replace the image URLs to include ?t=...
    content = content.replace(
        "`${import.meta.env.VITE_API_URL}/api/${chicken?._sourceCollection || (chicken?.gender === 'chick' ? 'chicks' : chicken?.gender === 'female' ? 'mothers' : chicken?.gender === 'male' ? 'fathers' : 'chickens')}/${chicken?._id}/image`",
        "`${import.meta.env.VITE_API_URL}/api/${chicken?._sourceCollection || (chicken?.gender === 'chick' ? 'chicks' : chicken?.gender === 'female' ? 'mothers' : chicken?.gender === 'male' ? 'fathers' : 'chickens')}/${chicken?._id}/image?t=${chicken?.updatedAt ? new Date(chicken.updatedAt).getTime() : ''}`"
    )
    
    content = content.replace(
        "`${import.meta.env.VITE_API_URL}/api/fathers/${chicken.father._id}/image`",
        "`${import.meta.env.VITE_API_URL}/api/fathers/${chicken.father._id}/image?t=${chicken?.father?.updatedAt ? new Date(chicken.father.updatedAt).getTime() : ''}`"
    )
    
    content = content.replace(
        "`${import.meta.env.VITE_API_URL}/api/mothers/${chicken.mother._id}/image`",
        "`${import.meta.env.VITE_API_URL}/api/mothers/${chicken.mother._id}/image?t=${chicken?.mother?.updatedAt ? new Date(chicken.mother.updatedAt).getTime() : ''}`"
    )

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

fix_file('frontend/src/components/pedigree/CertificateDocument.tsx')
fix_file('frontend/src/components/pedigree/CertificateModal.tsx')
