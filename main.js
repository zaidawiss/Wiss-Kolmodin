// === main.js === MED GOOGLE SHEETS ===

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxjXbTKvn0VhrRN1AwZFJ8Z3Pi2NJ5xlQ8_YHNUWOkAi-Khi6rOWNK9BAIvlwYAZToivg/exec";

async function loadFromSheet(key) {
  const res = await fetch(`${SCRIPT_URL}?key=${key}`);
  return await res.json();
}

function saveToSheet(key, data) {
  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ key, data }),
    headers: { "Content-Type": "application/json" }
  }).then(res => res.text()).then(console.log);
}

const dashboard = document.getElementById("dashboard");

function calculateAge(birthdateStr) {
  const birthdate = new Date(birthdateStr);
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const m = today.getMonth() - birthdate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  return age;
}

async function renderDashboard() {
  dashboard.innerHTML = "Laddar...";
  const members = await loadFromSheet("members");
  const tasks = await loadFromSheet("tasks");
  const pointsDataArr = await loadFromSheet("points");
  const pointsData = Object.fromEntries(pointsDataArr.map(p => [p.name, p]));

  dashboard.innerHTML = "";

  members.forEach(member => {
    if (member.type !== "barn") return;

    const memberCard = document.createElement("div");
    memberCard.className = "child-dashboard";
    memberCard.style.border = `4px solid ${member.color || "#ccc"}`;

    const name = document.createElement("h2");
    const ageDisplay = member.birthdate ? ` (${calculateAge(member.birthdate)} år)` : "";
    name.textContent = member.name + ageDisplay;
    memberCard.appendChild(name);

    const data = pointsData[member.name] || { day: 0, week: 0, month: 0, year: 0 };
    const pointsDisplay = document.createElement("div");
    pointsDisplay.className = "points";
    pointsDisplay.textContent = `🟩 År: ${data.year} 🟨 Månad: ${data.month} 🟦 Vecka: ${data.week} 🟥 Dag: ${data.day}`;
    memberCard.appendChild(pointsDisplay);

    const todoList = tasks.filter(task => (task.assignedTo || "").includes(member.name));
    if (todoList.length > 0) {
      const list = document.createElement("ul");
      todoList.forEach(task => {
        const li = document.createElement("li");
        const iconBtn = document.createElement("button");
        iconBtn.className = "task-icon-btn";
        const iconSrc = task.icon?.trim();
        iconBtn.innerHTML = iconSrc ? `<img src="${iconSrc}" class="task-icon" alt="symbol">` : "✅";

        const videoBtn = task.video ? document.createElement("button") : null;
        if (videoBtn) {
          videoBtn.className = "video-btn";
          videoBtn.textContent = "🎬";
          videoBtn.addEventListener("click", () => showVideo(task.video));
        }

        iconBtn.addEventListener("click", () => {
          task.done = task.done === "true" ? "false" : "true";
          updatePoints(member.name, parseInt(task.points || "10"), task.done === "true");
          task.assignedTo = task.assignedTo || "";
          saveToSheet("tasks", tasks);
          renderDashboard();
        });

        if (videoBtn) li.appendChild(videoBtn);
        li.appendChild(iconBtn);

        const label = document.createElement("span");
        label.textContent = task.name;
        label.className = "task-text";

        const status = document.createElement("span");
        status.textContent = task.done === "true" ? "✅" : "❌";

        li.appendChild(label);
        li.appendChild(status);
        list.appendChild(li);
      });
      memberCard.appendChild(list);
    }

    const rewardSection = document.createElement("div");
    rewardSection.className = "reward-section";
    rewardSection.innerHTML = `
      <h4>🎁 Belöningar</h4>
      <div class="rewards">
        <img src="assets/rewards/candy.png" alt="Godis" title="50 poäng">
        <img src="assets/rewards/game.png" alt="Spel" title="100 poäng">
        <img src="assets/rewards/party.png" alt="Party" title="200 poäng">
      </div>
    `;
    memberCard.appendChild(rewardSection);

    dashboard.appendChild(memberCard);
  });
}

function updatePoints(name, points, increase) {
  loadFromSheet("points").then(pointArr => {
    let pointsData = Object.fromEntries(pointArr.map(p => [p.name, p]));
    if (!pointsData[name]) pointsData[name] = { name, day: 0, week: 0, month: 0, year: 0 };
    const p = pointsData[name];
    const delta = increase ? points : -points;
    p.day = parseInt(p.day || 0) + delta;
    p.week = parseInt(p.week || 0) + delta;
    p.month = parseInt(p.month || 0) + delta;
    p.year = parseInt(p.year || 0) + delta;
    saveToSheet("points", Object.values(pointsData));
  });
}

function showVideo(videoUrl) {
  const overlay = document.createElement("div");
  overlay.className = "video-overlay";
  overlay.innerHTML = `
    <div class="video-box">
      <button class="close-video">Stäng ✖️</button>
      ${videoUrl.includes("youtube") ?
        `<iframe src="${videoUrl}" frameborder="0" allowfullscreen></iframe>` :
        `<video controls autoplay src="${videoUrl}"></video>`}
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector(".close-video").addEventListener("click", () => overlay.remove());
}

renderDashboard();
