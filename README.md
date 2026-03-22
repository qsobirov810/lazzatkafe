# Kafe Epos - O'rnatish va Ishlatish Qo'llanmasi

Ushbu loyiha zamonaviy Kafe avtomatlashtirish tizimi (React + Node.js).
Boshqa kompyuterga ko'chirganda yoki qayta o'rnatganda ushbu ko'rsatmalardan foydalaning.

## 1. Talablar (Prerequisites)
Yangi kompyuterda loyihani ishga tushirish uchun quyidagilar o'rnatilgan bo'lishi shart:
1. **Node.js** (v18 yoki undan yuqori versiya tavsiya etiladi). Tekshirish uchun: `node -v`
2. **Git** (Dasturni GitHubdan ko'chirib olish uchun).
3. **Ngrok** (Ixtiyoriy - loyihani vaqtinchalik internetga chiqarish, mijozga ko'rsatish uchun).
## 2. GitHubdan Yuklab Olish (Loyihani ko'chirish)
Yangi kompyuterda loyihani ishga tushirish uchun avval uni ko'chirib olish kerak:
1. Terminalni oching (xohlagan papkada).
2. Buyruqni yozing:
   ```bash
   git clone https://github.com/qsobirov810/kafe-epos.git
   ```
3. Papka ichiga kiring:
   ```bash
   cd kafe-epos
   ```

## 3. O'rnatish (Birinchi marta)
Loyihani ko'chirib olgach, kerakli kutubxonalarni o'rnatish kerak:

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
Endi dasturni ishga tushirish juda oson. **Faqat bitta terminal** yetarli.

1. Asosiy papkada terminal oching.
2. Quyidagi buyruqni yozing:
   ```bash
   npm start
   ```

*Bu buyruq avtomatik ravishda Serverni ham, Ekranni ham bitta joyda ishga tushiradi.*
*Agar to'xtatmoqchi bo'lsangiz: `Ctrl + C` tugmasini bosing.*

---

## 4. Kirish Manzillari

### 💻 Kompyuterda (Kassa / Admin):
Brauzerni ochib kiring:
👉 **[http://localhost:5173/admin](http://localhost:5173/admin)**

**Parollar:**
- **Kassir:** `1111` (Faqat to'lov va tarix)
- **Admin:** `8888` (Menyu va to'liq nazorat)

### 📱 Telefonda (Ofitsiant) tarmog'iga ulanish:
1. Telefon va Asosiy Kompyuter (Kassa) **bitta Wi-Fi tarmog'iga** ulangan bo'lishi shart.
2. Hozirgi kompyuteringizning IP manzili **192.168.1.2** ekanligini hisobga olsak, telefoningizdagi brauzerga (Chrome, Safari va h.k.) quyidagi manzilni yozib kiring:
   👉 **http://192.168.1.2:5173**

*(Eslatma: Agar internet yoki router o'zgarsa, IP ham o'zgarishi mumkin. Buni bilish uchun terminalda `npm start` qilingan payti `Network: http://192.168.x.x:5173/` degan yozuvga qaraysiz).*

3. Xuddi kompyuterdagidek Login ekrani ochiladi.
4. Admin panelidagi **"Xodimlar"** bo'limida yaratilgan, tasdiqlangan **Ofitsiant** login va parolini tering.
5. Tizim sizni avtomatik ravishda Ofitsiant paneliga olib kiradi (Bu orqali bemalol stollar atrofida yurib buyurtma olishingiz mumkin).

### 👨‍🍳 Oshxona Ekrani:
👉 **[http://localhost:5173/kitchen](http://localhost:5173/kitchen)**

---

## 5. Muammolar yechimi
- **Telefonda ochilmasa:** Wi-Fi bir xil ekanligini tekshiring. Antivirus yoki Firewalldan portlarni ochish kerak bo'lishi mumkin.
- **Ma'lumotlar ko'rinmasa:** 1-Terminalda (Server) xatolik yo'qligini tekshiring.

## 6. Server Konfiguratsiyasi (Xavfsizlik)
Server `.env` fayli orqali sozlanadi.
- **Fayl joylashuvi:** `server/.env`
- **Asosiy Login Parol:** `admin123` (Agar o'zgartirilmagan bo'lsa)
- **Parolni o'zgartirish:** `server/.env` faylida `ADMIN_PASSWORD` ni o'zgartiring.

### Login Sahifasi
- **Manzil:** `http://localhost:5173/login`
- **Admin Parol:** `admin123`

---

## 7. Real Serverga Joylashtirish (VPS / Domain)

Loyihani internetda (haqiqiy serverda) ishlatish uchun quyidagi qadamlarni bajaring:

### A. Frontendni tayyorlash (Build)
1. `.env.production` faylida `VITE_API_URL` ni o'z domeningizga o'zgartiring:
   ```env
   VITE_API_URL=https://api.sizningdomeningiz.uz
   ```
2. Loyihani build qiling:
   ```bash
   npm run build
   ```
   *Bu `dist` papkasini yaratadi. Ushbu papkani serveringizning `public_html` yoki tegishli joyiga yuklang.*

### B. Backendni sozlash (PM2)
Serveringizda backend doimiy ishlashi uchun **PM2** dan foydalaning:
1. Serverga kiring va `server` papkasiga o'ting.
2. PM2 orqali ishga tushiring:
   ```bash
   npm install -g pm2
   pm2 start index.js --name "kafe-api"
   pm2 save
   ```

### C. Nginx Sozlamalari (SSL va Domen)
Nginx orqali domenni ulash uchun misol (conf fayli):
```nginx
server {
    server_name api.sizningdomeningiz.uz;

    location / {
        proxy_pass http://localhost:3000; # Backend porti
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### D. Muhim eslatmalar
- **SSL (HTTPS):** `Certbot` orqali bepul SSL oling (`sudo certbot --nginx`).
- **Xavfsizlik:** `server/db.json` faylini muntazam ravishda zaxira (backup) qilib turing.
- **Portlar:** Serveringizda 3000 (API) va 80/443 (HTTP/S) portlari ochiq bo'lishi kerak.

---

## 8. Mijozga Ko'rsatish (Ngrok orqali Vaqtinchalik Onlayn Qilish)

Agar tizimni haqiqiy hostingga qo'ymasdan turib, boshqa joydagi (masalan, mijozning) telefonida ko'rsatmoqchi bo'lsangiz:

1. **Dasturni tayyorlang:**
   Bir marta kompyuter terminalida quyidagi buyruqni bering, u saytingizni ishlab chiqarish versiyasini siqib tayyorlaydi:
   ```bash
   npm run build
   ```

2. **Dasturni ishga tushiring:**
   Birinchi terminalda odatdagidek serverni yoqing:
   ```bash
   npm start
   ```

3. **Ngrok ulanishini oching:**
   Yangi ikkinchi terminalni (CMD) ochib quyidagini yozing:
   ```bash
   ngrok http 3000
   ```
   *Ekranda tayyor yashil link chiqadi (Masalan: `https://abcd-1234.ngrok-free.app`).*

4. **Tayyor!** Shu linkni telefonda ochasiz va tizim 100% onlayn dunyo yuzida ishlaydi (Telefon mobil internetda bo'lsa ham ishlayveradi). Kompyuterni o'chirsangiz, link ishlashdan to'xtaydi.
