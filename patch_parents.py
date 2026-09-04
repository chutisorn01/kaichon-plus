import re

def patch_file(file_path, type_name):
    with open(file_path, 'r') as f:
        content = f.read()

    # 1. Update handleOpenEdit
    old_handle = f"  const handleOpenEdit = ({type_name}: any) => {{"
    
    if type_name == 'father':
        new_handle = """  const handleOpenEdit = async (father: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fathers/${father._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const fullFather = await res.json();
      setEditingId(fullFather._id);
      setFormData({
        code: fullFather.code || '',
        name: fullFather.name || '',
        breed: fullFather.breed || '',
        color: fullFather.color || '',
        bandNumber: fullFather.bandNumber || '',
        bandColor: fullFather.bandColor || 'ทอง',
        bandText: fullFather.bandText || '',
        price: fullFather.price || '',
        records: fullFather.records || '',
        hatchDate: fullFather.hatchDate || '',
        status: fullFather.status || 'ปกติ',
        image: fullFather.image || ''
      });
      setShowAddForm(true);
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };
  
  // Prevent duplicate definition below by stripping the old function body
"""
        # We need to replace the entire old handleOpenEdit block
        # We'll use a regex to match from old_handle up to setShowAddForm(true); };
        pattern = r"  const handleOpenEdit = \(father: any\) => \{[\s\S]*?setShowAddForm\(true\);\s*\};"
        content = re.sub(pattern, new_handle, content)
        
        # 2. Update Image rendering in card
        old_img = """                    <img src={father.image} alt={father.name} className="w-full h-full object-cover" />"""
        new_img = """                    {father.image ? (
                      <img src={father.image} alt={father.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <Bird className="w-8 h-8 text-slate-500 opacity-50" />
                      </div>
                    )}"""
        # Wait, if father doesn't have image returned from API, father.image will be undefined.
        # But wait, Bird is not imported! I need to ensure Bird is imported, or just use an existing icon.
        # Let's check imports in FatherRegistry.tsx
        pass
        
    elif type_name == 'mother':
        new_handle = """  const handleOpenEdit = async (mother: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mothers/${mother._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const fullMother = await res.json();
      setEditingId(fullMother._id);
      setFormData({
        code: fullMother.code || '',
        name: fullMother.name || '',
        breed: fullMother.breed || '',
        color: fullMother.color || '',
        bandNumber: fullMother.bandNumber || '',
        bandColor: fullMother.bandColor || 'ทอง',
        bandText: fullMother.bandText || '',
        notes: fullMother.notes || '',
        status: fullMother.status || 'ปกติ',
        image: fullMother.image || ''
      });
      setShowAddForm(true);
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };
"""
        pattern = r"  const handleOpenEdit = \(mother: any\) => \{[\s\S]*?setShowAddForm\(true\);\s*\};"
        content = re.sub(pattern, new_handle, content)

    with open(file_path, 'w') as f:
        f.write(content)

patch_file('frontend/src/components/pedigree/FatherRegistry.tsx', 'father')
patch_file('frontend/src/components/pedigree/MotherRegistry.tsx', 'mother')
print("Patched handleOpenEdit")
