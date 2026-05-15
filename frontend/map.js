if (!localStorage.getItem("token")) window.location.href = "login.html";

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

const CITIES = {
  "bangalore":  [12.9716, 77.5946],
  "bengaluru":  [12.9716, 77.5946],
  "mumbai":     [19.0760, 72.8777],
  "delhi":      [28.6139, 77.2090],
  "hyderabad":  [17.3850, 78.4867],
  "chennai":    [13.0827, 80.2707],
  "pune":       [18.5204, 73.8567],
  "kolkata":    [22.5726, 88.3639],
  "ahmedabad":  [23.0225, 72.5714],
  "jaipur":     [26.9124, 75.7873],
  "noida":      [28.5355, 77.3910],
  "gurgaon":    [28.4595, 77.0266],
  "gurugram":   [28.4595, 77.0266],
  "karnataka":  [15.3173, 75.7139],
  "maharashtra":[19.7515, 75.7139],
};

function getCoords(location) {
  if (!location) return [20.5937, 78.9629];
  const lower = location.toLowerCase();
  for (const city in CITIES) {
    if (lower.includes(city)) return CITIES[city];
  }
  return [20.5937, 78.9629];
}

function getColor(match) {
  if (match >= 70) return "#22c55e";
  if (match >= 40) return "#e8a838";
  return "#ef4444";  // red for low match so pins are visible
}

// Initialize map
const map = L.map("map").setView([20.5937, 78.9629], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// Get results
let results = [];
try {
  const stored = localStorage.getItem("internshipResults");
  if (stored) results = JSON.parse(stored);
} catch (e) { results = []; }

console.log("Map results:", results.length, results);

if (!results || results.length === 0) {
  document.getElementById("mapSubtitle").textContent =
    "No results found. Please take the quiz and view results first!";
} else {
  document.getElementById("mapSubtitle").textContent =
    `Showing ${results.length} internships — click a pin for details`;

  // Add slight offset to pins at same location so they don't overlap
  const coordCount = {};

  results.forEach((job, i) => {
    const color  = getColor(job.match);
    let coords   = getCoords(job.location);

    // Offset duplicate coords slightly
    const key = coords.toString();
    coordCount[key] = (coordCount[key] || 0) + 1;
    if (coordCount[key] > 1) {
      coords = [
        coords[0] + (Math.random() - 0.5) * 0.5,
        coords[1] + (Math.random() - 0.5) * 0.5
      ];
    }

    const icon = L.divIcon({
      className: "",
      html: `<div style="
        background:${color};color:white;width:32px;height:32px;
        border-radius:50% 50% 50% 0;transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
        font-weight:800;font-size:11px;border:2px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.4)">
          <span style="transform:rotate(45deg)">${i + 1}</span>
        </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -34]
    });

    L.marker(coords, { icon }).addTo(map).bindPopup(`
      <div style="font-family:sans-serif;min-width:200px;padding:4px">
        <b style="font-size:14px">${job.title}</b><br/>
        <span style="color:#4a5568;font-size:12px">🏢 ${job.company}</span><br/>
        <span style="color:#4a5568;font-size:12px">📍 ${job.location}</span><br/>
        <span style="color:${color};font-weight:700;font-size:13px;display:block;margin:6px 0">${job.match}% match</span>
        <a href="${job.url}" target="_blank"
           style="background:#1a3a6b;color:white;padding:6px 14px;
                  border-radius:6px;text-decoration:none;font-size:12px;
                  font-weight:600;display:inline-block">Apply →</a>
      </div>
    `);
  });
}