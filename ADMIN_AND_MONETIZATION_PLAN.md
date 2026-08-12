# 📋 แผนงานระบบผู้ดูแลระบบ และระบบโปรโมทสร้างรายได้ (Admin & Monetization Roadmap)
**โครงการ**: KaiChon Plus  
**สถานะบันทึก**: รอดำเนินการพัฒนาในขั้นตอนถัดไป (Drafted Plan)

---

## 🎯 1. ภาพรวมเป้าหมาย (Objectives)
สร้างระบบสำหรับ **`admin` (ผู้ดูแลระบบ)** เพื่อบริหารจัดการสมาชิก การเงิน และรายการโปรโมทซุ้มฟาร์มไก่ชน เพื่อสร้างรายได้ต่อเนื่องให้แพลตฟอร์ม (SaaS / Marketplace Monetization)

---

## 👑 2. การแบ่งสิทธิ์การใช้งาน (Role Architecture)
- **`admin` (ผู้ดูแลระบบ)**:
  - มีสิทธิ์เข้าถึงหน้า **Admin Dashboard** (`/admin`)
  - อนุมัติ / ยกเลิกเครื่องหมายรับรองฟาร์ม **Verified Badge (🔵✔)**
  - ตรวจสอบยอดเงินชำระ และกดอนุมัติการโปรโมทพ่อพันธุ์ขึ้นการ์ด **🔥 PROMOTED** หน้าแรก
  - จัดการรายชื่อสมาชิก ระงับบัญชีผู้ใช้งานที่ทำผิดกฎ
- **`user` (สมาชิกซุ้มฟาร์มทั่วไป)**:
  - บันทึกสายพันธุ์ไก่ชน ออกใบเซอร์ประวัติ
  - กดส่งคำขอโปรโมทพ่อพันธุ์ขึ้นหน้าแรก
  - แก้ไขโปรไฟล์ซุ้มฟาร์ม

---

## 🛠️ 3. สิ่งที่ต้องพัฒนาในส่วนหลังบ้าน (Backend Tasks)

### 3.1 ฐานข้อมูล (Database Schema)
1. **User Schema (`user.model.ts`)**:
   - `role`: enum `['admin', 'user']` (default: `'user'`)
   - `isVerified`: `Boolean` (แอดมินอนุมัติเมื่อยืนยันตัวตน/จ่ายค่าธรรมเนียม)
2. **Father Schema (`father.model.ts`)**:
   - `isPromoted`: `Boolean` (default: `false`)
   - `promotedUntil`: `Date` (วันหมดอายุการโปรโมท)
   - `studFee`: `Number` (ค่าบริการเปิดผสมพันธุ์)
3. **Promotion Schema (`promotion.model.ts`) [NEW]**:
   - `user`: `Ref User`
   - `father`: `Ref Father`
   - `durationDays`: `Number` (7, 15, 30 วัน)
   - `amount`: `Number` (จำนวนเงิน)
   - `slipImage`: `String` (หลักฐานการโอนเงิน)
   - `status`: `enum ['pending', 'approved', 'rejected']`

### 3.2 API Endpoints
- `GET /api/admin/users` - ดึงรายชื่อสมาชิกทั้งหมด
- `PUT /api/admin/users/:id/verify` - กดเปิด/ปิด Verified Badge
- `GET /api/admin/promotions` - ดึงรายการคำขอโปรโมทพ่อพันธุ์
- `PUT /api/admin/promotions/:id/approve` - อนุมัติการโปรโมทพ่อพันธุ์ขึ้นหน้าแรก

---

## 🖼️ 4. สิ่งที่ต้องพัฒนาในส่วนหน้าบ้าน (Frontend Tasks)

1. **Admin Control Center Page (`AdminDashboard.tsx`)**:
   - แท็บ **"จัดการสมาชิก (Users)"**: แสดงตารางซุ้มฟาร์ม + ปุ่มกดสลับ Verified Badge 🔵✔
   - แท็บ **"รายการโปรโมท (Promotions)"**: แสดงรายการสลิปชำระเงิน + ปุ่มกด "อนุมัติขึ้นหน้าแรก"
2. **หน้าโปรโมทฝั่ง User (`PromoteModal.tsx`)**:
   - ปุ่ม **"🚀 โปรโมทขึ้นหน้าแรก"** ในทะเบียนพ่อพันธุ์
   - ป๊อบอัปแสดง QR Code PromptPay สำหรับสแกนจ่ายเงิน + อัปโหลดสลิป
3. **การ์ดโปรโมทหน้าแรก (`Home.tsx`)**:
   - ดึงพ่อพันธุ์ที่มี `isPromoted: true` และยังไม่หมดอายุ ขึ้นมาแสดงในการ์ดไฮไลท์ **🔥 FEATURED**

---

## 📌 ขั้นตอนการเริ่มทำเมื่อคุณพร้อม (Execution Plan)
เมื่อคุณพร้อมพัฒนา ให้แจ้งคำสั่ง:
> *"เริ่มทำระบบ Admin และโปรโมทตามแผนที่บันทึกไว้"*
