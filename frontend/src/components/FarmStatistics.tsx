import { useState, useEffect } from 'react';
import { ChevronLeft, BarChart as BarChartIcon, PieChart as PieChartIcon, Activity, ShieldCheck, Users, Info } from 'lucide-react';
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

export default function FarmStatistics({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/statistics', {
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-500">กำลังประมวลผลสถิติฟาร์ม...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <button onClick={() => onNavigate('dashboard')} className="absolute top-6 left-6 p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-600 dark:text-slate-300">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <Activity className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold dark:text-white">ไม่พบข้อมูลสถิติ</h2>
        <p className="text-sm text-slate-500 mt-2">โปรดเพิ่มข้อมูลประชากรไก่ในระบบเพื่อดูการวิเคราะห์</p>
      </div>
    );
  }

  // Population Pie Chart Data
  const popData = [
    { name: 'พ่อพันธุ์', value: stats.population.fathers, color: '#3b82f6' }, // blue-500
    { name: 'แม่พันธุ์', value: stats.population.mothers, color: '#ec4899' }, // pink-500
    { name: 'ลูกไก่', value: stats.population.chicks.total, color: '#eab308' }, // yellow-500
  ].filter(d => d.value > 0);

  // Chick Gender Pie Chart Data
  const genderData = [
    { name: 'ตัวผู้', value: stats.population.chicks.male, color: '#3b82f6' },
    { name: 'ตัวเมีย', value: stats.population.chicks.female, color: '#ec4899' },
    { name: 'ยังไม่ระบุ', value: stats.population.chicks.unknown, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 transition-colors font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 sticky top-0 z-30 border-b border-slate-200 dark:border-white/10 shadow-sm">
        <div className="max-w-6xl mx-auto w-full px-4 py-4 flex items-center gap-3">
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="p-2 -ml-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BarChartIcon className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-black leading-tight tracking-tight">สถิติฟาร์มอัจฉริยะ</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Farm Analytics Dashboard</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full p-4 space-y-6">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-5 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
            <ShieldCheck className="w-20 h-20 absolute -bottom-4 -right-4 opacity-20" />
            <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">พ่อพันธุ์</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black">{stats.population.fathers}</span>
              <span className="text-sm pb-1 font-bold">ตัว</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-5 text-white shadow-lg shadow-pink-500/20 relative overflow-hidden">
            <ShieldCheck className="w-20 h-20 absolute -bottom-4 -right-4 opacity-20" />
            <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">แม่พันธุ์</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black">{stats.population.mothers}</span>
              <span className="text-sm pb-1 font-bold">ตัว</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-5 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden col-span-2 md:col-span-2">
            <Users className="w-24 h-24 absolute -bottom-6 -right-2 opacity-20" />
            <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">ลูกไก่ทั้งหมด</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black">{stats.population.chicks.total}</span>
              <span className="text-sm pb-1 font-bold">ตัว</span>
            </div>
            <div className="flex gap-4 mt-3 text-xs font-bold opacity-90 border-t border-white/20 pt-2">
              <span>ผู้: {stats.population.chicks.male}</span>
              <span>เมีย: {stats.population.chicks.female}</span>
              <span>ยังไม่ระบุ: {stats.population.chicks.unknown}</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Population Donut Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold">สัดส่วนประชากรไก่</h2>
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
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {popData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-bold">ไม่มีข้อมูล</div>
              )}
            </div>
          </div>

          {/* Monthly Breeding Line Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold">ปริมาณการเข้าคอกผสม (ปีนี้)</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlyBatches} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#64748b' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="batches" 
                    name="จำนวนชุดการผสม"
                    stroke="#10b981" 
                    strokeWidth={4}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Fathers Bar Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 md:col-span-2">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <BarChartIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold">สุดยอดพ่อพันธุ์ (วัดจากจำนวนลูก)</h2>
                <p className="text-[10px] text-slate-500">พ่อไก่ 3 อันดับแรกที่ให้ลูกเยอะที่สุด</p>
              </div>
            </div>
            
            <div className="h-72">
              {stats.topFathers?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topFathers} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" opacity={0.3} />
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} 
                      width={100}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="chickCount" name="จำนวนลูกไก่ (ตัว)" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={32}>
                      {stats.topFathers.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#8b5cf6', '#a855f7', '#d946ef'][index % 3]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-bold flex-col gap-2">
                  <Info className="w-8 h-8 opacity-50" />
                  ยังไม่มีข้อมูลลูกไก่ที่ผูกกับพ่อพันธุ์
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
