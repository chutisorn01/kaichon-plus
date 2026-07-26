import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "th" | "en";

interface Translations {
  [key: string]: {
    th: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navigation & Common
  "nav.register": { th: "สมัครสมาชิก", en: "Register" },
  "nav.login": { th: "เข้าสู่ระบบ", en: "Log in" },
  "nav.backHome": { th: "กลับหน้าแรก", en: "Back to Home" },
  "footer.rights": { th: "สงวนลิขสิทธิ์", en: "All rights reserved." },
  
  // Home
  "home.title": { th: "ระบบบันทึกประวัติไก่ชน", en: "Fighting Rooster Record System" },
  "home.subtitle": { 
    th: "จัดการประวัติสายพันธุ์ ประวัติการแข่งขัน และการฉีดวัคซีนได้อย่างมืออาชีพ ค้นหาง่าย ใช้งานสะดวกบนทุกอุปกรณ์ ด้วยดีไซน์พรีเมียม", 
    en: "Manage bloodlines, match records, and vaccination history professionally. Easy to search, accessible on all devices with a premium design." 
  },
  "home.btnStart": { th: "เริ่มต้นใช้งานฟรี", en: "Start for Free" },
  "home.btnFeatures": { th: "ดูฟีเจอร์ทั้งหมด", en: "View All Features" },
  "home.rankingTitle": { th: "พ่อไก่ติดอันดับยอดนิยม", en: "Top Ranking Roosters" },
  "home.viewAll": { th: "ดูทั้งหมด", en: "View All" },
  "home.rank": { th: "อันดับ", en: "Rank" },
  "home.bloodline": { th: "สายพันธุ์", en: "Bloodline" },
  "home.winRecord": { th: "สถิติชนะ", en: "Win Record" },
  "home.fights": { th: "ไฟต์", en: "Fights" },
  
  // Breeds (For Home Page Mock Data)
  "breed.burmeseSaigon": { th: "พม่า-ง่อน", en: "Burmese-Saigon" },
  "breed.saigon": { th: "ไซ่ง่อน", en: "Saigon" },
  "breed.burmese": { th: "พม่า", en: "Burmese" },
  
  // Login
  "login.subtitle": { th: "เข้าสู่ระบบเพื่อจัดการประวัติไก่ชนระดับพรีเมียม", en: "Log in to manage premium fighting rooster records" },
  "login.username": { th: "ชื่อผู้ใช้งาน", en: "Username" },
  "login.usernamePlaceholder": { th: "ป้อนชื่อผู้ใช้งานของคุณ", en: "Enter your username" },
  "login.password": { th: "รหัสผ่าน", en: "Password" },
  "login.passwordPlaceholder": { th: "••••••••", en: "••••••••" },
  "login.remember": { th: "จดจำฉันไว้", en: "Remember me" },
  "login.forgot": { th: "ลืมรหัสผ่าน?", en: "Forgot password?" },
  "login.submit": { th: "เข้าสู่ระบบ", en: "Sign In" },
  "login.or": { th: "หรือ", en: "OR" },
  "login.google": { th: "เข้าสู่ระบบด้วย Google", en: "Sign in with Google" },
  "login.noAccount": { th: "ยังไม่มีบัญชีผู้ใช้อีกเหรอ?", en: "Don't have an account yet?" },
  "login.registerHere": { th: "ลงทะเบียนที่นี่", en: "Register here" },
  "login.errEmpty": { th: "กรุณากรอกข้อมูลให้ครบถ้วน", en: "Please fill in all fields" },
  "login.errInvalid": { th: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง", en: "Invalid username or password" },
  "login.errServer": { th: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", en: "Cannot connect to the server" },
  "login.success": { th: "เข้าสู่ระบบสำเร็จ!", en: "Login successful!" },
  "login.googleAlert": { th: "ฟีเจอร์ล็อกอินด้วย Google จะพร้อมใช้งานหลังอัปเดต Backend", en: "Google Login will be available after Backend update" },

  // Register
  "reg.subtitle": { th: "ลงทะเบียนเพื่อเข้าถึงระบบจัดการไก่ชนแบบครบวงจร", en: "Register to access the comprehensive rooster management system" },
  "reg.fullname": { th: "ชื่อ - นามสกุล", en: "Full Name" },
  "reg.fullnamePlaceholder": { th: "สมชาย ใจสู้", en: "Somchai Jaisoo" },
  "reg.username": { th: "ชื่อผู้ใช้งาน (Username)", en: "Username" },
  "reg.email": { th: "อีเมล", en: "Email Address" },
  "reg.passwordPlaceholder": { th: "อย่างน้อย 8 ตัวอักษร", en: "At least 8 characters" },
  "reg.confirmPassword": { th: "ยืนยันรหัสผ่าน", en: "Confirm Password" },
  "reg.confirmPasswordPlaceholder": { th: "ยืนยันรหัสผ่านอีกครั้ง", en: "Confirm password again" },
  "reg.submit": { th: "สร้างบัญชีผู้ใช้", en: "Create Account" },
  "reg.hasAccount": { th: "มีบัญชีอยู่แล้วใช่ไหม?", en: "Already have an account?" },
  "reg.loginHere": { th: "เข้าสู่ระบบเลย", en: "Log in now" },
  "reg.errLen": { th: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษรเพื่อความปลอดภัย", en: "Password must be at least 8 characters for security" },
  "reg.errMatch": { th: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน", en: "Passwords do not match" },
  "reg.errFail": { th: "ไม่สามารถสมัครสมาชิกได้ โปรดลองอีกครั้ง", en: "Registration failed, please try again" },
  "reg.success": { th: "สมัครสมาชิกสำเร็จ!", en: "Registration successful!" }
};

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

interface LanguageProviderState {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const initialState: LanguageProviderState = {
  language: "th",
  setLanguage: () => null,
  t: () => "",
};

const LanguageContext = createContext<LanguageProviderState>(initialState);

export function LanguageProvider({
  children,
  defaultLanguage = "th",
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem("vite-ui-language") as Language) || defaultLanguage
  );

  useEffect(() => {
    localStorage.setItem("vite-ui-language", language);
  }, [language]);

  const t = (key: string) => {
    if (!translations[key]) {
      console.warn(`Translation key '${key}' not found.`);
      return key;
    }
    return translations[key][language];
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined)
    throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
