import re

def fix_route(file_path, func_name):
    with open(file_path, 'r') as f:
        content = f.read()

    route_str = f"router.get('/:id/image', {func_name});\n"
    if route_str not in content:
        content = content.replace("router.use(protect);", route_str + "router.use(protect);")
        
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"Updated {file_path}")

fix_route('backend/src/routes/father.routes.ts', 'getFatherImage')
fix_route('backend/src/routes/mother.routes.ts', 'getMotherImage')
