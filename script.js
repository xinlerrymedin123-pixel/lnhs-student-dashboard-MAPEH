// ==========================================
// 1. GLOBAL VARIABLES & INITIALIZATION
// ==========================================

let studentDatabase = JSON.parse(localStorage.getItem('studentDatabase')) || [];
let currentStudentId = null;

// DOM Elements
const quickSelect = document.getElementById('quickSelect');
const noStudentsText = document.getElementById('noStudentsText');
const finalGradeDisplay = document.getElementById('finalGradeDisplay');

// Input Fields
const studentNameInput = document.getElementById('studentName');
const studentGradeInput = document.getElementById('studentGrade');
const studentTermInput = document.getElementById('studentTerm');
const studentSubjectInput = document.getElementById('studentSubject');
const studentTeacherInput = document.getElementById('studentTeacher');
const studentSYInput = document.getElementById('studentSY');
const teacherCommentsInput = document.getElementById('teacherComments');
const parentCommentsInput = document.getElementById('parentComments');

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    updateQuickSelectDropdown();
    
    // Add event listeners to all score inputs to auto-calculate as you type
    document.querySelectorAll('.score-input').forEach(input => {
        input.addEventListener('input', calculateAllGrades);
    });
});

// ==========================================
// 2. EVENT LISTENERS (BUTTONS)
// ==========================================

document.getElementById('btnNew').addEventListener('click', () => {
    clearForm();
    currentStudentId = null;
    alert("Form cleared. Ready for a new student.");
});

document.getElementById('btnSave').addEventListener('click', saveCurrentStudent);

document.getElementById('btnClear').addEventListener('click', clearForm);

document.getElementById('btnDelete').addEventListener('click', deleteCurrentStudent);

document.getElementById('btnPrint').addEventListener('click', () => {
    window.print();
});

document.getElementById('btnBulk').addEventListener('click', () => {
    alert("Bulk add feature coming soon!");
});

quickSelect.addEventListener('change', (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const student = studentDatabase.find(s => s.id === selectedId);
    if (student) {
        currentStudentId = student.id;
        populateForm(student);
    }
});

// ==========================================
// 3. CORE FUNCTIONS
// ==========================================

function saveCurrentStudent() {
    if (!studentNameInput.value) {
        alert("Please enter a student name before saving.");
        return;
    }

    // Gather all scores
    const wwScores = Array.from(document.querySelectorAll('.ww-input')).map(i => parseFloat(i.value) || 0);
    const ptScores = Array.from(document.querySelectorAll('.pt-input')).map(i => parseFloat(i.value) || 0);
    const exScores = Array.from(document.querySelectorAll('.ex-input')).map(i => parseFloat(i.value) || 0);

    const studentData = {
        id: currentStudentId || Date.now().toString(),
        name: studentNameInput.value,
        gradeSection: studentGradeInput.value,
        term: studentTermInput.value,
        subject: studentSubjectInput.value,
        teacher: studentTeacherInput.value,
        sy: studentSYInput.value,
        scores: { ww: wwScores, pt: ptScores, ex: exScores },
        comments: {
            teacher: teacherCommentsInput.value,
            parent: parentCommentsInput.value
        }
    };

    // Update existing or add new
    const existingIndex = studentDatabase.findIndex(s => s.id === studentData.id);
    if (existingIndex > -1) {
        studentDatabase[existingIndex] = studentData;
    } else {
        studentDatabase.push(studentData);
    }

    // Save to browser storage
    localStorage.setItem('studentDatabase', JSON.stringify(studentDatabase));
    
    currentStudentId = studentData.id;
    updateQuickSelectDropdown();
    quickSelect.value = currentStudentId;
    
    alert(`Student "${studentData.name}" saved successfully!`);
}

function populateForm(student) {
    studentNameInput.value = student.name || '';
    studentGradeInput.value = student.gradeSection || '';
    studentTermInput.value = student.term || '';
    studentSubjectInput.value = student.subject || '';
    studentTeacherInput.value = student.teacher || '';
    studentSYInput.value = student.sy || '';
    teacherCommentsInput.value = student.comments.teacher || '';
    parentCommentsInput.value = student.comments.parent || '';

    // Populate WW Scores
    const wwInputs = document.querySelectorAll('.ww-input');
    student.scores.ww.forEach((score, index) => {
        if(wwInputs[index]) wwInputs[index].value = score || '';
    });

    // Populate PT Scores
    const ptInputs = document.querySelectorAll('.pt-input');
    student.scores.pt.forEach((score, index) => {
        if(ptInputs[index]) ptInputs[index].value = score || '';
    });

    // Populate EX Scores
    const exInputs = document.querySelectorAll('.ex-input');
    student.scores.ex.forEach((score, index) => {
        if(exInputs[index]) exInputs[index].value = score || '';
    });

    calculateAllGrades();
}

function clearForm() {
    document.querySelectorAll('input').forEach(input => input.value = '');
    document.querySelectorAll('textarea').forEach(textarea => textarea.value = '');
    currentStudentId = null;
    quickSelect.value = "";
    calculateAllGrades(); 
}

function deleteCurrentStudent() {
    if (!currentStudentId) {
        alert("No student selected to delete.");
        return;
    }

    if (confirm("Are you sure you want to delete this student?")) {
        studentDatabase = studentDatabase.filter(s => s.id !== currentStudentId);
        localStorage.setItem('studentDatabase', JSON.stringify(studentDatabase));
        clearForm();
        updateQuickSelectDropdown();
    }
}

// ==========================================
// 4. CALCULATION FUNCTIONS
// ==========================================

function calculateAllGrades() {
    // 1. Calculate WW Percentage
    let wwTotal = 0;
    document.querySelectorAll('.ww-input').forEach(input => wwTotal += parseFloat(input.value) || 0);
    let wwPercentage = (wwTotal / 80) * 100; // 80 is max score (10 * 8 items)
    document.getElementById('wwPercentage').textContent = `WW Percentage: ${wwPercentage.toFixed(2)}%`;

    // 2. Calculate PT Percentage
    let ptTotal = 0;
    document.querySelectorAll('.pt-input').forEach(input => ptTotal += parseFloat(input.value) || 0);
    let ptPercentage = (ptTotal / 900) * 100; // 900 is max score (100 * 9 items)
    document.getElementById('ptPercentage').textContent = `PT Percentage: ${ptPercentage.toFixed(2)}%`;

    // 3. Calculate EX Percentage
    let exTotal = 0;
    document.querySelectorAll('.ex-input').forEach(input => exTotal += parseFloat(input.value) || 0);
    let exPercentage = (exTotal / 100) * 100; // 100 is max score (25+25+50)
    document.getElementById('exPercentage').textContent = `EX Percentage: ${exPercentage.toFixed(2)}%`;

    // 4. Calculate Final Grade (WW 20%, PT 50%, EX 30%)
    let finalGrade = (wwPercentage * 0.20) + (ptPercentage * 0.50) + (exPercentage * 0.30);
    
    // Handle NaN if fields are empty
    if (isNaN(finalGrade)) finalGrade = 0;

    finalGradeDisplay.textContent = `Final Grade: ${finalGrade.toFixed(2)}`;
}

// ==========================================
// 5. HELPER FUNCTIONS
// ==========================================

function updateQuickSelectDropdown() {
    quickSelect.innerHTML = '<option value="">-- Select a student --</option>';
    
    studentDatabase.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = student.name;
        quickSelect.appendChild(option);
    });

    if (studentDatabase.length > 0) {
        noStudentsText.style.display = 'none';
    } else {
        noStudentsText.style.display = 'block';
    }
}