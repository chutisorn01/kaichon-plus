import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  Activity, 
  ShieldCheck, 
  Users, 
  Info,
  Award,
  Layers,
  Heart,
  Tag,
  RefreshCw,
  Sparkles,
  Wallet,
  Receipt,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Trash2
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { CustomSelect, FormatOptionLabel } from './ui/CustomSelect';

const getBandColorHex = (colorName: string) => {
  switch (colorName) {
    case 'ทอง': return '#f59e0b';
    case 'เงิน': return '#94a3b8';
    case 'แดง': return '#ef4444';
    case 'เหลือง': return '#eab308';
    case 'เขียว': return '#10b981';
    case 'น้ำเงิน': return '#3b82f6';
    case 'ส้ม': return '#f97316';
    case 'ขาว': return '#64748b';
    case 'ฟ้า': return '#06b6d4';
    case 'ม่วง': return '#8b5cf6';
    case 'ชมพู': return '#ec4899';
    default: return '#64748b';
  }
};

export default function FarmStatistics({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'breeders' | 'bands' | 'finance'>(() => {
    return (sessionStorage.getItem('FarmStatistics_activeTab') as any) || 'overview';
  });

  const [showBulkSaleForm, setShowBulkSaleForm] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [bulkSaleData, setBulkSaleData] = useState({
    batchId: '',
    customerName: '',
    customerFarm: '',
    customerPhone: '',
    saleDate: new Date().toISOString().split('T')[0],
    totalPrice: '',
    notes: ''
  });
  const [chicksInBatch, setChicksInBatch] = useState(0);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ date: new Date().toISOString().split('T')[0], category: 'อาหาร', amount: '', note: '' });
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');
      return;
    }
    setIsSubmittingExpense(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenseForm)
      });
      if (res.ok) {
        setShowExpenseModal(false);
        setExpenseForm({ date: new Date().toISOString().split('T')[0], category: 'อาหาร', amount: '', note: '' });
        fetchStatistics();
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกรายจ่าย');
      }
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการบันทึกรายจ่าย');
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('ยืนยันการลบรายจ่ายนี้?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchStatistics();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenBulkSale = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/breeding-batches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const batchData = await res.json();
        // Filter out archived batches
        setBatches(batchData.filter((b: any) => !b.isArchived));
      }
      setShowBulkSaleForm(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchSelect = async (batchId: string) => {
    setBulkSaleData({ ...bulkSaleData, batchId });
    if (!batchId) {
      setChicksInBatch(0);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/breeding-batches/${batchId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        const availableChicks = json.chicks?.filter((c: any) => c.status === 'ปกติ') || [];
        setChicksInBatch(availableChicks.length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkSaleData.batchId || chicksInBatch === 0) {
      alert('กรุณาเลือกคอกที่มีลูกไก่สถานะปกติอยู่');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chicks/bulk-sale`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(bulkSaleData)
      });
      if (res.ok) {
        alert('บันทึกขายลูกไก่แบบเหมาคอกเรียบร้อยแล้ว!');
        setShowBulkSaleForm(false);
        setBulkSaleData({
          batchId: '',
          customerName: '',
          customerFarm: '',
          customerPhone: '',
          saleDate: new Date().toISOString().split('T')[0],
          totalPrice: '',
          notes: ''
        });
        fetchStatistics();
      } else {
        const data = await res.json();
        alert(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  useEffect(() => {
    sessionStorage.setItem('FarmStatistics_activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/statistics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-500 text-sm">กำลังประมวลผลสถิติฟาร์มอัจฉริยะ...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <button onClick={() => onNavigate('dashboard')} className="absolute top-6 left-6 p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-600 dark:text-slate-300">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <Activity className="w-16 h-16 text-slate-300 mb-4 animate-pulse" />
        <h2 className="text-xl font-bold dark:text-white">ไม่พบข้อมูลสถิติ</h2>
        <p className="text-sm text-slate-500 mt-2">โปรดเพิ่มข้อมูลประชากรไก่ในระบบเพื่อดูการวิเคราะห์</p>
      </div>
    );
  }

  // Population Pie Chart Data
  const popData = [
    { name: 'พ่อพันธุ์', value: stats.population.fathers, color: '#3b82f6' },
    { name: 'แม่พันธุ์', value: stats.population.mothers, color: '#ec4899' },
    { name: 'ลูกไก่', value: stats.population.chicks.total, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // Chick Gender Pie Chart Data
  const genderData = [
    { name: 'ตัวผู้ (ผู้)', value: stats.population.chicks.male, color: '#3b82f6' },
    { name: 'ตัวเมีย (เมีย)', value: stats.population.chicks.female, color: '#ec4899' },
    { name: 'ยังไม่ระบุ', value: stats.population.chicks.unknown, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  // Band Color Data for Chart
  const bandChartData = (stats.bandColorStats || []).map((b: any) => ({
    name: b.color || 'ไม่ระบุ',
    value: b.count,
    fill: getBandColorHex(b.color)
  }));

  const totalBandChicks = bandChartData.reduce((acc: number, curr: any) => acc + curr.value, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 transition-colors font-sans">
      {/* Top Bar Header */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-200 dark:border-white/10 shadow-xs">
        <div className="max-w-6xl mx-auto w-full px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button 
              onClick={() => onNavigate('dashboard')} 
              className="p-2 -ml-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2 truncate">
                <BarChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                สถิติฟาร์มอัจฉริยะ 📊
              </h1>
              <p className="text-[11px] text-slate-400 font-medium truncate">วิเคราะห์สัดส่วนประชากร ผลผลิต และสายเลือดไก่ชนในฟาร์ม</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleOpenBulkSale}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span className="hidden sm:inline">💰 บันทึกขายเหมาคอก</span>
              <span className="sm:hidden">💰 ขายเหมา</span>
            </button>
            <button 
              onClick={fetchStatistics}
              className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0 active:scale-95"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full p-4 space-y-6">
        
        {/* KPI Summary Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div 
            onClick={() => onNavigate('father-registry')}
            className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-4 sm:p-5 text-white shadow-lg shadow-blue-600/20 relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all border border-blue-500/30"
          >
            <ShieldCheck className="w-16 h-16 absolute -bottom-3 -right-3 opacity-20" />
            <p className="text-[10px] sm:text-xs font-bold opacity-80 uppercase tracking-wider mb-1">พ่อพันธุ์หลัก</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black">{stats.population.fathers}</span>
              <span className="text-xs font-bold opacity-90">ตัว</span>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('mother-registry')}
            className="bg-gradient-to-br from-pink-600 to-rose-600 rounded-3xl p-4 sm:p-5 text-white shadow-lg shadow-pink-600/20 relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all border border-pink-500/30"
          >
            <Heart className="w-16 h-16 absolute -bottom-3 -right-3 opacity-20" />
            <p className="text-[10px] sm:text-xs font-bold opacity-80 uppercase tracking-wider mb-1">แม่พันธุ์หลัก</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black">{stats.population.mothers}</span>
              <span className="text-xs font-bold opacity-90">ตัว</span>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('chick-registry')}
            className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-4 sm:p-5 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all border border-amber-400/30"
          >
            <Users className="w-16 h-16 absolute -bottom-3 -right-3 opacity-20" />
            <p className="text-[10px] sm:text-xs font-bold opacity-80 uppercase tracking-wider mb-1">ลูกไก่ทั้งหมด</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black">{stats.population.chicks.total}</span>
              <span className="text-xs font-bold opacity-90">ตัว</span>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('breeding-batch')}
            className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-4 sm:p-5 text-white shadow-lg shadow-emerald-600/20 relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all border border-emerald-500/30"
          >
            <Layers className="w-16 h-16 absolute -bottom-3 -right-3 opacity-20" />
            <p className="text-[10px] sm:text-xs font-bold opacity-80 uppercase tracking-wider mb-1">คอกผสมทั้งหมด</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black">{stats.totalBatches || 0}</span>
              <span className="text-xs font-bold opacity-90">คอก</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-4 sm:p-5 text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden col-span-2 sm:col-span-1 border border-indigo-500/30">
            <Sparkles className="w-16 h-16 absolute -bottom-3 -right-3 opacity-20" />
            <p className="text-[10px] sm:text-xs font-bold opacity-80 uppercase tracking-wider mb-1">เฉลี่ยลูก/คอก</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black">{stats.avgChicksPerBatch || 0}</span>
              <span className="text-xs font-bold opacity-90">ตัว/คอก</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto flex-nowrap snap-x bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs gap-1.5 hide-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-none snap-start px-4 sm:flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" /> ภาพรวมประชากร & คอกผสม
          </button>
          <button
            onClick={() => setActiveTab('breeders')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'breeders'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> อันดับพ่อพันธุ์ & แม่พันธุ์
          </button>
          <button
            onClick={() => setActiveTab('bands')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'bands'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> สัดส่วนสีกิ๊ฟปีก
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'finance'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" /> การเงิน & การขาย
          </button>
        </div>

        {/* Tab 1: Overview Charts */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Population Donut Chart */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <PieChartIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black">สัดส่วนประชากรไก่ชน</h2>
                    <p className="text-[10px] text-slate-400">จำแนกตามโครงสร้าง พ่อ / แม่ / ลูกไก่</p>
                  </div>
                </div>
                <div className="h-64">
                  {popData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={popData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={6}
                          dataKey="value"
                        >
                          {popData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                          itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">ยังไม่มีข้อมูลไก่</div>
                  )}
                </div>
              </div>

              {/* Chick Gender Distribution Chart */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black">สัดส่วนเพศลูกไก่</h2>
                    <p className="text-[10px] text-slate-400">จำแนกตามเพศ ผู้ / เมีย / ยังไม่ระบุ</p>
                  </div>
                </div>
                <div className="h-64">
                  {genderData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={6}
                          dataKey="value"
                        >
                          {genderData.map((entry, index) => (
                            <Cell key={`cell-gender-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                          itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">ยังไม่มีข้อมูลลูกไก่</div>
                  )}
                </div>
              </div>

            </div>

            {/* Monthly Breeding Batches Line Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black">ปริมาณคอกผสมพันธุ์รายเดือน (ปีนี้)</h2>
                    <p className="text-[10px] text-slate-400">สถิติจำนวนคอกผสมที่ลงบันทึกในแต่ละเดือน</p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                  {new Date().getFullYear()}
                </span>
              </div>
              
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyBatches} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.4} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#64748b' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="batches" 
                      name="จำนวนคอกผสม (คอก)"
                      stroke="#10b981" 
                      strokeWidth={4}
                      dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Breeders Leaderboards */}
        {activeTab === 'breeders' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top Fathers Bar Chart & Leaderboard */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black">♂ อันดับพ่อพันธุ์จ่ายลูกดกสูงสุด</h2>
                  <p className="text-[10px] text-slate-400">วัดจากจำนวนลูกไก่ในฝูง</p>
                </div>
              </div>

              {stats.topFathers?.length > 0 ? (
                <div className="space-y-3">
                  {stats.topFathers.map((father: any, index: number) => (
                    <div 
                      key={father._id || index}
                      onClick={() => onNavigate('chicken-detail', father._id)}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between group hover:border-purple-300 dark:hover:border-purple-800 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          index === 0 ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/30' :
                          index === 1 ? 'bg-slate-300 text-slate-900' :
                          index === 2 ? 'bg-amber-700 text-white' :
                          'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          #{index + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-purple-600 transition-colors">
                            <FormatOptionLabel label={father.name} />
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 font-bold">
                            {father.code || '-'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-purple-600 dark:text-purple-400">{father.chickCount}</span>
                        <span className="text-[10px] font-bold text-slate-400 ml-1">ตัว</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs font-bold gap-2">
                  <Info className="w-8 h-8 opacity-40" />
                  ยังไม่มีข้อมูลลูกไก่ที่ผูกกับพ่อพันธุ์
                </div>
              )}
            </div>

            {/* Top Mothers Bar Chart & Leaderboard */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black">♀ อันดับแม่พันธุ์ให้ลูกดกสูงสุด</h2>
                  <p className="text-[10px] text-slate-400">วัดจากจำนวนลูกไก่ในฝูง</p>
                </div>
              </div>

              {stats.topMothers?.length > 0 ? (
                <div className="space-y-3">
                  {stats.topMothers.map((mother: any, index: number) => (
                    <div 
                      key={mother._id || index}
                      onClick={() => onNavigate('chicken-detail', mother._id)}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between group hover:border-pink-300 dark:hover:border-pink-800 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          index === 0 ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/30' :
                          index === 1 ? 'bg-slate-300 text-slate-900' :
                          index === 2 ? 'bg-amber-700 text-white' :
                          'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          #{index + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-pink-600 transition-colors">
                            <FormatOptionLabel label={mother.name} />
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 font-bold">
                            {mother.code || '-'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-pink-600 dark:text-pink-400">{mother.chickCount}</span>
                        <span className="text-[10px] font-bold text-slate-400 ml-1">ตัว</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs font-bold gap-2">
                  <Info className="w-8 h-8 opacity-40" />
                  ยังไม่มีข้อมูลลูกไก่ที่ผูกกับแม่พันธุ์
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 3: Band Color Distribution */}
        {activeTab === 'bands' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black">สัดส่วนสีกิ๊ฟปีกไก่ในฟาร์ม</h2>
                  <p className="text-[10px] text-slate-400">จำนวนและเปอร์เซ็นต์ของกิ๊ฟปีกแยกตามสี</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                รวม {totalBandChicks} ตัว
              </span>
            </div>

            {bandChartData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bandChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {bandChartData.map((entry: any, index: number) => (
                          <Cell key={`cell-band-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {bandChartData.map((item: any, index: number) => {
                    const percent = totalBandChicks > 0 ? ((item.value / totalBandChicks) * 100).toFixed(1) : '0';
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: item.fill }} />
                            <span>สีกิ๊ฟ {item.name}</span>
                          </div>
                          <span className="text-slate-600 dark:text-slate-300 font-mono">
                            {item.value} ตัว ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ width: `${percent}%`, backgroundColor: item.fill }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center gap-2">
                <Tag className="w-8 h-8 opacity-40" />
                ยังไม่มีข้อมูลการติดกิ๊ฟปีกไก่ในระบบ
              </div>
            )}
          </div>
        )}


        {activeTab === 'finance' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Finance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-white/5 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-500">รายรับรวม (จากการขาย)</p>
                <h3 className="text-2xl font-black text-emerald-600">{stats.finance?.totalIncome?.toLocaleString() || 0} ฿</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-white/5 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-2">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-500">รายจ่ายรวม (ค่าอาหาร/ยา)</p>
                <h3 className="text-2xl font-black text-rose-600">{stats.finance?.totalExpense?.toLocaleString() || 0} ฿</h3>
              </div>
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl p-5 border border-amber-300 flex flex-col items-center text-center text-white shadow-lg shadow-amber-500/20">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm">
                  <Wallet className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold opacity-90">กำไรสุทธิ</p>
                <h3 className="text-2xl font-black">{stats.finance?.netProfit?.toLocaleString() || 0} ฿</h3>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Sales History */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-black text-slate-800 dark:text-white">ประวัติการขายล่าสุด</h2>
                </div>
                
                {stats.finance?.salesHistory?.length > 0 ? (
                  <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                    {stats.finance.salesHistory.map((sale: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {sale.customerName !== '-' ? sale.customerName : 'ลูกค้าทั่วไป'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {new Date(sale.date).toLocaleDateString('th-TH')} • ไก่: {sale.name} ({sale.code})
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-600">+{sale.amount.toLocaleString()} ฿</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400 text-sm font-bold">
                    ยังไม่มีประวัติการขายไก่
                  </div>
                )}
              </div>

              {/* Expenses History */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-black text-slate-800 dark:text-white">ประวัติรายจ่าย</h2>
                  </div>
                  <button 
                    onClick={() => setShowExpenseModal(true)}
                    className="flex items-center gap-1 text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                  >
                    <PlusCircle className="w-4 h-4" /> เพิ่มรายจ่าย
                  </button>
                </div>
                
                {stats.finance?.expensesHistory?.length > 0 ? (
                  <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                    {stats.finance.expensesHistory.map((expense: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {expense.category}
                            {expense.note && <span className="text-xs font-normal text-slate-500 ml-2">({expense.note})</span>}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {new Date(expense.date).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-rose-600">-{expense.amount.toLocaleString()} ฿</span>
                          <button 
                            onClick={() => handleDeleteExpense(expense._id)}
                            className="p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400 text-sm font-bold">
                    ยังไม่มีประวัติรายจ่าย
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Bulk Sale Modal */}
      {showBulkSaleForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                💰 บันทึกขายเหมาคอก
              </h2>
              <button onClick={() => setShowBulkSaleForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleBulkSaleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">เลือกคอกผสมพันธุ์</label>
                <CustomSelect
                  value={bulkSaleData.batchId}
                  onChange={handleBatchSelect}
                  options={batches.map(b => ({ value: b._id, label: `คอก ${b.batchCode}` }))}
                  placeholder="-- เลือกคอก --"
                />
                {bulkSaleData.batchId && (
                  <p className="text-xs font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                    * พบลูกไก่สถานะปกติในคอกนี้: {chicksInBatch} ตัว
                  </p>
                )}
              </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">ชื่อลูกค้า</label>
                  <input 
                    type="text" 
                    required
                    placeholder="เช่น เสี่ยบอย กทม."
                    className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    value={bulkSaleData.customerName}
                    onChange={e => setBulkSaleData({...bulkSaleData, customerName: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">ชื่อฟาร์ม / ซุ้มลูกค้า (ถ้ามี)</label>
                  <input 
                    type="text" 
                    placeholder="เช่น ซุ้มเพชรเจริญ"
                    className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    value={bulkSaleData.customerFarm}
                    onChange={e => setBulkSaleData({...bulkSaleData, customerFarm: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">เบอร์โทรศัพท์ติดต่อ</label>
                <input 
                  type="text" 
                  placeholder="094-xxx-xxxx"
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  value={bulkSaleData.customerPhone}
                  onChange={e => setBulkSaleData({...bulkSaleData, customerPhone: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">ราคาเหมารวม (บาท)</label>
                  <input 
                    type="number" 
                    required min="0"
                    placeholder="เช่น 10000"
                    className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    value={bulkSaleData.totalPrice}
                    onChange={e => setBulkSaleData({...bulkSaleData, totalPrice: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">วันที่ขาย</label>
                  <input 
                    type="date" 
                    required
                    className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    value={bulkSaleData.saleDate}
                    onChange={e => setBulkSaleData({...bulkSaleData, saleDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">บันทึกเพิ่มเติม</label>
                <textarea 
                  placeholder="เช่น จัดส่งทางรถตู้, ลูกค้ามารับเอง"
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
                  value={bulkSaleData.notes}
                  onChange={e => setBulkSaleData({...bulkSaleData, notes: e.target.value})}
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={chicksInBatch === 0}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-base shadow-lg shadow-amber-500/30 transition-all active:scale-95"
                >
                  ยืนยันการขายเหมาคอก ({chicksInBatch} ตัว)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-500" /> บันทึกรายจ่าย
              </h2>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">วันที่</label>
                <input 
                  type="date" 
                  required
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  value={expenseForm.date}
                  onChange={e => setExpenseForm({...expenseForm, date: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">หมวดหมู่</label>
                <select 
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  value={expenseForm.category}
                  onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
                >
                  <option value="อาหาร">ค่าอาหาร</option>
                  <option value="ยา/วิตามิน">ค่ายา/วิตามิน</option>
                  <option value="อุปกรณ์">ค่าอุปกรณ์</option>
                  <option value="ค่าจ้าง">ค่าจ้าง</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">จำนวนเงิน (บาท)</label>
                <input 
                  type="number" 
                  required min="1"
                  placeholder="เช่น 500"
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">หมายเหตุ (ไม่บังคับ)</label>
                <input 
                  type="text" 
                  placeholder="เช่น ซื้อข้าวเปลือก 2 กระสอบ"
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  value={expenseForm.note}
                  onChange={e => setExpenseForm({...expenseForm, note: e.target.value})}
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isSubmittingExpense}
                  className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingExpense ? 'กำลังบันทึก...' : 'บันทึกรายจ่าย'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
