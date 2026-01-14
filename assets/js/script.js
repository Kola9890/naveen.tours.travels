/* Naveen Tours & Travels - script.js (FINAL) */

const CONFIG = {
  owner: 'Naveen Tours & Travels',
  whatsappNumber: '919492842937', // 91 + 9492842937
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

/* ================= DATE SHORTCUTS (optional) ================= */
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

/* ================= WHATSAPP LINKS ================= */
function initWhatsApp() {
  const msg = encodeURIComponent(
    `Hi ${CONFIG.owner}, I would like to enquire about cabs.`
  );
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;

  const waHeader = document.getElementById('waHeader');
  if (waHeader) waHeader.href = url;

  const waFloat = document.getElementById('waFloat');
  if (waFloat) waFloat.href = url;

  const waContact = document.getElementById('waContact');
  if (waContact) waContact.href = url;
}

/* ================= AUTOCOMPLETE DATA ================= */
/* Add more cities/villages here anytime */
const INDIA_PLACES = [
  "Dachepalli","Dadar","Darjeeling","Davanagere","Davuluru",
  "Delhi","Guntur","Hyderabad","Vijayawada","Visakhapatnam",
  "Bengaluru","Chennai","Mumbai","Pune","Kolkata","Jaipur",
  "Kadapa","Kurnool","Nellore","Ongole","Tirupati","Rajahmundry",
  "Warangal","Nizamabad","Karimnagar","Coimbatore","Madurai","Mysuru"
];

/* ================= AUTOCOMPLETE (CLICK FIXED) ================= */
function attachAutocomplete(inputId, boxId) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(boxId);
  if (!input || !box) return;

  let open = false;

  function hide() {
    box.style.display = 'none';
    box.innerHTML = '';
    open = false;
  }

  function show() {
    box.style.display = 'block';
    open = true;
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    box.innerHTML = '';

    if (q.length < 2) return hide();

    const matches = INDIA_PLACES
      .filter(p => p.toLowerCase().startsWith(q))
      .slice(0, 20);

    if (!matches.length) return hide();

    matches.forEach(place => {
      const item = document.createElement('div');
      item.className = 'item';
      item.textContent = place;

      // ✅ pointerdown works on mobile + desktop
      item.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        input.value = place;
        hide();
      });

      box.appendChild(item);
    });

    show();
  });

  // Close only when clicking outside
  document.addEventListener('pointerdown', (e) => {
    if (open && !box.contains(e.target) && e.target !== input) {
      hide();
    }
  });

  // ESC closes
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });
}

/* ================= SEARCH -> RESULTS ================= */
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
  window.location.href = 'results.html';
}

/* ================= RESULTS SUMMARY ================= */
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

  const vehicleText = data.vehicle ? data.vehicle : 'Not specified';

  box.innerHTML = `
    <h3>Trip Summary</h3>
    <p><strong>Leaving From:</strong> ${escapeHTML(data.src || '—')}</p>
    <p><strong>Going To:</strong> ${escapeHTML(data.dst || '—')}</p>
    <p><strong>Departure:</strong> ${escapeHTML(data.date || '—')}</p>
    <p><strong>Vehicle:</strong> ${escapeHTML(vehicleText)}</p>
    <p class="muted small">For fares, tap WhatsApp and we’ll share a clear quote.</p>
  `;

  // WhatsApp quote button (results page)
  const msg = encodeURIComponent(
    `Hi ${CONFIG.owner},
Ride Enquiry
From: ${data.src || '—'}
To: ${data.dst || '—'}
Date: ${data.date || '—'}
Vehicle: ${vehicleText}`
  );
  const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;

  const waBtn = document.getElementById('waQuote');
  if (waBtn) waBtn.onclick = () => window.open(waUrl, '_blank', 'noopener,noreferrer');
}

/* ================= CONTACT FORM (optional) ================= */
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
    status.className = `form-status ${type}`;
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
    if (phone.length !== 10) {
      showStatus('Enter valid 10-digit phone number', 'error');
      return;
    }

    showStatus('Opening WhatsApp…', 'ok');
    const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(buildText())}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => form.reset(), 300);
  });

  if (emailBtn) {
    emailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href =
        `mailto:${CONFIG.email}?subject=${encodeURIComponent('Booking Request')}&body=${encodeURIComponent(buildText())}`;
    });
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

  // attach home search
  const form = document.getElementById('searchForm');
  if (form) form.addEventListener('submit', handleSearchSubmit);

  // attach autocomplete on home page if suggestion boxes exist
  attachAutocomplete('src', 'srcSuggestions');
  attachAutocomplete('dst', 'dstSuggestions');
});
