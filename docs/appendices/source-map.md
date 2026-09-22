# נספח ב׳ — מיפוי מקור הקוד אל ספר הפרויקט

לכל פרק יש מקור אחד. כותבים לפרק רק אחרי קריאה בקבצים שבשורה שלו. הנוהל המלא: `docs/book-conversion-guide.md`. זהות אקדמית: `docs/student-qa-appendix.md`.

| פרק | מה נכתב ממנו | קבצי מקור |
| --- | --- | --- |
| שער, הצהרה, 1.2 | שם, ת״ז, מכללה, מסלול, מנחה, טלפון מגישה (`050-5806570`), טלפון מנחה (`052-8612379`), חלוקת אחריות | `docs/student-qa-appendix.md` |
| 1.1 | מטרות | `README.md`, תיאור קצר בנספח א׳ |
| 2.1 | טכנולוגיות | `package.json`, `README.md`, `apps/frontend/package.json` אם קיים, `apps/backend` dependencies ב-`package.json` של השורש |
| 2.2 | 11 קולקציות ושדות | `apps/backend/src/models/*.schema.ts` |
| 3 | אחד-עשר המסכים | `apps/frontend/src/App.tsx`, `apps/frontend/src/pages/AdminPage.tsx` |
| 4.1–4.4 | מעטפת, קטלוג, כרטיס | `apps/frontend/src/main.tsx`, `App.tsx`, `context/AuthContext.tsx`, `context/CartContext.tsx`, `pages/CatalogPage.tsx`, `components/ProductCard.tsx`, `services/api.ts` |
| 4.5 | עיצוב הפרויקט | `apps/frontend/STYLE_GUIDE.md`, `apps/frontend/src/theme/tokens.ts`, `apps/frontend/src/theme/theme.ts` |
| 5 | הזדהות ונעילה | `apps/backend/src/auth/auth.controller.ts`, `auth.service.ts`, `token-version.guard.ts`, `jwt.strategy.ts`, `models/user.schema.ts`, `libs/shared-types/src/index.ts` (`MAX_FAILED_LOGINS`) |
| 6 | ניהול, ואישור או ביטול הזמנה בסעיף 6.2 | `products.controller.ts`, `products.service.ts`, `orders.controller.ts`, `orders.service.ts`, `analytics.service.ts`, `auth/admin.guard.ts` |
| 7 | עגלה, קופה, ביטול | `carts/carts.service.ts`, `cache/cache.service.ts`, `orders/orders.service.ts`, `webhooks/webhooks.service.ts` |
| 8.1 | נקודות קצה | `apps/backend/README.md` והקונטרולרים. אם יש סתירה, הקונטרולר קובע ומתקנים את ה-README |
| 8.2 | דפוסים | `AGENTS.md` סעיפים 1–8, `apps/backend/src/main.ts`, `common/mongo-sanitize.middleware.ts`, `common/http.ts`, והשירותים שמופיעים בפרקים 5–7 |
| 9.1–9.2 | פיתוח ובדיקות | `README.md`, `libs/shared-types/src/index.spec.ts`, `apps/backend/src/common/http.spec.ts`, `apps/frontend/src/components/*.test.tsx`, `.github/workflows/ci.yml` |
| 9.3 | הפצה | `RENDER_DEPLOYMENT.md`, `render.yaml`, `apps/backend/Dockerfile`, `.github/workflows/deploy-gh-pages.yml`, `.github/workflows/deploy-backend.yml` |
| 10 | סיכום, לקחים, תודות | רק הישגים שכבר מתועדים בפרקים 1–9. תודות למנחה מהנספח א׳ |

## קבועים שנקראים מהקוד ולא מהזיכרון

| עובדה | איפה מאמתים |
| --- | --- |
| 11 שמות הקולקציות | `AGENTS.md` וקבצי `models/` |
| מעברי סטטוס | `ORDER_TRANSITIONS` ב-`libs/shared-types/src/index.ts` |
| 5 כישלונות, 15 דקות, bcrypt 10 | `MAX_FAILED_LOGINS`, `LOCK_MS` ו-`bcrypt.hash` ב-`auth.service.ts` |
| JWT 8 שעות | `JWT_EXPIRES_IN` ב-`RENDER_DEPLOYMENT.md` |
| מספר הזמנה `BLM-n` | `orders.service.ts` |
| תפוגת idempotency 24 שעות | `idempotency-key.schema.ts` |
| תפוגת cache 300 שניות | `cache.service.ts` |
| צבעים | `tokens.ts` |
| כתובת החנות | `https://avivedri3.github.io/bloomstore/` ב-`README.md` |
