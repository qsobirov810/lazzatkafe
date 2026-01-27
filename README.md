# Kafe Epos - O'rnatish va Ishlatish Qo'llanmasi

Ushbu loyiha zamonaviy Kafe avtomatlashtirish tizimi (React + Node.js).
Boshqa kompyuterga ko'chirganda yoki qayta o'rnatganda ushbu ko'rsatmalardan foydalaning.

## 1. Talablar (Prerequisites)
Kompyuteringizda **Node.js** o'rnatilgan bo'lishi shart.
- Tekshirish uchun terminalda: `node -v`

## 2. O'rnatish (Birinchi marta)
Agar loyihani yangi kompyuterga ko'chirsangiz, avval kerakli kutubxonalarni o'rnatish kerak:

1. Asosiy papkada terminal oching va yozing:
   ```bash
   npm install
   ```
2. Keyin `server` papkasiga kirib, u yerda ham o'rnating:
   ```bash
   cd server
   npm install
   ```

## 3. Dasturni Ishga Tushirish
Dastur ishlashi uchun **2 ta terminal** ochish kerak (biri Server, biri Ekran uchun).

### 1-Terminal (Backend Server):
Ma'lumotlar bazasi va real vaqt rejimini ta'minlaydi.
```bash
cd server
node index.js
```
*Kutib turing, "Server running on http://localhost:3000" yozuvi chiqishi kerak.*

### 2-Terminal (Frontend Client):
Kassa va Ofitsiant ekranlarini ochadi.
```bash
npm run dev -- --host
```
*Bu buyruq dasturni tarmoqqa (Wi-Fi) uzatadi.*

---

## 4. Kirish Manzillari

### 💻 Kompyuterda (Kassa / Admin):
Brauzerni ochib kiring:
👉 **[http://localhost:5173/admin](http://localhost:5173/admin)**

**Parollar:**
- **Kassir:** `1111` (Faqat to'lov va tarix)
- **Admin:** `8888` (Menyu va to'liq nazorat)

### 📱 Telefonda (Ofitsiant):
1. Telefon va Kompyuter **bitta Wi-Fi** ga ulangan bo'lishi shart.
2. Kompyuterda terminalda `Network: http://192.168.x.x:5173` degan yozuvni qidiring.
3. Telefonda o'sha manzilni yozing va oxiriga `/waiter` qo'shing.

Misol: `http://192.168.1.38:5173/waiter`

### 👨‍🍳 Oshxona Ekrani:
👉 **[http://localhost:5173/kitchen](http://localhost:5173/kitchen)**

---

## 5. Muammolar yechimi
- **Telefonda ochilmasa:** Wi-Fi bir xil ekanligini tekshiring. Antivirus yoki Firewalldan portlarni ochish kerak bo'lishi mumkin.
- **Ma'lumotlar ko'rinmasa:** 1-Terminalda (Server) xatolik yo'qligini tekshiring.
# kafe-epos
