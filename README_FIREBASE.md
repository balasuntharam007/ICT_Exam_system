# Grade 6 ICT Online Exam Portal – Firebase & Cloud Firestore Integration Guide
# 6 ஆம் தர தகவல் மற்றும் தொடர்பாடல் தொழில்நுட்ப ஆன்லைன் தேர்வுத் தளம்

This document explains the full architecture, authentication system, Cloud Firestore integration, 100 student accounts management, and Excel export features.

---

## 🚀 1. Immediate Quick Start (Zero-Setup Preview)

The application includes an **instant auto-fallback engine**. You can open `index.html` directly in any web browser (Google Chrome, Microsoft Edge, Firefox, Safari) right now, and all features work out-of-the-box!

### Predefined Login Credentials:

#### 🔐 1 Secure Admin Account:
- **Admin Email / Username:** `admin@ictg6.school` or `admin`
- **Password:** `Admin@2026`
- **Features:** Full access to Admin Dashboard, 6-unit consolidated marksheet, student management, Excel export, and password reset.

#### 🎓 100 Predefined Student Accounts:
- **Usernames:** `std001` through `std100`
- **Default Password pattern:** `ict@std001` through `ict@std100`
  - Example: Username: `std001` | Password: `ict@std001`
  - Example: Username: `std025` | Password: `ict@std025`
  - Example: Username: `std100` | Password: `ict@std100`
- **Security:** Passwords are never stored in plain text. They are hashed using **SHA-256 with cryptographic salt** before saving.
- **Editable:** The administrator can change any student's name, reset passwords, or activate/deactivate accounts at any time.

---

## ☁️ 2. Connecting to Google Firebase Authentication & Cloud Firestore (3 Steps)

When you are ready to link the portal to your live Google Firebase account so that students can take exams from different computers in the school computer lab and results sync across the internet:

### Step 1: Create a Free Project in Firebase
1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/) and sign in with your Google account.
2. Click **"Add project"** (திட்டத்தைச் சேர்க்கவும்) and name it (e.g., `ict-grade6-exam`).

### Step 2: Enable Authentication & Firestore
1. In the left menu, click **Build > Authentication**, click **Get started**, and enable **Email/Password**.
2. In the left menu, click **Build > Firestore Database**, click **Create database**, select a location, and start in **Production mode** or **Test mode**.
3. Under the **Rules** tab in Firestore, copy and paste the contents of `firestore.rules` provided in this directory.

### Step 3: Add Your Firebase Keys to the Portal
1. In Project Settings (⚙️ icon > Project settings > General), scroll down to **"Your apps"**, click the Web icon (`</>`), and register the app.
2. Copy the `firebaseConfig` object and paste it into `firebase-config.js`:

```javascript
const defaultFirebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "ict-grade6-exam.firebaseapp.com",
    projectId: "ict-grade6-exam",
    storageBucket: "ict-grade6-exam.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};
```
*(Alternatively, you can paste the API Key and Project ID directly in the **"Firebase அமைப்புகள்"** tab inside the Admin Dashboard without editing code!)*

### Step 4: One-Click Cloud Seeding
1. Log in to the Admin Dashboard (`admin@ictg6.school` / `Admin@2026`).
2. Go to the **"100 மாணவர் கணக்குகள்" (Student Accounts)** tab.
3. Click the green button: **"100 கணக்குகளை Cloud இல் பதிவு செய்" (Seed 100 Accounts to Cloud)**.
4. All 100 accounts will be written to your Google Cloud Firestore `students` collection in seconds!

---

## 📊 3. Key System Features

### 1. Student Login Page (`#auth-view`)
- Bilingual interface (Tamil & English).
- Student enters their Username (`std001` to `std100`) and Password.
- Prevents inactive or suspended accounts from logging in with a clear message: *"உங்கள் கணக்கு முடக்கப்பட்டுள்ளது. ஆசிரியரைத் தொடர்பு கொள்ளவும்."*
- Includes quick 1-click test chips for convenient evaluation.

### 2. Automatic Cloud Result Storage
- When a student completes an examination or the countdown timer finishes:
  - The portal automatically saves the submission to Cloud Firestore (`exam_results` collection).
  - Saved fields: `studentUsername`, `studentName`, `unit`, `unitId`, `marks`, `total`, `percentage`, `status` (Passed / Needs Improvement), `mode` (Exam / Practice), `timeSpent`, and timestamp `examDate`.
  - The results view displays an immediate green verification banner: *"✓ முடிவுகள் தானாகவே கிளவுட் சேமிப்பகத்தில் சேமிக்கப்பட்டன! (Results automatically saved to Cloud Firestore)"*.

### 3. Comprehensive Admin Dashboard (`#admin-view`)
- **Overview & Analytics (மேற்பார்வை):**
  - Live metric counters: Total Students (100), Active Accounts, Exams Submitted, and Average Passing %.
  - Visual unit-by-unit performance comparison cards for all 6 units with progress bars and attempt counts.
- **Exam Results & Search (தேர்வு முடிவுகள்):**
  - Search any student by username (`std001`) or name in real time.
  - Filter results by Unit (Units 1 to 6 or Full Mock) and by Status (Passed / Needs Improvement).
  - Individual result deletion and inspection.
- **6-Unit Consolidated Marksheet Matrix (6 அலகுகளின் பட்டியல்):**
  - Displays each student's highest or latest mark across all six textbook units side-by-side:
    `[Roll | Username | Student Name | Unit 1 | Unit 2 | Unit 3 | Unit 4 | Unit 5 | Unit 6 | Overall Avg % | Performance Grade]`
  - Color-coded badges: Green for ≥ 50%, Red for < 50%, Gray dash for not yet attempted.
- **100 Student Accounts Management (மாணவர் கணக்குகள்):**
  - Add individual new students.
  - Edit student names and roll numbers.
  - Activate or Deactivate any account with a single click.
  - Reset any student's forgotten password securely.
  - Export student credential sheets.
- **Real Excel Export (.xlsx):**
  - Powered by SheetJS (`xlsx.full.min.js`).
  - **Export Results (.xlsx):** Downloads all exam submission records.
  - **Export 6-Unit Matrix (.xlsx):** Downloads the cross-unit consolidated marksheet formatted for report cards and school administration.
  - **Export Accounts (.xlsx):** Downloads the complete 100-student roster with credentials for classroom distribution.

---

## 📁 File Structure

| File | Description |
|---|---|
| `index.html` | Complete portal: Auth view, exam lobby, active exam UI, results review, and full Admin Dashboard. |
| `style.css` | Custom responsive CSS for all views, tables, metric cards, modals, and badges. |
| `firebase-config.js` | Firebase SDK initialization, SHA-256 salted hashing, 100 accounts templates, and dual Cloud Firestore + Local persistence layer. |
| `questions.js` | Full Sri Lanka Grade 6 ICT question bank (240 MCQs across Units 1–6 in Tamil). |
| `firestore.rules` | Security rules for Cloud Firestore collections (`students`, `admins`, `exam_results`). |
| `README_FIREBASE.md` | Comprehensive integration and usage manual. |
