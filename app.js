// Data Management & Cloud Sync
const CLOUD_DB_ID = '019dd134-167b-709c-ac14-e1c86a451633';
const CLOUD_URL = 'https://jsonblob.com/api/jsonBlob/' + CLOUD_DB_ID;

const DataManager = {
    save: (key, data) => {
        localStorage.setItem(`ista_${key}`, JSON.stringify(data));
        DataManager.syncToCloud();
    },
    load: (key) => JSON.parse(localStorage.getItem(`ista_${key}`)) || [],
    currentUser: null,
    
    syncToCloud: async () => {
        const fullData = {
            students: JSON.parse(localStorage.getItem('ista_students')) || [],
            grades: JSON.parse(localStorage.getItem('ista_grades')) || [],
            exams: JSON.parse(localStorage.getItem('ista_exams')) || []
        };
        try {
            await fetch(CLOUD_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(fullData)
            });
        } catch (e) {
            console.error("Cloud Sync Error", e);
        }
    },

    loadFromCloud: async () => {
        try {
            const res = await fetch(CLOUD_URL);
            const data = await res.json();
            
            const localStudents = JSON.parse(localStorage.getItem('ista_students')) || [];
            
            if (data && data.students && data.students.length > 0) {
                localStorage.setItem('ista_students', JSON.stringify(data.students || []));
                localStorage.setItem('ista_grades', JSON.stringify(data.grades || []));
                localStorage.setItem('ista_exams', JSON.stringify(data.exams || []));
                return true;
            } else if (localStudents.length > 0) {
                // If cloud is empty but teacher has local data, push to cloud
                DataManager.syncToCloud();
            }
        } catch (e) {
            console.error("Cloud Load Error", e);
        }
        return false;
    }
};

// Initial State
let currentRole = null;
let currentTab = 'students';
let isDarkMode = true;
let currentLang = localStorage.getItem('ista_lang') || 'fr';

const translations = {
    fr: {
        welcome: "Bienvenue ! Choisissez votre rôle :",
        teacher: "Formateur",
        student: "Stagiaire",
        login_btn: "Accéder au Dashboard",
        students_tab: "Stagiaires",
        grades_tab: "Notes",
        exams_tab: "Examens",
        attendance_tab: "Présence",
        analytics_tab: "Statistiques",
        my_grades: "Mes Notes",
        pass_exam: "Passer Examen",
        add_student: "Ajouter Stagiaire",
        search_placeholder: "Chercher par nom...",
        all_groups: "Tous les Groupes",
        export_pdf: "Export PDF",
        valider: "Valider",
        avg_class: "Moyenne Classe",
        best_note: "Meilleure Note",
        total_students: "Total Stagiaires",
        ranking: "Classement",
        results: "Mes Résultats",
        available_exams: "Examens Disponibles",
        start_exam: "Démarrer l'Examen",
        login_placeholder: "Votre nom",
        modal_name_placeholder: "Nom du stagiaire",
        modal_group_placeholder: "Groupe (ex: DEV101)",
        modal_exam_title: "Titre de l'examen",
        modal_time: "Temps (minutes)",
        status_draft: "Brouillon",
        status_published: "Publié",
        status_closed: "Fermé",
        publish_btn: "Publier",
        close_btn: "Fermer",
        error_fill_all: "Veuillez remplir tous les champs !",
        loading: "Chargement en cours..."
    },
    en: {
        welcome: "Welcome! Choose your role:",
        teacher: "Teacher",
        student: "Student",
        login_btn: "Enter Dashboard",
        students_tab: "Students",
        grades_tab: "Grades",
        exams_tab: "Exams",
        attendance_tab: "Attendance",
        analytics_tab: "Analytics",
        my_grades: "My Grades",
        pass_exam: "Take Exam",
        add_student: "Add Student",
        search_placeholder: "Search by name...",
        all_groups: "All Groups",
        export_pdf: "Export PDF",
        valider: "Submit",
        avg_class: "Class Average",
        best_note: "Top Grade",
        total_students: "Total Students",
        ranking: "Ranking",
        results: "My Results",
        available_exams: "Available Exams",
        start_exam: "Take Exam",
        login_placeholder: "Enter your name",
        modal_name_placeholder: "Student Name",
        modal_group_placeholder: "Group (e.g. DEV101)",
        modal_exam_title: "Exam Title",
        modal_time: "Time (minutes)",
        status_draft: "Draft",
        status_published: "Published",
        status_closed: "Closed",
        publish_btn: "Publish",
        close_btn: "Close",
        error_fill_all: "Please fill all fields!",
        loading: "Loading..."
    },
    ar: {
        welcome: "مرحباً بكم! اختر صفتك:",
        teacher: "أستاذ",
        student: "طالب",
        login_btn: "دخول للوحة التحكم",
        students_tab: "الطلبة",
        grades_tab: "النقط",
        exams_tab: "الامتحانات",
        attendance_tab: "الغـياب",
        analytics_tab: "الإحصائيات",
        my_grades: "نقطي",
        pass_exam: "اجتياز امتحان",
        add_student: "إضافة طالب",
        search_placeholder: "بحث عن اسم...",
        all_groups: "جميع المجموعات",
        export_pdf: "تحميل PDF",
        valider: "تأكيد",
        avg_class: "معدل القسم",
        best_note: "أعلى نقطة",
        total_students: "مجموع الطلبة",
        ranking: "الترتيب",
        results: "نتائجي",
        available_exams: "الامتحانات المتوفرة",
        start_exam: "بدء الامتحان",
        login_placeholder: "أدخل اسمك هنا",
        modal_name_placeholder: "اسم الطالب",
        modal_group_placeholder: "المجموعة (مثلاً: DEV101)",
        modal_exam_title: "عنوان الامتحان",
        modal_time: "الوقت (بالدقائق)",
        status_draft: "مسودة",
        status_published: "منشور",
        status_closed: "مغلق",
        publish_btn: "نشر",
        close_btn: "إغلاق",
        error_fill_all: "الرجاء ملء جميع الخانات!",
        loading: "جاري التحميل..."
    }
};

function t(key) {
    return translations[currentLang][key] || key;
}

function changeLang(lang) {
    currentLang = lang;
    localStorage.setItem('ista_lang', lang);
    applyRTLLogic(lang);
    location.reload();
}

function applyRTLLogic(lang) {
    if (lang === 'ar') {
        document.body.dir = 'rtl';
        document.body.style.textAlign = 'right';
    } else {
        document.body.dir = 'ltr';
        document.body.style.textAlign = 'left';
    }
}

// Theme Toggle
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('light-mode', !isDarkMode);
    const icon = document.getElementById('theme-icon');
    icon.className = isDarkMode ? 'fas fa-moon' : 'fas fa-sun';
    localStorage.setItem('ista_theme', isDarkMode ? 'dark' : 'light');
}

function loadTheme() {
    const saved = localStorage.getItem('ista_theme');
    if (saved === 'light') toggleTheme();
}

// UI Elements
const authSection = document.getElementById('auth-section');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const teacherNav = document.getElementById('teacher-nav');
const studentNav = document.getElementById('student-nav');
const contentArea = document.getElementById('content-area');

// Role Selection
function selectRole(role) {
    currentRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    loginForm.style.display = 'block';
    loginForm.classList.add('fade-in');
}

// Login
function login() {
    const name = document.getElementById('username').value.trim();
    const code = document.getElementById('usercode').value.trim();
    if (!name || !code) return showToast(t('error_fill_all'), 'danger');

    if (currentRole === 'student') {
        const students = DataManager.load('students');
        const student = students.find(s => s.name.toLowerCase() === name.toLowerCase() && s.code === code);
        if (!student) {
            return showToast("Smiya wla Code Massar ghalat!", 'danger');
        }
    } else if (currentRole === 'teacher') {
        const teacherPwd = localStorage.getItem('ista_teacher_pwd') || '1234';
        if (code !== teacherPwd) {
            return showToast("Mot de passe ghalat!", 'danger');
        }
    }

    DataManager.currentUser = { name, role: currentRole };
    localStorage.setItem('ista_session', JSON.stringify(DataManager.currentUser));
    
    renderApp();
}

function logout() {
    localStorage.removeItem('ista_session');
    location.reload();
}

// Rendering Logic
function renderApp() {
    const session = JSON.parse(localStorage.getItem('ista_session'));
    if (!session) return;

    authSection.style.display = 'none';
    mainApp.style.display = 'block';
    
    // Add Role Class for dynamic background
    document.body.classList.remove('role-teacher', 'role-student');
    document.body.classList.add(`role-${session.role}`);

    document.getElementById('display-name').innerText = session.name;
    document.getElementById('display-role').innerText = t(session.role);

    // Load Profile Picture
    const savedPic = localStorage.getItem(`ista_profile_${session.name}`);
    if (savedPic) {
        document.getElementById('profile-img').src = savedPic;
    } else {
        document.getElementById('profile-img').src = `https://ui-avatars.com/api/?name=${session.name}&background=6366f1&color=fff`;
    }

    if (session.role === 'teacher') {
        document.getElementById('btn-change-pwd').style.display = 'block';
        teacherNav.style.display = 'flex';
        switchTab('students');
    } else {
        document.getElementById('btn-change-pwd').style.display = 'none';
        studentNav.style.display = 'flex';
        switchTab('my-grades');
    }
}

function triggerProfileUpload() {
    document.getElementById('profile-upload').click();
}

function handleProfileUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const session = JSON.parse(localStorage.getItem('ista_session'));
            const base64Image = e.target.result;
            
            document.getElementById('profile-img').src = base64Image;
            localStorage.setItem(`ista_profile_${session.name}`, base64Image);
            showToast("Photo de profil mise à jour !");
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    showLoading();
    setTimeout(() => {
        renderContent(tab);
    }, 400);
}

function showLoading() {
    contentArea.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; gap: 1rem;">
            <div class="spinner"></div>
            <p style="color: var(--text-muted); animation: pulse 1.5s infinite;">${t('loading')}</p>
        </div>
    `;
}

function hideLoading() { }

function renderContent(tab) {
    contentArea.innerHTML = '';
    contentArea.classList.remove('fade-in');
    void contentArea.offsetWidth; // Trigger reflow
    contentArea.classList.add('fade-in');

    switch(tab) {
        case 'students': renderStudentsList(); break;
        case 'grades': renderGradesManagement(); break;
        case 'exams': renderExamsManagement(); break;
        case 'attendance': renderAttendance(); break;
        case 'analytics': renderAnalytics(); break;
        case 'my-grades': renderStudentGrades(); break;
        case 'take-exam': renderExamList(); break;
    }
}

// --- Content Components ---

function renderStudentsList() {
    const students = DataManager.load('students');
    const groups = [...new Set(students.map(s => s.group))];

    const existingCard = document.querySelector('.students-card');
    if (existingCard) {
        updateStudentsTable();
        return;
    }

    contentArea.innerHTML = `
        <div class="glass-card students-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2 style="margin: 0;">${t('students_tab')}</h2>
                <button class="btn btn-primary" onclick="showAddStudentModal()">
                    <i class="fas fa-plus"></i> ${t('add_student')}
                </button>
            </div>

            <div style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; margin-bottom: 2rem;">
                <div style="position: relative;">
                    <i class="fas fa-search" style="position: absolute; left: 1rem; top: 1rem; color: var(--text-muted);"></i>
                    <input type="text" id="student-search" placeholder="${t('search_placeholder')}" style="padding-left: 2.8rem; margin-bottom: 0;" oninput="updateStudentsTable()">
                </div>
                <select id="group-filter" onchange="updateStudentsTable()" style="margin-bottom: 0;">
                    <option value="">${t('all_groups')}</option>
                    ${groups.map(g => `<option value="${g}">${g}</option>`).join('')}
                </select>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="text-align: left; border-bottom: 1px solid var(--glass-border);">
                        <th style="padding: 1rem;">Nom</th>
                        <th style="padding: 1rem;">Code Massar</th>
                        <th style="padding: 1rem;">WhatsApp</th>
                        <th style="padding: 1rem;">Groupe</th>
                        <th style="padding: 1rem;">Action</th>
                    </tr>
                </thead>
                <tbody id="students-table-body"></tbody>
            </table>
        </div>
    `;
    updateStudentsTable();
}

function updateStudentsTable() {
    const students = DataManager.load('students');
    const searchVal = document.getElementById('student-search')?.value.toLowerCase() || '';
    const groupFilter = document.getElementById('group-filter')?.value || '';
    const tbody = document.getElementById('students-table-body');

    if (!tbody) return;

    const filtered = students.filter(s => 
        s.name.toLowerCase().includes(searchVal) && 
        (groupFilter === '' || s.group === groupFilter)
    );

    tbody.innerHTML = filtered.map((s, i) => `
        <tr class="fade-in" style="border-bottom: 1px solid var(--glass-border);">
            <td style="padding: 1rem;">${s.name}</td>
            <td style="padding: 1rem;">${s.code || '---'}</td>
            <td style="padding: 1rem;">${s.phone || '---'}</td>
            <td style="padding: 1rem;">${s.group}</td>
            <td style="padding: 1rem;">
                <button class="btn" style="color: var(--danger); padding: 0.5rem;" onclick="deleteStudent('${s.name}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-muted);">Hta chi wahed ma lqinah.</td></tr>';
    }
}

function showAddStudentModal() {
    openModal(t('add_student'), `
        <input type="text" id="modal-student-name" placeholder="${t('modal_name_placeholder')}">
        <input type="text" id="modal-student-group" placeholder="${t('modal_group_placeholder')}">
        <input type="text" id="modal-student-phone" value="212" placeholder="WhatsApp (ex: 212612345678)">
    `, () => {
        const name = document.getElementById('modal-student-name').value.trim();
        const group = document.getElementById('modal-student-group').value.trim();
        let phone = document.getElementById('modal-student-phone').value.trim();
        
        // Clean phone (keep only numbers)
        phone = phone.replace(/[^0-9]/g, '');
        // Convert Moroccan local format to international format for WhatsApp
        if (phone.startsWith('0')) {
            phone = '212' + phone.substring(1);
        }
        
        if (name && group && phone) {
            // Générer un code Massar automatique complexe (ex: M-A8F3K9)
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let randomStr = '';
            for (let i = 0; i < 6; i++) {
                randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const code = 'M-' + randomStr;
            
            const students = DataManager.load('students');
            students.push({ name, group, phone, code });
            DataManager.save('students', students);
            closeModal();
            renderStudentsList();
            
            // Sécuriser le nom pour l'attribut onclick
            const safeName = name.replace(/'/g, "\\'");
            
            // Afficher le code généré au prof bach y3tih l-talamid
            setTimeout(() => {
                openModal('Stagiaire Ajouté ! 🎉', `
                    <div style="text-align: center; padding: 1rem 0;">
                        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Sift had l-ma3loumat l-had stagiaire bach idkhl ishouf no9to:</p>
                        <div class="glass" style="padding: 1.5rem; border: 1px solid var(--success); border-radius: 12px; background: rgba(16, 185, 129, 0.1);">
                            <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Nom: <strong style="color: var(--text);">${name}</strong></p>
                            <p style="font-size: 1.3rem; margin-bottom: 0.5rem;">Code Massar: <strong style="color: var(--success); letter-spacing: 2px;">${code}</strong></p>
                            <p style="font-size: 1rem; color: var(--text-muted); margin-bottom: 1.5rem;"><i class="fab fa-whatsapp"></i> ${phone}</p>
                            
                            <a href="https://wa.me/${phone}?text=${encodeURIComponent('Salam ' + name + ' 👋,\n\nHa l-ma3loumat bach tdkhel l-plateforme ISTA AZILAL tchouf no9at dyalk:\n\n👤 *Smiya:* ' + name + '\n🔑 *Code Massar:* ' + code + '\n\nBon courage! 🎓')}" target="_blank" class="btn" style="background: #25D366; width: 100%; justify-content: center; color: white; text-decoration: none;">
                                <i class="fab fa-whatsapp"></i> Sift l-ma3loumat f WhatsApp
                            </a>
                        </div>
                    </div>
                `, () => closeModal());
            }, 300);
            
        } else {
            showToast("Khassk tdkhel Smiya, Groupe, w WhatsApp!", 'danger');
        }
    });
}

function deleteStudent(name) {
    if (confirm('Bghiti t-msah had l-étudiant?')) {
        let students = DataManager.load('students').filter(s => s.name !== name);
        DataManager.save('students', students);
        renderStudentsList();
        showToast('Étudiant supprimé!');
    }
}

function deleteExam(index) {
    if (confirm('Bghiti t-msah had l-examen?')) {
        let exams = DataManager.load('exams');
        exams.splice(index, 1);
        DataManager.save('exams', exams);
        renderExamsManagement();
        showToast('Examen supprimé!');
    }
}

// --- Grade Management ---
function renderGradesManagement() {
    const students = DataManager.load('students');
    const exams = DataManager.load('exams');
    const grades = DataManager.load('grades');

    contentArea.innerHTML = `
        <div class="glass-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="margin: 0;">${t('grades_tab')}</h2>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn" style="background: var(--success);" onclick="publishGrades()">
                        <i class="fas fa-eye"></i> Publier
                    </button>
                    <button class="btn" style="background: var(--accent);" onclick="exportGradesToPDF()">
                        <i class="fas fa-file-pdf"></i> ${t('export_pdf')}
                    </button>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 100px auto; gap: 1rem; margin-bottom: 2rem; align-items: start;">
                <select id="grade-student" style="margin-bottom: 0;">
                    <option value="">${t('students_tab')}</option>
                    ${students.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
                </select>
                <select id="grade-exam" style="margin-bottom: 0;">
                    <option value="">${t('exams_tab')}</option>
                    ${exams.map(e => `<option value="${e.title}">${e.title}</option>`).join('')}
                    <option value="Devoir 1">Devoir 1</option>
                    <option value="EFM">EFM</option>
                </select>
                <input type="number" id="grade-score" placeholder="/20" min="0" max="20" style="margin-bottom: 0;">
                <button class="btn btn-primary" onclick="addGrade()">${t('valider')}</button>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="text-align: left; border-bottom: 1px solid var(--glass-border);">
                        <th style="padding: 1rem;">Étudiant</th>
                        <th style="padding: 1rem;">Examen</th>
                        <th style="padding: 1rem;">Note</th>
                        <th style="padding: 1rem;">État</th>
                        <th style="padding: 1rem;">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${grades.map((g, index) => `
                        <tr style="border-bottom: 1px solid var(--glass-border);">
                            <td style="padding: 1rem;">${g.studentName}</td>
                            <td style="padding: 1rem;">${g.examTitle}</td>
                            <td style="padding: 1rem;">
                                <span class="badge" style="background: ${g.score >= 10 ? 'var(--success)' : 'var(--danger)'}; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.9rem;">
                                    ${g.score}/20
                                </span>
                            </td>
                            <td style="padding: 1rem;">
                                ${g.published ? '<span style="color: var(--success); font-size: 0.8rem;"><i class="fas fa-check-circle"></i> Mnchour</span>' : '<span style="color: var(--warning); font-size: 0.8rem;"><i class="fas fa-clock"></i> Mkhbiy</span>'}
                            </td>
                            <td style="padding: 1rem; display: flex; gap: 0.5rem;">
                                <button class="btn" style="background: #25D366; padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 8px; color: white; display: inline-flex; align-items: center; gap: 0.5rem;" onclick="sendWhatsApp('${g.studentName}', '${g.examTitle}', ${g.score})">
                                    <i class="fab fa-whatsapp"></i> Envoyer
                                </button>
                                <button class="btn" style="background: rgba(239, 68, 68, 0.2); color: var(--danger); padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;" onclick="deleteGrade(${index})" title="Msah No9ta">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function addGrade() {
    const studentName = document.getElementById('grade-student').value;
    let examTitle = document.getElementById('grade-exam').value;
    const scoreVal = document.getElementById('grade-score').value;
    const score = parseFloat(scoreVal);

    // Ila khellaha khawya, n3tiwha smiya par defaut
    if (!examTitle) {
        examTitle = "Évaluation";
    }

    if (!studentName || scoreVal === '') {
        showToast("Khassk tkhtar Smiya dyal l-étudiant w tdkhel No9ta!", 'danger');
        return;
    }
    if (score < 0 || score > 20) {
        showToast('Note khass t-koun bin 0 w 20!', 'danger');
        return;
    }

    const grades = DataManager.load('grades');
    grades.push({ studentName, examTitle, score, published: false });
    DataManager.save('grades', grades);
    
    showToast(`Note de ${score}/20 ajoutée pour ${studentName}!`);
    renderGradesManagement();
}

function deleteGrade(index) {
    if (confirm('Wesh met2ked bghiti tmse7 had n-no9ta?')) {
        let grades = DataManager.load('grades');
        grades.splice(index, 1);
        DataManager.save('grades', grades);
        renderGradesManagement();
        showToast('No9ta tms7at b nja7!', 'success');
    }
}

function publishGrades() {
    if (confirm("Wesh bghiti tbyn ga3 n-no9at l-talamid?")) {
        const grades = DataManager.load('grades');
        let count = 0;
        grades.forEach(g => {
            if (!g.published) {
                g.published = true;
                count++;
            }
        });
        if (count > 0) {
            DataManager.save('grades', grades);
            showToast(`Mzyan! ${count} no9at wlaw mnchorin db! 🎉`, 'success');
            renderGradesManagement();
        } else {
            showToast("Kolchi mnchour deja!", 'warning');
        }
    }
}

function sendWhatsApp(studentName, examTitle, score) {
    const students = DataManager.load('students');
    const student = students.find(s => s.name === studentName);
    
    if (!student || !student.phone) {
        return showToast("Hado stagiaire ma3ndouch numéro WhatsApp mssjel!", 'danger');
    }
    
    const message = encodeURIComponent(`Salam ${studentName},\n\nRak jbti *${score}/20* f l-imti7an dyal *${examTitle}*.\n\nCode Massar dyalk bach tdkhel l-plateforme howa: *${student.code}*\n\nBon courage! 🎓`);
    const whatsappUrl = `https://wa.me/${student.phone}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
}

function sendLoginWhatsApp(name, code, phone) {
    const message = encodeURIComponent(`Salam ${name} 👋,\n\nHa l-ma3loumat bach tdkhel l-plateforme ISTA AZILAL tchouf no9at dyalk:\n\n👤 *Smiya:* ${name}\n🔑 *Code Massar:* ${code}\n\nLien: http://localhost:5500\n\nBon courage! 🎓`);
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
}

async function exportGradesToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const grades = DataManager.load('grades');
    const students = DataManager.load('students');
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const session = JSON.parse(localStorage.getItem('ista_session'));
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // ============ DECORATIVE LEFT ACCENT BAR ============
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 6, pageH, 'F');

    // Accent dots on left bar
    doc.setFillColor(139, 92, 246);
    doc.circle(3, 50, 1.5, 'F');
    doc.circle(3, 100, 1.5, 'F');
    doc.circle(3, 150, 1.5, 'F');
    doc.circle(3, 200, 1.5, 'F');
    doc.circle(3, 250, 1.5, 'F');

    // ============ HEADER GRADIENT BAR ============
    // Main header background
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(12, 8, pageW - 24, 42, 4, 4, 'F');

    // Gradient overlay effect (simulate with layered rects)
    doc.setFillColor(99, 102, 241);
    doc.setGState(new doc.GState({ opacity: 0.15 }));
    doc.roundedRect(12, 8, pageW - 24, 42, 4, 4, 'F');
    doc.setGState(new doc.GState({ opacity: 1 }));

    // Header accent line (top)
    doc.setFillColor(99, 102, 241);
    doc.rect(12, 8, pageW - 24, 3, 'F');
    // Secondary accent line
    doc.setFillColor(236, 72, 153);
    doc.rect(12, 8, (pageW - 24) * 0.4, 3, 'F');

    // Logo / Title
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text("ISTA AZILAL", 20, 28);

    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text("Plateforme de Gestion Pédagogique", 20, 35);
    
    // Badge on right
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(pageW - 62, 17, 48, 14, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text("RELEVÉ OFFICIEL", pageW - 58, 26);

    // Date under header
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.text(`Généré le: ${today}`, 20, 44);

    // Generated by
    if (session) {
        doc.text(`Par: ${session.name}`, pageW - 14 - doc.getTextWidth(`Par: ${session.name}`), 44);
    }

    // ============ STATISTICS CARDS ============
    const avgScore = grades.length > 0 ? (grades.reduce((a, b) => a + b.score, 0) / grades.length).toFixed(1) : '0.0';
    const maxScore = grades.length > 0 ? Math.max(...grades.map(g => g.score)) : 0;
    const minScore = grades.length > 0 ? Math.min(...grades.map(g => g.score)) : 0;
    const passCount = grades.filter(g => g.score >= 10).length;
    const failCount = grades.filter(g => g.score < 10).length;
    const passRate = grades.length > 0 ? ((passCount / grades.length) * 100).toFixed(0) : '0';

    const cardY = 56;
    const cardH = 22;
    const cardGap = 4;
    const cardW = (pageW - 24 - (cardGap * 3)) / 4;

    // Card 1 — Moyenne
    doc.setFillColor(240, 244, 255);
    doc.roundedRect(12, cardY, cardW, cardH, 3, 3, 'F');
    doc.setFillColor(99, 102, 241);
    doc.rect(12, cardY, 3, cardH, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text("MOYENNE CLASSE", 19, cardY + 7);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text(`${avgScore}/20`, 19, cardY + 17);

    // Card 2 — Meilleure Note
    const card2X = 12 + cardW + cardGap;
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(card2X, cardY, cardW, cardH, 3, 3, 'F');
    doc.setFillColor(16, 185, 129);
    doc.rect(card2X, cardY, 3, cardH, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text("MEILLEURE NOTE", card2X + 7, cardY + 7);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`${maxScore}/20`, card2X + 7, cardY + 17);

    // Card 3 — Taux de Réussite
    const card3X = 12 + (cardW + cardGap) * 2;
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(card3X, cardY, cardW, cardH, 3, 3, 'F');
    doc.setFillColor(245, 158, 11);
    doc.rect(card3X, cardY, 3, cardH, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text("TAUX RÉUSSITE", card3X + 7, cardY + 7);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text(`${passRate}%`, card3X + 7, cardY + 17);

    // Card 4 — Total Étudiants
    const card4X = 12 + (cardW + cardGap) * 3;
    doc.setFillColor(252, 231, 243);
    doc.roundedRect(card4X, cardY, cardW, cardH, 3, 3, 'F');
    doc.setFillColor(236, 72, 153);
    doc.rect(card4X, cardY, 3, cardH, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text("TOTAL NOTES", card4X + 7, cardY + 7);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(236, 72, 153);
    doc.text(`${grades.length}`, card4X + 7, cardY + 17);

    // ============ TABLE SECTION TITLE ============
    const tableStartY = cardY + cardH + 10;
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(12, tableStartY, 4, 8, 1, 1, 'F');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("Détail des Notes", 20, tableStartY + 6);

    // Separator line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(12, tableStartY + 10, pageW - 12, tableStartY + 10);

    // ============ GRADES TABLE ============
    const tableData = grades.map((g, i) => [
        (i + 1).toString(),
        g.studentName,
        g.examTitle,
        `${g.score}/20`,
        g.score >= 16 ? 'Excellent' : g.score >= 14 ? 'Très Bien' : g.score >= 12 ? 'Bien' : g.score >= 10 ? 'Passable' : 'Non Validé'
    ]);

    doc.autoTable({
        startY: tableStartY + 14,
        head: [['#', 'Étudiant', 'Examen', 'Note', 'Mention']],
        body: tableData,
        theme: 'plain',
        margin: { left: 12, right: 12 },
        headStyles: {
            fillColor: [99, 102, 241],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            cellPadding: 5,
            halign: 'left'
        },
        bodyStyles: {
            fontSize: 9,
            cellPadding: 5,
            textColor: [30, 41, 59],
            lineColor: [226, 232, 240],
            lineWidth: 0.2
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252]
        },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center', fontStyle: 'bold', textColor: [148, 163, 184] },
            1: { cellWidth: 'auto', fontStyle: 'bold' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 28, halign: 'center', fontStyle: 'bold' },
            4: { cellWidth: 32, halign: 'center' }
        },
        didParseCell: function(data) {
            // Color-code the Note column
            if (data.column.index === 3 && data.section === 'body') {
                const score = parseFloat(data.cell.raw);
                if (score >= 16) {
                    data.cell.styles.textColor = [16, 185, 129];
                } else if (score >= 10) {
                    data.cell.styles.textColor = [99, 102, 241];
                } else {
                    data.cell.styles.textColor = [239, 68, 68];
                }
            }
            // Color-code the Mention column
            if (data.column.index === 4 && data.section === 'body') {
                const mention = data.cell.raw;
                if (mention === 'Excellent') {
                    data.cell.styles.textColor = [16, 185, 129];
                    data.cell.styles.fontStyle = 'bold';
                } else if (mention === 'Très Bien') {
                    data.cell.styles.textColor = [14, 165, 233];
                } else if (mention === 'Bien') {
                    data.cell.styles.textColor = [99, 102, 241];
                } else if (mention === 'Passable') {
                    data.cell.styles.textColor = [245, 158, 11];
                } else {
                    data.cell.styles.textColor = [239, 68, 68];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
        didDrawPage: function(data) {
            // Footer on each page
            const footerY = pageH - 15;
            
            // Footer separator
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.3);
            doc.line(12, footerY - 5, pageW - 12, footerY - 5);

            // Left side — branding
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(148, 163, 184);
            doc.text("ISTA AZILAL — Plateforme de Gestion Pédagogique", 12, footerY);

            // Center — page number
            const pageNum = `Page ${data.pageNumber}`;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(99, 102, 241);
            doc.text(pageNum, pageW / 2 - doc.getTextWidth(pageNum) / 2, footerY);

            // Right side — confidential
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(148, 163, 184);
            const confText = "Document Confidentiel";
            doc.text(confText, pageW - 12 - doc.getTextWidth(confText), footerY);

            // Left accent bar on every page
            doc.setFillColor(99, 102, 241);
            doc.rect(0, 0, 6, pageH, 'F');
        }
    });

    // ============ SUMMARY BOX (after table) ============
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Check if there's enough space, if not add new page
    if (finalY + 30 < pageH - 25) {
        // Summary box background
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(12, finalY, pageW - 24, 24, 3, 3, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(12, finalY, pageW - 24, 24, 3, 3, 'S');

        // Summary icon area
        doc.setFillColor(99, 102, 241);
        doc.roundedRect(16, finalY + 4, 16, 16, 2, 2, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text("i", 24 - doc.getTextWidth("i") / 2, finalY + 14);

        // Summary text
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text("Résumé:", 36, finalY + 10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(`${passCount} validé(s)  |  ${failCount} non validé(s)  |  Note min: ${minScore}/20  |  Note max: ${maxScore}/20  |  Moyenne: ${avgScore}/20`, 36, finalY + 17);
    }

    // ============ SAVE PDF ============
    const pdfBlob = doc.output('blob');
    
    if (window.showSaveFilePicker) {
        try {
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: `releve-notes-${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`,
                types: [{
                    description: 'Document PDF',
                    accept: { 'application/pdf': ['.pdf'] }
                }]
            });
            const writable = await fileHandle.createWritable();
            await writable.write(pdfBlob);
            await writable.close();
            showToast('✅ PDF t-sauvegarder b nja7! 🎉');
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error(err);
                showToast('Erreur f l-enregistrement!', 'danger');
            }
        }
    } else {
        const blobUrl = URL.createObjectURL(pdfBlob);
        window.open(blobUrl, '_blank');
        showToast('PDF mftou7 f tab jdid — Dir Ctrl+S bach t-save-ih fin ma bghiti!');
    }
}

function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'glass fade-in';
    const bgColor = type === 'success' ? 'var(--success)' : 'var(--danger)';
    toast.style.cssText = `position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 2rem; background: ${bgColor}; color: white; border-radius: 10px; z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3);`;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// --- Exam Management ---
function renderExamsManagement() {
    const exams = DataManager.load('exams');
    contentArea.innerHTML = `
        <div class="glass-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>${t('exams_tab')}</h2>
                <button class="btn btn-primary" onclick="showCreateExam()">
                    <i class="fas fa-plus"></i> ${t('exams_tab')}
                </button>
            </div>
            <div id="exams-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
                ${exams.map((e, i) => `
                    <div class="glass" style="padding: 1.5rem; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; right: 0; padding: 0.3rem 1rem; font-size: 0.7rem; font-weight: 700; background: ${getStatusColor(e.status)};">
                            ${t('status_' + (e.status || 'draft'))}
                        </div>
                        <h3 style="margin-top: 0.5rem;">${e.title}</h3>
                        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">${e.questions.length} Questions | ${e.timer} min</p>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn" style="background: var(--success); flex: 1; font-size: 0.8rem;" onclick="updateExamStatus(${i}, 'published')">${t('publish_btn')}</button>
                            <button class="btn" style="background: rgba(255,255,255,0.05); color: var(--danger); padding: 0.5rem;" onclick="deleteExam(${i})"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function getStatusColor(status) {
    switch(status) {
        case 'published': return 'var(--success)';
        case 'closed': return 'var(--danger)';
        default: return 'var(--warning)';
    }
}

function updateExamStatus(index, status) {
    const exams = DataManager.load('exams');
    exams[index].status = status;
    DataManager.save('exams', exams);
    renderExamsManagement();
}

function showCreateExam() {
    openModal(t('exams_tab'), `<input type="text" id="modal-exam-title" placeholder="${t('modal_exam_title')}"><input type="number" id="modal-exam-timer" placeholder="${t('modal_time')}" value="20">`, () => {
        const title = document.getElementById('modal-exam-title').value.trim();
        const timer = parseInt(document.getElementById('modal-exam-timer').value);
        if (title && timer) {
            const exams = DataManager.load('exams');
            exams.push({ title, timer, questions: [{q: "HTML?", a: ["Prog", "Balisage", "Soft"], correct: 1}], status: 'draft' });
            DataManager.save('exams', exams);
            closeModal();
            renderExamsManagement();
        }
    });
}

// --- Analytics ---
function renderAnalytics() {
    const grades = DataManager.load('grades');
    if (grades.length === 0) {
        contentArea.innerHTML = '<div class="glass-card"><h2>Analytics</h2><p>Khass n-dakhlou n-qitat bach n-choufou l-mibyane.</p></div>';
        return;
    }
    contentArea.innerHTML = `<div class="glass-card"><h2>${t('analytics_tab')}</h2><div style="height: 400px; margin-top: 2rem;"><canvas id="performanceChart"></canvas></div></div>`;
    const avgScore = (grades.reduce((a, b) => a + b.score, 0) / grades.length).toFixed(1);
    const maxScore = Math.max(...grades.map(g => g.score));
    const totalStudents = [...new Set(DataManager.load('students').map(s => s.name))].length;
    contentArea.insertAdjacentHTML('afterbegin', `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;"><div class="glass" style="padding: 1.5rem; border-left: 4px solid var(--primary);"><p style="color: var(--text-muted); font-size: 0.9rem;">${t('avg_class')}</p><h3 style="font-size: 2rem; margin: 0.5rem 0;">${avgScore}</h3></div><div class="glass" style="padding: 1.5rem; border-left: 4px solid var(--secondary);"><p style="color: var(--text-muted); font-size: 0.9rem;">${t('best_note')}</p><h3 style="font-size: 2rem; margin: 0.5rem 0;">${maxScore}</h3></div><div class="glass" style="padding: 1.5rem; border-left: 4px solid var(--success);"><p style="color: var(--text-muted); font-size: 0.9rem;">${t('total_students')}</p><h3 style="font-size: 2rem; margin: 0.5rem 0;">${totalStudents}</h3></div></div>`);
    new Chart(document.getElementById('performanceChart'), { type: 'bar', data: { labels: grades.map(g => g.studentName), datasets: [{ label: 'Notes / 20', data: grades.map(g => g.score), backgroundColor: 'rgba(99, 102, 241, 0.5)', borderColor: '#6366f1', borderWidth: 2 }] }, options: { maintainAspectRatio: false } });
}

// --- Student View ---
function renderStudentGrades() {
    const session = JSON.parse(localStorage.getItem('ista_session'));
    const allGrades = DataManager.load('grades');
    const myGrades = allGrades.filter(g => g.studentName === session.name && g.published);
    const rankings = Object.keys(allGrades).map(name => ({ name, avg: 10 })).sort((a,b) => b.avg - a.avg);
    const myRank = rankings.findIndex(r => r.name === session.name) + 1;
    contentArea.innerHTML = `<div class="glass-card"><h2>${t('results')}</h2>${myRank > 0 ? `<div class="glass" style="padding: 1rem; border-color: var(--secondary);"><p style="font-size: 0.8rem;">${t('ranking')}: #${myRank}</p></div>` : ''}<div style="display: grid; gap: 1rem; margin-top: 2rem;">${myGrades.length > 0 ? myGrades.map(g => `<div class="glass" style="padding: 1.5rem; display: flex; justify-content: space-between;"><h3>${g.examTitle}</h3><span>${g.score}/20</span></div>`).join('') : '<p style="color: var(--text-muted); text-align: center;">Mzal makayn ta no9ta mnchoura lik.</p>'}</div></div>`;
}

function renderExamList() {
    const exams = DataManager.load('exams').filter(e => e.status === 'published');
    contentArea.innerHTML = `<div class="glass-card"><h2>${t('available_exams')}</h2><div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem;">${exams.map((e, i) => `<div class="glass" style="padding: 1.5rem;"><h3>${e.title}</h3><button class="btn btn-primary" onclick="startExam(${i})">${t('start_exam')}</button></div>`).join('')}</div></div>`;
}

function startExam(index) {
    const exams = DataManager.load('exams').filter(e => e.status === 'published');
    const currentExam = exams[index];
    contentArea.innerHTML = `<div class="glass-card"><h2>${currentExam.title}</h2><button class="btn btn-primary" onclick="submitExam()">Terminer</button></div>`;
}

function submitExam() {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    switchTab('my-grades');
}

function renderAttendance() {
    const students = DataManager.load('students');
    contentArea.innerHTML = `<div class="glass-card"><h2>Presence</h2>${students.map(s => `<div class="glass" style="margin-bottom: 0.5rem; padding: 1rem;">${s.name}</div>`).join('')}</div>`;
}

function openModal(title, content, onSubmit) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-submit').onclick = onSubmit;
}

function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }

function showChangePwdModal() {
    openModal('Bdel Mot de Passe', `
        <input type="password" id="old-pwd" placeholder="Mot de passe l-9dim">
        <input type="password" id="new-pwd" placeholder="Mot de passe jdid">
    `, () => {
        const oldPwd = document.getElementById('old-pwd').value.trim();
        const newPwd = document.getElementById('new-pwd').value.trim();
        const currentPwd = localStorage.getItem('ista_teacher_pwd') || '1234';
        
        if (oldPwd !== currentPwd) {
            return showToast("Mot de passe l-9dim ghalat!", 'danger');
        }
        if (!newPwd) {
            return showToast("Dakhel mot de passe jdid!", 'danger');
        }
        
        localStorage.setItem('ista_teacher_pwd', newPwd);
        closeModal();
        showToast("Mot de passe tbeddel b nja7! 🎉");
    });
}

window.onload = async () => {
    document.getElementById('lang-selector').value = currentLang;
    applyRTLLogic(currentLang);
    loadTheme();
    
    // Nchargiw ma3loumat mn l-cloud (internet)
    document.querySelector('#auth-section p').innerText = "Jari jme3 l-ma3loumat mn l-internet (Cloud)...";
    await DataManager.loadFromCloud();
    
    renderApp();
    document.querySelector('#auth-section p').innerText = t('welcome');
    document.querySelectorAll('.role-btn span')[0].innerText = t('teacher');
    document.querySelectorAll('.role-btn span')[1].innerText = t('student');
    document.querySelector('#login-form button').innerHTML = `${t('login_btn')} <i class="fas fa-arrow-right"></i>`;
    document.getElementById('username').placeholder = t('login_placeholder');
};
