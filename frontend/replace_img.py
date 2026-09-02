import re
import os

files_to_update = [
    'src/components/pedigree/CertificateDocument.tsx',
    'src/components/pedigree/CertificateModal.tsx',
    'src/components/vip/VipBreedingDashboard.tsx'
]

for filepath in files_to_update:
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r') as f:
        content = f.read()

    # Add import
    if "import { SafeImage }" not in content:
        # Find the first import and add it after
        content = content.replace("import React", "import { SafeImage } from '../ui/SafeImage';\nimport React")
        if "import { SafeImage }" not in content:
            content = "import { SafeImage } from '../ui/SafeImage';\n" + content
            # VipDashboard is in a different folder, fix import path
            if 'vip' in filepath:
                content = content.replace("from '../ui/SafeImage'", "from '../ui/SafeImage'")

    # Replace <img ... />
    content = content.replace("<img ", "<SafeImage ")

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Updated {filepath}")

