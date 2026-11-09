/**
 * Grade 6 ICT Online Exam Portal - Firebase & Authentication Engine
 * Handles Firebase Authentication, Cloud Firestore Sync, 
 * 100 Predefined Student Accounts, and Secure Hashing.
 */

// 1. Firebase Configuration
// Replace with your Firebase Project Configuration from Firebase Console:
// (Firebase Console -> Project Settings -> General -> Your apps -> Web app)
const defaultFirebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Retrieve any custom config saved via Admin Dashboard
function getActiveFirebaseConfig() {
    try {
        const custom = localStorage.getItem('ict_g6_custom_firebase_config');
        if (custom) {
            const parsed = JSON.parse(custom);
            if (parsed && parsed.apiKey && parsed.apiKey !== "YOUR_API_KEY") {
                return parsed;
            }
        }
    } catch (e) {
        console.warn("Could not read custom firebase config", e);
    }
    return defaultFirebaseConfig;
}

// 2. Global Services & State
let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;
let isCloudConnected = false;

// Initialize Firebase
function initFirebase() {
    const config = getActiveFirebaseConfig();
    const isConfigured = config.apiKey && config.apiKey !== "YOUR_API_KEY" && config.projectId && config.projectId !== "YOUR_PROJECT_ID";

    if (isConfigured && typeof firebase !== 'undefined') {
        try {
            if (!firebase.apps.length) {
                firebaseApp = firebase.initializeApp(config);
            } else {
                firebaseApp = firebase.app();
            }
            firebaseAuth = firebase.auth();
            firestoreDb = firebase.firestore();
            isCloudConnected = true;
            console.log("✓ Firebase initialized & connected to Cloud Firestore:", config.projectId);
        } catch (err) {
            console.error("Firebase initialization failed:", err);
            isCloudConnected = false;
        }
    } else {
        console.info("ℹ Running in Local / Offline Cloud Simulation Mode. (Update firebase-config.js to connect live Firestore)");
        isCloudConnected = false;
    }
    return isCloudConnected;
}

// 3. Secure Password Hashing (Web Crypto API SHA-256 with Salt)
const HASH_SALT = "ICT_G6_SL_EXAM_2026_SECURE_SALT";

async function hashPassword(plainText, salt = HASH_SALT) {
    if (!plainText) return "";
    try {
        const textToHash = `${salt}_${plainText.trim()}_${salt}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(textToHash);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    } catch (e) {
        // Fallback simple hash for older environments
        let hash = 0;
        const str = `${salt}_${plainText}_${salt}`;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return "fallback_" + Math.abs(hash).toString(16);
    }
}

// 4. Default Admin & 100 Predefined Student Accounts Generator
const DEFAULT_ADMIN = {
    email: "admin@ictg6.school",
    username: "admin",
    name: "Exam Administrator (ICT ஆசிரியர்)",
    role: "admin",
    defaultPassword: "Admin@2026"
};

function generate100StudentTemplates() {
    const students = [];
    for (let i = 1; i <= 100; i++) {
        const rollStr = i.toString().padStart(3, '0');
        const username = `std${rollStr}`;
        students.push({
            rollNo: i,
            username: username,
            name: `மாணவர் ${rollStr} (Student ${rollStr})`,
            defaultPassword: `ict@std${rollStr}`,
            status: "active", // "active" or "inactive"
            createdAt: new Date().toISOString(),
            lastLogin: null
        });
    }
    return students;
}

// 5. Local Storage Simulation Engine (Provides 100% functionality even without Firebase API keys)
const LOCAL_STORAGE_KEYS = {
    STUDENTS: "ict_g6_cloud_students",
    RESULTS: "ict_g6_cloud_results",
    ADMIN: "ict_g6_cloud_admin",
    SESSION: "ict_g6_current_session"
};

// Seed Local Store with 100 students if empty
async function ensureLocalStoreSeeded() {
    let localStudents = localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS);
    if (!localStudents) {
        const template = generate100StudentTemplates();
        const seeded = [];
        for (const s of template) {
            const hash = await hashPassword(s.defaultPassword);
            seeded.push({
                rollNo: s.rollNo,
                username: s.username,
                name: s.name,
                passwordHash: hash,
                status: s.status,
                createdAt: s.createdAt,
                lastLogin: null
            });
        }
        localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(seeded));
    }

    let localAdmin = localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN);
    if (!localAdmin) {
        const adminHash = await hashPassword(DEFAULT_ADMIN.defaultPassword);
        localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN, JSON.stringify({
            ...DEFAULT_ADMIN,
            passwordHash: adminHash
        }));
    }

    // Seed a few sample results for instant testing of dashboard & matrix if empty
    let localResults = localStorage.getItem(LOCAL_STORAGE_KEYS.RESULTS);
    if (!localResults) {
        const sampleResults = [
            { id: "res_001", studentUsername: "std001", studentName: "மாணவர் 001 (Student 001)", unit: "அலகு 1 – கணினித் தொழில்நுட்பம்", unitId: 1, marks: 38, total: 40, percentage: 95, status: "Passed", mode: "exam", timeSpent: "14m 20s", examDate: new Date(Date.now() - 86400000 * 3).toLocaleString('ta-LK') },
            { id: "res_002", studentUsername: "std001", studentName: "மாணவர் 001 (Student 001)", unit: "அலகு 2 – கணினி வசதிகளைப் பாதுகாப்பாகப் பயன்படுத்துதல்", unitId: 2, marks: 36, total: 40, percentage: 90, status: "Passed", mode: "exam", timeSpent: "15m 10s", examDate: new Date(Date.now() - 86400000 * 2).toLocaleString('ta-LK') },
            { id: "res_003", studentUsername: "std002", studentName: "மாணவர் 002 (Student 002)", unit: "அலகு 1 – கணினித் தொழில்நுட்பம்", unitId: 1, marks: 34, total: 40, percentage: 85, status: "Passed", mode: "exam", timeSpent: "18m 05s", examDate: new Date(Date.now() - 86400000 * 2).toLocaleString('ta-LK') },
            { id: "res_004", studentUsername: "std003", studentName: "மாணவர் 003 (Student 003)", unit: "அலகு 3 – இயக்க முறைமைகளும் கோப்புகளைக் கையாளுதலும்", unitId: 3, marks: 39, total: 40, percentage: 98, status: "Passed", mode: "exam", timeSpent: "12m 40s", examDate: new Date(Date.now() - 86400000 * 1).toLocaleString('ta-LK') },
            { id: "res_005", studentUsername: "std004", studentName: "மாணவர் 004 (Student 004)", unit: "அலகு 1 – கணினித் தொழில்நுட்பம்", unitId: 1, marks: 16, total: 40, percentage: 40, status: "Needs Improvement", mode: "exam", timeSpent: "25m 00s", examDate: new Date().toLocaleString('ta-LK') }
        ];
        localStorage.setItem(LOCAL_STORAGE_KEYS.RESULTS, JSON.stringify(sampleResults));
    }
}

// 6. Data Service Layer (Cloud Firestore + Local Persistence)
const DataService = {
    // ------------------------------------------------------------------------
    // Cloud Connection Check
    // ------------------------------------------------------------------------
    isCloudActive() {
        return isCloudConnected && firestoreDb !== null;
    },

    getCloudStatus() {
        const config = getActiveFirebaseConfig();
        return {
            connected: isCloudConnected && firestoreDb !== null,
            projectId: (config && config.projectId && config.projectId !== "YOUR_PROJECT_ID") ? config.projectId : "Local Cloud Simulation",
            authDomain: config.authDomain || ""
        };
    },

    // ------------------------------------------------------------------------
    // Student Authentication
    // ------------------------------------------------------------------------
    async authenticateStudent(username, plainPassword) {
        await ensureLocalStoreSeeded();
        const cleanUser = username.trim().toLowerCase();
        const enteredHash = await hashPassword(plainPassword);

        // 1. Try Cloud Firestore if connected
        if (this.isCloudActive()) {
            try {
                const docRef = firestoreDb.collection("students").doc(cleanUser);
                const docSnap = await docRef.get();
                if (docSnap.exists) {
                    const student = docSnap.data();
                    if (student.status === "inactive") {
                        return { success: false, error: "உங்கள் கணக்கு முடக்கப்பட்டுள்ளது. ஆசிரியரைத் தொடர்பு கொள்ளவும். (Account is deactivated by Admin.)" };
                    }
                    if (student.passwordHash === enteredHash) {
                        const now = new Date().toISOString();
                        await docRef.update({ lastLogin: now });
                        student.lastLogin = now;
                        this.setCurrentSession({ role: "student", ...student });
                        return { success: true, user: student };
                    } else {
                        return { success: false, error: "தவறான கடவுச்சொல் (Incorrect Password)" };
                    }
                }
            } catch (err) {
                console.warn("Firestore auth lookup failed, checking local store fallback:", err);
            }
        }

        // 2. Local Cloud Fallback
        const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS) || "[]");
        const found = local.find(s => s.username.toLowerCase() === cleanUser);

        if (!found) {
            return { success: false, error: "மாணவர் கணக்கு காணப்படவில்லை (Username not found)" };
        }
        if (found.status === "inactive") {
            return { success: false, error: "உங்கள் கணக்கு முடக்கப்பட்டுள்ளது. ஆசிரியரைத் தொடர்பு கொள்ளவும். (Account is deactivated by Admin.)" };
        }
        if (found.passwordHash === enteredHash) {
            found.lastLogin = new Date().toISOString();
            localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(local));
            this.setCurrentSession({ role: "student", ...found });
            return { success: true, user: found };
        } else {
            return { success: false, error: "தவறான கடவுச்சொல் (Incorrect Password)" };
        }
    },

    // ------------------------------------------------------------------------
    // Admin Authentication
    // ------------------------------------------------------------------------
    async authenticateAdmin(emailOrUser, plainPassword) {
        await ensureLocalStoreSeeded();
        const input = emailOrUser.trim().toLowerCase();
        const enteredHash = await hashPassword(plainPassword);

        // 1. Try Firebase Authentication if connected and input is email
        if (this.isCloudActive() && firebaseAuth && input.includes("@")) {
            try {
                const userCred = await firebaseAuth.signInWithEmailAndPassword(input, plainPassword);
                const adminData = {
                    email: userCred.user.email,
                    username: "admin",
                    name: "Exam Administrator",
                    role: "admin",
                    uid: userCred.user.uid
                };
                this.setCurrentSession(adminData);
                return { success: true, user: adminData };
            } catch (authErr) {
                console.warn("Firebase Auth failed, trying Firestore admin lookup:", authErr);
            }
        }

        // 2. Check Firestore 'admins' collection if connected
        if (this.isCloudActive()) {
            try {
                const adminSnap = await firestoreDb.collection("admins").get();
                for (const doc of adminSnap.docs) {
                    const data = doc.data();
                    if ((data.username.toLowerCase() === input || data.email.toLowerCase() === input) && data.passwordHash === enteredHash) {
                        this.setCurrentSession({ role: "admin", ...data });
                        return { success: true, user: data };
                    }
                }
            } catch (err) {
                console.warn("Firestore admin lookup failed, falling back to local admin:", err);
            }
        }

        // 3. Fallback to Local Admin
        const localAdmin = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN) || "{}");
        if ((localAdmin.email.toLowerCase() === input || localAdmin.username.toLowerCase() === input) && localAdmin.passwordHash === enteredHash) {
            this.setCurrentSession({ role: "admin", ...localAdmin });
            return { success: true, user: localAdmin };
        }

        return { success: false, error: "தவறான நிர்வாகி மின்னஞ்சல் அல்லது கடவுச்சொல் (Invalid Admin Credentials)" };
    },

    // ------------------------------------------------------------------------
    // Session State Management
    // ------------------------------------------------------------------------
    setCurrentSession(userData) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.SESSION, JSON.stringify(userData));
    },

    getCurrentSession() {
        try {
            const sess = localStorage.getItem(LOCAL_STORAGE_KEYS.SESSION);
            return sess ? JSON.parse(sess) : null;
        } catch (e) {
            return null;
        }
    },

    logout() {
        if (this.isCloudActive() && firebaseAuth) {
            try { firebaseAuth.signOut(); } catch (e) { }
        }
        localStorage.removeItem(LOCAL_STORAGE_KEYS.SESSION);
    },

    // ------------------------------------------------------------------------
    // Students CRUD Operations (100 Accounts)
    // ------------------------------------------------------------------------
    async getAllStudents() {
        await ensureLocalStoreSeeded();

        if (this.isCloudActive()) {
            try {
                const snap = await firestoreDb.collection("students").orderBy("rollNo").get();
                if (!snap.empty) {
                    const list = [];
                    snap.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
                    return list;
                }
            } catch (err) {
                console.warn("Could not fetch students from Firestore:", err);
            }
        }

        const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS) || "[]");
        return local.sort((a, b) => a.rollNo - b.rollNo);
    },

    async saveStudent(studentObj) {
        const username = studentObj.username.trim().toLowerCase();
        let payload = {
            rollNo: parseInt(studentObj.rollNo) || 1,
            username: username,
            name: studentObj.name.trim(),
            status: studentObj.status || "active",
            lastLogin: studentObj.lastLogin || null,
            updatedAt: new Date().toISOString()
        };

        if (studentObj.newPassword) {
            payload.passwordHash = await hashPassword(studentObj.newPassword);
        } else if (studentObj.passwordHash) {
            payload.passwordHash = studentObj.passwordHash;
        }

        // 1. Cloud Firestore
        if (this.isCloudActive()) {
            try {
                await firestoreDb.collection("students").doc(username).set(payload, { merge: true });
            } catch (err) {
                console.error("Firestore saveStudent error:", err);
            }
        }

        // 2. Local Store
        const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS) || "[]");
        const idx = local.findIndex(s => s.username.toLowerCase() === username);
        if (idx >= 0) {
            local[idx] = { ...local[idx], ...payload };
        } else {
            payload.createdAt = new Date().toISOString();
            local.push(payload);
        }
        localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(local));
        return { success: true };
    },

    async toggleStudentStatus(username, newStatus) {
        const cleanUser = username.trim().toLowerCase();

        if (this.isCloudActive()) {
            try {
                await firestoreDb.collection("students").doc(cleanUser).update({
                    status: newStatus,
                    updatedAt: new Date().toISOString()
                });
            } catch (err) {
                console.error("Firestore toggle status error:", err);
            }
        }

        const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS) || "[]");
        const idx = local.findIndex(s => s.username.toLowerCase() === cleanUser);
        if (idx >= 0) {
            local[idx].status = newStatus;
            localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(local));
        }
        return { success: true, status: newStatus };
    },

    async resetStudentPassword(username, newPassword) {
        const cleanUser = username.trim().toLowerCase();
        const newHash = await hashPassword(newPassword);

        if (this.isCloudActive()) {
            try {
                await firestoreDb.collection("students").doc(cleanUser).update({
                    passwordHash: newHash,
                    updatedAt: new Date().toISOString()
                });
            } catch (err) {
                console.error("Firestore reset password error:", err);
            }
        }

        const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS) || "[]");
        const idx = local.findIndex(s => s.username.toLowerCase() === cleanUser);
        if (idx >= 0) {
            local[idx].passwordHash = newHash;
            localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(local));
        }
        return { success: true };
    },

    // Batch Seed 100 Students directly to Cloud Firestore
    async seed100StudentsToCloud(onProgress) {
        const templates = generate100StudentTemplates();
        const total = templates.length;

        // Ensure hashed passwords
        const fullStudents = [];
        for (let i = 0; i < templates.length; i++) {
            const s = templates[i];
            const hash = await hashPassword(s.defaultPassword);
            fullStudents.push({
                rollNo: s.rollNo,
                username: s.username,
                name: s.name,
                passwordHash: hash,
                status: "active",
                createdAt: new Date().toISOString(),
                lastLogin: null
            });
            if (onProgress) onProgress(i + 1, total, `தயாராகிறது: ${s.username}`);
        }

        // Write to Cloud Firestore if connected
        if (this.isCloudActive()) {
            try {
                // Batch in chunks of 50 (Firestore limit is 500)
                const batch1 = firestoreDb.batch();
                for (let i = 0; i < 50; i++) {
                    const st = fullStudents[i];
                    const ref = firestoreDb.collection("students").doc(st.username);
                    batch1.set(ref, st, { merge: true });
                }
                await batch1.commit();

                const batch2 = firestoreDb.batch();
                for (let i = 50; i < 100; i++) {
                    const st = fullStudents[i];
                    const ref = firestoreDb.collection("students").doc(st.username);
                    batch2.set(ref, st, { merge: true });
                }
                await batch2.commit();
                console.log("✓ All 100 student accounts seeded into Cloud Firestore!");
            } catch (err) {
                console.error("Firestore seed batch error:", err);
            }
        }

        // Always save to Local Store
        localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(fullStudents));
        return { success: true, count: 100 };
    },

    // ------------------------------------------------------------------------
    // Automatic Exam Results Saving & Fetching
    // ------------------------------------------------------------------------
    async saveExamResult(resultData) {
        const id = "res_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        const record = {
            id: id,
            studentUsername: resultData.studentUsername || "std001",
            studentName: resultData.studentName || "Student",
            unit: resultData.unit || "Unit 1",
            unitId: resultData.unitId || 1,
            marks: resultData.marks || 0,
            total: resultData.total || 40,
            percentage: resultData.percentage || 0,
            status: resultData.percentage >= 50 ? "Passed" : "Needs Improvement",
            mode: resultData.mode || "exam",
            timeSpent: resultData.timeSpent || "00:00",
            examDate: new Date().toLocaleString('ta-LK', { dateStyle: 'medium', timeStyle: 'short' }),
            timestamp: new Date().toISOString()
        };

        // 1. Cloud Firestore Save
        let cloudSaved = false;
        if (this.isCloudActive()) {
            try {
                await firestoreDb.collection("exam_results").doc(id).set(record);
                cloudSaved = true;
                console.log("✓ Result saved automatically to Cloud Firestore:", id);
            } catch (err) {
                console.error("Firestore saveExamResult failed:", err);
            }
        }

        // 2. Local Cloud Store Save
        const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.RESULTS) || "[]");
        local.unshift(record); // newest first
        localStorage.setItem(LOCAL_STORAGE_KEYS.RESULTS, JSON.stringify(local));

        return { success: true, record: record, cloudSaved: cloudSaved };
    },

    async getAllResults() {
        await ensureLocalStoreSeeded();

        if (this.isCloudActive()) {
            try {
                const snap = await firestoreDb.collection("exam_results").orderBy("timestamp", "desc").get();
                if (!snap.empty) {
                    const list = [];
                    snap.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
                    return list;
                }
            } catch (err) {
                console.warn("Could not fetch results from Firestore:", err);
            }
        }

        const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.RESULTS) || "[]");
        return local;
    },

    async deleteResult(resultId) {
        if (this.isCloudActive()) {
            try {
                await firestoreDb.collection("exam_results").doc(resultId).delete();
            } catch (err) {
                console.error("Firestore deleteResult error:", err);
            }
        }

        const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.RESULTS) || "[]");
        const filtered = local.filter(r => r.id !== resultId);
        localStorage.setItem(LOCAL_STORAGE_KEYS.RESULTS, JSON.stringify(filtered));
        return { success: true };
    },

    // ------------------------------------------------------------------------
    // 6-Unit Consolidated Marksheet Matrix Generation
    // ------------------------------------------------------------------------
    async getConsolidatedMarksheet() {
        const students = await this.getAllStudents();
        const results = await this.getAllResults();

        const matrix = students.map(student => {
            const studentResults = results.filter(r => r.studentUsername.toLowerCase() === student.username.toLowerCase());
            
            // Highest or latest marks for each of the 6 units
            const unitScores = { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null };
            let totalScore = 0;
            let unitsAttempted = 0;

            for (let u = 1; u <= 6; u++) {
                const uResults = studentResults.filter(r => r.unitId == u);
                if (uResults.length > 0) {
                    // Get highest percentage
                    const highest = Math.max(...uResults.map(r => r.percentage));
                    unitScores[u] = highest;
                    totalScore += highest;
                    unitsAttempted++;
                }
            }

            const overallAvg = unitsAttempted > 0 ? Math.round(totalScore / unitsAttempted) : null;

            return {
                rollNo: student.rollNo,
                username: student.username,
                name: student.name,
                status: student.status,
                units: unitScores,
                unitsAttempted: unitsAttempted,
                overallAvg: overallAvg,
                performance: overallAvg === null ? "தேர்வு எழுதவில்லை (Not Attempted)" :
                             overallAvg >= 75 ? "சிறப்புத் தேர்ச்சி (Distinction)" :
                             overallAvg >= 65 ? "நன்று (Very Good)" :
                             overallAvg >= 50 ? "தேர்ச்சி (Pass)" : "பயிற்சி தேவை (Needs Practice)"
            };
        });

        return matrix.sort((a, b) => a.rollNo - b.rollNo);
    }
};

// Initialize on script load
document.addEventListener('DOMContentLoaded', () => {
    initFirebase();
    ensureLocalStoreSeeded();
});
