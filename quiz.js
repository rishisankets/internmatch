// Redirect if not logged in
if (!localStorage.getItem("token")) window.location.href = "login.html";

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

// ── Questions ─────────────────────────────────────────────────
const QUESTIONS = [
  {
    question: "Which domain are you targeting?",
    multi: true,
    options: ["Software Development", "Data Science / AI", "Cybersecurity", "Cloud / DevOps", "UI/UX Design", "Finance & Fintech", "Marketing & Growth", "Research & Academia"]
  },
  {
    question: "Which programming languages do you know?",
    multi: true,
    options: ["Python", "JavaScript", "Java", "C / C++", "SQL", "None yet"]
  },
  {
    question: "What is your current skill level?",
    multi: false,
    options: ["Complete beginner", "Know the basics", "Built personal projects", "Done an internship before"]
  },
  {
    question: "What kind of work excites you most?",
    multi: true,
    options: ["Building products", "Analysing data", "Designing experiences", "Solving security problems", "Managing systems", "Writing & communication"]
  },
  {
    question: "What type of company do you want to work at?",
    multi: true,
    options: ["Early stage startup", "Mid-size tech company", "Large corporation", "Government / PSU", "Non-profit / NGO"]
  },
  {
    question: "How long can you commit to an internship?",
    multi: false,
    options: ["1 month", "2 months", "3 months", "6 months"]
  },
  {
    question: "What is your work preference?",
    multi: false,
    options: ["Remote only", "On-site only", "Hybrid", "No preference"]
  },
  {
    question: "Which city do you prefer?",
    multi: true,
    options: ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Any city"]
  },
  {
    question: "What is your primary goal from this internship?",
    multi: true,
    options: ["Get a PPO", "Build my portfolio", "Learn a specific skill", "Network with professionals"]
  },
  {
    question: "What matters most to you?",
    multi: true,
    options: ["High stipend", "Brand name on resume", "Mentorship quality", "Flexibility & work life balance"]
  }
];

// ── State ─────────────────────────────────────────────────────
let currentQuestion = 0;
let answers = new Array(QUESTIONS.length).fill(null).map(() => []);

// ── Render question ───────────────────────────────────────────
function renderQuestion() {
  const q = QUESTIONS[currentQuestion];

  // Progress
  const percent = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  document.getElementById("progressBar").style.width = percent + "%";
  document.getElementById("progressText").textContent = `Question ${currentQuestion + 1} of ${QUESTIONS.length}`;

  // Question text
  document.getElementById("questionText").textContent = q.question;

  // Multi select hint
  const hint = document.createElement("p");
  hint.style.cssText = "font-size:12px;color:var(--muted);margin-bottom:16px;";
  hint.textContent = q.multi ? "Select all that apply" : "Select one";

  // Options
  const grid = document.getElementById("optionsGrid");
  grid.innerHTML = "";
  grid.appendChild(hint);

  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = option;

    // Highlight if already selected
    if (answers[currentQuestion].includes(option)) {
      btn.classList.add("selected");
    }

    btn.onclick = () => selectOption(option, q.multi);
    grid.appendChild(btn);
  });

  // Back button
  document.getElementById("backBtn").style.display = currentQuestion > 0 ? "inline-block" : "none";

  // Next button
  document.getElementById("nextBtn").disabled = answers[currentQuestion].length === 0;
  document.getElementById("nextBtn").textContent = currentQuestion === QUESTIONS.length - 1 ? "Submit →" : "Next →";
}

// ── Select option ─────────────────────────────────────────────
function selectOption(option, multi) {
  if (multi) {
    // Toggle selection for multi-select
    const idx = answers[currentQuestion].indexOf(option);
    if (idx > -1) {
      answers[currentQuestion].splice(idx, 1); // deselect
    } else {
      answers[currentQuestion].push(option);   // select
    }
  } else {
    // Single select — replace
    answers[currentQuestion] = [option];
  }

  // Re-render options to reflect selection
  document.querySelectorAll(".option-btn").forEach(btn => {
    btn.classList.toggle("selected", answers[currentQuestion].includes(btn.textContent));
  });

  // Enable next
  document.getElementById("nextBtn").disabled = answers[currentQuestion].length === 0;
}

// ── Navigation ────────────────────────────────────────────────
function goNext() {
  if (currentQuestion < QUESTIONS.length - 1) {
    currentQuestion++;
    renderQuestion();
  } else {
    submitQuiz();
  }
}

function goBack() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
}

// ── Submit ────────────────────────────────────────────────────
async function submitQuiz() {
  const token = localStorage.getItem("token");
  const btn   = document.getElementById("nextBtn");
  btn.textContent = "Submitting...";
  btn.disabled    = true;

  // Flatten answers into array of strings for backend
  const flatAnswers = answers.map(a => a.join(", "));

  try {
    const response = await fetch("https://internmatch-api-c0mq.onrender.com/api/quiz/submit", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ answers: flatAnswers })
    });

    if (response.ok) {
      localStorage.setItem("quizAnswers", JSON.stringify(flatAnswers));
      window.location.href = "results.html";
    } else {
      alert("Something went wrong. Please try again.");
      btn.textContent = "Submit →";
      btn.disabled    = false;
    }
  } catch (err) {
    alert("Could not connect to server.");
    btn.textContent = "Submit →";
    btn.disabled    = false;
  }
}

// ── Start ─────────────────────────────────────────────────────
renderQuestion();