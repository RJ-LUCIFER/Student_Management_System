const STORAGE_KEY = "gmiu_students_v1";

const $ = (id) => document.getElementById(id);

const modal = $("modal");
const form = $("studentForm");
const tableBody = $("studentTableBody");
const emptyState = $("emptyState");
const searchInput = $("searchInput");

function getStudents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveStudents(students) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
}

function showMessage(text) {
  $("message").textContent = text;
  $("message").classList.remove("hidden");
  setTimeout(() => $("message").classList.add("hidden"), 2200);
}

function render() {
  const all = getStudents();
  const query = searchInput.value.trim().toLowerCase();

  const students = all.filter(s =>
    [s.enrollmentNo, s.name, s.email, s.course, s.phone]
      .some(v => String(v).toLowerCase().includes(query))
  );

  tableBody.innerHTML = students.map((s, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHTML(s.enrollmentNo)}</td>
      <td>${escapeHTML(s.name)}</td>
      <td>${escapeHTML(s.email)}</td>
      <td>${escapeHTML(s.course)}</td>
      <td>${escapeHTML(s.semester)}</td>
      <td>${escapeHTML(s.phone)}</td>
      <td>
        <button class="action edit" onclick="editStudent('${s.id}')">Edit</button>
        <button class="action delete" onclick="deleteStudent('${s.id}')">Delete</button>
      </td>
    </tr>
  `).join("");

  emptyState.classList.toggle("hidden", students.length !== 0);

  $("totalStudents").textContent = all.length;
  $("ceStudents").textContent = all.filter(s =>
    s.course.toLowerCase().includes("computer")
  ).length;

  $("latestStudent").textContent = all.length ? all[all.length - 1].name : "—";
}

function openModal(student = null) {
  form.reset();
  $("studentId").value = "";
  $("course").value = "Computer Engineering";

  if (student) {
    $("modalTitle").textContent = "Edit Student";
    $("studentId").value = student.id;
    $("enrollmentNo").value = student.enrollmentNo;
    $("name").value = student.name;
    $("email").value = student.email;
    $("course").value = student.course;
    $("semester").value = student.semester;
    $("phone").value = student.phone;
  } else {
    $("modalTitle").textContent = "Add Student";
  }

  modal.classList.remove("hidden");
  $("name").focus();
}

function closeModal() {
  modal.classList.add("hidden");
}

$("addBtn").addEventListener("click", () => openModal());
$("closeModal").addEventListener("click", closeModal);
$("cancelBtn").addEventListener("click", closeModal);
searchInput.addEventListener("input", render);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const students = getStudents();
  const id = $("studentId").value;

  const student = {
    id: id || crypto.randomUUID(),
    enrollmentNo: $("enrollmentNo").value.trim(),
    name: $("name").value.trim(),
    email: $("email").value.trim(),
    course: $("course").value.trim(),
    semester: $("semester").value,
    phone: $("phone").value.trim(),
    updatedAt: new Date().toISOString()
  };

  const duplicate = students.some(s =>
    s.enrollmentNo.toLowerCase() === student.enrollmentNo.toLowerCase() &&
    s.id !== id
  );

  if (duplicate) {
    alert("Enrollment number already exists.");
    return;
  }

  if (id) {
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) students[index] = student;
    showMessage("Student updated successfully.");
  } else {
    students.push(student);
    showMessage("Student added successfully.");
  }

  saveStudents(students);
  closeModal();
  render();
});

window.editStudent = function(id) {
  const student = getStudents().find(s => s.id === id);
  if (student) openModal(student);
};

window.deleteStudent = function(id) {
  const students = getStudents();
  const student = students.find(s => s.id === id);

  if (!student) return;

  if (confirm(`Delete ${student.name}?`)) {
    saveStudents(students.filter(s => s.id !== id));
    render();
    showMessage("Student deleted successfully.");
  }
};

$("clearBtn").addEventListener("click", () => {
  const students = getStudents();

  if (!students.length) {
    showMessage("There are no records to clear.");
    return;
  }

  if (confirm("Delete all student records from this browser?")) {
    localStorage.removeItem(STORAGE_KEY);
    render();
    showMessage("All student records cleared.");
  }
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

render();
