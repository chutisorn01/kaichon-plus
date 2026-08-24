import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface PromoteModalProps {
  father: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PromoteModal({ father, onClose, onSuccess }: PromoteModalProps) {
  const { language } = useLanguage();
  const [duration, setDuration] = useState<number>(7);
  const [slipImage, setSlipImage] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const getPrice = (days: number) => {
    switch (days) {
      case 7: return 100;
      case 15: return 200;
      case 30: return 350;
      default: return 100;
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSlipImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipImage) {
      setError(language === 'th' ? 'กรุณาอัปโหลดสลิปการโอนเงิน' : 'Please upload payment slip');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fatherId: father._id,
          durationDays: duration,
          amount: getPrice(duration),
          slipImage: slipImage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (language === 'th' ? 'เกิดข้อผิดพลาดในการส่งข้อมูล' : 'Failed to submit promotion request'));
      }

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const t = (th: string, en: string) => (language === 'th' ? th : en);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              🚀 {t('โปรโมทพ่อพันธุ์ขึ้นหน้าแรก', 'Promote Stud Father')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t(`พ่อไก่: ${father.name} (${father.code})`, `Father: ${father.name} (${father.code})`)}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h4 className="text-lg font-bold text-slate-950 dark:text-white mb-2">
              {t('ส่งคำขอโปรโมทสำเร็จ!', 'Submission Successful!')}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('ผู้ดูแลระบบกำลังตรวจสอบสลิปการโอนเงินของท่าน', 'Administrator is verifying your transfer slip')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="flex items-center gap-3 p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-100 dark:border-red-950">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Package Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                1. {t('เลือกแพ็กเกจระยะเวลา', 'Select Duration Package')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[7, 15, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDuration(days)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      duration === days
                        ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 scale-[1.02]'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-lg font-bold">{days} {t('วัน', 'Days')}</span>
                    <span className="text-sm font-semibold mt-1">{getPrice(days)} ฿</span>
                  </button>
                ))}
              </div>
            </div>

            {/* PromptPay QR Code Section */}
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3 text-left">
                2. {t('โอนเงินผ่านระบบพร้อมเพย์ (PromptPay)', 'Transfer via PromptPay')}
              </label>

              {/* PromptPay Header Banner */}
              <div className="mx-auto max-w-[240px] bg-slate-900 text-white py-2 px-4 rounded-2xl flex items-center justify-center gap-2 mb-4 font-bold shadow-sm">
                <span className="text-[#3b82f6] text-lg font-extrabold">prompt</span>
                <span className="text-[#eab308] text-lg font-extrabold">pay</span>
              </div>

              {/* Real QR Code Image */}
              <div className="bg-white p-4 rounded-2xl inline-block shadow-md border border-slate-100 mb-4">
                <img 
                  src="/promptpay-qr.JPG" 
                  alt="QR Code" 
                  className="w-60 h-60 sm:w-64 sm:h-64 mx-auto rounded-xl object-contain"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400">{t('บัญชีรับเงิน', 'Recipient Account')}</p>
                <p className="text-base font-bold text-slate-800 dark:text-slate-100">ธนาคารกสิกรไทย (KBank)</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">187-1-38250-2</p>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">ชื่อบัญชี: ชุติศรณ์ สุตะพันธ์</p>
                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-lg font-extrabold text-red-600 dark:text-red-400">
                    {t('ยอดโอน:', 'Amount:')} {getPrice(duration)}.00 ฿
                  </p>
                </div>
              </div>
            </div>

            {/* Slip Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                3. {t('แนบสลิปโอนเงิน (สลิปชำระเงิน)', 'Upload Transfer Slip')}
              </label>
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="slip-upload-file"
                />
                <label
                  htmlFor="slip-upload-file"
                  className="flex flex-col items-center justify-center w-full min-h-[140px] px-4 py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl hover:border-red-500 hover:bg-red-50/10 dark:hover:bg-red-950/5 transition-all cursor-pointer text-center"
                >
                  {slipImage ? (
                    <div className="space-y-3">
                      <img 
                        src={slipImage} 
                        alt="Slip Preview" 
                        className="max-h-24 mx-auto rounded-xl object-contain shadow-md border border-slate-100 dark:border-slate-800"
                      />
                      <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[280px]">
                        {fileName}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl mb-3">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {t('เลือกภาพสลิปใบเสร็จ', 'Select receipt slip image')}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        JPG, PNG {t('รองรับขนาดไม่เกิน 5MB', 'up to 5MB')}
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-3 px-4 font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all cursor-pointer text-center disabled:opacity-50"
              >
                {t('ยกเลิก', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={isLoading || !slipImage}
                className="flex-1 py-3 px-4 font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl transition-all cursor-pointer text-center shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('กำลังส่งคำขอ...', 'Submitting...')}
                  </span>
                ) : (
                  t('ส่งคำขอโปรโมท', 'Submit Promotion')
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
