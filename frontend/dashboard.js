// ── Auth guard ────────────────────────────────────────────────────────────────
const user = JSON.parse(localStorage.getItem("user") || "null");
if (!user) window.location.href = "login.html";

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("internshipResults");
  localStorage.removeItem("quizAnswers");
  window.location.href = "index.html";
}

// ── Greet ─────────────────────────────────────────────────────────────────────
const firstName = user?.name?.split(" ")[0] || "there";
document.getElementById("greeting").textContent = `Hi, ${firstName} 👋`;

// ── Load data safely ──────────────────────────────────────────────────────────
let results = [];
let answers = [];

try { results = JSON.parse(localStorage.getItem("internshipResults")) || []; } catch (_) {}
try { answers = JSON.parse(localStorage.getItem("quizAnswers"))       || []; } catch (_) {}

// ── Stats ─────────────────────────────────────────────────────────────────────
if (results.length > 0) {
  document.getElementById("statMatches").textContent = results.length;
  document.getElementById("statTop").textContent     = results[0].match + "%";

  // answers[0] may itself be an array (multi-select) or a string
  const field = Array.isArray(answers[0])
    ? answers[0][0]
    : (answers[0] || "—");
  document.getElementById("statField").textContent = field;

  // ── Top-3 cards ─────────────────────────────────────────────────────────────
  const grid = document.getElementById("dashResults");
  grid.innerHTML = "";   // clear the fallback paragraph

  results.slice(0, 3).forEach((job, i) => {
    const color = job.match >= 70 ? "#22c55e"
                : job.match >= 40 ? "#e8a838"
                : "#4a5568";

    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <div class="result-rank">#${i + 1}</div>
      <div class="result-body">
        <h3 class="result-title">${job.title  || "Untitled"}</h3>
        <p  class="result-company">🏢 ${job.company  || "Unknown"}</p>
        <p  class="result-location">📍 ${job.location || "India"}</p>
        <div class="result-match-bar">
          <div class="match-bar-fill"
               style="width:${job.match}%;background:${color}"></div>
        </div>
        <p class="result-match-text" style="color:${color}">${job.match}% match</p>
      </div>
      <a href="${job.url || '#'}" target="_blank"
         class="btn-primary result-btn">Apply →</a>
    `;
    grid.appendChild(card);
  });
}