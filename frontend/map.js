if (!localStorage.getItem("token")) window.location.href = "login.html";

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

// Known city coordinates
const CITIES = {
  "bangalore":  [12.9716, 77.5946],
  "bengaluru":  [12.9716, 77.5946],
  "mumbai":     [19.0760, 72.8777],
  "delhi":      [28.6139, 77.2090],
  "hyderabad":  [17.3850, 78.4867],
  "chennai":    [13.0827, 80.2707],
  "pune":       [18.5204, 73.8567],
  "kolkata":    [22.5726, 88.3639],
};

function getCoords(location) {
  const lower = (location || "").toLowerCase();
  for (const city in CITIES) {
    if (lower.includes(city)) return CITIES[city];
  }
  return [20.5937, 78.9629]; // default: center of India
}

function getColor(match) {
  if (match >= 70) return "#22c55e";
  if (match >= 40) return "#e8a838";
  return "#4a5568";
}

const results = JSON.parse(localStorage.getItem("internshipResults")) || [];

document.getElementById("mapSubtitle").textContent =
  results.length > 0 ? `Showing ${results.length} internships — click a pin for details` : "No results found. Take the quiz first!";

// Create map
const map = L.map("map").setView([20.5937, 78.9629], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// Add a pin for each internship
results.forEach((job, i) => {
  const color = getColor(job.match);
  const icon  = L.divIcon({
    className: "",
    html: `<div style="background:${color};color:white;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">
             <span style="transform:rotate(45deg)">${i+1}</span>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -32]
  });

  L.marker(getCoords(job.location), { icon }).addTo(map).bindPopup(`
    <div style="font-family:sans-serif;min-width:180px">
      <b style="font-size:14px">${job.title}</b><br/>
      <span style="color:#4a5568;font-size:12px">🏢 ${job.company}</span><br/>
      <span style="color:#4a5568;font-size:12px">📍 ${job.location}</span><br/>
      <span style="color:${color};font-weight:700;font-size:13px">${job.match}% match</span><br/><br/>
      <a href="${job.url}" target="_blank" style="background:#1a3a6b;color:white;padding:6px 14px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600">Apply →</a>
    </div>
  `);
});