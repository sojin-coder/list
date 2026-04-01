/**
 * Digital Registry - Firebase Logic
 * Modernized UI Functions
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ✅ 1. Firebase Config (ទុកដដែល)
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

// ✅ 2. Loading Screen Logic (Modern Hide)
window.addEventListener("load", () => {
  const loader = document.querySelector(".loading-screen");
  setTimeout(() => {
    loader.classList.add("hide");
  }, 1500); // 1.5s for cool animation
});

// ✅ 3. Helper: Format Money ($ and ៛)
const formatDigitalMoney = (amount) => {
  const num = Number(amount);
  if (num < 1000) {
    return `$${num.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
  } else {
    return `${num.toLocaleString("km-KH")} ៛`;
  }
};

// ✅ 4. SHOW DATA (Modern List Rendering)
onSnapshot(studentsCol, (snapshot) => {
  const tbl = document.getElementById("tbl");
  let html = "";
  let i = 1;

  if (snapshot.empty) {
    html = `<tr><td colspan="5" class="text-center text-muted py-5">
      <i class="fas fa-folder-open d-block mb-3 fs-1 opacity-50"></i>
      គ្មានទិន្នន័យ សូមបញ្ចូលអ្នកចូលរួមថ្មី!
    </td></tr>`;
  } else {
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();

      html += `
        <tr>
          <td class="text-center text-muted fw-bold">${i++}</td>
          <td class="fw-semibold">${d.full_name}</td>
          <td class="text-muted"><i class="fas fa-location-dot me-2 text-primary-v2 opacity-50"></i>${d.address}</td>
          <td class="text-end money-cell">${formatDigitalMoney(d.money)}</td>
          <td class="text-center actions-cell">
            <button class="action-btn-digital btn-edit-v2" onclick="edit('${docSnap.id}')">
              <i class="fas fa-pen"></i>
            </button>
            <button class="action-btn-digital btn-del-v2" onclick="del('${docSnap.id}')">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `;
    });
  }
  tbl.innerHTML = html;
});

// ✅ 5. ADD DATA
const form = document.getElementById("form");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));

  try {
    await addDoc(studentsCol, data);
    form.reset();
    showDigitalParty(); // Modern Emoji effect
  } catch (err) {
    console.error("Error adding:", err);
  }
});

// ✅ 6. DELETE (No Alert)
window.del = async (id) => {
  try {
    await deleteDoc(doc(db, "students", id));
  } catch (err) {
    console.error("Error deleting:", err);
  }
};

// ✅ 7. EDIT (Show Modern Modal)
window.edit = async (id) => {
  const snap = await getDoc(doc(db, "students", id));
  const d = snap.data();

  document.getElementById("u_id").value = id;
  document.getElementById("u_name").value = d.full_name;
  document.getElementById("u_address").value = d.address;
  document.getElementById("u_money").value = d.money;

  new bootstrap.Modal(document.getElementById("modal")).show();
};

// ✅ 8. UPDATE DATA
document.getElementById("form-update").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("u_id").value;

  try {
    await updateDoc(doc(db, "students", id), {
      full_name: document.getElementById("u_name").value,
      address: document.getElementById("u_address").value,
      money: document.getElementById("u_money").value,
    });
    bootstrap.Modal.getInstance(document.getElementById("modal")).hide();
  } catch (err) {
    console.error("Error updating:", err);
  }
});

// ✅ 9. Modern Digital Effect (Floating Icons)
function showDigitalParty() {
  const icons = ["✨", "✨", "✨", "✨", "✨"];
  for (let i = 0; i < 12; i++) {
    const el = document.createElement("div");
    el.textContent = icons[Math.floor(Math.random() * icons.length)];
    el.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}%;
      top: 50%;
      font-size: ${Math.random() * 20 + 15}px;
      animation: digitalFloat 1.5s ease-out forwards;
      pointer-events: none;
      z-index: 9999;
      filter: drop-shadow(0 0 5px rgba(255,255,255,0.5));
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
}

// Inline CSS for Floating animation
const style = document.createElement("style");
style.innerHTML = `
  @keyframes digitalFloat {
    0% { transform: translateY(0) scale(1) rotate(0); opacity: 0; }
    20% { opacity: 1; }
    100% { transform: translateY(-150px) scale(0) rotate(${Math.random() * 360}deg); opacity: 0; }
  }
`;
document.head.appendChild(style);
