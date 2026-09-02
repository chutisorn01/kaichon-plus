import re

files = [
    'src/routes/chicken.routes.ts',
    'src/routes/chick.routes.ts',
    'src/routes/father.routes.ts',
    'src/routes/mother.routes.ts'
]

for file_path in files:
    try:
        with open(file_path, 'r') as f:
            content = f.read()
            
        content = content.replace("} , getChickenImage } from", "  getChickenImage,\n} from")
        
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"Fixed {file_path}")
    except Exception as e:
        print(f"Error {file_path}: {e}")

