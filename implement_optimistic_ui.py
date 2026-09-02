import re

def update_chicken_list(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Find the onClick for chicken cards
    content = content.replace(
        "onClick={() => onNavigate('chicken-detail', chicken._id)}",
        "onClick={() => {\n                  try { sessionStorage.setItem(`cached_chicken_${chicken._id}`, JSON.stringify(chicken)); } catch (e) {}\n                  onNavigate('chicken-detail', chicken._id);\n                }}"
    )

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

def update_chicken_detail(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Change initial state
    content = content.replace(
        "const [chick, setChick] = useState<any>(null);",
        """const [chick, setChick] = useState<any>(() => {
    try {
      const cached = sessionStorage.getItem(`cached_chicken_${chickenId}`);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  });"""
    )
    
    # Change initial loading state
    content = content.replace(
        "const [loading, setLoading] = useState(true);",
        """const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(`cached_chicken_${chickenId}`);
    } catch (e) { return true; }
  });"""
    )

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_chicken_list('frontend/src/components/chickens/ChickenList.tsx')
update_chicken_detail('frontend/src/components/pedigree/ChickenDetail.tsx')
