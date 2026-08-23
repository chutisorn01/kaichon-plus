import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'th' | 'en';

const translations = {
  th: {
    // Brand & App
    appName: 'KaiChon Plus',
    appSub: 'ระบบบริหารจัดการสายเลือดและสุขภาพฟาร์มไก่ชน',
    
    // Header & Nav
    dashboard: 'แดชบอร์ด',
    fatherRegistry: 'พ่อพันธุ์',
    motherRegistry: 'แม่พันธุ์',
    breedingBatches: 'ชุดผสมพันธุ์',
    chickRegistry: 'ทะเบียนลูกไก่',
    chickBanding: 'ติดกิ๊ฟปีก',
    farmStatistics: 'สถิติฟาร์ม',
    vaccines: 'ตารางวัคซีน',
    profile: 'โปรไฟล์ฟาร์ม',
    logout: 'ออกจากระบบ',
    login: 'เข้าสู่ระบบ',
    register: 'ลงทะเบียน',
    backToHome: 'กลับหน้าแรก',
    
    // Auth & Actions
    username: 'ชื่อผู้ใช้งาน',
    password: 'รหัสผ่าน',
    loginGoogle: 'เข้าสู่ระบบด้วย Google',
    rememberMe: 'จดจำฉันไว้',
    forgotPassword: 'ลืมรหัสผ่าน?',
    noAccount: 'ยังไม่มีบัญชีผู้ใช้อีกเหรอ?',
    registerHere: 'ลงทะเบียนที่นี่',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    search: 'ค้นหา...',
    edit: 'แก้ไข',
    delete: 'ลบ',
    shareLink: 'แชร์ลิงก์',
    
    // Dashboard Cards
    pedigreeSystem: 'ระบบสายเลือด (Pedigree Management)',
    healthSystem: 'ระบบสุขภาพฟาร์ม (Farm Health & Statistics)',
    fathers: 'พ่อพันธุ์',
    mothers: 'แม่พันธุ์',
    batches: 'คอกผสม',
    chicks: 'ลูกไก่',
    publicVerification: 'ผลการค้นหาสาธารณะ',
    verifiedBadge: 'เครื่องหมายรับรองฟาร์ม (Verified Badge)',
    
    // Search Box
    searchPlaceholder: 'ค้นหาด้วยเลขกิ๊ฟ, รหัสสากล (เช่น KCP-001), หรือชื่อฟาร์ม...',
    popularSearches: 'คำค้นยอดนิยม:',

    // Buttons & Features
    btnStart: 'เริ่มต้นใช้งานฟรี',
    btnFeatures: 'ดูฟีเจอร์ทั้งหมด',
    featuredStuds: 'พ่อพันธุ์แนะนำพิเศษ',
    featuredStudsSub: 'พ่อพันธุ์ยอดนิยมที่เปิดรับผสมพันธุ์และรับประกันสายเลือดโดยตรง',
    recommendedCard: 'การ์ดแนะนำ',
    ownerFarm: 'ฟาร์มสมาชิก',
    bloodline: 'สายเลือด',
    studFee: 'ค่าผสมพันธุ์',
    viewPedigree: 'ดูใบประวัติสายเลือด',

    // Dot notation aliases
    'nav.login': 'เข้าสู่ระบบ',
    'nav.register': 'ลงทะเบียน',
    'home.title': 'ระบบบันทึกประวัติไก่ชน',
    'home.subtitle': 'จัดการประวัติสายพันธุ์ ประวัติการแข่งขัน และการฉีดวัคซีนได้อย่างมืออาชีพ ค้นหาง่าย ใช้งานสะดวกบนทุกอุปกรณ์ ด้วยดีไซน์พรีเมียม',
    'home.searchPlaceholder': 'ค้นหาด้วยเลขกิ๊ฟ, รหัสสากล (เช่น KCP-001), หรือชื่อฟาร์ม...',
    'home.btnStart': 'เริ่มต้นใช้งานฟรี',
    'home.btnFeatures': 'ดูฟีเจอร์ทั้งหมด',
    'home.featuredStuds': 'พ่อพันธุ์แนะนำพิเศษ',
    'home.featuredStudsSub': 'พ่อพันธุ์ยอดนิยมที่เปิดรับผสมพันธุ์และรับประกันสายเลือดโดยตรง',
  },
  en: {
    // Brand & App
    appName: 'KaiChon Plus',
    appSub: 'Fighting Chicken Pedigree & Farm Health System',
    
    // Header & Nav
    dashboard: 'Dashboard',
    fatherRegistry: 'Father Registry',
    motherRegistry: 'Mother Registry',
    breedingBatches: 'Breeding Batches',
    chickRegistry: 'Chick Registry',
    chickBanding: 'Wing Banding',
    farmStatistics: 'Farm Statistics',
    vaccines: 'Vaccine Guide',
    profile: 'Farm Profile',
    logout: 'Logout',
    login: 'Sign In',
    register: 'Register',
    backToHome: 'Back to Home',
    
    // Auth & Actions
    username: 'Username',
    password: 'Password',
    loginGoogle: 'Sign in with Google',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    registerHere: 'Register here',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search...',
    edit: 'Edit',
    delete: 'Delete',
    shareLink: 'Share Link',
    
    // Dashboard Cards
    pedigreeSystem: 'Pedigree Management',
    healthSystem: 'Farm Health & Statistics',
    fathers: 'Fathers',
    mothers: 'Mothers',
    batches: 'Batches',
    chicks: 'Chicks',
    publicVerification: 'Public Search Results',
    verifiedBadge: 'Verified Farm Badge',
    
    // Search Box
    searchPlaceholder: 'Search by wing band #, code (e.g. KCP-001), or farm name...',
    popularSearches: 'Popular Searches:',

    // Buttons & Features
    btnStart: 'Start for Free',
    btnFeatures: 'View All Features',
    featuredStuds: 'Featured Studs',
    featuredStudsSub: 'Popular stud roosters open for breeding and directly guaranteed pedigree',
    recommendedCard: 'RECOMMENDED',
    ownerFarm: 'Owner Farm',
    bloodline: 'Bloodline',
    studFee: 'Stud Fee',
    viewPedigree: 'View Pedigree Certificate',

    // Dot notation aliases
    'nav.login': 'Sign In',
    'nav.register': 'Register',
    'home.title': 'Fighting Rooster Record System',
    'home.subtitle': 'Manage bloodlines, match records, and vaccination history professionally. Easy to search, accessible on all devices with a premium design.',
    'home.searchPlaceholder': 'Search by wing band #, code (e.g. KCP-001), or farm name...',
    'home.btnStart': 'Start for Free',
    'home.btnFeatures': 'View All Features',
    'home.featuredStuds': 'Featured Studs',
    'home.featuredStudsSub': 'Popular stud roosters open for breeding and directly guaranteed pedigree',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['th']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('kaichon_lang') as Language;
    return saved === 'en' || saved === 'th' ? saved : 'th';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kaichon_lang', lang);
  };

  const t = (key: keyof typeof translations['th']) => {
    return translations[language][key] || translations['th'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
