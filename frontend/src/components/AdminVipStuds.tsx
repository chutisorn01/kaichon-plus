import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { Search, Crown, CheckCircle2, BadgeCheck } from 'lucide-react';

export default function AdminVipStuds() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`http://localhost:5001/api/chickens?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (res.ok) {
        // Handle both direct array and object with data array
        const list = Array.isArray(data) 
          ? data 
          : (Array.isArray(data.data) ? data.data : (Array.isArray(data.chickens) ? data.chickens : []));
        // Filter only fathers (assuming gender checking or just list them all since any chicken could be promoted)
        setSearchResults(list);
      }
    } catch (err) {
      alert('Error searching chickens');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePromote = async (id: string, tier: 'vip' | 'standard', durationDays: number) => {
    if (!window.confirm(`ยืนยันการตั้งค่าไก่เป็นระดับ ${tier.toUpperCase()} เป็นเวลา ${durationDays} วัน?`)) return;
    
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/admin/fathers/${id}/promote`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isPromoted: true,
          promotionTier: tier,
          durationDays
        })
      });
      
      if (res.ok) {
        alert('อัปเดตสถานะสำเร็จ!');
        // Update local state to reflect change visually
        setSearchResults(searchResults.map(c => c._id === id ? { ...c, isPromoted: true, promotionTier: tier } : c));
      } else {
        alert('Error updating status');
      }
    } catch (err) {
      alert('Error updating status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemovePromotion = async (id: string) => {
    if (!window.confirm('ยืนยันการยกเลิกโปรโมทไก่ตัวนี้?')) return;
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/admin/fathers/${id}/promote`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isPromoted: false,
          promotionTier: 'standard',
          durationDays: 0 // Will expire or we can just let isPromoted=false hide it
        })
      });
      
      if (res.ok) {
        alert('ยกเลิกโปรโมทสำเร็จ!');
        setSearchResults(searchResults.map(c => c._id === id ? { ...c, isPromoted: false, promotionTier: 'standard' } : c));
      }
    } catch (err) {
      alert('Error removing promotion');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <Crown className="text-amber-500 w-6 h-6" /> 
          ระบบอัปเกรดพ่อพันธุ์ (VIP Manual Override)
        </h2>
        <p className="text-sm text-slate-500 mb-6">ค้นหาไก่จากรหัสกิ๊ฟปีก ชื่อ หรือฟาร์ม แล้วตั้งค่าเป็น VIP ทันทีที่รับยอดเงินโอน</p>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-medium"
              placeholder="ค้นหาชื่อไก่ชน, กิ๊ฟปีก, หรือรหัส..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" disabled={isSearching} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold shadow-md cursor-pointer disabled:opacity-50">
            {isSearching ? 'กำลังค้นหา...' : 'ค้นหาไก่ชน'}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {searchResults.map(c => (
          <div key={c._id} className={`bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border ${c.promotionTier === 'vip' ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-200 dark:border-slate-800'} flex flex-col sm:flex-row gap-4 items-center justify-between`}>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0">
                {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Img</div>}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-lg text-slate-900 dark:text-white">{c.name}</h4>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-mono">{c.code}</span>
                  {c.isPromoted && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${c.promotionTier === 'vip' ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                      {c.promotionTier === 'vip' ? <Crown className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {c.promotionTier === 'vip' ? 'แชมป์เงินล้าน' : 'การ์ดแนะนำ'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  เจ้าของ: {c.user?.farmName || c.user?.name || 'ไม่ทราบ'}
                  {c.user?.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 inline" />}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-4 sm:mt-0">
              {c.isPromoted ? (
                <button 
                  onClick={() => handleRemovePromotion(c._id)}
                  disabled={processingId === c._id}
                  className="px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold rounded-xl transition-colors cursor-pointer w-full sm:w-auto"
                >
                  ยกเลิกโปรโมท
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => handlePromote(c._id, 'standard', 30)}
                    disabled={processingId === c._id}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl border border-red-200 transition-colors cursor-pointer flex-1 sm:flex-none text-center"
                  >
                    + Standard (30วัน)
                  </button>
                  <button 
                    onClick={() => handlePromote(c._id, 'vip', 30)}
                    disabled={processingId === c._id}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-1"
                  >
                    <Crown className="w-3.5 h-3.5" /> + VIP (30วัน)
                  </button>
                </>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
