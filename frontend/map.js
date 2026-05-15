// ── Auth guard ────────────────────────────────────────────────────────────────
if (!localStorage.getItem("token")) window.location.href = "login.html";

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

// ── City → coords lookup ──────────────────────────────────────────────────────
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
  "gurugram":   [28.4595, 77.0266],
  "gurgaon":    [28.4595, 77.0266],
};

function getCoords(location) {
  if (!location) return [20.5937, 78.9629];
  const lower = location.toLowerCase();
  for (const city in CITIES) {
    if (lower.includes(city)) return CITIES[city];
  }
  return [20.5937, 78.9629];   // centre of India as fallback
}

function getColor(match) {
  if (match >= 70) return "#22c55e";
  if (match >= 40) return "#e8a838";
  return "#4a5568";
}

// ── Build the pin HTML ────────────────────────────────────────────────────────
// Avoid flexbox inside divIcon — use line-height centering instead (more reliable)
function makePinHTML(label, color) {
  return `
    <div style="
      position: relative;
      width: 32px; height: 32px;
    ">
      <div style="
        background: ${color};
        width: 32px; height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2.5px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        position: absolute; top: 0; left: 0;
      "></div>
      <span style="
        position: absolute;
        top: 6px; left: 0;
        width: 32px;
        text-align: center;
        color: white;
        font-weight: 800;
        font-size: 11px;
        line-height: 1;
        font-family: sans-serif;
        pointer-events: none;
      ">${label}</span>
    </div>
  `;
}

// ── Initialise map ────────────────────────────────────────────────────────────
const map = L.map("map", { zoomControl: true }).setView([20.5937, 78.9629], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
  maxZoom: 18,
}).addTo(map);

// Force Leaflet to recalculate size in case the container was 0px at init time
setTimeout(() => map.invalidateSize(), 100);

// ── Load results ──────────────────────────────────────────────────────────────
let results = [];
try {
  const stored = localStorage.getItem("internshipResults");
  if (stored) results = JSON.parse(stored);
} catch (_) {}

const subtitle = document.getElementById("mapSubtitle");

if (!results || results.length === 0) {
  subtitle.textContent = "No results found. Please take the quiz first!";
} else {
  subtitle.textContent = `Showing ${results.length} internship${results.length !== 1 ? "s" : ""} — click a pin for details`;

  results.forEach((job, i) => {
    const color  = getColor(job.match);
    const coords = getCoords(job.location);

    const icon = L.divIcon({
      className:   "",           // clear Leaflet's default white box
      html:        makePinHTML(i + 1, color),
      iconSize:    [32, 32],
      iconAnchor:  [16, 32],     // bottom-centre of pin touches the location
      popupAnchor: [0, -36],     // popup appears above the pin
    });

    L.marker(coords, { icon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family:DM Sans,sans-serif;min-width:210px;padding:4px 2px">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0a0f1e">
            ${job.title || "Untitled"}
          </p>
          <p style="margin:0 0 2px;font-size:12px;color:#4a5568">🏢 ${job.company  || "Unknown"}</p>
          <p style="margin:0 0 8px;font-size:12px;color:#4a5568">📍 ${job.location || "India"}</p>
          <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:${color}">
            ${job.match}% match
          </p>
          <a href="${job.url || '#'}" target="_blank"
             style="display:inline-block;background:#1a3a6b;color:white;
                    padding:6px 16px;border-radius:6px;text-decoration:none;
                    font-size:12px;font-weight:600">Apply →</a>
        </div>
      `);
  });
}