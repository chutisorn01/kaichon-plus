import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Add b64toBlob function
    b64_func = """
const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data.split(',')[1]);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: contentType });
};
"""
    # Insert it right before getCertificateImage
    content = content.replace(" const getCertificateImage = async () => {", b64_func + "\n const getCertificateImage = async () => {")

    # Replace fetch(image) with b64toBlob
    old_fetch_blob = """ const res = await fetch(image);
 const blob = await res.blob();"""
    new_fetch_blob = """ const blob = b64toBlob(image, 'image/jpeg');"""
    content = content.replace(old_fetch_blob, new_fetch_blob)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/pedigree/CertificateModal.tsx')
