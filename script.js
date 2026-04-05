
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
  import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBN9CPViV4ok9kAhZTBGm8h76x8XcAdmGk",
    authDomain: "my-listing-947ff.firebaseapp.com",
    projectId: "my-listing-947ff",
    storageBucket: "my-listing-947ff.appspot.com",
    messagingSenderId: "1039885458733",
    appId: "1:1039885458733:web:0e3a06b5dd600e3b2f07a4"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const colRef = collection(db, "students");

  const modalEdit = new bootstrap.Modal(document.getElementById('editModal'));

  // Helper: format currency
  const formatMoney = (amount) => {
    let num = Number(amount);
    if (isNaN(num)) num = 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  };

  // Helper: escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  // REAL-TIME LISTENER - បង្ហាញទិន្នន័យក្នុងតារាង (FORM OUTPUT)
  let rowCounter = 0;
  onSnapshot(colRef, (snapshot) => {
    let rows = "";
    let index = 1;
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const fullName = data.full_name || "—";
      const address = data.address || "—";
      const moneyVal = data.money !== undefined && data.money !== null ? parseFloat(data.money) : 0;
      
      rows += `
        <tr>
          <td class="text-center" style="width: 50px;">${index}</td>
          <td class="fw-semibold"><i class="fas fa-id-card me-2 text-info opacity-70"></i>${escapeHtml(fullName)}</td>
          <td><i class="fas fa-location-dot me-1 text-secondary"></i> <small>${escapeHtml(address)}</small></td>
          <td class="text-end fw-bold text-success">${formatMoney(moneyVal)}</td>
          <td class="text-center">
            <button class="icon-btn edit" onclick="window.editEntry('${docSnap.id}', '${escapeHtml(fullName)}', '${escapeHtml(address)}', ${moneyVal})">
              <i class="fas fa-pen"></i>
            </button>
            <button class="icon-btn delete" onclick="window.deleteEntry('${docSnap.id}')">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `;
      index++;
    });
    
    if (rows === "") {
      rows = `<tr><td colspan="5" class="text-center py-5 opacity-50"><i class="fas fa-inbox fa-2x mb-2 d-block"></i>មិនទាន់មានទិន្នន័យ</td></tr>`;
    }
    
    document.getElementById("listBody").innerHTML = rows;
    document.getElementById("countLabel").innerHTML = `<i class="fas fa-user-check me-1"></i>${snapshot.size} នាក់`;
  });

  // CREATE - បន្ថែមទិន្នន័យថ្មី (FORM INPUT)
  const addForm = document.getElementById("addForm");
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameVal = document.getElementById("nameInp").value.trim();
    const addrVal = document.getElementById("addrInp").value.trim();
    let moneyVal = parseFloat(document.getElementById("moneyInp").value);
    if (isNaN(moneyVal)) moneyVal = 0;
    
    if (!nameVal) {
      alert("សូមបញ្ចូលឈ្មោះពេញ");
      return;
    }
    
    try {
      await addDoc(colRef, {
        full_name: nameVal,
        address: addrVal || "មិនបានបញ្ជាក់",
        money: moneyVal
      });
      
      // Reset form
      addForm.reset();
      
      // Show success feedback
      const btn = addForm.querySelector("button[type='submit']");
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check-circle me-1"></i> រក្សាទុកដោយជោគជ័យ!';
      btn.style.background = "linear-gradient(95deg, #00c6ff, #0aff9d)";
      setTimeout(() => { 
        btn.innerHTML = originalText;
        btn.style.background = "linear-gradient(95deg, #00c6ff, #0072ff)";
      }, 2000);
      
    } catch (err) {
      console.error(err);
      alert("មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ");
    }
  });

  // DELETE - លុបទិន្នន័យ
  window.deleteEntry = async (id) => {
    if (confirm("តើអ្នកពិតជាចង់លុបសមាជិកនេះមែនទេ?\nទិន្នន័យនឹងបាត់បង់ជាអចិន្ត្រៃយ៍")) {
      try {
        await deleteDoc(doc(db, "students", id));
      } catch (error) {
        alert("លុបមិនបាន: " + error.message);
      }
    }
  };

  // EDIT - បើកទម្រង់កែប្រែ
  window.editEntry = (id, name, address, money) => {
    document.getElementById("editId").value = id;
    document.getElementById("editName").value = name;
    document.getElementById("editAddr").value = address;
    document.getElementById("editMoney").value = money;
    modalEdit.show();
  };

  // UPDATE - កែប្រែទិន្នន័យ
  document.getElementById("updateBtn").addEventListener("click", async () => {
    const id = document.getElementById("editId").value;
    if (!id) return;
    
    const newName = document.getElementById("editName").value.trim();
    const newAddr = document.getElementById("editAddr").value.trim();
    let newMoney = parseFloat(document.getElementById("editMoney").value);
    if (isNaN(newMoney)) newMoney = 0;
    
    if (!newName) {
      alert("សូមបញ្ចូលឈ្មោះពេញ");
      return;
    }
    
    try {
      const docRef = doc(db, "students", id);
      await updateDoc(docRef, {
        full_name: newName,
        address: newAddr || "មិនបានបញ្ជាក់",
        money: newMoney
      });
      modalEdit.hide();
    } catch (err) {
      alert("ការកែប្រែបរាជ័យ: " + err.message);
    }
  });