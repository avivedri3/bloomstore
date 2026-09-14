# ספר פרויקט — BloomStore

**שם הפרויקט:** BloomStore — חנות פרחים מקוונת  
**מסגרת:** פרויקט גמר — הנדסאי תוכנה, אורט  
**ארכיטקטורה:** שלוש שכבות, Nx Monorepo, TypeScript מקצה לקצה  
**תאריך:** ספטמבר 2026

מסמך זה מיושר לקוד בפועל לפי `DOCS_SYNC.md`. גרסה חיה: `GET /api/docs`.

---

## פרק 1 — מבוא

BloomStore היא מערכת מסחר אלקטרוני למכירת זרי פרחים, צמחים וסידורים לאירועים. הלקוח גולש בקטלוג ציבורי, מנהל עגלה, משלם (סימולציה) ומעקב אחרי הזמנות. מנהל המערכת מנהל מלאי, מקדם סטטוס משלוח וצופה בלוח סטטיסטיקות.

### מטרות

1. לממש חנות מלאה לפי דרישות ספר הפרויקט של אורט (שלוש שכבות, מסד נתונים, בדיקות, הדרכה).
2. להפגין דפוסי עיצוב: Price Snapshot, Write-Through Cache, State Machine, Token Versioning, Account Lockout.
3. לספק CI/CD: GitHub Actions לאיכות קוד, GitHub Pages ל-SPA ולספר הפרויקט, Render ל-API.

### בעיה עסקית

חנויות פרחים קטנות מתקשות לנהל מלאי בזמן אמת, למנוע מכירה במחיר ישן, ולבטל הזמנות תוך החזרת מלאי. BloomStore נועלת מחיר בהזמנה, מסננת מוצרים לא פעילים / אזלו מהמלאי, ומבצעת restock טרנזקציונלי בביטול לפני משלוח.

---

## פרק 2 — תיאור המערכת

### משתמשי הקצה

| תפקיד | יכולות |
| --- | --- |
| אורח | קטלוג ודף מוצר |
| לקוח (`customer`) | הרשמה, התחברות, עגלה, כתובות, הזמנה, ביטול לפני `shipped` |
| מנהל (`admin`) | כל יכולות הלקוח + CRUD מוצרים (מחיקה רכה), סינון הזמנות, שינוי סטטוס, סטטיסטיקות |

### מודולים פונקציונליים

1. קטלוג ציבורי — רשת מוצרים עם קטגוריה, מחיר, מלאי ותמונה. סינון `isActive: true` ו-`stock > 0`.
2. אבטחה — JWT עם `tokenVersion`, נעילת חשבון אחרי 5 כשלונות (`ACCOUNT_LOCKED`, HTTP 423), Helmet, CORS, rate limit, סניטציית NoSQL.
3. עגלה — Write-Through ל-MongoDB + Redis (או מטמון בזיכרון).
4. הזמנות — מכונת מצבים + צילום מחיר בשורות ההזמנה.
5. ניהול ואנליטיקה — `Promise.all` לאגרגציות מקבילות ותרשימים בממשק המנהל.

### טכנולוגיות

- Frontend: React 19, Vite, React Router 7, Axios, MUI + Tailwind (`apps/frontend`)
- Backend: NestJS (Express), Mongoose, Zod, Helmet (`apps/backend`)
- Shared: DTOs וסכמות Zod (`libs/shared-types`)
- תיעוד: Markdown עברי ב-`docs/project-book.md`

---

## פרק 3 — ניתוח המערכת

### מקרי שימוש עיקריים

**UC-01 צפייה בקטלוג:** אורח פותח `/`. המערכת מחזירה רק מוצרים פעילים עם מלאי.

**UC-02 התחברות:** הלקוח שולח אימייל וסיסמה. אחרי 5 כשלונות מוחזר 423. הצלחה מחזירה JWT הכולל `tokenVersion`.

**UC-03 הוספה לעגלה:** הלקוח בוחר כמות. השירות בודק מלאי, כותב ל-MongoDB ומעדכן מטמון.

**UC-04 תשלום והזמנה:** הלקוח בוחר כתובת ושולח `idempotencyKey`. נוצרת הזמנה `pending_payment` עם snapshot מחירים, יורד מלאי, העגלה מתרוקנת.

**UC-05 ביטול:** לפני `shipped` המלאי מוחזר בטרנזקציה והסטטוס `cancelled`.

**UC-06 ניהול משלוח:** מנהל מסנן לפי סטטוס ומקדמים לפי מטריצת המעברים ב-`ORDER_TRANSITIONS`.

**UC-07 דשבורד:** מנהל רואה הכנסות, הזמנות פתוחות, מכירות יומיות, התראות מלאי נמוך וצמיחת משתמשים.

### דרישות לא פונקציונליות

- TypeScript strict בכל הפרויקטים
- מעטפת JSON אחידה `{ success, data }` / `{ success: false, error }`
- זמן תגובה סביר לקטלוג (אינדקס על `isActive`, `stock`, `category`)
- תיעוד חי ב-`GET /api/docs`

---

## פרק 4 — עיצוב המערכת

### שלוש שכבות (Backend)

1. **Presentation** — `*controller.ts`: חילוץ פרמטרים, Zod parse, החזרת `ok()` / שגיאות HTTP. אין לוגיקה עסקית.
2. **Business** — `*service.ts`: מלאי, מכונת מצבים, נעילת חשבון, כתיבת מטמון, ביקורת.
3. **Data** — `models/*.schema.ts`: 11 אוספי MongoDB.

### מודול Frontend

דפים תחת `apps/frontend/src/pages`, הקשרים Auth/Cart, לקוח Axios עם Bearer token.

### דיאגרמת רכיבים (לוגית)

```
React SPA  -->  NestJS Controllers  -->  Services  -->  Mongoose Models
                     |                      |
                     +--> GET /api/docs     +--> Redis/Memory cache
```

### דפוסי עיצוב (מטריצה)

| דפוס | מיקום | תכלית |
| --- | --- | --- |
| Envelope | `common/http.ts` | תשובות אחידות |
| Price Snapshot | `orders.service.ts` | נעילת מחיר בשורת הזמנה |
| Write-Through Cache | `carts.service.ts` + `cache.service.ts` | Mongo מקור אמת |
| State Machine | `canTransition` ב-shared-types | מעברי סטטוס חוקיים בלבד |
| Token Versioning | `User.tokenVersion` + `TokenVersionGuard` | ביטול JWT בהתנתקות |
| Account Lockout | `AuthService.login` | 5 כשלונות → 423 |
| Idempotency | `idempotencykeys` | מניעת הזמנה כפולה |
| Soft Delete | `Product.isActive` | הסתרה מהקטלוג הציבורי |

---

## פרק 5 — מסד הנתונים

אחת-עשרה קולקציות:

| קולקציה | מודל | שדות עיקריים |
| --- | --- | --- |
| `users` | User | email, passwordHash, role, tokenVersion, failedLoginAttempts, lockUntil |
| `products` | Product | name, category, price, stock, imageUrl, isActive |
| `carts` | Cart | userId ייחודי, items[{productId, quantity}] |
| `orders` | Order | orderNumber, status, items[snapshot], total, addressId |
| `payments` | Payment | orderId, amount, status, provider |
| `addresses` | Address | userId, city, street, phone, isDefault |
| `sequences` | Sequence | name, value (מספרי הזמנה BLM-n) |
| `auditlogs` | AuditLog | actorId, action, entity, metadata |
| `webhookevents` | WebhookEvent | eventId ייחודי, type, payload |
| `failedwebhooks` | FailedWebhook | eventId, reason, retryCount |
| `idempotencykeys` | IdempotencyKey | key, userId, orderId, TTL 24ש |

יחסים: User 1—N Address/Order; User 1—1 Cart; Order 1—1 Payment; Order N—snapshot של Product (לא FK חי בזמן אמת — זה במכוון).

---

## פרק 6 — מימוש

### API עיקרי

| מתודה | נתיב | תיאור |
| --- | --- | --- |
| GET | `/api/health` | בדיקת חיות |
| GET | `/api/docs` | ספר הפרויקט |
| POST | `/api/auth/register` `/login` `/logout` | אימות |
| GET | `/api/products` | קטלוג ציבורי מסונן |
| GET/POST/PATCH/DELETE | `/api/products` | ניהול (admin) |
| GET/PUT/DELETE | `/api/cart` | עגלה |
| GET/POST | `/api/addresses` | כתובות |
| POST | `/api/orders/checkout` | יצירת הזמנה |
| GET | `/api/orders/mine` `/admin` | רשימות |
| PATCH | `/api/orders/:id/status` | מעבר מצב |
| GET | `/api/admin/stats` | דשבורד |

### אלגוריתם ביטול + Restock

אם `canTransition(current, cancelled)` והסטטוס אינו `shipped`/`delivered`: טרנזקציית MongoDB מגדילה `stock` לכל שורת snapshot, מעדכנת הזמנה ל-`cancelled` ותשלום ל-`refunded`.

### אבטחה ב-`main.ts`

Helmet, CORS לפי `CORS_ORIGINS`, מגבלת קצב על `/auth/login` ו-`/auth/register`, ו-`MongoSanitizeMiddleware` שמסיר מפתחות `$` ו-`.` מגוף הבקשה.

---

## פרק 7 — ממשק משתמש

- **קטלוג:** כרטיסי מוצר, סינון קטגוריה, הוספה לעגלה.
- **התחברות/הרשמה:** טופס MUI; הודעת נעילה אם 423.
- **עגלה:** שינוי כמות ומחיקה.
- **Checkout:** בחירת/יצירת כתובת + מפתח idempotency.
- **הזמנות:** סטטוס, מחיר נעול, ביטול.
- **Admin:** לשוניות Products / Orders / Statistics (Recharts).

עיצוב: צבע ורד `#c45c7a`, רקע קרם, Tailwind לעזרת פריסה ו-MUI לרכיבים.

---

## פרק 8 — תוכנית בדיקות (STP)

### יחידה

- `libs/shared-types/src/index.spec.ts` — מעברי מכונת מצבים.
- `apps/backend/src/common/http.spec.ts` — מעטפת JSON ומדיניות נעילה.
- `apps/frontend/src/components/Header.test.tsx` — מותג וניווט קטלוג.

### אינטגרציה / E2E (תרחישים)

1. אורח רואה קטלוג בלי Sunset Bouquet (stock 0).
2. לקוח מתחבר, מוסיף מוצר, מזין כתובת, checkout, רואה `pending_payment`.
3. מנהל מאשר → processing → shipped → delivered.
4. ביטול מ-`confirmed` מחזיר מלאי.
5. חמש התחברויות שגויות → 423 ACCOUNT_LOCKED.
6. Logout מגדיל `tokenVersion`; בקשת `/auth/me` עם הטוקן הישן נכשלת.

CI (`.github/workflows/ci.yml`): lint, typecheck, test, build, npm audit — לפי מבנה iAgent.

---

## פרק 9 — הדרכה למשתמש

### התקנה מקומית

```bash
cp apps/backend/.env.example apps/backend/.env
# MONGODB_URI + JWT_SECRET
npm install
npm run dev
```

- חנות: http://localhost:3000  
- API: http://localhost:3030/api  
- ספר פרויקט: http://localhost:3030/api/docs  

### משתמשי הדגמה (נוצרים ב-seed אם המסד ריק)

| תפקיד | אימייל | סיסמה |
| --- | --- | --- |
| מנהל | admin@bloomstore.com | Admin123! |
| לקוח | customer@bloomstore.com | Customer123! |

### פריסה

- Frontend + HTML של הספר: GitHub Pages (`deploy-gh-pages.yml`)
- Backend: Render לפי `RENDER_DEPLOYMENT.md` (Dockerfile בנתיב `apps/backend/Dockerfile`, context שורש הריפו)

---

## פרק 10 — סיכום ומסקנות

BloomStore מממשת חנות פרחים מלאה במבנה מונורפו Nx עם הפרדת שכבות קשיחה, אחד-עשר אוספים, ודפוסי אבטחה ומסחר הנדרשים לפרויקט גמר. הלקח המרכזי: צילום מחיר ומכונת מצבים מונעים חוסר עקביות בין קטלוג להזמנה; Token Versioning פשוט יותר מ-blacklist מלא לביטול סשן.

הרחבות עתידיות: ספק תשלום אמיתי דרך webhooks הקיימים, חיפוש טקסט מלא, והתראות מלאי בדוא"ל.

**ביבליוגרפיה / מקורות השראה:** מאגר iAgent (CI/CD ו-Nx), front-simple-shop (מבנה דפי חנות), הנחיות ספר פרויקט אורט.
