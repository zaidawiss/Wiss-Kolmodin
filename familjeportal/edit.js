// === edit.js === MED DEBUG LOGGAR ===

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxjXbTKvn0VhrRN1AwZFJ8Z3Pi2NJ5xlQ8_YHNUWOkAi-Khi6rOWNK9BAIvlwYAZToivg/exec";

async function loadFromSheet(key) {
  const res = await fetch(`${SCRIPT_URL}?key=${key}`);
  return await res.json();
}

function saveToSheet(key, data) {
  console.log(`Sparar till Google Sheet – nyckel: ${key}`, data);
  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ key, data }),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.text())
    .then(response => console.log("Svar från Google Sheet:", response))
    .catch(err => console.error("Fel vid POST:", err));
}

document.getElementById("memberForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  console.log("🟢 Formuläret för att lägga till medlem har skickats");

  const member = {
    name: document.getElementById("memberName").value,
    type: document.getElementById("memberType").value,
    birthdate: document.getElementById("memberBirthdate").value,
    color: document.getElementById("memberColor").value
  };

  console.log("📦 Ny medlem att spara:", member);

  try {
    const members = await loadFromSheet("members");
    members.push(member);
    saveToSheet("members", members);
    this.reset();
    renderMembers();
  } catch (err) {
    console.error("❌ Fel när medlemmar hämtas eller sparas:", err);
  }
});

function renderMembers() {
  const memberList = document.getElementById("memberList");
  loadFromSheet("members").then(members => {
    memberList.innerHTML = members.map((m, index) => `
      <li>
        ${m.name} (${m.type}${m.birthdate ? ", född: " + m.birthdate : ""})
        <button data-index="${index}" class="removeMember">❌</button>
      </li>
    `).join("");

    updateMemberOptions(members);

    document.querySelectorAll(".removeMember").forEach(btn => {
      btn.addEventListener("click", () => {
        members.splice(btn.dataset.index, 1);
        saveToSheet("members", members);
        renderMembers();
      });
    });
  });
}

function updateMemberOptions(members) {
  const select = document.getElementById("assignedChildren");
  if (!select) return;
  select.innerHTML = members
    .filter(m => m.type === "barn")
    .map(m => `<option value="${m.name}">${m.name}</option>`)
    .join("");
}

renderMembers();
