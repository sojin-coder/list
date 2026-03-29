
// Loading
window.onload = () => {
  setTimeout(() => {
    document.querySelector(".loading-screen").style.display = "none";
  }, 1000);
};

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Config
const firebaseConfig = {
  apiKey: "AIzaSyBN9CPViV4ok9kAhZTBGm8h76x8XcAdmGk",
  authDomain: "my-listing-947ff.firebaseapp.com",
  projectId: "my-listing-947ff",
  storageBucket: "my-listing-947ff.appspot.com",
  messagingSenderId: "1039885458733",
  appId: "1:1039885458733:web:0e3a06b5dd600e3b2f07a4"
};

// Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM
const tbl = document.getElementById("tbl");
const form = document.getElementById("form");

// SHOW DATA
onSnapshot(collection(db, "students"), (snapshot) => {
  let html = "";
  let i = 1;

  snapshot.forEach((docSnap) => {
    const d = docSnap.data();

    html += `
      <tr>
        <td>${i++}</td>
        <td>${d.full_name}</td>
        <td>${d.address}</td>
        <td>${d.money}</td>
        <td>
          <button class="btn btn-info btn-sm" onclick="edit('${docSnap.id}')">កែ</button>
          <button class="btn btn-danger btn-sm" onclick="del('${docSnap.id}')">លុប</button>
        </td>
      </tr>
    `;
  });

  tbl.innerHTML = html;
});

// ADD
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form));

  await addDoc(collection(db, "students"), data);

  // Swal.fire("Success", "Added!", "success");
  form.reset();
});

// DELETE
window.del = async (id) => {
  await deleteDoc(doc(db, "students", id));
  // Swal.fire("Deleted", "", "success");
};

// EDIT
window.edit = async (id) => {
  const snap = await getDoc(doc(db, "students", id));
  const d = snap.data();

  document.getElementById("u_id").value = id;
  document.getElementById("u_name").value = d.full_name;
  document.getElementById("u_address").value = d.address;
  document.getElementById("u_money").value = d.money;

  new bootstrap.Modal(document.getElementById("modal")).show();
};

// UPDATE
document.getElementById("form-update").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("u_id").value;

  await updateDoc(doc(db, "students", id), {
    full_name: document.getElementById("u_name").value,
    address: document.getElementById("u_address").value,
    money: document.getElementById("u_money").value,
  });

  // Swal.fire("Updated", "", "success");

  bootstrap.Modal.getInstance(document.getElementById("modal")).hide();
});
// Party effect when adding data
function showParty() {
  const partyEmojis = ['🎉', '🎊', '🥳', '✨', '💫', '🎈', '🎪', '🤡', '😍', '🔥'];
  for(let i = 0; i < 10; i++) {
    const emoji = document.createElement('div');
    emoji.textContent = partyEmojis[Math.floor(Math.random() * partyEmojis.length)];
    emoji.style.position = 'fixed';
    emoji.style.left = Math.random() * 100 + '%';
    emoji.style.top = '50%';
    emoji.style.fontSize = Math.random() * 30 + 20 + 'px';
    emoji.style.animation = 'party 1s ease-out forwards';
    emoji.style.pointerEvents = 'none';
    emoji.style.zIndex = '9999';
    document.body.appendChild(emoji);
    setTimeout(() => emoji.remove(), 1000);
  }
}