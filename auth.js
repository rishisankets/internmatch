const API = "https://internmatch-api-c0mq.onrender.com/api";

// Show error message on the page
function showError(message) {
  const box = document.getElementById("errorBox");
  box.textContent = message;
  box.style.display = "block";
}

// Login function
async function login(email, password) {
  const btn = document.getElementById("submitBtn");
  btn.textContent = "Signing in...";
  btn.disabled = true;

  try {
    const response = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.message || "Invalid email or password.");
      return;
    }

    // Save token and user to localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect to dashboard
    window.location.href = "dashboard.html";

  } catch (err) {
    showError("Could not connect to server. Is it running?");
  } finally {
    btn.textContent = "Sign in →";
    btn.disabled = false;
  }
}

// Signup function
async function signup(name, email, password) {
  if (password.length < 6) {
    showError("Password must be at least 6 characters.");
    return;
  }

  const btn = document.getElementById("submitBtn");
  btn.textContent = "Creating account...";
  btn.disabled = true;

  try {
    const response = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.message || "Something went wrong.");
      return;
    }

    // Save token and user to localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect to quiz
    window.location.href = "quiz.html";

  } catch (err) {
    showError("Could not connect to server. Is it running?");
  } finally {
    btn.textContent = "Create account →";
    btn.disabled = false;
  }
}
