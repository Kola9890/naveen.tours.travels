/* =========================
   Naveen Tours & Travels
   Production script.js
   ========================= */

const CONFIG = {
  owner: 'Naveen Tours & Travels',
  whatsappNumber: '919492843937',
  phoneDisplay: '+91 9492842937',
  email: 'info.naveen.tours.travels@gmail.com',
  avgSpeedKmph: 45,
};

/* ---------- THEME ---------- */
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  btn.onclick = () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };
}

/* ---------- DATE SHORTCUTS ---------- */
function setToday() {
  const d = document.getElementById('date');
  if (!d) return;
  d.value = new Date().toISOString().slice(0, 10);
}
function setTomorrow() {
  const d = document.getElementById('date');
  if (!d) return;
  d.value = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
}

/* ---------- SEARCH ---------- */
function onSearchSubmit(e) {
  e.preventDefault();

  const src = document.getElementById('src').value.trim();
  const dst = document.getElementById('dst').value.trim();
  const date = document.getElementById('date').value;
  const vehicle = document.getElementById('vehicle').value;

  if (!src || !dst || !date) {
    alert('Please fill all required fields');
    return false;
  }

  localStorage.setItem(
    'booking',
    JSON.stringify({ src, dst, date, vehicle })
  );

  window.location.href = 'results.html';
  return false;
}

/* ---------- DISTANCE ---------- */
const CITY_COORDS = {
  Dachepalli: [16.6, 79.7333],
  Guntur: [16.3067, 80.4365],
  Hyderabad: [17.385, 78.4867],
  Vijayawada: [16.5062, 80.648],
  Visakhapatnam: [17.6868, 83.2185],
  Bengaluru: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
};

function haversine(a, b) {
  const R = 6371;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) *
      Math.cos(toRad(b[0])) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function renderSummary() {
  const box = document.getElementById('summary');
  if (!box) return;

  const data = JSON.parse(localStorage.getItem('booking') || '{}');
  const srcKey = (data.src || '').split(',')[0];
  const dstKey = (data.dst || '').split(',')[0];

  const a = CITY_COORDS[srcKey];
  const b = CITY_COORDS[dstKey];

  const dist = a && b ? Math.round(haversine(a, b)) : '—';
  const eta = a && b ? (dist / CONFIG.avgSpeedKmph).toFixed(1) : '—';

  box.innerHTML = `
    <h3>Trip Summary</h3>
    <p><strong>From:</strong> ${data.src || '-'}</p>
    <p><strong>To:</strong> ${data.dst || '-'}</p>
    <p><strong>Date:</strong> ${data.date || '-'}</p>
    <p><strong>Vehicle:</strong> ${data.vehicle || 'Not selected'}</p>
    <p><strong>Distance:</strong> ${dist} km</p>
    <p><strong>ETA:</strong> ${eta} hrs</p>
  `;

  const msg = encodeURIComponent(
    `Hi ${CONFIG.owner},
Ride enquiry
From: ${data.src}
To: ${data.dst}
Date: ${data.date}
Vehicle: ${data.vehicle || 'Not selected'}
Distance: ${dist} km
ETA: ${eta} hrs`
  );

  const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;

  const waBtn = document.getElementById('waQuote');
  if (waBtn) waBtn.onclick = () => window.open(waUrl, '_blank');

  const gmaps = document.getElementById('gmapsDir');
  if (gmaps)
    gmaps.href = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      data.src || ''
    )}&destination=${encodeURIComponent(data.dst || '')}`;
}

/* ---------- WHATSAPP ---------- */
function initWhatsApp() {
  const msg = encodeURIComponent(
    `Hi ${CONFIG.owner}, I would like to enquire about cabs.`
  );
  const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;

  const waHeader = document.getElementById('waHeader');
  if (waHeader) waHeader.href = waUrl;

  const waFloat = document.getElementById('waFloat');
  if (waFloat) waFloat.href = waUrl;

  const waContact = document.getElementById('waContact');
  if (waContact) waContact.href = waUrl;
}

/* ---------- FOOTER YEAR ---------- */
function setYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

/* ---------- INIT ---------- */
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initWhatsApp();
  renderSummary();
  setYear();
});
