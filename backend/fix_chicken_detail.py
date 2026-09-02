import re

# 1. Update backend controller to avoid fetching parent images
file_path = 'src/controllers/chicken.controller.ts'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace(
    ".populate('father', 'code name gender bloodline image')",
    ".populate('father', 'code name gender bloodline')"
)
content = content.replace(
    ".populate('mother', 'code name gender bloodline image')",
    ".populate('mother', 'code name gender bloodline')"
)
content = content.replace(
    ".populate('father', 'code name image bloodline breed')",
    ".populate('father', 'code name bloodline breed')"
)
content = content.replace(
    ".populate('mother', 'code name image bloodline breed')",
    ".populate('mother', 'code name bloodline breed')"
)

with open(file_path, 'w') as f:
    f.write(content)

# 2. Update frontend to remove siblings fetch
file_path_frontend = '../frontend/src/components/pedigree/ChickenDetail.tsx'
with open(file_path_frontend, 'r') as f:
    content_frontend = f.read()

# Remove the sibling fetch block entirely
sibling_fetch_block = """      if (data?.batch?._id || data?.batch) {
        const bId = data.batch._id || data.batch;
        const sibRes = await fetch(`${import.meta.env.VITE_API_URL}/api/chicks/${chickenId}/siblings?t=${Date.now()}`, { headers }).catch(() => null);
        if (sibRes && sibRes.ok) {
          setSiblings(await sibRes.json());
        }
      }"""

content_frontend = content_frontend.replace(sibling_fetch_block, "")

with open(file_path_frontend, 'w') as f:
    f.write(content_frontend)

print("Updated backend and frontend.")
