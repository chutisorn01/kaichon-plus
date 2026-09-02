import re

def update_route(file_path, import_name, route_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Add import if missing
    if import_name not in content:
        # Assuming we need to import it from '../controllers/chicken.controller.js'
        if "from '../controllers/chicken.controller.js'" in content:
            content = content.replace("from '../controllers/chicken.controller.js';", f", {import_name} }} from '../controllers/chicken.controller.js';")
        else:
            # Maybe it doesn't exist, just add at top
            content = f"import {{ {import_name} }} from '../controllers/chicken.controller.js';\n" + content
    
    # Add route before the main CRUD operations (so /:id/image doesn't conflict)
    # The routes usually look like router.get('/:id', ...
    route_str = f"router.get('/:id/image', {import_name});\n"
    if route_str not in content:
        content = content.replace("router.get('/:id',", route_str + "router.get('/:id',")
    
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_route('src/routes/chicken.routes.ts', 'getChickenImage', '/:id/image')
# Wait, for chicks/fathers/mothers, the get*Image is in chicken.controller.js
# But chick.routes.ts might not import from chicken.controller.js
def update_other_route(file_path, import_name):
    with open(file_path, 'r') as f:
        content = f.read()
    
    if import_name not in content:
        content = f"import {{ {import_name} }} from '../controllers/chicken.controller.js';\n" + content
        
    route_str = f"router.get('/:id/image', {import_name});\n"
    if route_str not in content:
        # insert it right before router.get('/:id'
        content = content.replace("router.get('/:id',", route_str + "router.get('/:id',")
        
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_other_route('src/routes/chick.routes.ts', 'getChickImage')
update_other_route('src/routes/father.routes.ts', 'getFatherImage')
update_other_route('src/routes/mother.routes.ts', 'getMotherImage')

