file_path = 'backend/src/index.ts'
with open(file_path, 'r') as f:
    content = f.read()

old_str = "const app = express();\nconst PORT = process.env.PORT || 5001;"
new_str = "const app = express();\napp.set('trust proxy', 1); // Trust first proxy (Cloudflare/Nginx)\nconst PORT = process.env.PORT || 5001;"

if old_str in content:
    content = content.replace(old_str, new_str)
    with open(file_path, 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Code not found")
