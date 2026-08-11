# הקורסים שלי — חיבור אמיתי ל-Google

אפליקציית Next.js שקוראת את מבנה תיקיות הקורסים מ-Google Drive. אין בסיס נתונים,
אין שכפול תוכן, והגישה היא לקריאה בלבד.

---

## שלב 1 — Google Cloud Console

1. **צרו פרויקט** ב-<https://console.cloud.google.com> (או השתמשו בקיים).
2. **הפעילו את Google Drive API**: `APIs & Services → Library → Google Drive API → Enable`.
   (אין צורך ב-Slides API — המצגות נטענות דרך iframe של Google.)
3. **OAuth consent screen**:
   - יש לכם Google Workspace? בחרו **Internal**. זו האפשרות הפשוטה: אין תהליך אימות,
     והאפליקציה זמינה לכל מי שבארגון.
   - אין Workspace? בחרו **External** והשאירו את האפליקציה במצב **Testing**. הוסיפו את
     כתובות המייל של המשתמשים תחת **Test users** (עד 100).
   - הוסיפו את ה-scope ‎`.../auth/drive.readonly`‎.
4. **Credentials → Create credentials → OAuth client ID → Web application**:
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - בפרודקשן הוסיפו גם את הדומיין האמיתי, באותו מבנה בדיוק.
5. שמרו את **Client ID** ו-**Client secret**.

> **חשוב לדעת:** `drive.readonly` הוא scope מוגבל אצל Google. כל עוד האפליקציה
> Internal או Testing — אין צורך באימות. פרסום External לציבור הרחב מחייב תהליך
> verification כולל בדיקת אבטחה, שלוקח שבועות. לאפליקציה פרטית פשוט אל תפרסמו.

## שלב 2 — תיקיית השורש

פתחו את תיקיית הקורסים ב-Drive והעתיקו את ה-ID מהכתובת:

```
https://drive.google.com/drive/folders/1AbCdEf...   ←  זה ה-ID
```

שתפו את התיקייה עם כל משתמש שאמור לראות אותה, בהרשאת **Viewer**.
האפליקציה משתמשת בטוקן של המשתמש עצמו, ולכן מי שאין לו גישה בדרייב לא יראה תוכן.

## שלב 3 — הרצה

```bash
cp .env.example .env.local     # ומלאו את הערכים
openssl rand -base64 32        # לתוך NEXTAUTH_SECRET
npm install
npm run dev                    # http://localhost:3000
```

---

## מבנה הפרויקט

```
app/
  login/                       מסך התחברות
  courses/                     "הקורסים שלי"
  courses/[courseId]/          עמוד קורס + רשימת שיעורים
  courses/.../presentation/    צופה המצגות
  api/courses/…                שכבת ה-API בצד שרת (הטוקן לא יוצא מכאן)
  api/auth/[...nextauth]/      OAuth
services/googleDrive.ts        כל הלוגיקה של Drive, מרוכזת במקום אחד
lib/lessons.ts                 כלל זיהוי השיעור ‎^(\d+)[-_ ]*‎ והמיון המספרי
lib/apiClient.ts               אותו ממשק שהיה לספק המוק
components/ui.tsx              רכיבי התצוגה מהפרוטוטייפ
```

## החלטות אבטחה (PRD §18)

- ה-access token נשמר ב-JWT מוצפן בעוגייה `httpOnly` ולעולם לא נשלח לדפדפן.
  הסשן בצד הלקוח מכיל שם, אימייל ותמונה בלבד.
- ה-client secret קיים רק בקובץ הסביבה בצד שרת.
- `assertUnderRoot` מוודא שכל תיקייה שנקראת נמצאת מתחת לתיקיית השורש המוגדרת,
  כך שהחלפת ID בכתובת לא תיתן גישה לשאר הדרייב של המשתמש.
- מזהי Drive עוברים ולידציה לפני שהם נכנסים לשאילתת ה-API.
- אין קריאות כתיבה, ואין רישום טוקנים ללוג.

## שאלות שכדאי לצפות להן

**המצגת לא נטענת בתוך האתר.** קורה כשהדפדפן מחובר לכמה חשבונות Google, או
כשעוגיות צד־שלישי חסומות. הצופה מזהה את זה ומציג "פתיחה ב-Google Slides",
וגם במצב תקין יש כפתור מילוט מתחת למצגת.

**התחברתי ואני לא רואה קורסים.** התיקייה לא משותפת עם אותו חשבון, או שה-ID
בקובץ הסביבה שגוי.

**"אין לנו כרגע גישה".** ה-refresh token פג או בוטל ב-<https://myaccount.google.com/permissions>.
התחברות מחדש פותרת.
