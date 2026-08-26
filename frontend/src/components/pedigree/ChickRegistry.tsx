import { useState, useEffect } from 'react';
import { Search, ChevronLeft, Trash2, Edit, Swords, Tag, User, Users, ChevronDown, ChevronUp, Plus, Download, Loader2, X, CheckCircle, Home, Crown, Layers } from 'lucide-react'; // Trigger HMR
import JSZip from 'jszip';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import { CustomSelect } from '../ui/CustomSelect';
import { getBandColorClass } from './FatherRegistry';
import { CertificateDocument } from './CertificateDocument';

const getBandColorCircleClass = (color: string) => {
  switch (color) {
    case 'ทอง': return 'bg-amber-400';
    case 'เงิน': return 'bg-slate-300';
    case 'แดง': return 'bg-red-500';
    case 'เหลือง': return 'bg-yellow-400';
    case 'เขียว': return 'bg-green-500';
    case 'น้ำเงิน': return 'bg-blue-500';
    default: return 'bg-slate-400';
  }
};

export default function ChickRegistry({ selectedBatchCode, onNavigate }: { selectedBatchCode?: string, onNavigate: (page: any, id?: string) => void }) {
  const [chicks, setChicks] = useState<any[]>([]);
  const [search, setSearch] = useState(selectedBatchCode || '');
  const [filterSource, setFilterSource] = useState<'all' | 'farm' | 'vip'>('all');
  const [loading, setLoading] = useState(true);
  const [expandedBatches, setExpandedBatches] = useState<Record<string, boolean>>(() => {
    return selectedBatchCode ? { [selectedBatchCode]: true } : {};
  });
  const [selectedChicks, setSelectedChicks] = useState<Set<string>>(new Set());
  const [showBulkDateModal, setShowBulkDateModal] = useState(false);
  const [bulkHatchDate, setBulkHatchDate] = useState('');
  
  const [showBulkBandModal, setShowBulkBandModal] = useState(false);
  const [bulkBandStartNumber, setBulkBandStartNumber] = useState('');
  const [bulkBandColor, setBulkBandColor] = useState('');
  const [bulkBandText, setBulkBandText] = useState('');

  const [showBulkNameModal, setShowBulkNameModal] = useState(false);
  const [bulkNamePrefix, setBulkNamePrefix] = useState('');
  const [bulkNameAddNumber, setBulkNameAddNumber] = useState(true);

  const [showBulkGenderModal, setShowBulkGenderModal] = useState(false);
  const [bulkGender, setBulkGender] = useState('');

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf'>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [exportingCurrentIndex, setExportingCurrentIndex] = useState(0);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchChicks();
  }, []);

  const fetchChicks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chicks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setChicks(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันหน้าการลบข้อมูลลูกไก่?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL}/api/chicks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchChicks();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedChicks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectBatch = (e: React.MouseEvent, chicksInBatch: any[]) => {
    e.stopPropagation();
    const allSelected = chicksInBatch.every(c => selectedChicks.has(c._id));
    setSelectedChicks(prev => {
      const next = new Set(prev);
      chicksInBatch.forEach(c => {
        if (allSelected) next.delete(c._id);
        else next.add(c._id);
      });
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (!confirm(`ยืนยันการลบข้อมูลลูกไก่ที่เลือกจำนวน ${selectedChicks.size} รายการ?`)) return;
    try {
      const token = localStorage.getItem('token');
      await Promise.all(Array.from(selectedChicks).map(id => 
        fetch(`${import.meta.env.VITE_API_URL}/api/chicks/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ));
      setSelectedChicks(new Set());
      fetchChicks();
    } catch (err) {
      console.error(err);
    }
  };


  const handleBulkDeleteClick = () => setShowBulkDeleteConfirm(true);

  const confirmBulkDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await Promise.all(Array.from(selectedChicks).map(id => 
        fetch(`${import.meta.env.VITE_API_URL}/api/chicks/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ));
      setSelectedChicks(new Set());
      setShowBulkDeleteConfirm(false);
      fetchChicks();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmBatchExport = async () => {
    setIsExporting(true);
    const sortedSelectedChicks = chicks.filter(c => selectedChicks.has(c._id));
    
    try {
      if (exportFormat === 'pdf') {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        
        for (let i = 0; i < sortedSelectedChicks.length; i++) {
          // 1. Trigger React to render ONLY this chick's certificate
          setExportingCurrentIndex(i + 1);
          
          // 2. Wait for DOM to mount and external images to load (optimized from 1000ms to 150ms)
          await new Promise(resolve => setTimeout(resolve, 150));
          
          const chick = sortedSelectedChicks[i];
          const element = document.getElementById(`cert-${chick._id}`);
          if (element) {
            const dataUrl = await toJpeg(element, { 
              quality: 0.95, 
              backgroundColor: '#0f172a',
              width: 794,
              height: 1123,
              pixelRatio: 1
            });
            
            if (i > 0) pdf.addPage();
            pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, (1123 * pdfWidth) / 794);
          }
        }
        
        pdf.save(`Kaichon_Pedigree_Batch_${new Date().getTime()}.pdf`);
      } else {
        // JPG (ZIP export)
        const zip = new JSZip();
        
        for (let i = 0; i < sortedSelectedChicks.length; i++) {
          setExportingCurrentIndex(i + 1);
          
          // Wait for DOM (optimized)
          await new Promise(resolve => setTimeout(resolve, 150));
          
          const chick = sortedSelectedChicks[i];
          const element = document.getElementById(`cert-${chick._id}`);
          if (element) {
            const dataUrl = await toJpeg(element, { 
              quality: 0.95, 
              backgroundColor: '#0f172a',
              width: 794,
              height: 1123,
              pixelRatio: 1
            });
            
            // Add image to zip
            const base64Data = dataUrl.split(',')[1];
            zip.file(`Pedigree_${chick.name || chick.code || 'Chick'}.jpg`, base64Data, { base64: true });
          }
        }
        
        // Generate and download zip
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Kaichon_Pedigree_Batch_${new Date().getTime()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    } catch (error) {
      console.error("Batch export error:", error);
      alert("เกิดข้อผิดพลาดในการโหลดใบประวัติ (กรุณาลองใหม่อีกครั้ง หรือโหลดทีละน้อยๆ)");
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
      setExportingCurrentIndex(0);
    }
  };

  const handleBulkUpdateDate = async () => {
    if (!bulkHatchDate) return alert('กรุณาเลือกวันที่ฟัก');
    try {
      const token = localStorage.getItem('token');
      await Promise.all(Array.from(selectedChicks).map(id => 
        fetch(`${import.meta.env.VITE_API_URL}/api/chicks/${id}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ hatchDate: new Date(bulkHatchDate) })
        })
      ));
      setShowBulkDateModal(false);
      setBulkHatchDate('');
      setSelectedChicks(new Set());
      fetchChicks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkUpdateBand = async () => {
    if (!bulkBandStartNumber) return alert('กรุณาระบุเลขเริ่มต้น');
    try {
      const token = localStorage.getItem('token');
      // Sort selected chicks to match display order
      const sortedSelectedChicks = chicks.filter(c => selectedChicks.has(c._id));
      
      const startNumStr = bulkBandStartNumber.trim();
      const match = startNumStr.match(/(\d+)$/);
      let prefix = startNumStr;
      let startNum = 0;
      let numLength = 0;
      
      if (match) {
        prefix = startNumStr.substring(0, startNumStr.length - match[1].length);
        startNum = parseInt(match[1], 10);
        numLength = match[1].length;
      }

      await Promise.all(sortedSelectedChicks.map((chick, index) => {
        let newBandNumber = bulkBandStartNumber;
        if (match) {
          newBandNumber = prefix + String(startNum + index).padStart(numLength, '0');
        }
        
        return fetch(`${import.meta.env.VITE_API_URL}/api/chicks/${chick._id}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            bandNumber: newBandNumber,
            ...(bulkBandColor && { bandColor: bulkBandColor }),
            ...(bulkBandText && { bandText: bulkBandText })
          })
        });
      }));
      
      setShowBulkBandModal(false);
      setBulkBandStartNumber('');
      setBulkBandColor('');
      setBulkBandText('');
      setSelectedChicks(new Set());
      fetchChicks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkUpdateName = async () => {
    if (!bulkNamePrefix.trim()) return alert('กรุณาระบุชื่อที่ต้องการตั้ง');
    try {
      const token = localStorage.getItem('token');
      const sortedSelectedChicks = chicks.filter(c => selectedChicks.has(c._id));

      await Promise.all(sortedSelectedChicks.map((chick, index) => {
        let newName = bulkNamePrefix.trim();
        if (bulkNameAddNumber) {
          newName = `${newName} ${index + 1}`;
        }
        
        return fetch(`${import.meta.env.VITE_API_URL}/api/chicks/${chick._id}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: newName })
        });
      }));
      
      setShowBulkNameModal(false);
      setBulkNamePrefix('');
      setSelectedChicks(new Set());
      fetchChicks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkUpdateGender = async () => {
    if (!bulkGender) return alert('กรุณาเลือกเพศ');
    try {
      const token = localStorage.getItem('token');
      await Promise.all(Array.from(selectedChicks).map(id => 
        fetch(`${import.meta.env.VITE_API_URL}/api/chicks/${id}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ gender: bulkGender })
        })
      ));
      setShowBulkGenderModal(false);
      setBulkGender('');
      setSelectedChicks(new Set());
      fetchChicks();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredChicks = chicks.filter(c => {
    // Check Source Filter
    const isVip = c.mother?.source === 'ไก่ฟาร์มอื่น (ลูกค้า VIP)';
    if (filterSource === 'farm' && isVip) return false;
    if (filterSource === 'vip' && !isVip) return false;

    // Check Search Query
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.name || '').toLowerCase().includes(q) || 
      (c.code || '').toLowerCase().includes(q) ||
      (c.bandNumber || '').toLowerCase().includes(q) ||
      (c.bandText || '').toLowerCase().includes(q) ||
      (c.bandColor || '').toLowerCase().includes(q) ||
      (c.batch?.batchCode || '').toLowerCase().includes(q) ||
      (c.father?.name || '').toLowerCase().includes(q) ||
      (c.fatherNameText || '').toLowerCase().includes(q) ||
      (c.mother?.name || '').toLowerCase().includes(q) ||
      (c.motherNameText || '').toLowerCase().includes(q)
    );
  });

  const groupedChicks: Record<string, any[]> = {};
  filteredChicks.forEach(chick => {
    let batchCode = 'ไม่ได้ระบุชุดผสม (เพิ่มเอง)';
    if (chick.batch && typeof chick.batch === 'object' && chick.batch.batchCode) {
      batchCode = chick.batch.batchCode;
    } else if (typeof chick.batch === 'string' && /^[a-fA-F0-9]{24}$/.test(chick.batch)) {
      batchCode = 'ชุดผสมเก่า (ไม่มีรหัส)';
    } else if (chick.batch && typeof chick.batch === 'object' && chick.batch._id) {
      batchCode = 'ชุดผสมเก่า (ไม่มีรหัส)';
    }

    if (/^[a-fA-F0-9]{24}$/.test(batchCode)) {
      batchCode = 'ชุดผสมเก่า (ไม่มีรหัส)';
    }
    if (!groupedChicks[batchCode]) groupedChicks[batchCode] = [];
    groupedChicks[batchCode].push(chick);
  });

  const toggleBatch = (batchCode: string) => {
    setExpandedBatches(prev => ({
      ...prev,
      [batchCode]: !prev[batchCode]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 sticky top-0 z-30 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto w-full px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('dashboard')} className="p-2 -ml-2 text-slate-500 hover:text-red-600 transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">ทะเบียนลูกไก่</h1>
          </div>
          
          <button 
            onClick={() => onNavigate('chick-banding')}
            className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-3.5 py-2.5 rounded-2xl shadow-md shadow-red-600/20 active:scale-95 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">บันทึกลูกไก่เข้าฝูง</span><span className="sm:hidden">เพิ่ม</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto w-full p-4 flex-1">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="ค้นหาลูกไก่ (ชื่อ, รหัส, ชุดผสม, ชื่อพ่อ, ชื่อแม่)..." 
            className="w-full pl-10 pr-20 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Source Tabs */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-6">
          <button
            onClick={() => setFilterSource('all')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs font-black rounded-xl transition-all duration-300 ${filterSource === 'all' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800'}`}
          >
            <Layers className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span>ทั้งหมด</span>
          </button>
          <button
            onClick={() => setFilterSource('farm')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs font-black rounded-xl transition-all duration-300 ${filterSource === 'farm' ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-md shadow-purple-500/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800'}`}
          >
            <Home className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span>ฟาร์มเรา</span>
          </button>
          <button
            onClick={() => setFilterSource('vip')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs font-black rounded-xl transition-all duration-300 ${filterSource === 'vip' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-md shadow-yellow-500/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800'}`}
          >
            <Crown className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span>VIP</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-10">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : chicks.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10" />
            </div>
            <p>ยังไม่มีข้อมูลลูกไก่ในระบบ</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.keys(groupedChicks).sort().map(batchCode => (
              <div key={batchCode} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                {/* Batch Header */}
                <div 
                  onClick={() => toggleBatch(batchCode)}
                  className="px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={(e) => toggleSelectBatch(e, groupedChicks[batchCode])}
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors cursor-pointer mr-1 ${
                        groupedChicks[batchCode].length > 0 && groupedChicks[batchCode].every(c => selectedChicks.has(c._id)) 
                          ? 'bg-red-600 border-red-600 text-white' 
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {groupedChicks[batchCode].length > 0 && groupedChicks[batchCode].every(c => selectedChicks.has(c._id)) && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      )}
                    </div>
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 font-bold shrink-0 shadow-sm">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-black text-sm mb-0.5">ชุดการผสม: {batchCode}</h2>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-500">
                        <span>ลูกไก่ {groupedChicks[batchCode].length} ตัว</span>
                        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-3">
                          <span className="truncate"><span className="text-red-500/80">พ่อ:</span> {groupedChicks[batchCode][0]?.father?.name || groupedChicks[batchCode][0]?.fatherNameText || '-'}</span>
                          <span className="truncate"><span className="text-pink-500/80">แม่:</span> {groupedChicks[batchCode][0]?.mother?.name || groupedChicks[batchCode][0]?.motherNameText || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      title="ออกใบเซอร์ทั้งชุด"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChicks(new Set(groupedChicks[batchCode].map((c: any) => c._id)));
                        setShowExportModal(true);
                      }}
                      className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-200 dark:border-indigo-800 shadow-sm active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <div className="text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-4">
                      {(search.trim() ? true : expandedBatches[batchCode]) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Chicks List (Expanded) */}
                {(search.trim() ? true : expandedBatches[batchCode]) && (
                  <div className="p-2 space-y-2 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900">
                    {groupedChicks[batchCode].map((chick) => (
                      <div 
                        key={chick._id} 
                        onClick={() => onNavigate('chicken-detail', chick._id)}
                        className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-all cursor-pointer hover:border-red-200 dark:hover:border-red-900/30"
                      >
                        <div 
                          onClick={(e) => toggleSelect(e, chick._id)}
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                            selectedChicks.has(chick._id)
                              ? 'bg-red-600 border-red-600 text-white' 
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {selectedChicks.has(chick._id) && (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-bold truncate text-sm ${
                              chick.gender === 'ผู้' || chick.gender === 'male' ? 'text-blue-700 dark:text-blue-400' :
                              chick.gender === 'เมีย' || chick.gender === 'female' ? 'text-pink-600 dark:text-pink-400' :
                              'text-slate-900 dark:text-white'
                            }`}>
                              {(() => {
                                let displayName = chick.name || '';
                                if (displayName.includes('เจ้าชาย')) displayName = 'ไก่เพศผู้ "ยังไม่มีชื่อ"';
                                if (displayName.includes('เจ้าหญิง')) displayName = 'ไก่เพศเมีย "ยังไม่มีชื่อ"';
                                
                                if (chick.gender === 'ผู้' || chick.gender === 'male') {
                                  return displayName.includes('♂') ? displayName : `♂ ${displayName}`;
                                } else if (chick.gender === 'เมีย' || chick.gender === 'female') {
                                  return displayName.includes('♀') ? displayName : `♀ ${displayName}`;
                                }
                                return displayName;
                              })()}
                            </h3>
                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-mono font-bold rounded-full">
                              {chick.code}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 mt-1">
                            <div className="flex items-center gap-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${chick.gender === 'ผู้' || chick.gender === 'male' ? 'bg-blue-500' : chick.gender === 'เมีย' || chick.gender === 'female' ? 'bg-pink-500' : 'bg-slate-400'}`}></div>
                              {chick.gender === 'male' ? 'ผู้' : chick.gender === 'female' ? 'เมีย' : chick.gender}
                            </div>
                            {chick.bandNumber && (
                              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-bold rounded-lg border min-w-0 max-w-full ${getBandColorClass(chick.bandColor || 'แดง')}`}>
                                <Tag className="w-2.5 h-2.5 shrink-0" />
                                <span className="flex items-center gap-1 shrink-0">
                                  {chick.bandColor && <div className={`w-2 h-2 rounded-full ${getBandColorCircleClass(chick.bandColor)} shadow-sm border border-black/10 shrink-0`} />}
                                </span>
                                <span className="shrink-0">#{chick.bandNumber}</span>
                                {chick.bandText && <span className="truncate">[{chick.bandText}]</span>}
                              </div>
                            )}
                          </div>
                          <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-50 dark:border-white/5">
                            <span className="flex items-center gap-1 truncate">
                              <span className="text-red-500/80 font-bold">พ่อ:</span> {chick.father?.name || chick.fatherNameText || '-'}
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <span className="text-pink-500/80 font-bold">แม่:</span> {chick.mother?.name || chick.motherNameText || '-'}
                            </span>
                          </div>
                        </div>
                        <div className="text-slate-300 dark:text-slate-600">
                          <ChevronLeft className="w-5 h-5 rotate-180" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedChicks.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-none z-40">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-black">
                {selectedChicks.size}
              </span>
              <span className="font-bold text-sm">ทำรายการแบบกลุ่ม:</span>
            </div>
            
            {/* Responsive Grid Button List */}
            <div className="grid grid-cols-3 md:flex md:flex-row gap-2 w-full">
              <button 
                onClick={() => setShowBulkNameModal(true)}
                className="w-full px-2 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform shadow-sm cursor-pointer hover:bg-emerald-600 flex items-center justify-center"
              >
                ตั้งชื่อชุด
              </button>
              <button 
                onClick={() => setShowBulkGenderModal(true)}
                className="w-full px-2 py-2.5 bg-pink-500 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform shadow-sm cursor-pointer hover:bg-pink-600 flex items-center justify-center"
              >
                ระบุเพศ
              </button>
              <button 
                onClick={() => setShowBulkBandModal(true)}
                className="w-full px-2 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform shadow-sm cursor-pointer hover:bg-amber-600 flex items-center justify-center"
              >
                ติดกิ๊ฟชุด
              </button>
              <button 
                onClick={() => setShowBulkDateModal(true)}
                className="w-full px-2 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform shadow-sm cursor-pointer flex items-center justify-center"
              >
                แก้วันที่ฟัก
              </button>
              <button 
                onClick={() => setShowExportModal(true)}
                className="w-full px-2 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform shadow-sm cursor-pointer hover:from-indigo-600 hover:to-purple-600 flex items-center justify-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                ใบเซอร์
              </button>
              <button 
                onClick={handleBulkDeleteClick}
                className="w-full px-2 py-2.5 bg-slate-200 dark:bg-slate-800 text-red-600 rounded-xl text-xs font-bold active:scale-95 transition-transform shadow-sm hover:bg-red-50 cursor-pointer flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="font-black text-xl mb-2">ยืนยันการลบ?</h3>
            <p className="text-sm text-slate-500 mb-6">คุณกำลังจะลบรายการที่เลือกจำนวน {selectedChicks.size} รายการ การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm cursor-pointer hover:bg-slate-200"
              >
                ยกเลิก
              </button>
              <button 
                onClick={confirmBulkDelete}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md cursor-pointer shadow-red-500/20 active:scale-95 transition-all hover:bg-red-700"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col relative overflow-hidden">
            
            {/* 
              HIDDEN RENDERING AREA (Memory Optimized):
              Only renders the specific certificate currently being exported, one by one.
              Kept inside the modal viewport to prevent browser optimization culling.
            */}
            <div className="absolute top-0 left-0 opacity-0 pointer-events-none z-[-1]" aria-hidden="true">
              {chicks.filter(c => selectedChicks.has(c._id)).map((chick, index) => (
                (isExporting && exportingCurrentIndex === index + 1) && (
                  <div key={`cert-${chick._id}`} id={`cert-${chick._id}`} className="w-[794px] h-[1123px] relative bg-slate-900 shrink-0">
                    <CertificateDocument chicken={chick} scale={1} />
                  </div>
                )
              ))}
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Download className="w-6 h-6 text-indigo-500" />
                ดาวน์โหลดใบเซอร์
              </h2>
              {!isExporting && (
                <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              )}
            </div>
            
            {isExporting ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                  <Download className="w-8 h-8 text-indigo-500 animate-bounce" />
                </div>
                <h3 className="text-xl font-black mb-2">กำลังสร้างเอกสาร...</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold mb-4">
                  {exportingCurrentIndex} / {selectedChicks.size} รายการ
                </p>
                <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${(exportingCurrentIndex / selectedChicks.size) * 100}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-3">เลือกรูปแบบไฟล์ (Format)</label>
                    <div className="flex gap-3">
                      <button onClick={() => setExportFormat('png')} className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${exportFormat === 'png' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <div className="font-black text-xl">JPG</div>
                        <div className="text-xs">แยกไฟล์ (Zip)</div>
                      </button>
                      <button onClick={() => setExportFormat('pdf')} className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${exportFormat === 'pdf' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <div className="font-black text-xl">PDF</div>
                        <div className="text-xs">รวมไฟล์ (PDF)</div>
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={confirmBatchExport}
                  className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-lg shadow-xl shadow-indigo-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" /> ดาวน์โหลด
                </button>
              </>
            )}
          </div>
        </div>
      )}



      {/* Bulk Date Modal */}
      {showBulkDateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <h3 className="font-bold mb-4">ตั้งคาวันที่ฟัก / วันเกิด (ทีละหลายตัว)</h3>
            <div className="space-y-4">
              <input 
                type="date"
                value={bulkHatchDate}
                onChange={(e) => setBulkHatchDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-red-500"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowBulkDateModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleBulkUpdateDate}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md cursor-pointer shadow-blue-500/20 active:scale-95 transition-all hover:bg-blue-700"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Name Modal */}
      {showBulkNameModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-bold mb-4">ตั้งชื่อลูกไก่ (ทีละหลายตัว)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">ชื่อลูกไก่ (คำนำหน้า)</label>
                <input 
                  type="text"
                  placeholder="เช่น ขุนศึก, มังกร, เพชร"
                  value={bulkNamePrefix}
                  onChange={(e) => setBulkNamePrefix(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <input 
                  type="checkbox"
                  checked={bulkNameAddNumber}
                  onChange={(e) => setBulkNameAddNumber(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded border-slate-300"
                />
                <span className="text-sm font-medium">รันตัวเลขต่อท้ายอัตโนมัติ (เช่น ขุนศึก 1, 2, 3...)</span>
              </label>
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => setShowBulkNameModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm cursor-pointer hover:bg-slate-200"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleBulkUpdateName}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md cursor-pointer shadow-emerald-500/20 active:scale-95 transition-all hover:bg-emerald-700"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Band Modal */}
      {showBulkBandModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold">ติดกิ๊ฟ / แก้ไขกิ๊ฟ (แบบชุด)</h3>
            <p className="text-xs text-slate-500">ระบบจะทำการรันตัวเลขกิ๊ฟให้ลูกไก่ {selectedChicks.size} ตัวตามลำดับอัตโนมัติ</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">เลขเริ่มต้น (เช่น A001)</label>
                <input 
                  type="text"
                  value={bulkBandStartNumber}
                  onChange={(e) => setBulkBandStartNumber(e.target.value)}
                  placeholder="เช่น 001"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-red-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">สีของกิ๊ฟ (ไม่ระบุก็ได้)</label>
                <CustomSelect
                  value={bulkBandColor}
                  onChange={(val) => setBulkBandColor(val)}
                  options={[
                    { value: '', label: '-- เลือกสี --' },
                    { value: 'ทอง', label: 'ทอง', colorCode: 'bg-amber-400' },
                    { value: 'เงิน', label: 'เงิน', colorCode: 'bg-slate-300' },
                    { value: 'แดง', label: 'แดง', colorCode: 'bg-red-500' },
                    { value: 'เหลือง', label: 'เหลือง', colorCode: 'bg-yellow-400' },
                    { value: 'เขียว', label: 'เขียว', colorCode: 'bg-green-500' },
                    { value: 'น้ำเงิน', label: 'น้ำเงิน', colorCode: 'bg-blue-500' },
                    { value: 'ส้ม', label: 'ส้ม', colorCode: 'bg-orange-500' },
                    { value: 'ขาว', label: 'ขาว', colorCode: 'bg-white border border-slate-200' },
                    { value: 'ฟ้า', label: 'ฟ้า', colorCode: 'bg-sky-400' },
                    { value: 'ม่วง', label: 'ม่วง', colorCode: 'bg-purple-500' },
                    { value: 'ชมพู', label: 'ชมพู', colorCode: 'bg-pink-400' }
                  ]}
                  buttonClassName="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-red-500 flex items-center justify-between"
                  placeholder="-- เลือกสี --"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">ชื่อซุ้มบนกิ๊ฟ (ไม่ระบุก็ได้)</label>
                <input 
                  type="text"
                  value={bulkBandText}
                  onChange={(e) => setBulkBandText(e.target.value)}
                  placeholder="เช่น ส.สิบทิศ"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-red-500"
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setShowBulkBandModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleBulkUpdateBand}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm cursor-pointer shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                >
                  บันทึกกิ๊ฟชุด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Gender Modal */}
      {showBulkGenderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-bold mb-4">ระบุเพศลูกไก่ (ทีละหลายตัว)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">เลือกเพศ</label>
                <CustomSelect
                  value={bulkGender}
                  onChange={(val) => setBulkGender(val)}
                  options={[
                    { value: '', label: '-- เลือกเพศ --' },
                    { value: 'ผู้', label: 'ตัวผู้' },
                    { value: 'เมีย', label: 'ตัวเมีย' },
                    { value: 'ยังไม่ระบุ', label: 'ยังไม่ระบุ' }
                  ]}
                  buttonClassName="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-pink-500 flex items-center justify-between"
                  placeholder="-- เลือกเพศ --"
                />
              </div>
              
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => setShowBulkGenderModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm cursor-pointer hover:bg-slate-200"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleBulkUpdateGender}
                  className="flex-1 py-3 rounded-xl bg-pink-600 text-white font-bold text-sm shadow-md cursor-pointer shadow-pink-500/20 active:scale-95 transition-all hover:bg-pink-700"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}