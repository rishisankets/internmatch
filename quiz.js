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
    question: "What job title are you targeting?",
    multi: true,
    options: [
      "Software Developer",
      "Data Analyst",
      "Frontend Developer",
      "Backend Developer",
      "Machine Learning Engineer",
      "Business Analyst",
      "Digital Marketing Executive",
      "Financial Analyst"
    ]
  },
  {
    question: "What are your strongest technical skills?",
    multi: true,
    options: [
      "Python",
      "JavaScript",
      "React",
      "SQL",
      "Machine Learning",
      "Java",
      "Excel",
      "Node.js"
    ]
  },
  {
    question: "What industry do you want to work in?",
    multi: true,
    options: [
      "Information Technology",
      "Banking and Finance",
      "E-commerce",
      "Healthcare",
      "Consulting",
      "Education Technology",
      "Media and Advertising",
      "Manufacturing"
    ]
  },
  {
    question: "What type of work do you enjoy most?",
    multi: true,
    options: [
      "Building web applications",
      "Analysing data and reports",
      "Machine learning and AI",
      "Managing social media",
      "Financial modelling",
      "Testing and quality assurance",
      "Cloud and DevOps",
      "Customer relationship management"
    ]
  },
  {
    question: "Which of these tools do you know?",
    multi: true,
    options: [
      "Git and GitHub",
      "Tableau or Power BI",
      "AWS or Azure",
      "Figma or Adobe XD",
      "Google Analytics",
      "Salesforce",
      "TensorFlow or PyTorch",
      "Microsoft Office"
    ]
  },
  {
    question: "What soft skills do you bring?",
    multi: true,
    options: [
      "Communication and presentation",
      "Problem solving and critical thinking",
      "Team collaboration",
      "Project management",
      "Client handling",
      "Research and documentation",
      "Attention to detail",
      "Time management"
    ]
  },
  {
    question: "What kind of role responsibilities excite you?",
    multi: true,
    options: [
      "Writing and debugging code",
      "Building dashboards and reports",
      "Running marketing campaigns",
      "Handling customer queries",
      "Conducting research and analysis",
      "Designing user interfaces",
      "Managing databases",
      "Supporting finance and accounting"
    ]
  },
  {
    question: "Where do you want to work?",
    multi: false,
    options: [
      "Bangalore",
      "Mumbai",
      "Delhi",
      "Hyderabad",
      "Chennai",
      "Pune",
      "Remote",
      "Any location"
    ]
  },
  {
    question: "What kind of company are you targeting?",
    multi: true,
    options: [
      "Product based IT company",
      "Service based IT company",
      "Startup",
      "Banking or NBFC",
      "Consulting firm",
      "MNC",
      "Government or PSU",
      "NGO or Non profit"
    ]
  },
  {
    question: "What is your career goal from this role?",
    multi: true,
    options: [
      "Full time placement after internship",
      "Build real world experience",
      "Learn from industry mentors",
      "Work on live projects",
      "Strengthen my resume",
      "Transition into a new field"
    ]
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