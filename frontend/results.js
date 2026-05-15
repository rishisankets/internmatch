if (!localStorage.getItem("token")) window.location.href = "login.html";

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

async function loadResults() {
  const answers = JSON.parse(localStorage.getItem("quizAnswers"));
  const token   = localStorage.getItem("token");

  if (!answers) {
    document.getElementById("resultsGrid").innerHTML =
      "<p style='color:var(--muted);text-align:center;padding:40px'>No quiz answers found. Please take the quiz first.</p>";
    return;
  }

  const btn = document.getElementById("resultsGrid");
  btn.innerHTML = "<p style='color:var(--muted);text-align:center;padding:40px'>⏳ Finding best matches for you... (this may take 10-20 seconds)</p>";

  try {
    const response = await fetch("https://internmatch-api-c0mq.onrender.com/api/recommend", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ answers })
    });

    const data    = await response.json();
    const results = data.results;

    if (!results || results.length === 0) {
      document.getElementById("resultsGrid").innerHTML =
        "<p style='color:var(--muted);text-align:center;padding:40px'>No matches found. Try retaking the quiz with different answers!</p>";
      return;
    }

    // ✅ Save results to localStorage for map and dashboard
    localStorage.setItem("internshipResults", JSON.stringify(results));

    // Update subtitle
    document.getElementById("resultsSubtitle").textContent =
      `Found ${results.length} matches based on your profile`;

    // Render cards
    const grid = document.getElementById("resultsGrid");
    grid.innerHTML = "";

    results.forEach((job, index) => {
      const matchColor = job.match >= 70 ? "#22c55e" : job.match >= 40 ? "#e8a838" : "#4a5568";
      const card = document.createElement("div");
      card.className = "result-card";
      card.innerHTML = `
        <div class="result-rank">#${index + 1}</div>
        <div class="result-body">
          <h3 class="result-title">${job.title}</h3>
          <p class="result-company">🏢 ${job.company}</p>
          <p class="result-location">📍 ${job.location}</p>
          <div class="result-match-bar">
            <div class="match-bar-fill" style="width:${job.match}%; background:${matchColor}"></div>
          </div>
          <p class="result-match-text" style="color:${matchColor}">${job.match}% match</p>
        </div>
        <a href="${job.url}" target="_blank" class="btn-primary result-btn">Apply →</a>
      `;
      grid.appendChild(card);
    });

  } catch (err) {
    document.getElementById("resultsGrid").innerHTML =
      "<p style='color:var(--muted);text-align:center;padding:40px'>Could not connect to server. Is the backend running?</p>";
  }
}

loadResults();