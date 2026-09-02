import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Add import
    import_statement = "import dashboardRoutes from './routes/dashboard.routes.js';\n"
    if "import dashboardRoutes" not in content:
        content = content.replace("import authRoutes from './routes/auth.routes.js';", import_statement + "import authRoutes from './routes/auth.routes.js';")

    # Add route use
    use_statement = "app.use('/api/dashboard', dashboardRoutes);\n"
    if "app.use('/api/dashboard'" not in content:
        content = content.replace("app.use('/api/auth', authRoutes);", "app.use('/api/auth', authRoutes);\n" + use_statement)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/index.ts')
