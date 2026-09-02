import re

file_path = 'src/controllers/chicken.controller.ts'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update getAllChickens to exclude image
content = content.replace(
    "chickens = await Chicken.find({ _id: { $in: paginatedChickenIds } })",
    "chickens = await Chicken.find({ _id: { $in: paginatedChickenIds } }).select('-image')"
)
content = content.replace(
    "chicks = await Chick.find({ _id: { $in: paginatedChickIds } })",
    "chicks = await Chick.find({ _id: { $in: paginatedChickIds } }).select('-image')"
)

# 2. Append new image streaming endpoints at the end of the file
image_endpoints = """
// --- Image Streaming Endpoints ---

const streamImage = async (Model: any, id: string, res: Response) => {
  try {
    const doc = await Model.findById(id).select('image').lean();
    if (!doc || !doc.image) {
      return res.status(404).send('Image not found');
    }

    const match = doc.image.match(/^data:([A-Za-z-+\\/]+);base64,(.+)$/);
    if (!match) {
      return res.status(404).send('Invalid image format');
    }

    const buffer = Buffer.from(match[2], 'base64');
    res.setHeader('Content-Type', match[1]);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    return res.end(buffer);
  } catch (error) {
    console.error('Error streaming image:', error);
    return res.status(500).send('Server Error');
  }
};

export const getChickenImage = async (req: Request, res: Response) => {
  return streamImage(Chicken, req.params.id, res);
};

export const getChickImage = async (req: Request, res: Response) => {
  return streamImage(Chick, req.params.id, res);
};

export const getFatherImage = async (req: Request, res: Response) => {
  return streamImage(Father, req.params.id, res);
};

export const getMotherImage = async (req: Request, res: Response) => {
  return streamImage(Mother, req.params.id, res);
};
"""

if "const streamImage =" not in content:
    content += "\n" + image_endpoints

with open(file_path, 'w') as f:
    f.write(content)
print(f"Updated {file_path}")
