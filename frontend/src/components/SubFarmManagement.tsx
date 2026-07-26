import { useState } from 'react';
import { ChevronLeft, Building2, Users, ShieldCheck, Plus, CheckCircle2, Search, Award } from 'lucide-react';

export default function SubFarmManagement({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [subFarms] = useState([
    { id: '1', farmName: 'ส.เจริญฟาร์ม สาขา 1 (ชลบุรี)', ownerName: 'นายสมชาย', farmCode: 'SCJ-BR01', chickensCount: 24, status: 'active' },
    { id: '2', farmName: 'พยัคฆ์ฟาร์ม เครือข่ายอยุธยา', ownerName: 'นายชนะ', farmCode: 'PKF-AYU', chickensCount: 18, status: 'active' },
  ]);

  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 'c101', name: 'เจ้าเยียร์ทอง', code: 'SCJ-BR01-2026-G012', bandNumber: '012', subFarm: 'ส.เจริญฟาร์ม สาขา 1', bloodline: 'พม่า-ง่อน', date: '2026-06-28' },
    { id: 'c102', name: 'เจ้าเกรียงไกร', code: 'PKF-AYU-2026-G005', bandNumber: '005', subFarm: 'พยัคฆ์ฟาร์ม เครือข่ายอยุธยา', bloodline: 'ป่าก๋อย', date: '2026-06-29' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newFarm, setNewFarm] = useState({ farmName: '', ownerName: '', farmCode: '' });

  const handleApprove = (id: string) => {
    setPendingApprovals(pendingApprovals.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-20 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-4 py-4 flex items-center justify-between sticky top-0 z-30 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="p-2 -ml-2 text-slate-500 hover:text-red-600 transition-colors cursor-pointer">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              จัดการเครือข่ายลูกฟาร์ม <ShieldCheck className="w-5 h-5 text-blue-500" />
            </h1>
            <p className="text-xs text-slate-500">ระบบรับรองสายเลือดและบริหารซุ้มในเครือข่าย</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> เพิ่มลูกฟาร์ม
        </button>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-5xl mx-auto w-full space-y-6">
        {/* Network Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black">{subFarms.length} ซุ้ม</div>
              <div className="text-xs text-slate-500">ลูกฟาร์มในเครือข่าย</div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/50 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black">42 ตัว</div>
              <div className="text-xs text-slate-500">ยอดรวมไก่ในเครือ</div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/50 text-red-600 rounded-2xl flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-red-600">{pendingApprovals.length} รายการ</div>
              <div className="text-xs text-slate-500">รอฟาร์มแม่อนุมัติรับรอง 🔵</div>
            </div>
          </div>
        </div>

        {/* Pending Approvals Section */}
        {pendingApprovals.length > 0 && (
          <div className="bg-gradient-to-br from-blue-900/10 to-indigo-900/10 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/50 dark:border-blue-800/30 p-5 rounded-3xl">
            <h2 className="text-base font-bold mb-3 text-blue-900 dark:text-blue-200 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" /> คำขอรับรองสายเลือดไก่จากลูกฟาร์ม (Verified Approval)
            </h2>
            <div className="space-y-3">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-100 dark:border-white/5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm">{item.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full font-mono font-bold">{item.code}</span>
                    </div>
                    <div className="text-xs text-slate-500 space-x-2">
                      <span>สังกัด: <strong>{item.subFarm}</strong></span>
                      <span>• กิ๊ฟ #{item.bandNumber}</span>
                      <span>• {item.bloodline}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleApprove(item.id)}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" /> อนุมัติตรา Verified 🔵
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub-Farms List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500" /> รายชื่อลูกฟาร์มในเครือข่ายทั้งหมด
            </h2>
            <span className="text-xs text-slate-400">Total: {subFarms.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subFarms.map((farm) => (
              <div key={farm.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{farm.farmName}</h3>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold rounded-full">{farm.farmCode}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    เจ้าของ: {farm.ownerName} • จำนวนไก่ในซุ้ม: <strong className="text-slate-700 dark:text-slate-300">{farm.chickensCount} ตัว</strong>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 rounded-xl border border-blue-200/50 dark:border-blue-900/30">
                  อยู่ในเครือ 🟢
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">เพิ่มลูกฟาร์มเข้าร่วมเครือข่าย</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">ชื่อลูกฟาร์ม / ซุ้มไก่</label>
                <input 
                  type="text" 
                  placeholder="เช่น ส.เจริญฟาร์ม สาขา 2"
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                  value={newFarm.farmName}
                  onChange={(e) => setNewFarm({...newFarm, farmName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">ชื่อเจ้าของฟาร์ม</label>
                <input 
                  type="text" 
                  placeholder="เช่น นายปรีชา"
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                  value={newFarm.ownerName}
                  onChange={(e) => setNewFarm({...newFarm, ownerName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">รหัสตัวย่อสาขา (Sub-Farm Code)</label>
                <input 
                  type="text" 
                  placeholder="เช่น SCJ-BR02"
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none uppercase font-bold"
                  value={newFarm.farmCode}
                  onChange={(e) => setNewFarm({...newFarm, farmCode: e.target.value})}
                />
              </div>
              <button 
                onClick={() => { setShowAddModal(false); alert('เพิ่มลูกฟาร์มเข้าร่วมเครือข่ายสำเร็จ!'); }}
                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 cursor-pointer mt-2"
              >
                บันทึกเพิ่มลูกฟาร์ม
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
