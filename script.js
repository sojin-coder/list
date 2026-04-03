 // Firebase imports
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
  import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    doc,
    updateDoc,
  } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

  // Firebase Config
  const firebaseConfig = {
    apiKey: "AIzaSyBN9CPViV4ok9kAhZTBGm8h76x8XcAdmGk",
    authDomain: "my-listing-947ff.firebaseapp.com",
    projectId: "my-listing-947ff",
    storageBucket: "my-listing-947ff.appspot.com",
    messagingSenderId: "1039885458733",
    appId: "1:1039885458733:web:0e3a06b5dd600e3b2f07a4",
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const studentsCol = collection(db, "students");

  // Helper: Format money (USD style or Riel style)
  const formatMoney = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return "$0";
    if (num < 1000) {
      return `$${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    } else {
      return `${num.toLocaleString("km-KH")} ៛`;
    }
  };

  // DOM elements
  const tbody = document.getElementById("participantTableBody");
  const recordSpan = document.getElementById("recordCount");
  const form = document.getElementById("participantForm");
  const fullNameInput = document.getElementById("fullName");
  const addressInput = document.getElementById("address");
  const moneyInput = document.getElementById("money");

  // Edit modal elements
  const editModalElem = document.getElementById("editModal");
  let editModalInstance = null;
  const editIdInput = document.getElementById("editId");
  const editNameInput = document.getElementById("editName");
  const editAddressInput = document.getElementById("editAddress");
  const editMoneyInput = document.getElementById("editMoney");
  const confirmUpdateBtn = document.getElementById("confirmUpdateBtn");

  // Real-time listener (with record counter)
  onSnapshot(studentsCol, (snapshot) => {
    const records = snapshot.docs;
    recordSpan.innerText = records.length;
    
    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-5">
        <i class="fas fa-folder-open d-block mb-3 fs-1 opacity-50"></i>
        គ្មានទិន្នន័យ សូមបញ្ចូលអ្នកចូលរួមថ្មី!
      </td></tr>`;
      return;
    }

    let html = "";
    let counter = 1;
    records.forEach((docSnap) => {
      const data = docSnap.data();
      const docId = docSnap.id;
      html += `
        <tr>
          <td class="text-center fw-bold" style="color: #a0e7ff;">${counter++}</td>
          <td class="fw-semibold">${escapeHtml(data.full_name) || ""}</td>
          <td><i class="fas fa-location-dot me-2 opacity-75" style="color:#7aa2f7;"></i> ${escapeHtml(data.address) || ""}</td>
          <td class="text-end money-cell">${formatMoney(data.money)}</td>
          <td class="text-center">
            <button class="action-btn-digital btn-edit-v2" data-edit-id="${docId}" data-fullname="${escapeHtml(data.full_name)}" data-address="${escapeHtml(data.address)}" data-money="${data.money}">
              <i class="fas fa-pen"></i>
            </button>
            <button class="action-btn-digital btn-del-v2" data-delete-id="${docId}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;

    // attach delete & edit events dynamically after render
    document.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.removeEventListener('click', handleDelete);
      btn.addEventListener('click', handleDelete);
    });
    document.querySelectorAll('[data-edit-id]').forEach(btn => {
      btn.removeEventListener('click', handleEdit);
      btn.addEventListener('click', handleEdit);
    });
  });

  // Escape HTML to prevent injection
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  // Delete handler
  async function handleDelete(e) {
    e.stopPropagation();
    const id = this.getAttribute('data-delete-id');
    if (!id) return;
    try {
      await deleteDoc(doc(db, "students", id));
      showDigitalSpark();
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  // Edit handler: fill modal and show
  function handleEdit(e) {
    e.stopPropagation();
    const id = this.getAttribute('data-edit-id');
    const fullName = this.getAttribute('data-fullname');
    const address = this.getAttribute('data-address');
    const money = this.getAttribute('data-money');
    
    editIdInput.value = id;
    editNameInput.value = fullName || '';
    editAddressInput.value = address || '';
    editMoneyInput.value = money !== 'null' ? money : '';
    
    if (!editModalInstance) {
      editModalInstance = new bootstrap.Modal(editModalElem);
    }
    editModalInstance.show();
  }

  // Update confirmation
  confirmUpdateBtn.addEventListener('click', async () => {
    const id = editIdInput.value;
    const newName = editNameInput.value.trim();
    const newAddress = editAddressInput.value.trim();
    const newMoney = editMoneyInput.value;
    
    if (!newName || !newAddress || newMoney === '') {
      alert("សូមបំពេញព័ត៌មានទាំងអស់");
      return;
    }
    
    try {
      await updateDoc(doc(db, "students", id), {
        full_name: newName,
        address: newAddress,
        money: Number(newMoney),
      });
      if (editModalInstance) editModalInstance.hide();
      showDigitalSpark();
    } catch (err) {
      console.error("Update failed:", err);
      alert("ការកែប្រែបរាជ័យ, សូមពិនិត្យបណ្តាញ");
    }
  });

  // Add new participant
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const full_name = fullNameInput.value.trim();
    const address = addressInput.value.trim();
    const money = parseFloat(moneyInput.value);
    
    if (!full_name || !address || isNaN(money)) {
      alert("សូមបំពេញទិន្នន័យឲ្យបានត្រឹមត្រូវ");
      return;
    }
    
    try {
      await addDoc(studentsCol, {
        full_name: full_name,
        address: address,
        money: money,
      });
      form.reset();
      showDigitalSpark();
    } catch (err) {
      console.error("Add error:", err);
      alert("មិនអាចបន្ថែមទិន្នន័យបានទេ!");
    }
  });

  // Digital spark effect (small celebration)
  function showDigitalSpark() {
    for (let i = 0; i < 10; i++) {
      const spark = document.createElement("div");
      spark.textContent = "✨";
      spark.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 80 + 10}%;
        font-size: ${Math.random() * 20 + 12}px;
        animation: sparkFloat 0.9s ease-out forwards;
        pointer-events: none;
        z-index: 10000;
        opacity: 0.8;
      `;
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 900);
    }
  }

  // inject keyframes for spark effect
  if (!document.querySelector("#sparkStyle")) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "sparkStyle";
    styleSheet.textContent = `
      @keyframes sparkFloat {
        0% { transform: translateY(0) scale(0.8); opacity: 1; }
        100% { transform: translateY(-120px) scale(0.2) rotate(20deg); opacity: 0; }
      }
    `;
    document.head.appendChild(styleSheet);
  }

  // init modal on demand
  window.addEventListener('load', () => {
    if (typeof bootstrap !== 'undefined') {
      editModalInstance = new bootstrap.Modal(editModalElem, { backdrop: 'static', keyboard: true });
    }
  });