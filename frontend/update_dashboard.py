import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    old_fetch_logic = """      const [chickensRes, fathersRes, mothersRes, batchesRes, chicksRes, userRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/chickens`, { headers }).catch(() => null),
        fetch(`${import.meta.env.VITE_API_URL}/api/fathers`, { headers }).catch(() => null),
        fetch(`${import.meta.env.VITE_API_URL}/api/mothers`, { headers }).catch(() => null),
        fetch(`${import.meta.env.VITE_API_URL}/api/breeding-batches`, { headers }).catch(() => null),
        fetch(`${import.meta.env.VITE_API_URL}/api/chicks`, { headers }).catch(() => null),
        fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, { headers }).catch(() => null)
      ]);

      if (userRes && userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.data);
        try {
          sessionStorage.setItem('dashboard_user', JSON.stringify(userData.data));
        } catch (e) {
          console.warn('Could not save user to sessionStorage (likely quota exceeded by base64 images).');
        }
      }

      let cCount = 0;
      if (chickensRes && chickensRes.ok) {
        const data = await chickensRes.json();
        cCount = (data.data || data.chickens || []).length;
      }

      let fCount = 0;
      if (fathersRes && fathersRes.ok) {
        const data = await fathersRes.json();
        fCount = Array.isArray(data) ? data.length : 0;
      }

      let mCount = 0;
      if (mothersRes && mothersRes.ok) {
        const data = await mothersRes.json();
        mCount = Array.isArray(data) ? data.length : 0;
      }

      let bCount = 0;
      if (batchesRes && batchesRes.ok) {
        const data = await batchesRes.json();
        bCount = Array.isArray(data) ? data.length : 0;
      }

      let chCount = 0;
      if (chicksRes && chicksRes.ok) {
        const data = await chicksRes.json();
        chCount = Array.isArray(data) ? data.length : 0;
      }"""

    new_fetch_logic = """      const [countsRes, userRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/counts`, { headers }).catch(() => null),
        fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, { headers }).catch(() => null)
      ]);

      if (userRes && userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.data);
        try {
          sessionStorage.setItem('dashboard_user', JSON.stringify(userData.data));
        } catch (e) {
          console.warn('Could not save user to sessionStorage.');
        }
      }

      let cCount = 0, fCount = 0, mCount = 0, bCount = 0, chCount = 0;
      
      if (countsRes && countsRes.ok) {
        const data = await countsRes.json();
        if (data.success && data.data) {
          cCount = data.data.chickens || 0;
          fCount = data.data.fathers || 0;
          mCount = data.data.mothers || 0;
          bCount = data.data.batches || 0;
          chCount = data.data.chicks || 0;
        }
      }"""

    content = content.replace(old_fetch_logic, new_fetch_logic)

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/components/Dashboard.tsx')
