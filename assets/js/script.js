/* =========================
   Naveen Tours & Travels
   Production script.js
   ========================= */

const CONFIG = {
  owner: 'Naveen Tours & Travels',
  whatsappNumber: '919492843937',
  phoneDisplay: '+91 9492842937',
  email: 'info.naveentoursandtravels@gmail.com',
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

/* ---------- DATE SHORTCUTS (Home) ---------- */
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

/* ---------- SEARCH (Home) ---------- */
function onSearchSubmit(e) {
  e.preventDefault();

  const src = (document.getElementById('src')?.value || '').trim();
  const dst = (document.getElementById('dst')?.value || '').trim();
  const date = document.getElementById('date')?.value || '';
  const vehicle = document.getElementById('vehicle')?.value || '';

  if (!src || !dst || !date) {
    alert('Please fill Leaving From, Going To, and Departure date');
    return false;
  }

  localStorage.setItem('booking', JSON.stringify({ src, dst, date, vehicle }));
  window.location.href = 'results.html';
  return false;
}

/* ---------- DISTANCE (Results) ---------- */
const CITY_COORDS = {
  Dachepalli: [16.6, 79.7333],
  Guntur: [16.3067, 80.4365],
  Hyderabad: [17.385, 78.4867],
  Vijayawada: [16.5062, 80.648],
  Visakhapatnam: [17.6868, 83.2185],
  Bengaluru: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  Mumbai: [19.076, 72.8777],
  Pune: [18.5204, 73.8567],
  Delhi: [28.6139, 77.209],
};

function normalizeCity(s) {
  return (s || '').split(',')[0].trim();
}

function haversine(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const A =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) *
      Math.cos(toRad(b[0])) *
      Math.sin(dLon / 2) ** 2;
  const C = 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
  return R * C;
}

function safeParseJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || '') || fallback;
  } catch (_) {
    return fallback;
  }
}

function renderSummary() {
  const box = document.getElementById('summary');
  if (!box) return;

  const data = safeParseJSON('booking', {});
  const srcKey = normalizeCity(data.src);
  const dstKey = normalizeCity(data.dst);

  const a = CITY_COORDS[srcKey];
  const b = CITY_COORDS[dstKey];

  const dist = a && b ? Math.round(haversine(a, b)) : '—';
  const eta = a && b ? (dist / CONFIG.avgSpeedKmph).toFixed(1) : '—';
  const vehicleText = data.vehicle ? data.vehicle : 'Not selected';

  box.innerHTML = `
    <h3>Trip Summary</h3>
    <p><strong>From:</strong> ${escapeHTML(data.src || '—')}</p>
    <p><strong>To:</strong> ${escapeHTML(data.dst || '—')}</p>
    <p><strong>Date:</strong> ${escapeHTML(data.date || '—')}</p>
    <p><strong>Vehicle:</strong> ${escapeHTML(vehicleText)}</p>
    <p><strong>Distance:</strong> ${dist === '—' ? '—' : dist + ' km'}</p>
    <p><strong>ETA:</strong> ${eta === '—' ? '—' : eta + ' hrs'}</p>
    <p class="muted small">For exact fare, tap WhatsApp and we’ll share a clear quote.</p>
  `;

  const msg = encodeURIComponent(
    `Hi ${CONFIG.owner},
Ride Enquiry
From: ${data.src || '—'}
To: ${data.dst || '—'}
Date: ${data.date || '—'}
Vehicle: ${vehicleText}
Distance: ${dist === '—' ? '—' : dist + ' km'}
ETA: ${eta === '—' ? '—' : eta + ' hrs'}`
  );

  const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;

  const waBtn = document.getElementById('waQuote');
  if (waBtn) waBtn.onclick = () => window.open(waUrl, '_blank', 'noopener,noreferrer');

  const gmaps = document.getElementById('gmapsDir');
  if (gmaps) {
    gmaps.href = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      data.src || ''
    )}&destination=${encodeURIComponent(data.dst || '')}`;
  }
}

/* ---------- WHATSAPP BUTTONS ---------- */
function initWhatsApp() {
  const msg = encodeURIComponent(`Hi ${CONFIG.owner}, I would like to enquire about cabs.`);
  const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;

  const waHeader = document.getElementById('waHeader');
  if (waHeader) waHeader.href = waUrl;

  const waFloat = document.getElementById('waFloat');
  if (waFloat) waFloat.href = waUrl;

  const waContact = document.getElementById('waContact');
  if (waContact) waContact.href = waUrl;
}

/* ---------- CONTACT FORM (Contact page) ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const emailBtn = document.getElementById('emailFallback');

  const get = (id) => (document.getElementById(id)?.value || '').trim();

  function buildText() {
    const name = get('cfName');
    const phone = get('cfPhone');
    const from = get('cfFrom');
    const to = get('cfTo');
    const date = get('cfDate');
    const vehicle = get('cfVehicle');
    const msg = get('cfMsg');

    return `Hi ${CONFIG.owner},
New Booking Request
Name: ${name}
Phone: ${phone}
From: ${from}
To: ${to}
Date: ${date}
Vehicle: ${vehicle || 'Not specified'}
Message: ${msg || '—'}`;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = buildText();
    const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  });

  // Email fallback button updates live on click
  if (emailBtn) {
    emailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = buildText();

      const mailto =
        `mailto:${CONFIG.email}` +
        `?subject=${encodeURIComponent('Booking Request - Naveen Tours & Travels')}` +
        `&body=${encodeURIComponent(text)}`;

      window.location.href = mailto;
    });
  }
}

/* ---------- FOOTER YEAR ---------- */
function setYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

/* ---------- SAFE HTML ---------- */
function escapeHTML(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* ---------- INIT ---------- */
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initWhatsApp();
  renderSummary();
  initContactForm();
  setYear();
});
