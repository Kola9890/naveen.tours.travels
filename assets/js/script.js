/* Naveen Tours & Travels - script.js (FINAL) */

const CONFIG = {
  owner: 'Naveen Tours & Travels',
  whatsappNumber: '919492842937',
  email: 'info.naveentoursandtravels@gmail.com',
  avgSpeedKmph: 45,
};

/* ================= THEME ================= */
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);

  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  btn.onclick = () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };
}

/* ================= DATE SHORTCUTS ================= */
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

/* ================= WHATSAPP ================= */
function initWhatsApp() {
  const msg = encodeURIComponent(`Hi ${CONFIG.owner}, I would like to enquire about cabs.`);
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;

  const waHeader = document.getElementById('waHeader');
  if (waHeader) waHeader.href = url;

  const waFloat = document.getElementById('waFloat');
  if (waFloat) waFloat.href = url;

  const waContact = document.getElementById('waContact');
  if (waContact) waContact.href = url;
}

/* ================= AUTOCOMPLETE DATA ================= */
/* You can keep expanding this list */
const INDIA_PLACES = [
  "Dachepalli","Guntur","Hyderabad","Vijayawada","Visakhapatnam",
  "Bengaluru","Chennai","Mumbai","Pune","Delhi","Kolkata","Jaipur",
  "Dadar","Darjeeling","Davanagere","Davuluru","Dindigul","Dausa",
  "Anantapur","Kurnool","Nellore","Tirupati","Rajahmundry","Ongole",
  "Kadapa","Warangal","Nizamabad","Vikarabad","Medak","Karimnagar",
  "Coimbatore","Madurai","Trichy","Salem","Erode","Mysuru",
  "Patna","Ranchi","Lucknow","Kanpur","Noida","Gurugram"
];

/* ================= AUTOCOMPLETE (FIXED CLICK ISSUE) ================= */
function attachAutocomplete(inputId, boxId) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(boxId);
  if (!input || !box) return;

  function hide() {
    box.style.display = 'none';
    box.innerHTML = '';
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    box.innerHTML = '';

    if (q.length < 2) {
      hide();
      return;
    }

    const matches = INDIA_PLACES
      .filter(p => p.toLowerCase().startsWith(q))
      .slice(0, 20);

    if (!matches.length) {
      hide();
      return;
    }

    matches.forEach(place => {
      const div = document.createElement('div');
      div.className = 'item';
      div.textContent = place;

      // ✅ mousedown works before blur (FIX)
      div.addEventListener('mousedown', (e) => {
        e.preventDefault();
        input.value = place;
        hide();
      });

      box.appendChild(div);
    });

    box.style.display = 'block';
  });

  // close only when clicking outside
  document.addEventListener('mousedown', (e) => {
    if (!box.contains(e.target) && e.target !== input) {
      hide();
    }
  });

  // ESC closes list
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });
}

/* ================= SEARCH → RESULTS ================= */
function handleSearchSubmit(e) {
  e.preventDefault();

  const src = (document.getElementById('src')?.value || '').trim();
  const dst = (document.getElementById('dst')?.value || '').trim();
  const date = document.getElementById('date')?.value || '';
  const vehicle = document.getElementById('vehicle')?.value || '';

  if (!src || !dst || !date) {
    alert('Please fill Leaving From, Going To, and Departure date');
    return;
  }

  localStorage.setItem('booking', JSON.stringify({ src, dst, date, vehicle }));
  window.location.assign('results.html');
}

/* ================= RESULTS SUMMARY ================= */
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
  const toRad = d => (d * Math.PI) / 180;
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

function escapeHTML(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderSummary() {
  const box = document.getElementById('summary');
  if (!box) return;

  let data = {};
  try { data = JSON.parse(localStorage.getItem('booking') || '{}'); } catch {}

  const a = CITY_COORDS[normalizeCity(data.src)];
  const b = CITY_COORDS[normalizeCity(data.dst)];

  const dist = a && b ? Math.round(haversine(a, b)) : null;
  const eta = dist ? (dist / CONFIG.avgSpeedKmph) : null;
  const vehicleText = data.vehicle || 'Not specified';

  box.innerHTML = `
    <h3>Trip Summary</h3>
    <p><strong>Leaving From:</strong> ${escapeHTML(data.src || '—')}</p>
    <p><strong>Going To:</strong> ${escapeHTML(data.dst || '—')}</p>
    <p><strong>Departure:</strong> ${escapeHTML(data.date || '—')}</p>
    <p><strong>Vehicle:</strong> ${escapeHTML(vehicleText)}</p>
    <p><strong>Distance:</strong> ${dist ? dist + ' km' : '—'}</p>
    <p><strong>ETA:</strong> ${eta ? eta.toFixed(1) + ' hrs' : '—'}</p>
  `;
}

/* ================= CONTACT FORM ================= */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const emailBtn = document.getElementById('emailFallback');
  const status = document.getElementById('formStatus');

  const get = id => (document.getElementById(id)?.value || '').trim();
  const digitsOnly = s => (s || '').replace(/\D/g, '');

  function showStatus(text, type) {
    if (!status) return;
    status.textContent = text;
    status.className = `form-status ${type}`;
    status.style.display = 'block';
  }

  function buildText() {
    return `Hi ${CONFIG.owner},
Name: ${get('cfName')}
Phone: ${get('cfPhone')}
From: ${get('cfFrom')}
To: ${get('cfTo')}
Date: ${get('cfDate')}
Vehicle: ${get('cfVehicle') || '—'}
Message: ${get('cfMsg') || '—'}`;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const phone = digitsOnly(get('cfPhone'));

    if (phone.length !== 10) {
      showStatus('Enter valid 10-digit phone number', 'error');
      return;
    }

    showStatus('Opening WhatsApp…', 'ok');
    window.open(
      `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(buildText())}`,
      '_blank',
      'noopener,noreferrer'
    );
    setTimeout(() => form.reset(), 300);
  });

  if (emailBtn) {
    emailBtn.onclick = e => {
      e.preventDefault();
      window.location.href =
        `mailto:${CONFIG.email}?subject=Booking Request&body=${encodeURIComponent(buildText())}`;
    };
  }
}

/* ================= YEAR ================= */
function setYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

/* ================= INIT ================= */
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initWhatsApp();
  initContactForm();
  renderSummary();
  setYear();

  const form = document.getElementById('searchForm');
  if (form) form.addEventListener('submit', handleSearchSubmit);

  attachAutocomplete('src', 'srcSuggestions');
  attachAutocomplete('dst', 'dstSuggestions');
});
