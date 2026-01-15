/* Naveen Tours & Travels - script.js (FINAL COMPLETE + Maps Button Fix) */

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

  btn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

/* ================= WHATSAPP ================= */
function initWhatsApp() {
  const msg = encodeURIComponent(
    `Hi ${CONFIG.owner}, I would like to enquire about cab services.`
  );
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;

  const waHeader = document.getElementById('waHeader');
  const waFloat = document.getElementById('waFloat');
  const waContact = document.getElementById('waContact');

  if (waHeader) waHeader.href = url;
  if (waFloat) waFloat.href = url;
  if (waContact) waContact.href = url;
}

/* ================= AUTOCOMPLETE DATA ================= */
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

  document.addEventListener('pointerdown', (e) => {
    if (open && !box.contains(e.target) && e.target !== input) {
      hide();
    }
  });
}

/* ================= SEARCH -> RESULTS ================= */
function handleSearchSubmit(e) {
  e.preventDefault();

  const src = document.getElementById('src')?.value.trim();
  const dst = document.getElementById('dst')?.value.trim();
  const date = document.getElementById('date')?.value;
  const vehicle = document.getElementById('vehicle')?.value || '';

  if (!src || !dst || !date) {
    alert('Please fill Leaving From, Going To and Date');
    return;
  }

  localStorage.setItem('booking', JSON.stringify({ src, dst, date, vehicle }));
  window.location.href = 'results.html';
}

/* ================= RESULTS PAGE (WhatsApp + Google Maps FIX) ================= */
function renderSummary() {
  const box = document.getElementById('summary');
  if (!box) return;

  let data = {};
  try {
    data = JSON.parse(localStorage.getItem('booking') || '{}');
  } catch {}

  box.innerHTML = `
    <h3>Trip Summary</h3>
    <p><strong>Leaving From:</strong> ${data.src || '—'}</p>
    <p><strong>Going To:</strong> ${data.dst || '—'}</p>
    <p><strong>Date:</strong> ${data.date || '—'}</p>
    <p><strong>Vehicle:</strong> ${data.vehicle || 'Any'}</p>
    <p class="muted">For price, contact us on WhatsApp.</p>
  `;

  // WhatsApp Quote
  const waBtn = document.getElementById('waQuote');
  if (waBtn) {
    const msg = encodeURIComponent(
      `Hi ${CONFIG.owner},
Trip enquiry:
From: ${data.src || '—'}
To: ${data.dst || '—'}
Date: ${data.date || '—'}
Vehicle: ${data.vehicle || 'Any'}`
    );
    waBtn.onclick = () =>
      window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`, '_blank');
  }

  // ✅ Google Maps Directions (FORCE OPEN + FALLBACK)
  const gmaps = document.getElementById('gmapsDir');
  if (gmaps) {
    const origin = encodeURIComponent(data.src || '');
    const destination = encodeURIComponent(data.dst || '');
    const mapsUrl =
      `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    // normal browser link
    gmaps.href = mapsUrl;
    gmaps.target = "_blank";
    gmaps.rel = "noopener";

    // force open for mobile / in-app browsers
    gmaps.onclick = (e) => {
      e.preventDefault();
      const win = window.open(mapsUrl, "_blank", "noopener,noreferrer");
      if (!win) {
        // popup blocked -> open in same tab
        window.location.href = mapsUrl;
      }
    };
  }
}

/* ================= CONTACT FORM ================= */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const emailBtn = document.getElementById('emailFallback');
  const status = document.getElementById('formStatus');

  const get = id => document.getElementById(id)?.value.trim() || '';

  function showStatus(msg, type) {
    if (!status) return;
    status.textContent = msg;
    status.className = `form-status ${type}`;
    status.style.display = 'block';
  }

  function buildMsg() {
    return `Hi ${CONFIG.owner},
Name: ${get('cfName')}
Phone: ${get('cfPhone')}
From: ${get('cfFrom')}
To: ${get('cfTo')}
Date: ${get('cfDate')}
Vehicle: ${get('cfVehicle')}
Message: ${get('cfMsg')}`;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    showStatus('Opening WhatsApp…', 'ok');
    window.open(
      `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(buildMsg())}`,
      '_blank'
    );
    setTimeout(() => form.reset(), 400);
  });

  if (emailBtn) {
    emailBtn.addEventListener('click', e => {
      e.preventDefault();
      window.location.href =
        `mailto:${CONFIG.email}?subject=Booking Request&body=${encodeURIComponent(buildMsg())}`;
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
  renderSummary();
  initContactForm();
  setYear();

  // Search form
  const form = document.getElementById('searchForm');
  if (form) form.addEventListener('submit', handleSearchSubmit);

  // Autocomplete
  attachAutocomplete('src', 'srcSuggestions');
  attachAutocomplete('dst', 'dstSuggestions');

  // Today / Tomorrow buttons (if present)
  const dateInput = document.getElementById('date');
  const btnToday = document.getElementById('btnToday');
  const btnTomorrow = document.getElementById('btnTomorrow');

  if (btnToday && dateInput) {
    btnToday.addEventListener('click', () => {
      dateInput.value = new Date().toISOString().slice(0, 10);
    });
  }
  if (btnTomorrow && dateInput) {
    btnTomorrow.addEventListener('click', () => {
      const d = new Date(Date.now() + 86400000);
      dateInput.value = d.toISOString().slice(0, 10);
    });
  }
});
