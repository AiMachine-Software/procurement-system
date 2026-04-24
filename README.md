# Procurement System (ระบบจัดซื้อจัดจ้าง)

โปรเจคนี้คือระบบจัดการการจัดซื้อจัดจ้าง (Procurement System) ที่พัฒนาด้วย **React** และ **Vite** พร้อมการออกแบบที่ทันสมัยและตอบโจทย์การใช้งาน

---

## 🚀 เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Data Fetching:** [Axios](https://axios-http.com/)
- **Routing:** [React Router 7](https://reactrouter.com/)

---

## 🛠 วิธีเริ่มใช้งานโปรเจค (Getting Started)

### 1. ติดตั้ง Dependencies
เปิด Terminal ในโฟลเดอร์โปรเจคแล้วรันคำสั่ง:
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` ที่ root ของโปรเจค (หรือแก้ไขไฟล์ที่มีอยู่) และกำหนด URL ของ API:
```env
VITE_API_URL=http://your-api-url:8081/api
```

### 3. รันโปรเจคในโหมด Developer
เพื่อเปิดใช้งานเซิร์ฟเวอร์จำลองสำหรับพัฒนา:
```bash
npm run dev
```
หลังจากรันเสร็จ โปรเจคจะเปิดที่ [http://localhost:5173](http://localhost:5173) (หรือตามที่ระบุใน Terminal)

---

## 📦 การ Build สำหรับ Production

เมื่อต้องการนำโปรเจคไปใช้งานจริง (Deploy) ให้ใช้คำสั่ง:

```bash
npm run build
```
ไฟล์ที่ได้จะถูกเก็บไว้ในโฟลเดอร์ `dist/`

---

## 📂 โครงสร้างโปรเจคที่สำคัญ

- `src/routes/`: จัดเก็บหน้าที่แสดงผลตามเส้นทาง (Routes) เช่น Dashboard, Login, Project Detail
- `src/components/`: จัดเก็บ Component ที่นำมาใช้ซ้ำได้
- `public/`: จัดเก็บไฟล์ Static ต่างๆ เช่น รูปภาพ
- `vite.config.js`: ไฟล์ตั้งค่าของ Vite

---

## 💡 คำสั่งอื่นๆ
- `npm run lint`: ตรวจสอบความถูกต้องของ Code ตามกฎ ESLint
- `npm run preview`: พรีวิวโปรเจคที่ Build เสร็จแล้วในเครื่องตัวเอง
