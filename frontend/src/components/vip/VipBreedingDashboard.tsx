import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle, Crown, Plus, X, Loader2, Sparkles, AlertCircle, ChevronLeft, Edit, Trash2, Download, Hash, Calendar, Hourglass, Layers, ShieldCheck, Phone, MessageCircle, Globe } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface VipBreedingDashboardProps {
  user: any;
  onNavigate: (page: string) => void;
}

const VipBreedingDashboard: React.FC<VipBreedingDashboardProps> = ({ user, onNavigate }) => {
  const [isVIP, setIsVIP] = useState(user?.isVIP || false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(!user?.isVIP);
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'none' | 'pending' | 'rejected'>('none');
  
  // Data for VIP users
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [exportingRecord, setExportingRecord] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'progress' | 'completed'>('progress');

  // Export States
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportCandidate, setExportCandidate] = useState<any>(null);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png'>('png');
  const [exportTheme, setExportTheme] = useState<'classic' | 'premium' | 'dark'>('premium');
  const [fathers, setFathers] = useState<any[]>([]);
  const [alert, setAlert] = useState<{show: boolean, type: 'success' | 'error', message: string}>({show: false, type: 'success', message: ''});

  // Form State
  const [formData, setFormData] = useState({
    queueNo: '',
    intakeDate: new Date().toISOString().split('T')[0],
    father: '',
    motherName: '',
    bandNo: '',
    weight: '',
    phone: '',
    caretaker: '',
    lockNo: '',
    cycleNo: '',
    breedingStartDate: '',
    matingCount: '',
    eggCount: '',
    incubationDate: '',
    fertileEggs: '',
    hatchDate: '',
    chickQuantity: '',
    vaccines: '',
    nurseryDate: '',
    nurseryLockNo: '',
    nurseryCycleQty: '',
    expectedDeliveryDate: '',
    deliveryLockNo: '',
    deliveryCycleQty: '',
    motherReturnDate: '',
    motherReturnWeight: '',
    notes: ''
  });

  useEffect(() => {
    if (!isVIP) {
      checkSubscriptionStatus();
    } else {
      fetchRecords();
      fetchFathers();
    }
  }, [isVIP]);

  const checkSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vip-subscriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const latest = data.data[0];
        setSubscriptionStatus(latest.status);
        if (latest.status === 'approved') {
          setIsVIP(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vip-breeding`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFathers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fathers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      // getFathers returns an array directly, not an object with success/data properties
      if (Array.isArray(data)) {
        setFathers(data);
      } else if (data.success && data.data) {
        setFathers(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitSubscription = async () => {
    if (!user?.isPartnerVip && !slipImage) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vip-subscriptions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          amount: user?.isPartnerVip ? 0 : 500, // VIP Price
          slipImage: user?.isPartnerVip ? 'partner-vip-auto-approved' : slipImage
        })
      });
      const data = await res.json();
      if (data.success) {
        if (user?.isPartnerVip) {
          setIsVIP(true); // Auto-activate
        } else {
          setSubscriptionStatus('pending');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const submitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `${import.meta.env.VITE_API_URL}/api/vip-breeding/${editingId}`
        : `${import.meta.env.VITE_API_URL}/api/vip-breeding`;
        
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingId(null);
        fetchRecords();
        setAlert({show: true, type: 'success', message: 'บันทึกข้อมูลเรียบร้อยแล้ว'});
        setTimeout(() => setAlert({show: false, type: 'success', message: ''}), 3000);
      }
    } catch (err) {
      setAlert({show: true, type: 'error', message: 'เกิดข้อผิดพลาดในการบันทึก'});
    } finally {
      setSubmitting(false);
    }
  };

  const generateChicks = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vip-breeding/${id}/generate-chicks`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAlert({show: true, type: 'success', message: `สร้างลูกไก่เข้าคลังเรียบร้อยแล้ว จำนวน ${data.count} ตัว`});
        fetchRecords(); // Refresh the records to update the isChicksGenerated flag
      } else {
        setAlert({show: true, type: 'error', message: data.message || 'เกิดข้อผิดพลาด'});
      }
      setTimeout(() => setAlert({show: false, type: 'success', message: ''}), 5000);
    } catch (err) {
      setAlert({show: true, type: 'error', message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ'});
      setTimeout(() => setAlert({show: false, type: 'success', message: ''}), 5000);
    }
  };

  const handleEdit = (record: any) => {
    setEditingId(record._id);
    setFormData({
      queueNo: record.queueNo || '',
      intakeDate: record.intakeDate ? record.intakeDate.split('T')[0] : '',
      father: record.father?._id || '',
      motherName: record.motherName || '',
      bandNo: record.bandNo || '',
      weight: record.weight || '',
      phone: record.phone || '',
      caretaker: record.caretaker || '',
      lockNo: record.lockNo || '',
      cycleNo: record.cycleNo || '',
      breedingStartDate: record.breedingStartDate ? record.breedingStartDate.split('T')[0] : '',
      matingCount: record.matingCount || '',
      eggCount: record.eggCount || '',
      incubationDate: record.incubationDate ? record.incubationDate.split('T')[0] : '',
      fertileEggs: record.fertileEggs || '',
      hatchDate: record.hatchDate ? record.hatchDate.split('T')[0] : '',
      chickQuantity: record.chickQuantity || '',
      vaccines: record.vaccines || '',
      nurseryDate: record.nurseryDate ? record.nurseryDate.split('T')[0] : '',
      nurseryLockNo: record.nurseryLockNo || '',
      nurseryCycleQty: record.nurseryCycleQty || '',
      expectedDeliveryDate: record.expectedDeliveryDate ? record.expectedDeliveryDate.split('T')[0] : '',
      deliveryLockNo: record.deliveryLockNo || '',
      deliveryCycleQty: record.deliveryCycleQty || '',
      motherReturnDate: record.motherReturnDate ? record.motherReturnDate.split('T')[0] : '',
      motherReturnWeight: record.motherReturnWeight || '',
      notes: record.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vip-breeding/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAlert({show: true, type: 'success', message: 'ลบรายการเรียบร้อยแล้ว'});
        fetchRecords();
      } else {
        setAlert({show: true, type: 'error', message: data.message || 'เกิดข้อผิดพลาด'});
      }
      setTimeout(() => setAlert({show: false, type: 'success', message: ''}), 3000);
    } catch (err) {
      setAlert({show: true, type: 'error', message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ'});
      setTimeout(() => setAlert({show: false, type: 'success', message: ''}), 3000);
    }
  };

  const downloadRecord = (record: any) => {
    setExportCandidate(record);
    setShowExportModal(true);
  };

  const confirmExport = () => {
    setExportingRecord(exportCandidate);
    setShowExportModal(false);
  };

  useEffect(() => {
    if (exportingRecord) {
      const exportElement = document.getElementById('printable-form');
      if (exportElement) {
        // Wait a bit for rendering
        setTimeout(() => {
          toPng(exportElement, { quality: 1.0, backgroundColor: exportTheme === 'dark' ? '#0f172a' : '#ffffff', useCORS: true, cacheBust: true })
            .then(async (dataUrl) => {
              const fileName = `VIP-Breeding-${exportingRecord.queueNo}.${exportFormat === 'pdf' ? 'pdf' : 'png'}`;
              let shared = false;

              if (navigator.share) {
                try {
                  let file;
                  if (exportFormat === 'pdf') {
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (exportElement.offsetHeight * pdfWidth) / exportElement.offsetWidth;
                    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    const blob = pdf.output('blob');
                    file = new File([blob], fileName, { type: 'application/pdf' });
                  } else {
                    const res = await fetch(dataUrl);
                    const blob = await res.blob();
                    file = new File([blob], fileName, { type: 'image/png' });
                  }

                  if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                      files: [file],
                      title: 'เอกสาร VIP Breeding',
                      text: `เอกสาร VIP Breeding หมายเลข ${exportingRecord.queueNo}`
                    });
                    shared = true;
                  }
                } catch (shareError: any) {
                  if (shareError.name === 'AbortError' || (shareError.message && shareError.message.includes('abort'))) {
                    shared = true;
                  } else {
                    console.error('Share API Error:', shareError);
                  }
                }
              }

              if (!shared) {
                if (exportFormat === 'pdf') {
                  const pdf = new jsPDF('p', 'mm', 'a4');
                  const pdfWidth = pdf.internal.pageSize.getWidth();
                  const pdfHeight = (exportElement.offsetHeight * pdfWidth) / exportElement.offsetWidth;
                  pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
                  pdf.save(fileName);
                } else {
                  const link = document.createElement('a');
                  link.download = fileName;
                  link.href = dataUrl;
                  link.click();
                }
              }
              setExportingRecord(null);
            })
            .catch((err) => {
              console.error('Error generating image', err);
              setAlert({show: true, type: 'error', message: 'เกิดข้อผิดพลาดในการสร้างไฟล์ดาวน์โหลด'});
              setExportingRecord(null);
            });
        }, 500);
      }
    }
  }, [exportingRecord, exportFormat, exportTheme]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      queueNo: '',
      intakeDate: new Date().toISOString().split('T')[0],
      father: '',
      motherName: '',
      bandNo: '',
      weight: '',
      phone: '',
      caretaker: '',
      lockNo: '',
      cycleNo: '',
      breedingStartDate: '',
      matingCount: '',
      eggCount: '',
      incubationDate: '',
      fertileEggs: '',
      hatchDate: '',
      chickQuantity: '',
      vaccines: '',
      nurseryDate: '',
      nurseryLockNo: '',
      nurseryCycleQty: '',
      expectedDeliveryDate: '',
      deliveryLockNo: '',
      deliveryCycleQty: '',
      motherReturnDate: '',
      motherReturnWeight: '',
      notes: ''
    });
    setShowForm(false);
  };

  const renderNonVIP = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => onNavigate('dashboard')}
        className="mb-6 flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-full shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 font-bold transition-all text-sm w-fit group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> กลับหน้าหลัก
      </button>
      <div className="flex flex-col items-center justify-center p-6 sm:p-10 min-h-[60vh] bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-yellow-500/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-600"></div>
        
        <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
          <Crown className="w-12 h-12 text-yellow-400" />
        </div>
      
      <h2 className="text-3xl font-black text-white mb-3 text-center">ระบบรับฝากผสม <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">VIP</span></h2>
      <p className="text-slate-300 text-center mb-8 max-w-md">
        ปลดล็อกระบบบันทึกประวัติการรับฝากผสมอย่างละเอียดกว่า 25 รายการ 
        ตั้งแต่การกักโรค การฟักไข่ การอนุบาล จนถึงการส่งแม่ไก่กลับ 
        เหมาะสำหรับฟาร์มชั้นนำที่ต้องการมาตรฐานระดับมืออาชีพ
      </p>

      {subscriptionStatus === 'pending' ? (
        <div className="bg-blue-900/40 border border-blue-500/50 p-6 rounded-2xl flex flex-col items-center text-center">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-3" />
          <h3 className="text-lg font-bold text-blue-300">รอการอนุมัติจากผู้ดูแลระบบ</h3>
          <p className="text-sm text-blue-200/70 mt-2">สลิปการโอนเงินของคุณกำลังถูกตรวจสอบ (ใช้เวลาไม่เกิน 24 ชั่วโมง)</p>
        </div>
      ) : (
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 w-full max-w-sm flex flex-col items-center">
          
          {user?.isPartnerVip ? (
            <div className="text-center w-full mb-6">
              <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                <Crown className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-amber-400 mb-2">คุณได้รับสิทธิ์ Partner VIP</h3>
              <p className="text-sm text-slate-300">เปิดใช้งานระบบ VIP Breeding ได้ทันทีโดยไม่ต้องชำระเงินและรออนุมัติ</p>
            </div>
          ) : (
            <>
              <div className="text-yellow-400 font-bold text-2xl mb-4">500 ฿ <span className="text-sm text-slate-400 font-normal">/ ตลอดชีพ</span></div>
              
              <img src="/promptpay-qr.JPG" alt="PromptPay QR" className="w-48 h-48 rounded-xl mb-6 shadow-md object-cover" />
              
              <div className="w-full mb-6">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600 border-dashed rounded-xl cursor-pointer bg-slate-800/50 hover:bg-slate-700 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 mb-2 text-slate-400" />
                    <p className="text-sm text-slate-400 font-bold">อัปโหลดสลิปโอนเงิน</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
                {slipImage && (
                  <div className="mt-4 relative rounded-lg overflow-hidden border border-slate-600">
                    <img src={slipImage} alt="Slip preview" className="w-full h-32 object-cover" />
                    <button onClick={() => setSlipImage(null)} className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          <button 
            onClick={submitSubscription}
            disabled={(!user?.isPartnerVip && !slipImage) || submitting}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-900 font-black rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? 'กำลังส่งข้อมูล...' : user?.isPartnerVip ? 'ยืนยันเปิดใช้งานระบบฟรี' : 'ยืนยันการชำระเงิน'}
          </button>
        </div>
      )}
      </div>
    </div>
  );

  const renderVIPDashboard = () => (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <button 
        onClick={() => onNavigate('dashboard')}
        className="mb-6 flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-full shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 font-bold transition-all text-sm w-fit group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> กลับหน้าหลัก
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold mb-3">
            <Crown className="w-4 h-4" /> VIP Member
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">
            ระบบรับฝากผสม VIP
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            จัดการและติดตามสถานะไก่ชนฝากผสมอย่างละเอียด
          </p>
        </div>
        
        <button 
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-900 px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> เพิ่มรายการใหม่
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto hide-scrollbar mb-6 gap-1">
        <button 
          onClick={() => setFilterStatus('all')}
          className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-black rounded-xl transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 ${filterStatus === 'all' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-md shadow-yellow-500/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
        >
          <Layers className="w-4 h-4" /> 
          ทั้งหมด
        </button>
        <button 
          onClick={() => setFilterStatus('progress')}
          className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-black rounded-xl transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 ${filterStatus === 'progress' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
        >
          <Hourglass className="w-4 h-4" /> 
          <span className="hidden sm:inline">อยู่ระหว่างดำเนินการ</span>
          <span className="sm:hidden">กำลังทำ</span>
        </button>
        <button 
          onClick={() => setFilterStatus('completed')}
          className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-black rounded-xl transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 ${filterStatus === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
        >
          <CheckCircle className="w-4 h-4" /> 
          <span className="hidden sm:inline">ดึงลูกไก่เข้าคลังแล้ว</span>
          <span className="sm:hidden">เข้าคลังแล้ว</span>
        </button>
      </div>

      {alert.show && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 font-bold border ${alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-500/30 dark:text-green-400' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-500/30 dark:text-red-400'}`}>
          {alert.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {alert.message}
        </div>
      )}

      {loading && records.length === 0 ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
      ) : records.filter(r => filterStatus === 'all' || (filterStatus === 'progress' ? !r.isChicksGenerated : r.isChicksGenerated)).length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 sm:p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-300">ยังไม่มีรายการฝากผสม</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-sm">เริ่มบันทึกข้อมูลฝากผสมแบบละเอียดได้โดยการกดปุ่ม "เพิ่มรายการใหม่" ด้านบน</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {records.filter(r => filterStatus === 'all' || (filterStatus === 'progress' ? !r.isChicksGenerated : r.isChicksGenerated)).map(record => (
            <div key={record._id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-yellow-500/30 hover:border-yellow-500/60 transition-colors flex flex-col">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-black px-3 py-1.5 rounded-xl w-fit shadow-sm border border-yellow-200/50 dark:border-yellow-700/30">
                    <Hash className="w-3.5 h-3.5" /> คิว {record.queueNo}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl w-fit border border-slate-100 dark:border-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> รับเข้า: {new Date(record.intakeDate).toLocaleDateString('th-TH')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => downloadRecord(record)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="ดาวน์โหลดใบประวัติ">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleEdit(record)} className="p-1.5 text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors" title="แก้ไข">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(record._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="ลบ">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-slate-500 font-bold">พ่อพันธุ์</span>
                  <span className="text-[10px] text-slate-500 font-bold">แม่พันธุ์</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-sm truncate max-w-[40%]">{record.father?.name || '-'}</span>
                  <span className="text-slate-300 text-xs font-black">X</span>
                  <span className="font-bold text-pink-600 dark:text-pink-400 text-sm truncate max-w-[40%] text-right">{record.motherName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 flex-1 text-sm">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold">ผู้ดูแล</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{record.caretaker || '-'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-bold">กำหนดส่ง</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300">{record.expectedDeliveryDate ? new Date(record.expectedDeliveryDate).toLocaleDateString('th-TH') : '-'}</p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-bold">สถานะ</span>
                <span className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 px-3 py-1.5 rounded-lg text-xs font-bold border border-yellow-200 dark:border-yellow-700/30">
                  {record.chickQuantity ? `ลูกไก่ ${record.chickQuantity} ตัว` : 'อยู่ระหว่างฝากผสม'}
                </span>
              </div>
              
              {record.chickQuantity > 0 && (
                <div className="mt-4">
                  {record.isChicksGenerated ? (
                    <div className="w-full text-center bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> ดึงลูกไก่เข้าคลังแล้ว
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); generateChicks(record._id); }}
                      className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> ดึงลูกไก่ {record.chickQuantity} ตัวเข้าคลัง
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderForm = () => {
    const editingRecord = editingId ? records.find(r => r._id === editingId) : null;
    const isLocked = editingRecord ? editingRecord.isChicksGenerated : false;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-6 h-6 text-yellow-500" /> {editingId ? 'แก้ไขรายการฝากผสม' : 'บันทึกรับฝากผสมใหม่'}
            </h2>
          <button type="button" onClick={resetForm} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={submitRecord} className="p-6 max-h-[70vh] overflow-y-auto space-y-8">
          
          {/* Section 1: Intake */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> ข้อมูลรับเข้ากักโรค
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">วันที่รับเข้า</label>
                <input type="date" required value={formData.intakeDate} onChange={e => setFormData({...formData, intakeDate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">คิว</label>
                <input type="text" required placeholder="คิว.283" value={formData.queueNo} onChange={e => setFormData({...formData, queueNo: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">พ่อพันธุ์ (ฟาร์มของเรา)</label>
                <select required disabled={isLocked} value={formData.father} onChange={e => setFormData({...formData, father: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none disabled:opacity-50">
                  <option value="">เลือกพ่อพันธุ์...</option>
                  {fathers.map(f => <option key={f._id} value={f._id}>{f.name} ({f.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">แม่พันธุ์ (แม่ฝากผสม)</label>
                <input type="text" required disabled={isLocked} placeholder="ชื่อแม่พันธุ์" value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">รหัสกิ๊ฟปีก (แม่พันธุ์)</label>
                <input type="text" placeholder="405" value={formData.bandNo} onChange={e => setFormData({...formData, bandNo: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">น้ำหนัก (กก.)</label>
                <input type="number" step="0.1" placeholder="2.5" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                <input type="text" placeholder="093-XXXXXXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ผู้ดูแล</label>
                <input type="text" placeholder="ชื่อผู้ดูแล" value={formData.caretaker} onChange={e => setFormData({...formData, caretaker: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
            </div>
          </div>

          {/* Section 2: Breeding */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center gap-2">
              <span className="bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> ข้อมูลการผสมและการฟัก
            </h3>
            
            {isLocked && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl text-sm font-bold flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  รายการนี้สร้างข้อมูลลูกไก่เข้าฟาร์มเรียบร้อยแล้ว<br/>
                  <span className="text-xs text-yellow-600 font-normal">ไม่อนุญาตให้แก้ไขข้อมูลสายพันธุ์และจำนวนลูกไก่อีก เพื่อป้องกันข้อมูลในทะเบียนหลักผิดพลาด (สามารถแก้ไขได้เฉพาะข้อมูลการจัดส่ง)</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ล็อคที่ผสม</label>
                <input type="text" placeholder="634" value={formData.lockNo} onChange={e => setFormData({...formData, lockNo: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">รอบที่</label>
                <input type="number" placeholder="1" value={formData.cycleNo} onChange={e => setFormData({...formData, cycleNo: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">วันที่เริ่มผสม</label>
                <input type="date" disabled={isLocked} value={formData.breedingStartDate} onChange={e => setFormData({...formData, breedingStartDate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">จำนวนการผสม (ครั้ง)</label>
                <input type="number" disabled={isLocked} placeholder="3" value={formData.matingCount} onChange={e => setFormData({...formData, matingCount: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">วันที่เข้าฟัก</label>
                <input type="date" disabled={isLocked} value={formData.incubationDate} onChange={e => setFormData({...formData, incubationDate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">จำนวนไข่ทั้งหมด (ฟอง)</label>
                <input type="number" disabled={isLocked} placeholder="10" value={formData.eggCount} onChange={e => setFormData({...formData, eggCount: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">จำนวนไข่มีเชื้อ (ฟอง)</label>
                <input type="number" disabled={isLocked} placeholder="8" value={formData.fertileEggs} onChange={e => setFormData({...formData, fertileEggs: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">วันที่ฟักออก</label>
                <input type="date" disabled={isLocked} value={formData.hatchDate} onChange={e => setFormData({...formData, hatchDate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 text-green-600">จำนวนลูกไก่ที่ได้ (ตัว)</label>
                <input type="number" disabled={isLocked} placeholder="7" value={formData.chickQuantity} onChange={e => setFormData({...formData, chickQuantity: e.target.value})} className="w-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50" />
              </div>
            </div>
          </div>

          {/* Section 3: Nursery */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center gap-2">
              <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span> ข้อมูลอนุบาล
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">เข้าล็อคอนุบาลวันที่</label>
                <input type="date" value={formData.nurseryDate} onChange={e => setFormData({...formData, nurseryDate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ล็อคอนุบาลที่</label>
                <input type="text" value={formData.nurseryLockNo} onChange={e => setFormData({...formData, nurseryLockNo: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">วัคซีนที่ทำ</label>
                <input type="text" placeholder="ND+iB" value={formData.vaccines} onChange={e => setFormData({...formData, vaccines: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">รอบที่ / จำนวนตัว</label>
                <input type="text" placeholder="รอบ 1 จำนวน 5 ตัว" value={formData.nurseryCycleQty} onChange={e => setFormData({...formData, nurseryCycleQty: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
            </div>
          </div>

          {/* Section 4: Delivery */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center gap-2">
              <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span> ข้อมูลจัดส่ง & หมายเหตุ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">กำหนดส่งลูกไก่วันที่</label>
                <input type="date" value={formData.expectedDeliveryDate} onChange={e => setFormData({...formData, expectedDeliveryDate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">แม่ไก่ส่งกลับวันที่</label>
                <input type="date" value={formData.motherReturnDate} onChange={e => setFormData({...formData, motherReturnDate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">น้ำหนักตอนส่งกลับ (กก.)</label>
                <input type="number" step="0.1" value={formData.motherReturnWeight} onChange={e => setFormData({...formData, motherReturnWeight: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-500 mb-1">หมายเหตุ (เช่น จิกไข่, ไข่เน่า, ตายโคม)</label>
                <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 outline-none resize-none"></textarea>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button type="button" onClick={resetForm} className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              ยกเลิก
            </button>
            <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-slate-900 dark:bg-yellow-500 text-white dark:text-slate-900 font-black rounded-xl shadow-lg hover:bg-slate-800 dark:hover:bg-yellow-400 transition-colors disabled:opacity-50">
              {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {isCheckingStatus ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-bold">กำลังตรวจสอบสถานะ VIP...</p>
        </div>
      ) : (
        isVIP ? renderVIPDashboard() : renderNonVIP()
      )}
      {showForm && renderForm()}
      
      {/* Export Selection Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-4 mb-6">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-500" /> ดาวน์โหลดใบประวัติ VIP
              </h3>
              <button onClick={() => setShowExportModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-3">1. เลือกรูปแบบไฟล์ (Format)</label>
                <div className="flex gap-3">
                  <button onClick={() => setExportFormat('png')} className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${exportFormat === 'png' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <div className="font-black text-xl">PNG</div>
                    <div className="text-xs">รูปภาพความละเอียดสูง</div>
                  </button>
                  <button onClick={() => setExportFormat('pdf')} className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${exportFormat === 'pdf' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <div className="font-black text-xl">PDF</div>
                    <div className="text-xs">เอกสารสำหรับสั่งพิมพ์</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-3">2. เลือกธีมและดีไซน์ (Design Theme)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button onClick={() => setExportTheme('premium')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${exportTheme === 'premium' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-md shadow-yellow-500/20' : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <Crown className="w-6 h-6" />
                    <div className="font-black text-sm">Premium Gold</div>
                    <div className="w-full h-8 bg-gradient-to-br from-yellow-200 to-amber-300 rounded mt-1 border border-yellow-400/30"></div>
                  </button>
                  <button onClick={() => setExportTheme('dark')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${exportTheme === 'dark' ? 'border-slate-700 bg-slate-800 text-white shadow-md' : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <ShieldCheck className="w-6 h-6" />
                    <div className="font-black text-sm">Modern Dark</div>
                    <div className="w-full h-8 bg-slate-900 rounded mt-1 border border-slate-700"></div>
                  </button>
                  <button onClick={() => setExportTheme('classic')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${exportTheme === 'classic' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md shadow-blue-500/10' : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <Layers className="w-6 h-6" />
                    <div className="font-black text-sm">Classic Clean</div>
                    <div className="w-full h-8 bg-white rounded mt-1 border border-slate-200"></div>
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={confirmExport}
              className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg shadow-xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" /> ยืนยันการดาวน์โหลด
            </button>
          </div>
        </div>
      )}

      {/* Hidden Printable Form */}
      {exportingRecord && (
        <div className="fixed -left-[9999px] top-0">
          <div id="printable-form" className={`w-[800px] p-10 font-sans border-8 ${
            exportTheme === 'premium' ? 'bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-400 text-yellow-950' :
            exportTheme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' :
            'bg-white border-yellow-500/20 text-slate-900'
          }`}>
            <div className={`flex justify-between items-center border-b-2 pb-6 mb-6 ${
              exportTheme === 'premium' ? 'border-yellow-500' :
              exportTheme === 'dark' ? 'border-slate-700' :
              'border-yellow-500'
            }`}>
              <div>
                <h1 className={`text-3xl font-black mb-1 ${
                  exportTheme === 'premium' ? 'text-yellow-900' :
                  exportTheme === 'dark' ? 'text-white' :
                  'text-slate-900'
                }`}>ใบประวัติรับฝากผสม VIP</h1>
                <p className={`${
                  exportTheme === 'premium' ? 'text-yellow-700 font-bold' :
                  exportTheme === 'dark' ? 'text-slate-400' :
                  'text-slate-500'
                }`}>ฟาร์มไก่ชนพรีเมียม (Kaichon Plus)</p>
              </div>
              <div className="text-right">
                <div className={`inline-block px-4 py-2 rounded-lg text-lg font-black border ${
                  exportTheme === 'premium' ? 'bg-yellow-200/50 border-yellow-400 text-yellow-900' :
                  exportTheme === 'dark' ? 'bg-slate-800 border-slate-600 text-white' :
                  'bg-slate-100 border-slate-200 text-slate-900'
                }`}>
                  คิวที่: {exportingRecord.queueNo}
                </div>
              </div>
            </div>

            {/* Helper function to style sections based on theme */}
            {(() => {
              const cardBg = exportTheme === 'premium' ? 'bg-white/60 border border-yellow-300 shadow-lg shadow-yellow-900/5' :
                             exportTheme === 'dark' ? 'bg-slate-900 border border-slate-800' :
                             'bg-slate-50 border border-slate-200';
              const headingColor = exportTheme === 'premium' ? 'text-yellow-800 border-yellow-300' :
                                   exportTheme === 'dark' ? 'text-white border-slate-700' :
                                   'text-slate-800 border-slate-200';
              const labelColor = exportTheme === 'premium' ? 'text-yellow-600' :
                                 exportTheme === 'dark' ? 'text-slate-400' :
                                 'text-slate-500';
              
              return (
                <>
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className={`${cardBg} p-6 rounded-xl`}>
                      <h3 className={`text-lg font-bold border-b pb-2 mb-4 ${headingColor}`}>ข้อมูลไก่ชน</h3>
                      <div className="space-y-3 text-sm">
                        <p><span className={`${labelColor} font-bold inline-block w-24`}>พ่อพันธุ์:</span> <span className="font-bold">{exportingRecord.father?.name || '-'}</span></p>
                        <p><span className={`${labelColor} font-bold inline-block w-24`}>แม่พันธุ์:</span> <span className="font-bold">{exportingRecord.motherName || '-'}</span></p>
                        <p><span className={`${labelColor} font-bold inline-block w-24`}>เบอร์ห่วงขา:</span> {exportingRecord.bandNo || '-'}</p>
                        <p><span className={`${labelColor} font-bold inline-block w-24`}>น้ำหนักรับเข้า:</span> {exportingRecord.weight ? `${exportingRecord.weight} กก.` : '-'}</p>
                      </div>
                    </div>

                    <div className={`${cardBg} p-6 rounded-xl`}>
                      <h3 className={`text-lg font-bold border-b pb-2 mb-4 ${headingColor}`}>ข้อมูลการรับฝาก</h3>
                      <div className="space-y-3 text-sm">
                        <p><span className={`${labelColor} font-bold inline-block w-24`}>วันที่รับเข้า:</span> {exportingRecord.intakeDate ? new Date(exportingRecord.intakeDate).toLocaleDateString('th-TH') : '-'}</p>
                        <p><span className={`${labelColor} font-bold inline-block w-24`}>ผู้ดูแล:</span> {exportingRecord.caretaker || '-'}</p>
                        <p><span className={`${labelColor} font-bold inline-block w-24`}>เบอร์ติดต่อ:</span> {exportingRecord.phone || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`${cardBg} p-6 rounded-xl mb-8`}>
                    <h3 className={`text-lg font-bold border-b pb-2 mb-4 ${headingColor}`}>ผลการผสมและการฟัก</h3>
                    <div className="grid grid-cols-3 gap-6 text-sm">
                      <div>
                        <p className={`${labelColor} font-bold mb-1`}>วันที่เริ่มผสม</p>
                        <p className="font-medium">{exportingRecord.breedingStartDate ? new Date(exportingRecord.breedingStartDate).toLocaleDateString('th-TH') : '-'}</p>
                      </div>
                      <div>
                        <p className={`${labelColor} font-bold mb-1`}>จำนวนไข่ทั้งหมด</p>
                        <p className="font-medium">{exportingRecord.eggCount ? `${exportingRecord.eggCount} ฟอง` : '-'}</p>
                      </div>
                      <div>
                        <p className={`${labelColor} font-bold mb-1`}>จำนวนไข่มีเชื้อ</p>
                        <p className="font-medium">{exportingRecord.fertileEggs ? `${exportingRecord.fertileEggs} ฟอง` : '-'}</p>
                      </div>
                      <div>
                        <p className={`${labelColor} font-bold mb-1`}>วันที่ฟัก</p>
                        <p className="font-medium">{exportingRecord.hatchDate ? new Date(exportingRecord.hatchDate).toLocaleDateString('th-TH') : '-'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className={`${labelColor} font-bold mb-1`}>จำนวนลูกไก่ที่ได้</p>
                        <p className={`font-black text-lg ${exportTheme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{exportingRecord.chickQuantity ? `${exportingRecord.chickQuantity} ตัว` : '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className={`${cardBg} p-6 rounded-xl`}>
                      <h3 className={`text-lg font-bold border-b pb-2 mb-4 ${headingColor}`}>ข้อมูลการจัดส่ง</h3>
                      <div className="space-y-3 text-sm">
                        <p><span className={`${labelColor} font-bold inline-block w-32`}>วันที่แม่ส่งกลับ:</span> {exportingRecord.motherReturnDate ? new Date(exportingRecord.motherReturnDate).toLocaleDateString('th-TH') : '-'}</p>
                        <p><span className={`${labelColor} font-bold inline-block w-32`}>วันที่ลูกไก่จัดส่ง:</span> {exportingRecord.expectedDeliveryDate ? new Date(exportingRecord.expectedDeliveryDate).toLocaleDateString('th-TH') : '-'}</p>
                      </div>
                    </div>
                    <div className={`${cardBg} p-6 rounded-xl`}>
                      <h3 className={`text-lg font-bold border-b pb-2 mb-4 ${headingColor}`}>หมายเหตุ</h3>
                      <p className={`text-sm whitespace-pre-wrap ${exportTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{exportingRecord.notes || '-'}</p>
                    </div>
                  </div>
                  <div className={`mt-8 pt-6 border-t border-dashed ${exportTheme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}>
                    <div className="flex justify-between items-center text-sm">
                      <div className={`font-bold ${headingColor}`}>
                        ข้อมูลติดต่อฟาร์ม:
                      </div>
                      <div className={`flex gap-6 ${exportTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-blue-500" /> 08X-XXX-XXXX</span>
                        <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4 text-green-500" /> @kaichonplus</span>
                        <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-blue-600" /> โกวเซ้ม ฟาร์ม</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`mt-6 text-center text-sm ${exportTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    <p>เอกสารรับรองโดย KaiChon Plus System</p>
                    <p className="mt-1">สร้างเมื่อ: {new Date().toLocaleString('th-TH')}</p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default VipBreedingDashboard;
