const CONFIG = {
  owner: 'Naveen Tours & Travels',
  whatsappNumber: '919492842937',
  email: 'info.naveentoursandtravels@gmail.com',
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

/* WHATSAPP LINKS */
function initWhatsApp() {
  const msg = encodeURIComponent(`Hi ${CONFIG.owner}, I would like to enquire about cabs.`);
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;

  ['waHeader', 'waFloat', 'waContact'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = url;
  });
}

/* SAVE HOME SEARCH TO LOCALSTORAGE (optional feature) */
function saveSearchDraft() {
  const src = document.getElementById('src')?.value?.trim() || '';
  const dst = document.getElementById('dst')?.value?.trim() || '';
  const date = document.getElementById('date')?.value || '';
  const vehicle = document.getElementById('vehicle')?.value || '';
  localStorage.setItem('lastSearch', JSON.stringify({ src, dst, date, vehicle }));
}

/* AUTO-FILL CONTACT FORM FROM HOME SEARCH */
function fillContactFromLastSearch() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  let data = {};
  try {
    data = JSON.parse(localStorage.getItem('lastSearch') || '{}');
  } catch (e) {}

  if (data.src && document.getElementById('cfFrom')) document.getElementById('cfFrom').value = data.src;
  if (data.dst && document.getElementById('cfTo')) document.getElementById('cfTo').value = data.dst;
  if (data.date && document.getElementById('cfDate')) document.getElementById('cfDate').value = data.date;
  if (data.vehicle && document.getElementById('cfVehicle')) document.getElementById('cfVehicle').value = data.vehicle;
}

/* CONTACT FORM (WhatsApp + Email) */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Add status box (success/error)
  let status = document.getElementById('formStatus');
  if (!status) {
    status = document.createElement('div');
    status.id = 'formStatus';
    status.className = 'form-status';
    status.style.display = 'none';
    form.appendChild(status);
  }

  const showStatus = (text, type) => {
    status.textContent = text;
    status.classList.remove('ok', 'error');
    status.classList.add(type);
    status.style.display = 'block';
  };

  const digitsOnly = (s) => (s || '').replace(/\D/g, '');

  const buildText = () => {
    const name = document.getElementById('cfName')?.value?.trim() || '';
    const phone = document.getElementById('cfPhone')?.value?.trim() || '';
    const from = document.getElementById('cfFrom')?.value?.trim() || '';
    const to = document.getElementById('cfTo')?.value?.trim() || '';
    const date = document.getElementById('cfDate')?.value || '';
    const vehicle = document.getElementById('cfVehicle')?.value?.trim() || '';
    const msg = document.getElementById('cfMsg')?.value?.trim() || '';

    return `Hi ${CONFIG.owner},
New Booking Request
Name: ${name}
Phone: ${phone}
From: ${from}
To: ${to}
Date: ${date}
Vehicle: ${vehicle || 'Not specified'}
Message: ${msg || '—'}`;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const phoneRaw = document.getElementById('cfPhone')?.value || '';
    const phone = digitsOnly(phoneRaw);

    if (!(phone.length === 10 || (phone.length === 12 && phone.startsWith('91')))) {
      showStatus('Please enter a valid 10-digit phone number.', 'error');
      return;
    }

    showStatus('Opening WhatsApp… Please tap Send in WhatsApp.', 'ok');

    const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(buildText())}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    setTimeout(() => form.reset(), 300);
  });

  const emailBtn = document.getElementById('emailFallback');
  if (emailBtn) {
    emailBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const phoneRaw = document.getElementById('cfPhone')?.value || '';
      const phone = digitsOnly(phoneRaw);
      if (!(phone.length === 10 || (phone.length === 12 && phone.startsWith('91')))) {
        showStatus('Please enter a valid 10-digit phone number before emailing.', 'error');
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

  // Fill auto data when contact page loads
  fillContactFromLastSearch();
}

/* YEAR */
function setYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

/* INIT */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initWhatsApp();
  initContactForm();
  setYear();

  // If home page fields exist, save draft when user types
  const src = document.getElementById('src');
  const dst = document.getElementById('dst');
  const date = document.getElementById('date');
  const vehicle = document.getElementById('vehicle');

  [src, dst, date, vehicle].forEach((el) => {
    if (el) el.addEventListener('change', saveSearchDraft);
    if (el && el.tagName === 'INPUT') el.addEventListener('input', saveSearchDraft);
  });
});
