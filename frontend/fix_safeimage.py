import re

def fix_safeimage(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Extract crossOrigin to prevent it from going into ...props
    content = content.replace(
        "export const SafeImage: React.FC<SafeImageProps> = ({ src, className, alt, ...props }) => {",
        "export const SafeImage: React.FC<SafeImageProps> = ({ src, className, alt, crossOrigin, ...props }) => {"
    )

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

fix_safeimage('src/components/ui/SafeImage.tsx')
