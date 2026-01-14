/* Naveen Tours & Travels - script.js */

const CONFIG = {
  owner: 'Naveen Tours & Travels',
  whatsappNumber: '919492842937', // 91 + 9492842937
  email: 'info.naveentoursandtravels@gmail.com',
  avgSpeedKmph: 45,
};

/* THEME (saved) */
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

/* TODAY / TOMORROW */
function setToday() {
  const d = document.getElementById('date');
  if (!d) return;
  d.value = new Date().toISOString().slice(0, 10);
}
function setTomorrow() {
  const d = document.getElementById('date');
  if (!d) return;
  d.value = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/* HOME SEARCH -> RESULTS */
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

  // ✅ redirect to results page
  window.location.href = 'results.html';
  return false;
}

/* WHATSAPP LINKS (header + floating + contact button) */
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

/* DISTANCE (simple estimate) */
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

/* RESULTS PAGE SUMMARY */
function renderSummary() {
  const box = document.getElementById('summary');
  if (!box) return;

  let data = {};
  try {
    data = JSON.parse(localStorage.getItem('booking') || '{}');
  } catch (e) {}

  const a = CITY_COORDS[normalizeCity(data.src)];
  const b = CITY_COORDS[normalizeCity(data.dst)];

  const dist = a && b ? Math.round(haversine(a, b)) : null;
  const eta = dist ? (dist / CONFIG.avgSpeedKmph) : null;

  const vehicleText = data.vehicle ? data.vehicle : 'Not specified';

  box.innerHTML = `
    <h3>Trip Summary</h3>
    <p><strong>Leaving From:</strong> ${escapeHTML(data.src || '—')}</p>
    <p><strong>Going To:</strong> ${escapeHTML(data.dst || '—')}</p>
    <p><strong>Departure:</strong> ${escapeHTML(data.date || '—')}</p>
    <p><strong>Vehicle:</strong> ${escapeHTML(vehicleText)}</p>
    <p><strong>Distance:</strong> ${dist ? dist + ' km' : '—'}</p>
    <p><strong>ETA:</strong> ${eta ? eta.toFixed(1) + ' hrs' : '—'}</p>
    <p class="muted small">For fares, tap WhatsApp and we’ll share a clear quote.</p>
  `;

  const msg = encodeURIComponent(
    `Hi ${CONFIG.owner},
Ride Enquiry
From: ${data.src || '—'}
To: ${data.dst || '—'}
Date: ${data.date || '—'}
Vehicle: ${vehicleText}
Distance: ${dist ? dist + ' km' : '—'}
ETA: ${eta ? eta.toFixed(1) + ' hrs' : '—'}`
  );

  const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;
  const waBtn = document.getElementById('waQuote');
  if (waBtn) waBtn.onclick = () => window.open(waUrl, '_blank', 'noopener,noreferrer');

  const gmaps = document.getElementById('gmapsDir');
  if (gmaps) {
    gmaps.href = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      data.src || ''
    )}&destination=${encodeURIComponent(data.dst || '')}&travelmode=driving`;
  }
}

/* CONTACT FORM -> WhatsApp + Email */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const emailBtn = document.getElementById('emailFallback');
  const status = document.getElementById('formStatus');

  const get = (id) => (document.getElementById(id)?.value || '').trim();
  const digitsOnly = (s) => (s || '').replace(/\D/g, '');

  function showStatus(text, type) {
    if (!status) return;
    status.textContent = text;
    status.classList.remove('ok', 'error');
    status.classList.add(type);
    status.style.display = 'block';
  }

  function buildText() {
    return `Hi ${CONFIG.owner},
New Booking Request
Name: ${get('cfName')}
Phone: ${get('cfPhone')}
From: ${get('cfFrom')}
To: ${get('cfTo')}
Date: ${get('cfDate')}
Vehicle: ${get('cfVehicle') || 'Not specified'}
Message: ${get('cfMsg') || '—'}`;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = digitsOnly(get('cfPhone'));

    if (!(phone.length === 10 || (phone.length === 12 && phone.startsWith('91')))) {
      showStatus('Please enter a valid 10-digit phone number.', 'error');
      return;
    }

    showStatus('Opening WhatsApp… Please tap Send in WhatsApp.', 'ok');

    const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(buildText())}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => form.reset(), 300);
  });

  if (emailBtn) {
    emailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const phone = digitsOnly(get('cfPhone'));

      if (!(phone.length === 10 || (phone.length === 12 && phone.startsWith('91')))) {
        showStatus('Please enter a valid phone number before emailing.', 'error');
        return;
      }

      showStatus('Opening email…', 'ok');

      const mailto =
        `mailto:${CONFIG.email}` +
        `?subject=${encodeURIComponent('Booking Request - Naveen Tours & Travels')}` +
        `&body=${encodeURIComponent(buildText())}`;

      window.location.href = mailto;
    });
  }
}

/* YEAR */
function setYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

/* SAFE HTML */
function escapeHTML(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* INIT */
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initWhatsApp();
  renderSummary();
  initContactForm();
  setYear();
});
