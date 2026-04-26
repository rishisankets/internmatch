const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "login.html";

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

// Greet user
document.getElementById("greeting").textContent = `Hi, ${user.name.split(" ")[0]} 👋`;

// Load results from localStorage
const results = JSON.parse(localStorage.getItem("internshipResults")) || [];
const answers = JSON.parse(localStorage.getItem("quizAnswers")) || [];

if (results.length > 0) {
  document.getElementById("statMatches").textContent = results.length;
  document.getElementById("statTop").textContent     = results[0].match + "%";
  document.getElementById("statField").textContent   = answers[0] || "—";

  const grid = document.getElementById("dashResults");
  grid.innerHTML = "";

  results.slice(0, 3).forEach((job, i) => {
    const color = job.match >= 70 ? "#22c55e" : job.match >= 40 ? "#e8a838" : "#4a5568";
    const card  = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <div class="result-rank">#${i + 1}</div>
      <div class="result-body">
        <h3 class="result-title">${job.title}</h3>
        <p class="result-company">🏢 ${job.company}</p>
        <p class="result-location">📍 ${job.location}</p>
        <div class="result-match-bar">
          <div class="match-bar-fill" style="width:${job.match}%;background:${color}"></div>
        </div>
        <p class="result-match-text" style="color:${color}">${job.match}% match</p>
      </div>
      <a href="${job.url}" target="_blank" class="btn-primary result-btn">Apply →</a>
    `;
    grid.appendChild(card);
  });
}