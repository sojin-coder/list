import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
  import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

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

  // Exchange rate (1 USD = 4100 KHR)
  const EXCHANGE_RATE = 4100;

  // Sort state (default: oldest first)
  let sortOrder = "oldest"; // "oldest" or "newest"
  let allDocuments = []; // Store all documents for sorting

  // Auto-detect currency based on amount
  function detectCurrency(amount) {
    if (amount >= 1000) {
      return "KHR";
    } else {
      return "USD";
    }
  }

  // Format amount based on currency
  function formatMoney(amount, currency) {
    let num = Number(amount);
    if (isNaN(num)) num = 0;
    
    if (currency === "USD") {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
      }).format(num);
    } else {
      return new Intl.NumberFormat('km-KH', { 
        style: 'currency', 
        currency: 'KHR', 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      }).format(num);
    }
  }

  // Get currency badge HTML
  function getCurrencyBadge(currency) {
    if (currency === "USD") {
      return '<span class="currency-badge usd"><i class="fas fa-dollar-sign"></i> USD</span>';
    } else {
      return '<span class="currency-badge khr"><i class="fas fa-riel-sign"></i> KHR</span>';
    }
  }

  // Escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  // Update currency UI based on amount input
  function updateCurrencyUI(amount) {
    const usdOption = document.getElementById('usdOption');
    const khrOption = document.getElementById('khrOption');
    const numAmount = parseFloat(amount);
    
    if (!isNaN(numAmount) && numAmount > 0) {
      const detectedCurrency = detectCurrency(numAmount);
      if (detectedCurrency === "USD") {
        usdOption.classList.add('selected');
        khrOption.classList.remove('selected');
      } else {
        khrOption.classList.add('selected');
        usdOption.classList.remove('selected');
      }
    } else {
      usdOption.classList.remove('selected');
      khrOption.classList.remove('selected');
    }
  }

  // Update total summary
  function updateTotalSummary(dataArray) {
    let totalUSD = 0;
    let totalKHR = 0;
    
    dataArray.forEach(item => {
      const money = item.money || 0;
      const currency = item.currency || detectCurrency(money);
      
      if (currency === "USD") {
        totalUSD += money;
      } else {
        totalKHR += money;
      }
    });
    
    // Format and display totals
    const usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const khrFormatter = new Intl.NumberFormat('km-KH', { style: 'currency', currency: 'KHR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    
    document.getElementById('totalUSD').innerHTML = usdFormatter.format(totalUSD);
    document.getElementById('totalKHR').innerHTML = khrFormatter.format(totalKHR);
    
    // Grand total in USD (converting KHR to USD)
    const grandTotalUSD = totalUSD + (totalKHR / EXCHANGE_RATE);
    document.getElementById('grandTotalUSD').innerHTML = usdFormatter.format(grandTotalUSD);
  }

  // Render table based on current sort order
  function renderTable() {
    let sortedData = [...allDocuments];
    
    // Sort by timestamp (using document ID as timestamp proxy, or use actual timestamp field)
    // Firebase document IDs contain timestamp information, but for better accuracy we'll sort by the order they were added
    // Since we're storing documents in an array in the order they come from Firestore,
    // we can reverse based on the index
    if (sortOrder === "newest") {
      sortedData.reverse();
    }
    // else "oldest" keeps original order (first added first)
    
    let rows = "";
    let index = 1;
    
    sortedData.forEach(item => {
      const fullName = item.full_name || "—";
      const address = item.address || "—";
      const moneyVal = item.money !== undefined && item.money !== null ? parseFloat(item.money) : 0;
      const currency = item.currency || detectCurrency(moneyVal);
      
      rows += `
        <tr>
          <td class="text-center" style="width: 50px;">${index}</td>
          <td class="fw-semibold"><i class="fas fa-id-card me-2"></i>${escapeHtml(fullName)}</td>
          <td><i class="fas fa-location-dot me-1 text-secondary"></i> <small>${escapeHtml(address)}</small></td>
          <td class="text-end fw-bold ${currency === 'USD' ? 'amount-usd' : 'amount-khr'}">
            ${formatMoney(moneyVal, currency)}${getCurrencyBadge(currency)}
          </td>
          <td class="text-center">
            <button class="icon-btn edit" onclick="window.editEntry('${item.id}', '${escapeHtml(fullName)}', '${escapeHtml(address)}', ${moneyVal}, '${currency}')">
              <i class="fas fa-pen"></i>
            </button>
            <button class="icon-btn delete" onclick="window.deleteEntry('${item.id}')">
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
    document.getElementById("countLabel").innerHTML = `<i class="fas fa-user-check me-1"></i>${allDocuments.length} នាក់`;
  }

  // REAL-TIME LISTENER - Store data in array and update totals
  onSnapshot(colRef, (snapshot) => {
    allDocuments = [];
    
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      allDocuments.push({
        id: docSnap.id,
        full_name: data.full_name,
        address: data.address,
        money: data.money,
        currency: data.currency
      });
    });
    
    // Update total summary
    updateTotalSummary(allDocuments);
    
    // Render table with current sort order
    renderTable();
  });

  // Sort selector listener
  const sortSelect = document.getElementById('sortSelect');
  sortSelect.addEventListener('change', (e) => {
    sortOrder = e.target.value;
    renderTable();
  });

  // Auto-detect currency when user types in money input
  const moneyInput = document.getElementById("moneyInp");
  moneyInput.addEventListener("input", (e) => {
    updateCurrencyUI(e.target.value);
  });

  // CREATE - Add new data
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
    
    // Auto-detect currency
    const currency = detectCurrency(moneyVal);
    
    try {
      await addDoc(colRef, {
        full_name: nameVal,
        address: addrVal || "មិនបានបញ្ជាក់",
        money: moneyVal,
        currency: currency,
        createdAt: new Date().toISOString() // Add timestamp for better sorting
      });
      
      addForm.reset();
      // Reset currency UI
      document.getElementById('usdOption').classList.remove('selected');
      document.getElementById('khrOption').classList.remove('selected');
      
      const btn = addForm.querySelector("button[type='submit']");
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check-circle me-1"></i> រក្សាទុកដោយជោគជ័យ!';
      btn.style.background = "linear-gradient(95deg, #00c6ff, #0aff9d)";
      setTimeout(() => { 
        btn.innerHTML = originalText;
        btn.style.background = "linear-gradient(95deg, #6d481d, #753901)";
      }, 2000);
      
    } catch (err) {
      console.error(err);
      alert("មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ");
    }
  });

  // DELETE
  window.deleteEntry = async (id) => {
    if (confirm("តើអ្នកពិតជាចង់លុបសមាជិកនេះមែនទេ?\nទិន្នន័យនឹងបាត់បង់ជាអចិន្ត្រៃយ៍")) {
      try {
        await deleteDoc(doc(db, "students", id));
      } catch (error) {
        alert("លុបមិនបាន: " + error.message);
      }
    }
  };

  // EDIT
  window.editEntry = (id, name, address, money, currency) => {
    document.getElementById("editId").value = id;
    document.getElementById("editName").value = name;
    document.getElementById("editAddr").value = address;
    document.getElementById("editMoney").value = money;
    document.getElementById("editCurrencySelect").value = currency || detectCurrency(money);
    modalEdit.show();
  };

  // UPDATE
  document.getElementById("updateBtn").addEventListener("click", async () => {
    const id = document.getElementById("editId").value;
    if (!id) return;
    
    const newName = document.getElementById("editName").value.trim();
    const newAddr = document.getElementById("editAddr").value.trim();
    let newMoney = parseFloat(document.getElementById("editMoney").value);
    const newCurrency = document.getElementById("editCurrencySelect").value;
    
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
        money: newMoney,
        currency: newCurrency
      });
      modalEdit.hide();
    } catch (err) {
      alert("ការកែប្រែបរាជ័យ: " + err.message);
    }
  });