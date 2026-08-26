# Ko‘p tilli nikoh taklifnomasi

Bu loyiha statik Next.js sayti bo‘lib, shaxsiylashtirishni brauzerda URL fragmentidan o‘qiydi.
Taklifnoma o‘zbek lotin, o‘zbek kirill, rus va ingliz tillarida ishlaydi.
Juftlik ismlari, sanalar, vaqt, manzil va xarita havolalari Usmon va Zulayhoning to‘y ma’lumotlariga moslangan.
Taklifnoma havolalarini ulashishdan oldin ma’lumotlarni yana bir bor tekshiring.

## To‘y ma’lumotlarini tahrirlash

Barcha ommaviy to‘y ma’lumotlari [`config/wedding.ts`](./config/wedding.ts) faylida saqlanadi.
U yerda har bir til uchun juftlik ismlari va tarjima qilingan matnlar, shuningdek sana, boshlanish vaqti, vaqt mintaqasi, joy nomi, to‘liq manzil va ikkala xarita havolasini yangilang.
Qizlar bazmi 2026-yil 13-sentabrga, nikoh to‘yi esa 2026-yil 14-sentabrga sozlangan.
Qizlar bazmi taklifnomasida faqat Zulayhoning ismi ko‘rsatiladi.
`openingMessage` taklifnoma ochilishidagi qisqa hissiy jumlani belgilaydi.
`brokenLinkContact` noto‘g‘ri havola holatida ko‘rsatiladigan aloqa matni bo‘lib, kerak bo‘lmasa `null` qoladi.

## Shaxsiy havola yaratish

Sayt ishga tushgach, brauzerda `/invite/` sahifasini oching.
Tadbir va tilni tanlang, mehmon ismini tanlangan alifboda kiriting, `singular` yoki `plural` murojaat shaklini aniq belgilang va yaratilgan havolani nusxalang.
`Nikoh to‘yi` standart tanlov bo‘lib, `Qizlar bazmi` alohida bayroq bilan kodlanadi.
`singular` shakli taklifnomada `sizni`, `plural` shakli esa `sizlarni` jumlasini tanlaydi.
Murojaat shakli ism, tinish belgisi, so‘zlar soni yoki `va` so‘zidan taxmin qilinmaydi.
Ism boshidagi va oxiridagi bo‘sh joylar olib tashlanadi va ism uzunligi ko‘pi bilan 120 Unicode kod nuqtasi bo‘lishi mumkin.
Qator uzilishi, boshqaruv belgisi yoki matn yo‘nalishini yashirincha o‘zgartiradigan belgi qatnashgan ism rad etiladi.

Yaratilgan taklifnoma havolasi quyidagi shaklda bo‘ladi.

```text
https://taklif.example/#TOKEN
```

Yangi token versiyalangan ixcham ikkilik formatdan foydalanadi.
Birinchi dekodlangan bayt `0xF1` bo‘lib, `0xF` format oilasini va `1` joriy versiyani bildiradi.
Ikkinchi bayt sarlavha uzunligi bo‘lib, joriy versiyada `3` ga teng.
Uchinchi baytning eng past biti murojaat shaklini bildiradi, bunda `0` singular va `1` plural hisoblanadi.
Keyingi uch bit tilni bildiradi, bunda `0` o‘zbek lotin, `1` o‘zbek kirill, `2` rus va `3` ingliz tilidir.
Uchinchi baytning beshinchi biti tadbirni bildiradi, bunda `0` nikoh to‘yi va `1` qizlar bazmi hisoblanadi.
Bu bit o‘rnatilmagan bo‘lsa, taklifnoma nikoh to‘yi sifatida ochiladi.
Qolgan yuqori bitlar hozircha ajratilgan va e’tiborsiz qoldiriladi.
Undan keyingi ikki bayt kelajakdagi ixtiyoriy xususiyatlar uchun ajratilgan va hozir `0` bo‘ladi.
Sarlavhadan keyingi baytlar mehmon ismining UTF-8 ko‘rinishidir va butun ketma-ketlik to‘ldiruvchi belgilarsiz URL-safe Base64 formatida kodlanadi.

`0xF1` ushbu saytning birinchi nashr qilinadigan token formatidir.
Nashrdan oldingi versiyasiz tajriba formatlari qo‘llab-quvvatlanmaydi.
Noma’lum xususiyat bitlari e’tiborsiz qoldiriladi, noma’lum til qiymati esa o‘zbek lotin tiliga qaytadi.
Kelajakdagi `0xF` oilasidagi versiya joriy murojaat va til bitlarini saqlashi, yangi maydonlarni ism oldidagi sarlavhaga qo‘shishi va sarlavha uzunligini oshirishi kerak.
Nashr qilingan til raqamlari, tadbir biti va boshqa bit ma’nolarini qayta ishlatmang yoki o‘zgartirmang.
Shu qoidalarga rioya qilinganda kelajakdagi buildlar birinchi nashrdan boshlab yuborilgan havolalarni ochadi, joriy dekoder esa noma’lum qo‘shimcha maydonlarga ega kelajak havolalarini xavfsiz standartlar bilan talqin qiladi.
URL fragmenti odatiy HTTP so‘rovida serverga yuborilmaydi va brauzerning o‘zida dekodlanadi.
Base64 faqat kodlash usuli bo‘lib, shifrlash yoki maxfiylik himoyasi emas.

`/invite/` generatoriga saytdan havola berilmagan va u qidiruv tizimlari uchun `noindex` qilingan.
Bu cheklovlar generatorni himoyalamaydi, shuning uchun manzilni bilgan har kim uni ochishi mumkin.

## Mahalliy ishga tushirish

Node.js 20.9 yoki undan yangi versiya kerak.

```bash
npm install
npm run dev
```

Sayt `http://localhost:3000/` manzilida, havola generatori esa `http://localhost:3000/invite/` manzilida ochiladi.

## Tekshiruv va statik build

Lint va TypeScript tekshiruvlarini ishga tushiring.

```bash
npm run lint
npm run typecheck
```

Playwright brauzerlarini bir marta o‘rnating.

```bash
npx playwright install chromium webkit firefox
```

Production E2E tekshiruvi statik buildni yaratib, keyin brauzer testlarini ishga tushiradi.

```bash
npm run test:e2e:production
```

Amaldagi `out/` buildiga qarshi E2E testlarini alohida ishga tushirish mumkin.

```bash
npm run test:e2e
```

Joylangan saytni aynan shu testlar bilan tekshirish uchun uning asosiy URL manzilini bering.

```bash
PLAYWRIGHT_BASE_URL=https://sayt.pages.dev npm run test:e2e
```

Mobil scroll unumdorligini Galaxy S24 Ultra o‘lchami, yuqori piksel zichligi va 4 karra CPU sekinlashtirish bilan o‘lchash mumkin.

```bash
npm run perf:mobile
npm run perf:mobile:check
```

Joylangan saytni o‘lchash uchun `PERF_BASE_URL` qiymatini bering, kuchliroq sinov uchun esa `PERF_CPU_RATE=8` ishlating.

```bash
PERF_BASE_URL=https://sayt.pages.dev PERF_CPU_RATE=8 npm run perf:mobile
```

Faqat statik production build yaratish uchun quyidagi buyruqni ishlating.

```bash
npm run build
```

Build natijasi `out/` papkasiga yoziladi.
Uni mahalliy statik serverda tekshirish uchun avval build yarating, keyin serverni ishga tushiring.

```bash
npm run start
```

Boshqa port kerak bo‘lsa uni argument orqali bering.

```bash
npm run start -- --port 4173
```

## Tasvirlar

Production sahifasidagi uchta botanika tasviri ushbu loyiha uchun ImageGen yordamida original tarzda yaratilgan.
Ular shaffof WebP fayllari sifatida `public/botanicals/` ichida saqlanadi va sahifa ishlayotganda tashqi tasvir serveriga so‘rov yuborilmaydi.
Tarixiy vizual tadqiqot manbalari va ularning huquqiy holati `artifacts/moodboard/credits.md` faylida qayd etilgan.

## Deployment

`npm run build` muvaffaqiyatli tugagach, `out/` papkasining ichidagi fayllarni HTTPS va statik hostingni qo‘llaydigan platformaga joylang.
Serverda Next.js jarayoni, serverless funksiya yoki maxsus qayta yo‘naltirish talab qilinmaydi.
Cloudflare Pages uchun build buyrug‘i `npm run build`, chiqish papkasi esa `out` bo‘ladi.
`public/_headers` fayli robots, referrer, framing va MIME himoya sarlavhalarini Cloudflare buildiga olib kiradi.
Deploymentdan keyin `/invite/` generatorini, bitta singular havolani, bitta plural havolani va noto‘g‘ri fragmentni haqiqiy production domenida tekshiring.

## Maxfiylik

Loyihada mehmonlar ro‘yxati, mehmon ma’lumot fayli, backend, ma’lumotlar bazasi yoki shaxsiy havolalar CSV fayli yo‘q.
Generator kiritilgan ismni saqlamaydi va havolani brauzerning o‘zida yaratadi.
Shunga qaramay, taklifnoma havolasi uni olgan har kim ochishi mumkin bo‘lgan bearer havoladir va u boshqa odamlarga yuborilishi mumkin.
Mehmon ismi token ichidan oson dekodlanadi, sahifada ko‘rinadi va to‘liq havola brauzer tarixida, xabarlarda yoki nusxalangan matnda saqlanishi mumkin.
`noindex` va URL fragmentining serverga yuborilmasligi autentifikatsiya yoki maxfiylik kafolati emas.
