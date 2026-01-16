/* Naveen Tours & Travels - script.js (FINAL ALL FEATURES) */

const CONFIG = {
  owner: 'Naveen Tours & Travels',
  whatsappNumber: '919492842937',
  email: 'info.naveentoursandtravels@gmail.com',
};

/* ================= THEME ================= */
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);

  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
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

  ['waHeader', 'waFloat', 'waContact'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = url;
  });
}

/* ================= AUTOCOMPLETE ================= */
const INDIA_PLACES = [
  "Hyderabad","Vijayawada","Visakhapatnam","Bengaluru","Chennai",
  "Mumbai","Pune","Kolkata","Jaipur","Tirupati","Rajahmundry",
  "Warangal","Nellore","Ongole","Kurnool","Kadapa","Mysuru"
];

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
    if (q.length < 2) return hide();

    INDIA_PLACES.filter(p => p.toLowerCase().startsWith(q))
      .forEach(place => {
        const div = document.createElement('div');
        div.className = 'item';
        div.textContent = place;
        div.onclick = () => {
          input.value = place;
          hide();
        };
        box.appendChild(div);
      });

    box.style.display = 'block';
  });

  document.addEventListener('click', e => {
    if (!box.contains(e.target) && e.target !== input) hide();
  });
}

/* ================= SEARCH ================= */
function handleSearchSubmit(e) {
  e.preventDefault();
  const src = document.getElementById('src')?.value.trim();
  const dst = document.getElementById('dst')?.value.trim();
  const date = document.getElementById('date')?.value;
  const vehicle = document.getElementById('vehicle')?.value || '';

  if (!src || !dst || !date) {
    alert('Please fill all required fields');
    return;
  }

  localStorage.setItem('booking', JSON.stringify({ src, dst, date, vehicle }));
  window.location.href = 'results.html';
}

/* ================= RESULTS PAGE ================= */
function renderSummary() {
  const box = document.getElementById('summary');
  if (!box) return;

  const data = JSON.parse(localStorage.getItem('booking') || '{}');

  box.innerHTML = `
    <h3>Trip Summary</h3>
    <p><b>From:</b> ${data.src || '-'}</p>
    <p><b>To:</b> ${data.dst || '-'}</p>
    <p><b>Date:</b> ${data.date || '-'}</p>
    <p><b>Vehicle:</b> ${data.vehicle || 'Any'}</p>
  `;

  const gmaps = document.getElementById('gmapsDir');
  if (gmaps) {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(data.src)}&destination=${encodeURIComponent(data.dst)}`;
    gmaps.onclick = () => window.open(url, '_blank');
  }
}

/* ================= MOBILE MENU ================= */
function initMobileMenu() {
  const btn = document.getElementById('menuBtn');
  const close = document.getElementById('menuClose');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !close || !menu) return;

  btn.onclick = () => menu.classList.add('show');
  close.onclick = () => menu.classList.remove('show');
  menu.onclick = e => e.target === menu && menu.classList.remove('show');
}

/* ================= MODAL HELPERS ================= */
function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add('show');
  m.setAttribute('aria-hidden', 'false');
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('show');
  m.setAttribute('aria-hidden', 'true');
}

/* ================= GALLERY CLOSE → BACK TO OUTSTATION ================= */
function attachGalleryModal(modalId, closeBtnId) {
  const modal = document.getElementById(modalId);
  const closeBtn = document.getElementById(closeBtnId);
  const outstation = document.getElementById('outstationModal');
  if (!modal || !closeBtn || !outstation) return;

  const closeGallery = () => {
    closeModal(modalId);
    openModal('outstationModal'); // ✅ BACK TO POPULAR PLACES
  };

  closeBtn.onclick = closeGallery;
  modal.onclick = e => e.target === modal && closeGallery();
}

/* ================= OUTSTATION POPUP ================= */
function initOutstationPopup() {
  const card = document.getElementById('outstationCard');
  const modal = document.getElementById('outstationModal');
  const close = document.getElementById('outstationClose');
  if (!card || !modal || !close) return;

  card.onclick = () => openModal('outstationModal');
  close.onclick = () => closeModal('outstationModal');
  modal.onclick = e => e.target === modal && closeModal('outstationModal');

  const map = {
    tirupati: 'tirupatiModal',
    hyderabad: 'hyderabadModal',
    bengaluru: 'bengaluruModal',
    visakhapatnam: 'visakhapatnamModal',
    vijayawada: 'vijayawadaModal',
  };

  document.querySelectorAll('.place-card').forEach(card => {
    card.onclick = () => {
      const place = (card.dataset.place || card.innerText).toLowerCase();
      if (map[place]) {
        closeModal('outstationModal');
        openModal(map[place]);
      }
    };
  });
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
  initMobileMenu();
  initOutstationPopup();
  setYear();

  const form = document.getElementById('searchForm');
  if (form) form.addEventListener('submit', handleSearchSubmit);

  attachAutocomplete('src', 'srcSuggestions');
  attachAutocomplete('dst', 'dstSuggestions');

  attachGalleryModal('tirupatiModal', 'tirupatiClose');
  attachGalleryModal('hyderabadModal', 'hyderabadClose');
  attachGalleryModal('bengaluruModal', 'bengaluruClose');
  attachGalleryModal('visakhapatnamModal', 'visakhapatnamClose');
  attachGalleryModal('vijayawadaModal', 'vijayawadaClose');
});
