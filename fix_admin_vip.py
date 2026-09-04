import re

file_path = 'frontend/src/components/AdminVipStuds.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update imports
if "import { useState, useEffect } from 'react';" not in content:
    content = content.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';")

# 2. Add state and fetchPromoted
state_code = """  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activePromoted, setActivePromoted] = useState<any[]>([]);
  const [isLoadingPromoted, setIsLoadingPromoted] = useState(true);

  const fetchPromoted = async () => {
    setIsLoadingPromoted(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fathers/promoted`);
      const data = await res.json();
      if (data.status === 'success' || data.success) {
        setActivePromoted(data.data || []);
      } else if (Array.isArray(data)) {
        setActivePromoted(data);
      }
    } catch (err) {
      console.error('Error fetching promoted fathers', err);
    } finally {
      setIsLoadingPromoted(false);
    }
  };

  useEffect(() => {
    fetchPromoted();
  }, []);"""

if "fetchPromoted = async" not in content:
    content = content.replace("  const [processingId, setProcessingId] = useState<string | null>(null);", state_code)

# 3. Add fetchPromoted calls to handlePromote and handleRemovePromotion
if "fetchPromoted();" not in content:
    content = content.replace("setSearchResults(searchResults.map(c => c._id === id ? { ...c, isPromoted: true, promotionTier: tier } : c));\n      }", "setSearchResults(searchResults.map(c => c._id === id ? { ...c, isPromoted: true, promotionTier: tier } : c));\n        fetchPromoted();\n      }")
    content = content.replace("setSearchResults(searchResults.map(c => c._id === id ? { ...c, isPromoted: false, promotionTier: 'standard' } : c));\n      }", "setSearchResults(searchResults.map(c => c._id === id ? { ...c, isPromoted: false, promotionTier: 'standard' } : c));\n        fetchPromoted();\n      }")

# 4. Extract Card component and Active section
card_regex = re.compile(r"<div className=\"space-y-4\">\s*\{searchResults\.map\(c => \(\s*<div key=\{c\._id\}(.*?)</button>\s*</>\s*\)\}\s*</div>\s*</div>\s*\)\)\}\s*</div>", re.DOTALL)
match = card_regex.search(content)
if match and "พ่อไก่ที่กำลังโปรโมท" not in content:
    card_html = match.group(0)
    
    new_ui = f"""
      {{/* Active Promoted Section */}}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Crown className="text-amber-500 w-5 h-5" />
          พ่อไก่ที่กำลังโปรโมทอยู่ตอนนี้ (Active)
        </h3>
        
        {{isLoadingPromoted ? (
          <div className="text-center text-slate-500 py-8">กำลังโหลดข้อมูล...</div>
        ) : activePromoted.length === 0 ? (
          <div className="text-center text-slate-500 py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">ไม่มีไก่ที่ถูกโปรโมทอยู่ในขณะนี้</div>
        ) : (
          <div className="space-y-4">
            {{activePromoted.map(c => (
              <div key={{c._id}} className={{`bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row gap-4 items-center justify-between`}}>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0">
                    {{c.image ? <img src={{c.image}} alt={{c.name}} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Img</div>}}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-lg text-slate-900 dark:text-white">{{c.name}}</h4>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono">{{c.code}}</span>
                      <span className={{`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${{c.promotionTier === 'vip' ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-red-100 text-red-700 border border-red-300'}}`}}>
                        {{c.promotionTier === 'vip' ? <Crown className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}}
                        {{c.promotionTier === 'vip' ? 'แชมป์เงินล้าน' : 'การ์ดแนะนำ'}}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      เจ้าของ: {{c.user?.farmName || c.user?.name || 'ไม่ทราบ'}}
                      {{c.user?.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 inline" />}}
                    </p>
                    {{c.promotionExpiresAt && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-1 font-medium">
                        หมดอายุ: {{new Date(c.promotionExpiresAt).toLocaleDateString('th-TH')}} {{new Date(c.promotionExpiresAt).toLocaleTimeString('th-TH')}}
                      </p>
                    )}}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                  <button 
                    onClick={{() => handleRemovePromotion(c._id)}}
                    disabled={{processingId === c._id}}
                    className="px-4 py-2 bg-white dark:bg-slate-900 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 w-full sm:w-auto"
                  >
                    ลบ (ยกเลิกโปรโมท)
                  </button>
                  <button 
                    onClick={{() => handlePromote(c._id, c.promotionTier || 'vip', 30)}}
                    disabled={{processingId === c._id}}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer border border-transparent w-full sm:w-auto"
                  >
                    ต่ออายุ (30วัน)
                  </button>
                </div>
              </div>
            ))}}
          </div>
        )}}
      </div>

{card_html}"""
    
    content = content.replace(card_html, new_ui)

with open(file_path, 'w') as f:
    f.write(content)
print("Updated successfully")
