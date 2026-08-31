import { SafeImage } from '../ui/SafeImage';
import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { X, Download, ShieldCheck, Trophy, Award, Calendar, Hash, User, Tag, Heart, Phone, MessageCircle, Globe, Star, CheckCircle, BadgeCheck, FileText, Image as ImageIcon } from 'lucide-react';
import { getBandColorCircleClass, getBandTextColorClass, getBandContrastTextClass, getBandBorderColorClass, getBandBgFadedClass } from './ChickenDetail';

interface CertificateModalProps {
 chicken: any;
 onClose: () => void;
}

export default function CertificateModal({ chicken, onClose }: CertificateModalProps) {
 const certificateRef = useRef<HTMLDivElement>(null);
 const containerRef = useRef<HTMLDivElement>(null);
 const [downloadingJpg, setDownloadingJpg] = useState(false);
 const [downloadSuccessJpg, setDownloadSuccessJpg] = useState(false);
 const [downloadingPdf, setDownloadingPdf] = useState(false);
 const [downloadSuccessPdf, setDownloadSuccessPdf] = useState(false);
 const [scale, setScale] = useState(1);

 useEffect(() => {
 const updateScale = () => {
 if (containerRef.current) {
 // Leave some padding (e.g. 32px)
 const containerWidth = containerRef.current.offsetWidth - 32;
 if (containerWidth < 794) {
 setScale(containerWidth / 794);
 } else {
 setScale(1);
 }
 }
 };
 updateScale();
 window.addEventListener('resize', updateScale);
 return () => window.removeEventListener('resize', updateScale);
 }, []);

 const handleDownload = async () => {
 if (!certificateRef.current) return;
 
 try {
 setDownloadingJpg(true);
 setDownloadSuccessJpg(false);
 
 const canvas = await html2canvas(certificateRef.current, {
 backgroundColor: '#0f172a',
 scale: 2.5,
 useCORS: true,
 allowTaint: true,
 logging: false
 });
 const image = canvas.toDataURL('image/jpeg', 0.95);
 
 const fileName = `Certificate_${chicken.code || 'Kaichon'}.jpg`;
 let shared = false;

 // 1) ลองใช้ Web Share API (สำหรับมือถือ iOS/Android จะเด้งเมนูให้ Save Image หรือแชร์ต่อได้)
 if (navigator.share) {
 try {
 const res = await fetch(image);
 const blob = await res.blob();
 const file = new File([blob], fileName, { type: 'image/jpeg' });
 
 if (navigator.canShare && navigator.canShare({ files: [file] })) {
 await navigator.share({
 files: [file],
 title: 'ใบเซอร์ไก่ชน',
 text: `ใบเซอร์ประวัติไก่ชน ${chicken.name || ''}`
 });
 shared = true;
 }
 } catch (shareError: any) {
 // ผู้ใช้กดยกเลิก Share (AbortError) ไม่ต้องทำ Fallback
 if (shareError.name === 'AbortError' || shareError.message.includes('abort')) {
 shared = true;
 } else {
 console.error('Share API Error:', shareError);
 }
 }
 }
 
 // 2) Fallback สำหรับ Desktop หรือเบราว์เซอร์ที่ไม่รองรับ Share API
 if (!shared) {
 const res = await fetch(image);
 const blob = await res.blob();
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = fileName;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 setTimeout(() => URL.revokeObjectURL(url), 100);
 }
 
 setDownloadSuccessJpg(true);
 setTimeout(() => setDownloadSuccessJpg(false), 3000);
 } catch (error) {
 console.error('Error generating certificate:', error);
 alert('เกิดข้อผิดพลาดในการสร้างใบเซอร์ กรุณาลองใหม่อีกครั้ง');
 } finally {
 setDownloadingJpg(false);
 }
 };

 const handleDownloadPdf = async () => {
 if (!certificateRef.current) return;
 
 try {
 setDownloadingPdf(true);
 setDownloadSuccessPdf(false);
 
 const canvas = await html2canvas(certificateRef.current, {
 backgroundColor: '#0f172a',
 scale: 2.5,
 useCORS: true,
 allowTaint: true,
 logging: false
 });
 const image = canvas.toDataURL('image/jpeg', 0.95);
 
 const pdf = new jsPDF('p', 'mm', 'a4');
 const pdfWidth = pdf.internal.pageSize.getWidth();
 pdf.addImage(image, 'JPEG', 0, 0, pdfWidth, (1123 * pdfWidth) / 794);
 
 const fileName = `Certificate_${chicken.code || 'Kaichon'}.pdf`;
 let shared = false;

 if (navigator.share) {
 try {
 const blob = pdf.output('blob');
 const file = new File([blob], fileName, { type: 'application/pdf' });
 if (navigator.canShare && navigator.canShare({ files: [file] })) {
 await navigator.share({
 files: [file],
 title: 'ใบเซอร์ไก่ชน PDF',
 text: `ใบเซอร์ประวัติไก่ชน ${chicken.name || ''} (PDF)`
 });
 shared = true;
 }
 } catch (shareError: any) {
 if (shareError.name === 'AbortError' || shareError.message.includes('abort')) {
 shared = true;
 } else {
 console.error('Share API Error:', shareError);
 }
 }
 }

 if (!shared) {
 pdf.save(fileName);
 }
 
 setDownloadSuccessPdf(true);
 setTimeout(() => setDownloadSuccessPdf(false), 3000);
 } catch (error) {
 console.error('Error generating PDF:', error);
 alert('เกิดข้อผิดพลาดในการสร้างใบเซอร์ กรุณาลองใหม่อีกครั้ง');
 } finally {
 setDownloadingPdf(false);
 }
 };

 const getGenderText = (gender: string) => {
 if (gender === 'male' || gender === 'ผู้') return 'เพศผู้';
 if (gender === 'female' || gender === 'เมีย') return 'เพศเมีย';
 return 'ไม่ระบุ';
 };

 const certUrl = `${window.location.origin}/chicken-detail/${chicken._id}`;
 // Use a reliable API for QR code to bypass any React rendering issues
 const qrCodeUrl = `https://quickchart.io/qr?size=150&text=${encodeURIComponent(certUrl)}`;
 const certDate = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

 return (
 <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-300">
 <div className="relative w-full max-w-3xl flex flex-col items-center h-full">
 {/* Controls */}
 <div className="w-full flex justify-between items-center mb-4 shrink-0">
 <button 
 onClick={onClose}
 className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors "
 >
 <X className="w-6 h-6" />
 </button>
 
 <div className="flex gap-2">
 <button 
 onClick={handleDownload}
 disabled={downloadingJpg}
 className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
 downloadSuccessJpg 
 ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
 : 'bg-white text-slate-800 hover:bg-slate-100 shadow-white/20'
 }`}
 >
 {downloadSuccessJpg ? (
 <CheckCircle className="w-5 h-5 text-emerald-50" />
 ) : downloadingJpg ? (
 <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
 ) : (
 <ImageIcon className="w-5 h-5" />
 )}
 {downloadSuccessJpg ? 'สำเร็จ!' : 'บันทึก JPG'}
 </button>
 <button 
 onClick={handleDownloadPdf}
 disabled={downloadingPdf}
 className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
 downloadSuccessPdf 
 ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
 : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white shadow-red-500/20'
 }`}
 >
 {downloadSuccessPdf ? (
 <CheckCircle className="w-5 h-5" />
 ) : downloadingPdf ? (
 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 ) : (
 <FileText className="w-5 h-5" />
 )}
 {downloadSuccessPdf ? 'สำเร็จ!' : 'บันทึก PDF'}
 </button>
 </div>
 </div>

 {/* Certificate Preview Wrapper - Scaled perfectly for screen */}
 <div 
 ref={containerRef}
 className="w-full flex-1 flex justify-center items-start overflow-auto custom-scrollbar pb-10"
 >
 {/* Scaled Container Height placeholder so it doesn't overflow its wrapper incorrectly */}
 <div style={{ height: `${1123 * scale}px`, width: `${794 * scale}px`, position: 'relative' }}>
 {/* WRAPPER FOR SCALING (so the actual certificate is unscaled for html-to-image) */}
 <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
 {/* THE ACTUAL CERTIFICATE (A4 Portrait 794 x 1123 px) */}
 <div 
 ref={certificateRef}
 className="w-[794px] h-[1123px] bg-slate-900 relative overflow-hidden rounded-sm shadow-2xl flex flex-col border-[12px] border-slate-800 origin-top-left"
 style={{ fontFamily: "'Inter', sans-serif" }}
 >
 {/* Background Gradient Fixed for iOS */}
 <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)' }}></div>
 {/* Ornate Border Overlay */}
 <div className="absolute inset-4 border-[4px] border-amber-500/30 rounded-lg pointer-events-none z-10"></div>
 <div className="absolute inset-5 border-[1px] border-amber-500/20 rounded-md pointer-events-none z-10"></div>
 
 {/* Corner Accents */}
 <div className="absolute top-4 left-4 w-12 h-12 border-t-[4px] border-l-[4px] border-amber-400 z-10"></div>
 <div className="absolute top-4 right-4 w-12 h-12 border-t-[4px] border-r-[4px] border-amber-400 z-10"></div>
 <div className="absolute bottom-4 left-4 w-12 h-12 border-b-[4px] border-l-[4px] border-amber-400 z-10"></div>
 <div className="absolute bottom-4 right-4 w-12 h-12 border-b-[4px] border-r-[4px] border-amber-400 z-10"></div>

 {/* Background Watermark */}
 <div className="absolute inset-0 flex items-center justify-center opacity-25 z-0 pointer-events-none overflow-hidden">
 {chicken.user?.profileImage || chicken.user?.coverImage ? (
 <SafeImage crossOrigin="anonymous" src={chicken.user.coverImage || chicken.user.profileImage} alt="Watermark" className="w-full h-full object-cover" />
 ) : (
 <ShieldCheck className="w-[600px] h-[600px] text-amber-500/50" />
 )}
 </div>

 {/* Bottom-up Dark Fade Overlay (70% opacity at bottom) */}
 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-slate-900/40 to-transparent pointer-events-none z-[5]"></div>

 {/* Header */}
 <div className="pt-8 pb-0 text-center relative z-20">
 <h1 
 className="text-6xl font-black text-amber-300 tracking-widest mb-0 pt-6 pb-2"
 style={{ fontFamily: "'Charm', cursive", lineHeight: '1.4' }}
 >
 {chicken.user?.farmName || chicken.user?.name || 'KAICHON PLUS'}
 </h1>
 <div className="inline-flex items-center justify-center mt-3 relative group">
 {/* Decorative glowing background */}
 <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 blur-md rounded-full"></div>
 
 {/* Main Pill */}
 <div className="relative px-8 py-1.5 rounded-full bg-gradient-to-r from-slate-800/80 via-slate-800/90 to-slate-800/80 border border-amber-500/30 shadow-inner overflow-hidden">
 {/* Shine effect */}
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
 
 <h2 className="text-sm font-black text-amber-300 tracking-[0.2em] relative z-10 ">
 ใบประวัติรับรองสายพันธุ์
 </h2>
 </div>
 </div>
 <div className="flex items-center justify-center mt-2">
 <div className="h-[1px] w-32 bg-gradient-to-r from-transparent to-amber-500/50"></div>
 <Award className="w-6 h-6 text-amber-400 mx-4" />
 <div className="h-[1px] w-32 bg-gradient-to-l from-transparent to-amber-500/50"></div>
 </div>
 </div>

 {/* Main Content Area */}
 <div className="flex-1 px-16 flex flex-col relative z-20 gap-3">
 
 {/* Photo & Basic Info Block */}
 <div className="flex items-center justify-between w-full bg-slate-800/20 py-2 px-6 rounded-3xl border border-slate-700/30 shadow-lg">
 <div className="flex items-center gap-8">
 {/* Royal Photo Frame */}
 <div className="w-40 h-40 bg-gradient-to-br from-amber-200 via-amber-500 to-amber-800 rounded-3xl p-[4px] shadow-lg relative shrink-0">
 <div className="absolute inset-0 rounded-3xl border border-white/40 m-1 z-20 pointer-events-none"></div>
 <div className="w-full h-full rounded-[24px] bg-slate-900 overflow-hidden shadow-inner relative z-10">
 {chicken.image ? (
 <SafeImage crossOrigin="anonymous" src={chicken.image} alt="Chicken" className="w-full h-full object-cover" />
 ) : (
 <Trophy className="w-16 h-16 opacity-50 text-slate-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
 )}
 </div>
 </div>

 <div className="flex flex-col items-start justify-center">
 <div className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
 <Star className="w-3.5 h-3.5" /> Gamefowl Profile
 </div>
 <h3 className={`${(chicken.name || '').length > 15 ? 'text-xl md:text-2xl' : 'text-3xl'} font-black text-white mb-1.5 leading-tight line-clamp-2 break-words max-w-[350px]`}>
 {chicken.name}
 </h3>
 {chicken.code && (
 <div className="bg-slate-800/60 text-slate-200 font-bold px-3 py-0.5 rounded-md text-[11px] tracking-wider border border-slate-700/50 shadow-sm max-w-[500px] leading-relaxed mt-0.5 flex items-center flex-wrap">
 <span className="text-amber-500/80 mr-1.5 uppercase text-[10px] shrink-0">ID:</span>
 <span className="break-all md:break-words">{chicken.code}</span>
 </div>
 )}
 </div>
 </div>

 {/* Right: Signature/Stamp */}
 <div className="flex flex-col items-center justify-center relative mt-2 pr-4">
 {chicken.user?.signatureImage ? (
 <SafeImage crossOrigin="anonymous" src={chicken.user.signatureImage} alt="Signature" className="h-12 object-contain " />
 ) : (
 <div className="text-3xl text-amber-400 -rotate-6 pb-1" style={{ fontFamily: "'Charm', cursive" }}>
 {chicken.user?.farmName || chicken.user?.name || 'ชุติศรณ์ ฟาร์ม'}
 </div>
 )}
 <div className="w-40 h-[1px] bg-gradient-to-r from-transparent via-amber-500/80 to-transparent mb-1"></div>
 <div className="text-[9px] text-amber-500/90 uppercase tracking-widest font-bold">
 Authorized Signature
 </div>
 <div className="mt-1 text-[10px] font-mono font-bold text-amber-400/90 tracking-wider bg-slate-950/70 px-2.5 py-0.5 rounded border border-amber-500/30 shadow-sm whitespace-nowrap z-20">
 KP-{chicken._id.substring(12, 18).toUpperCase()}-{chicken._id.substring(18, 24).toUpperCase()}
 </div>
 
 {/* Fake Stamp Background */}
 {chicken.user?.stampText !== '' && (
 <div className="absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[60%] w-20 h-20 border-2 border-red-500/70 rounded-full flex items-center justify-center -z-10 rotate-12 bg-red-500/5 mix-blend-screen shadow-lg">
 <div className="text-red-500/70 text-[9px] font-black uppercase text-center leading-tight tracking-widest px-2 ">
 {(chicken.user?.stampText || 'ORIGINAL BREED').split(' ').map((word: string, i: number) => (
 <React.Fragment key={i}>
 {word}
 {i < (chicken.user?.stampText || 'ORIGINAL BREED').split(' ').length - 1 && <br/>}
 </React.Fragment>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Details Grid */}
 <div className="grid grid-cols-2 gap-1.5 shrink-0">
 <div className={`${getBandBgFadedClass(chicken.bandColor || 'แดง')} px-2 py-1.5 rounded-xl border ${getBandBorderColorClass(chicken.bandColor || 'แดง')} flex flex-col justify-center shadow-md overflow-hidden relative`}>
 <span className={`text-[10px] ${getBandTextColorClass(chicken.bandColor || 'แดง')} opacity-80 uppercase tracking-wider mb-0.5 font-bold`}>เบอร์กิ๊ฟปีก</span>
 <div className="flex items-center gap-1.5 w-full overflow-hidden mt-1 relative z-10">
 {chicken.bandNumber ? (
 <>
 <div className={`w-1.5 h-1.5 rounded-full shrink-0 shadow-sm ${getBandColorCircleClass(chicken.bandColor || 'แดง')}`}></div>
 
 <span className={`text-[14px] font-black text-white tracking-widest leading-normal shrink-0 `}>
 {chicken.bandNumber}
 </span>
 
 <span className={`text-[12px] font-bold text-white border-l border-white/30 pl-2 ml-0.5 truncate flex-1 tracking-wide leading-normal pb-1`}>
 {chicken.bandText || chicken.user?.farmName || chicken.user?.name || 'ฟาร์ม'}
 </span>
 
 <span className={`text-[9px] font-bold ${getBandTextColorClass(chicken.bandColor || 'แดง')} opacity-80 shrink-0 leading-normal pb-1`}>
 (กิ๊ฟสี{chicken.bandColor || 'แดง'})
 </span>
 </>
 ) : (
 <span className="text-sm font-bold text-amber-400">-</span>
 )}
 </div>
 {/* Faint color glow at the bottom */}
 <div className={`absolute bottom-0 right-0 w-16 h-16 blur-xl rounded-full opacity-30 pointer-events-none ${getBandColorCircleClass(chicken.bandColor || 'แดง')}`}></div>
 </div>
 
 <div className="bg-slate-800/40 px-2 py-1.5 rounded-xl border border-slate-700/50 flex flex-col justify-center shadow-md">
 <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">เพศ</span>
 <span className="text-sm font-bold text-slate-200">{getGenderText(chicken.gender)}</span>
 </div>
 
 <div className="bg-slate-800/40 px-2 py-1.5 rounded-xl border border-slate-700/50 flex flex-col justify-center shadow-md">
 <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">วันเกิด/ฟัก</span>
 <span className="text-sm font-bold text-slate-200">
 {chicken.hatchDate ? new Date(chicken.hatchDate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
 </span>
 </div>
 
 <div className="bg-slate-800/40 px-2 py-1.5 rounded-xl border border-slate-700/50 flex flex-col justify-center shadow-md">
 <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Breeder / ฟาร์มเพาะพันธุ์</span>
 <span className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
 {chicken.user?.isVerified === true && (
 <BadgeCheck className="w-4 h-4 text-white fill-blue-500 shrink-0" />
 )}
 {chicken.user?.farmName || chicken.user?.name || 'ฟาร์มสมาชิก'}
 </span>
 </div>

 {chicken.status === 'ขายแล้ว' && chicken.saleInfo?.customerName && (
 <div className="col-span-2 bg-slate-800/60 px-3 py-2 rounded-xl border border-amber-500/30 flex items-center justify-between relative overflow-hidden shadow-inner mt-0.5">
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent"></div>
 <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest relative z-10 shrink-0 flex items-center gap-1.5">
 <Award className="w-3.5 h-3.5 text-amber-500" />
 เจ้าของใหม่
 </span>
 <div className="flex items-center gap-2 relative z-10 min-w-0 justify-end">
 <span className="text-sm font-black text-white flex items-center truncate">
 {chicken.saleInfo.customerName} {chicken.saleInfo.customerFarm ? <span className="text-amber-200/90 font-bold ml-1 text-xs">({chicken.saleInfo.customerFarm})</span> : ''}
 </span>
 {chicken.saleInfo.customerPhone && (
 <span className="text-[10px] text-amber-500/70 tracking-wider shrink-0 border-l border-amber-500/30 pl-2">
 {chicken.saleInfo.customerPhone}
 </span>
 )}
 </div>
 </div>
 )}
 </div>

 {/* Pedigree Tree */}
 <div className="mt-0 flex-1 flex flex-col items-center w-full">
 <h4 className="text-[13px] font-bold text-amber-500/70 tracking-widest uppercase mb-2 text-center border-b border-amber-500/20 pb-1 w-full">
 Pedigree Tree / ผังสายเลือด
 </h4>
 
 <div className="flex flex-col items-center w-full relative">
 {/* Parents Row */}
 <div className="flex w-full justify-center gap-28 relative z-10">
 
 {/* Horizontal Connection Line (Spans only the gap, touching box edges) */}
 <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-28 h-[2px] bg-gradient-to-r from-blue-500/50 via-amber-500/50 to-pink-500/50 z-0">
 {/* Center Dot */}
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-amber-500 border-2 border-amber-500 rounded-full shadow-lg"></div>
 </div>
 
 {/* Vertical Drop Line (Reaches exactly the top edge of Subject card) */}
 <div className="absolute top-[45%] left-1/2 h-[calc(55%+8px)] w-[2px] bg-gradient-to-b from-amber-500/50 to-amber-500/10 z-0"></div>

 {/* Sire (Father) */}
 <div className="w-[220px] min-w-[220px] shrink-0 bg-gradient-to-b from-blue-900/40 to-slate-900/90 border border-blue-500/40 px-3 pt-4 pb-2 rounded-2xl shadow-lg relative z-10 text-center">
 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-700 to-blue-500 border border-blue-400 text-white text-[11px] font-black uppercase tracking-widest px-4 py-0.5 rounded-full shadow-lg">
 Sire (พ่อ)
 </div>
 {chicken.father?.image ? (
 <div className="w-16 h-16 mx-auto mb-2 rounded-full border-[3px] border-blue-500/50 overflow-hidden shadow-lg">
 <SafeImage crossOrigin="anonymous" src={chicken.father.image} alt={chicken.father.name} className="w-full h-full object-cover" />
 </div>
 ) : (
 <div className="w-16 h-16 mx-auto mb-2 rounded-full border-[3px] border-blue-500/20 bg-blue-900/30 flex items-center justify-center shadow-lg">
 <Trophy className="w-6 h-6 text-blue-400/50" />
 </div>
 )}
 <div className="text-base font-black text-white mb-0 leading-snug break-words px-1 line-clamp-2">
 {chicken.father?.name || chicken.fatherNameText || 'ไม่ระบุ'}
 </div>
 {chicken.father?.code && (
 <div className="text-[9px] text-blue-200/50 font-mono mt-0.5 tracking-wider break-all max-w-full px-2">
 ID: {chicken.father.code}
 </div>
 )}
 </div>

 {/* Dam (Mother) */}
 {/* Dam (Mother) */}
 <div className="w-[220px] min-w-[220px] shrink-0 bg-gradient-to-b from-pink-900/40 to-slate-900/90 border border-pink-500/40 px-3 pt-4 pb-2 rounded-2xl shadow-lg relative z-10 text-center">
 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-700 to-pink-500 border border-pink-400 text-white text-[11px] font-black uppercase tracking-widest px-4 py-0.5 rounded-full shadow-lg">
 Dam (แม่)
 </div>
 {chicken.mother?.image ? (
 <div className="w-16 h-16 mx-auto mb-2 rounded-full border-[3px] border-pink-500/50 overflow-hidden shadow-lg">
 <SafeImage crossOrigin="anonymous" src={chicken.mother.image} alt={chicken.mother.name} className="w-full h-full object-cover" />
 </div>
 ) : (
 <div className="w-16 h-16 mx-auto mb-2 rounded-full border-[3px] border-pink-500/20 bg-pink-900/30 flex items-center justify-center shadow-lg">
 <Heart className="w-6 h-6 text-pink-400/50" />
 </div>
 )}
 <div className="text-base font-black text-white mb-0 leading-snug break-words px-1 line-clamp-2">
 {chicken.mother?.name || chicken.motherNameText || 'ไม่ระบุ'}
 </div>
 {chicken.mother?.code && (
 <div className="text-[9px] text-pink-200/50 font-mono mt-0.5 tracking-wider break-all max-w-full px-2">
 ID: {chicken.mother.code}
 </div>
 )}
 </div>
 </div>
 
 {/* Subject (Child) */}
 {/* Subject (Child) */}
 <div className="w-[240px] min-w-[240px] shrink-0 bg-gradient-to-b from-amber-600/30 to-slate-900/90 border-2 border-amber-500/60 px-4 pt-3 pb-2 rounded-2xl shadow-lg relative z-10 text-center mt-2">
 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-4 py-0.5 rounded-full shadow-lg">
 Subject
 </div>
 <div className="text-lg font-black text-white mb-0 leading-snug break-words px-1 line-clamp-2">
 {chicken.name}
 </div>
 <div className="text-[10px] text-amber-200/50 font-mono mt-0.5 tracking-wider break-all max-w-full px-2">
 ID: {chicken.code}
 </div>
 {chicken.siblingCount > 0 && (
 <div className="mt-1.5">
 <div className="text-[9px] text-amber-300/90 font-medium bg-amber-900/40 border border-amber-500/30 px-2.5 py-0.5 rounded-full inline-block shadow-inner">
 มีคู่เกิดรวมชุดนี้ {chicken.siblingCount} ตัว
 </div>
 </div>
 )}
 </div>
 </div>
 
 </div>

 {/* Official Signature & Slogan */}
 <div className="flex-1 flex flex-col items-center justify-center relative z-20 w-full min-h-[100px] py-2">
 <div className="flex items-center justify-center w-full px-16">
 {/* Slogan */}
 <div className="flex flex-col items-center justify-center text-center relative max-w-full">
 <div className="text-2xl font-bold text-amber-500 tracking-wide z-10 px-4 pt-2 pb-1 leading-loose" style={{ fontFamily: "'Charm', cursive" }}>
 {chicken.user?.description || 'พันธุกรรมโคตรเบอร์แข้ง สายเลือดมังกร'}
 </div>
 <div className="text-[9px] text-slate-500/80 uppercase tracking-widest mt-1 font-bold">
 Premium Quality Guaranteed
 </div>
 </div>
 </div>
 </div>

 </div>

 {/* Footer with Verification and Breeder Info */}
 <div className="h-[130px] px-12 pb-10 flex items-end justify-center relative z-20 mt-auto shrink-0">
 <div className="w-full h-full bg-slate-900/95 border border-amber-500/20 rounded-2xl pl-8 pr-4 py-4 flex items-center justify-between shadow-2xl relative overflow-hidden shadow-amber-500/5">
 <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 pointer-events-none"></div>
 
 {/* Left Block: Seal + Breeder Info */}
 <div className="flex items-center gap-6 relative z-10 flex-1 min-w-0 pr-4">
 {/* Seal */}
 {chicken.user?.profileImage && (
 <div className="flex flex-col items-center justify-center shrink-0">
 <div className="w-12 h-12 rounded-full border-2 border-amber-500/50 p-1 mb-1 bg-slate-900 shadow-lg">
 <SafeImage crossOrigin="anonymous" src={chicken.user.profileImage} alt="Farm Logo" className="w-full h-full object-cover rounded-full" />
 </div>
 <div className="text-[8px] text-amber-500/80 uppercase tracking-widest font-bold max-w-[64px] text-center truncate">
 {chicken.user?.farmName || chicken.user?.name || 'Official Seal'}
 </div>
 </div>
 )}

 {/* Contact Info */}
 <div className="flex flex-col items-start justify-center min-w-0 flex-1 h-full">
 
 {/* Contacts Row */}
 <div className="flex flex-col gap-y-2.5 w-full">
 {chicken.user?.phone && (
 <div className="flex items-center gap-2 text-xs text-amber-200/90 font-mono shrink-0">
 <Phone className="w-4 h-4 text-amber-500 shrink-0" /> <span className="truncate">{chicken.user.phone}</span>
 </div>
 )}
 {chicken.user?.lineId && (
 <div className="flex items-center gap-2 text-xs text-amber-200/90 font-mono shrink-0">
 <MessageCircle className="w-4 h-4 text-green-500 shrink-0" /> <span className="truncate">{chicken.user.lineId}</span>
 </div>
 )}
 {chicken.user?.facebook && (
 <div className="flex items-center gap-2 text-xs text-amber-200/90 font-mono shrink-0">
 <Globe className="w-4 h-4 text-blue-500 shrink-0" /> <span className="truncate">{chicken.user.facebook}</span>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Right Block: Verification */}
 <div className="flex items-center justify-end relative z-10 shrink-0 gap-5 text-right pl-6 border-l border-amber-500/10">
 <div className="flex flex-col items-end justify-center">
 <div className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest mb-1">
 Scan to Verify
 </div>
 <div className="text-[9px] text-slate-400 max-w-[130px] mb-2 leading-tight">
 สแกนเพื่อตรวจสอบประวัติสายเลือดออนไลน์
 </div>
 <div className="text-[8px] text-amber-600/70 font-bold tracking-widest uppercase">
 Powered by Kaichon Plus
 </div>
 </div>

 <div className="flex flex-col items-center shrink-0">
 <div className="bg-white p-1.5 rounded-lg shadow-lg w-[70px] h-[70px] flex items-center justify-center">
 <SafeImage crossOrigin="anonymous" src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain rounded-sm" />
 </div>
 </div>
 </div>
 
 </div>
 </div>

 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
