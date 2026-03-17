/* ═══════════════════════════════════════════
   SunnyAid – script.js
   ═══════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════
   1. CLOCK
   ═══════════════════════════════════════════ */
function updateClock() {
  const now  = new Date();
  const time = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateShort = now.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const dateLong  = now.toLocaleDateString('en-AU', { weekday: 'long',  day: 'numeric', month: 'long',  year: 'numeric' });
  const timeShort = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });

  setTextSafe('navTime',     time);
  setTextSafe('navDate',     dateShort);
  setTextSafe('chatTime',    time);
  setTextSafe('chatDate',    dateLong);
  setTextSafe('initMsgTime', timeShort);
}

function setTextSafe(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

setInterval(updateClock, 1000);
updateClock();


/* ═══════════════════════════════════════════
   2. NAV SCROLL + ACTIVE LINK
   ═══════════════════════════════════════════ */
const mainNav    = document.getElementById('mainNav');
const backTopBtn = document.getElementById('backTop');
const navAnchors = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  const y = window.scrollY;

  // Scrolled state
  mainNav.classList.toggle('scrolled', y > 60);

  // Back to top
  if (backTopBtn) backTopBtn.classList.toggle('show', y > 500);

  // Active link
  let current = '';
  document.querySelectorAll('section[id], [id]').forEach(sec => {
    if (sec.offsetTop - 100 <= y) current = sec.id;
  });
  navAnchors.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}, { passive: true });


/* ═══════════════════════════════════════════
   3. MOBILE MENU
   ═══════════════════════════════════════════ */
const mobMenu     = document.getElementById('mobMenu');
const hamburgerBtn = document.getElementById('hamburgerBtn');

function openMob() {
  mobMenu.classList.add('open');
  hamburgerBtn.classList.add('open');
  hamburgerBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMob() {
  mobMenu.classList.remove('open');
  hamburgerBtn.classList.remove('open');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// Expose globally for inline onclick
window.openMob  = openMob;
window.closeMob = closeMob;

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobMenu.classList.contains('open')) closeMob();
});


/* ═══════════════════════════════════════════
   4. SCROLL REVEAL
   ═══════════════════════════════════════════ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger sibling reveals
      const siblings = entry.target.parentElement?.querySelectorAll('.reveal');
      let delay = 0;
      if (siblings) {
        siblings.forEach((sib, idx) => {
          if (sib === entry.target) delay = idx * 80;
        });
      }
      setTimeout(() => entry.target.classList.add('in'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

function initReveal() {
  const selectors = [
    '.reveal', '.scard', '.tcard', '.acard', '.aw-b',
    '.erow', '.pcard', '.art-card', '.hcard', '.step',
    '.hero-stat', '.qr-card'
  ];
  document.querySelectorAll(selectors.join(', ')).forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
}
initReveal();


/* ═══════════════════════════════════════════
   5. COUNTER ANIMATION (hero stats)
   ═══════════════════════════════════════════ */
function animateCounter(el, target, duration = 1500) {
  let start = null;
  const startVal = 0;

  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(startVal + (target - startVal) * ease);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));


/* ═══════════════════════════════════════════
   6. QR CODES
   ═══════════════════════════════════════════ */
const QR_DATA = {
  phone: {
    url:   'tel:+61889675083',
    icon:  '📞',
    title: 'Call SunnyAid',
    sub:   'Point your camera to dial instantly',
    val:   '+61-8-8967-5083'
  },
  email: {
    url:   'mailto:info@sunnyaid.com.au',
    icon:  '✉️',
    title: 'Email SunnyAid',
    sub:   'Scan to open a new email to our team',
    val:   'info@sunnyaid.com.au'
  },
  web: {
    url:   'https://www.sunnyaid.com.au',
    icon:  '🌐',
    title: 'Visit Website',
    sub:   'Scan to open SunnyAid in your browser',
    val:   'www.sunnyaid.com.au'
  }
};

function makeQR(containerId, url, size) {
  const el = document.getElementById(containerId);
  if (!el || typeof QRCode === 'undefined') return;
  el.innerHTML = '';
  new QRCode(el, {
    text:         url,
    width:        size,
    height:       size,
    colorDark:    '#0d3347',
    colorLight:   '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
}

// Generate QR codes after page load
window.addEventListener('load', () => {
  makeQR('qr-phone', QR_DATA.phone.url, 128);
  makeQR('qr-email', QR_DATA.email.url, 128);
  makeQR('qr-web',   QR_DATA.web.url,   128);
});

function openQR(key) {
  const d = QR_DATA[key];
  if (!d) return;

  setTextSafe('qrMIcon',      d.icon);
  setTextSafe('qrModalTitle', d.title);
  setTextSafe('qrMSub',       d.sub);
  setTextSafe('qrMVal',       d.val);

  makeQR('qr-large', d.url, 180);

  const overlay = document.getElementById('qrOverlay');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  overlay.querySelector('.btn-close').focus();
}

function closeQR(e) {
  if (e && e.target !== document.getElementById('qrOverlay') && e.type !== 'keydown') return;
  document.getElementById('qrOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeQR(e);
});

// QR card keyboard support
document.querySelectorAll('.qr-card').forEach(card => {
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

// Expose
window.openQR  = openQR;
window.closeQR = closeQR;


/* ═══════════════════════════════════════════
   7. BACK TO TOP
   ═══════════════════════════════════════════ */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.scrollToTop = scrollToTop;


/* ═══════════════════════════════════════════
   8. NEWSLETTER SUBSCRIBE
   ═══════════════════════════════════════════ */
function subscribeEmail() {
  const input   = document.getElementById('emailSub');
  const confirm = document.getElementById('subConfirm');
  if (!input || !confirm) return;

  const email = input.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    confirm.style.color = '#f87171';
    confirm.textContent = 'Please enter a valid email address.';
    return;
  }

  confirm.style.color = 'var(--gold-bright)';
  confirm.textContent = '✓ Thanks! You\'re subscribed.';
  input.value = '';
  setTimeout(() => { confirm.textContent = ''; }, 5000);
}
window.subscribeEmail = subscribeEmail;

// Allow Enter key on email input
const emailInput = document.getElementById('emailSub');
if (emailInput) {
  emailInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') subscribeEmail();
  });
}


/* ═══════════════════════════════════════════
   9. CHAT WIDGET
   ═══════════════════════════════════════════ */
const SYSTEM_PROMPT = `You are a friendly and knowledgeable support assistant for SunnyAid, an Australian NDIS (National Disability Insurance Scheme) registered disability services provider. Speak in a warm, helpful, and genuinely Australian-friendly tone.

About SunnyAid:
- 26+ years as a trusted NDIS provider
- NDIS Registered Provider #4050072735
- Coverage: Queensland, NSW & ACT, Victoria, Western Australia
- Phone: +61-8-8967-5083
- Email: info@sunnyaid.com.au
- 220+ expert team members, 98% client satisfaction

Services we offer:
1. Therapeutic Support — evidence-based therapy and wellbeing interventions
2. Daily Living & Life Skills — support for everyday independence at home
3. Support & Connection — community engagement and social participation
4. Daily Life Assistance — personal care and home tasks
5. NDIS Speech Therapy — communication support
6. Community & Activities — social programs and group activities
7. NDIS Plan Management — budget tracking, invoice handling, fund control
8. Specialist Support Coordination — navigating and maximising NDIS plans

How to get started: Make enquiry → Create NDIS Plan → Start Exceptional Care

Guidelines:
- Keep responses concise (2–4 sentences)
- Be warm, empathetic and human
- For urgent matters, always direct to +61-8-8967-5083
- Never give medical or legal advice
- If unsure, say so and suggest calling or emailing
`;

let chatHistory = [];
let chatOpen    = false;

const chatWin     = document.getElementById('chatWin');
const chatFabBtn  = document.getElementById('chatFabBtn');
const chatNotif   = document.getElementById('chatNotif');
const chatMsgs    = document.getElementById('chatMsgs');
const chatQREl    = document.getElementById('chatQR');
const chatInEl    = document.getElementById('chatIn');

function toggleChat() {
  chatOpen = !chatOpen;
  chatWin.classList.toggle('open', chatOpen);
  chatWin.setAttribute('aria-hidden', String(!chatOpen));
  chatFabBtn.setAttribute('aria-expanded', String(chatOpen));

  if (chatOpen) {
    if (chatNotif) chatNotif.style.display = 'none';
    setTimeout(() => chatInEl?.focus(), 350);
  }
}
window.toggleChat = toggleChat;

function getTime() {
  return new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}

function appendMessage(html, role) {
  const div = document.createElement('div');
  div.className = `msg msg-${role}`;
  div.innerHTML = `
    <div class="msg-b">${html}</div>
    <div class="msg-t">${getTime()}</div>
  `;
  chatMsgs.appendChild(div);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  return div;
}

function showTypingIndicator() {
  const div = document.createElement('div');
  div.className = 'msg msg-bot';
  div.id = 'typingIndicator';
  div.innerHTML = '<div class="msg-b"><div class="typing"><span></span><span></span><span></span></div></div>';
  chatMsgs.appendChild(div);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function sendQ(text) {
  if (chatQREl) chatQREl.style.display = 'none';
  if (chatInEl) chatInEl.value = text;
  sendMsg();
}
window.sendQ = sendQ;

async function sendMsg() {
  if (!chatInEl) return;
  const text = chatInEl.value.trim();
  if (!text) return;
  chatInEl.value = '';

  appendMessage(escapeHtml(text), 'user');
  chatHistory.push({ role: 'user', content: text });
  showTypingIndicator();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system:     SYSTEM_PROMPT,
        messages:   chatHistory
      })
    });

    const data = await response.json();
    removeTypingIndicator();

    const reply = data.content?.[0]?.text
      || "I'm sorry, I couldn't process that right now. Please call us on 📞 +61-8-8967-5083 and we'll be happy to help!";

    appendMessage(escapeHtml(reply), 'bot');
    chatHistory.push({ role: 'assistant', content: reply });

  } catch (err) {
    removeTypingIndicator();
    appendMessage(
      "Sorry, I'm having trouble connecting right now. Please call us on 📞 <strong>+61-8-8967-5083</strong> and we'll be happy to help!",
      'bot'
    );
  }
}
window.sendMsg = sendMsg;

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}


/* ═══════════════════════════════════════════
   10. SMOOTH SCROLL for anchor links
   ═══════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 80;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});


/* ═══════════════════════════════════════════
   11. KEYBOARD TRAP for modals
   ═══════════════════════════════════════════ */
document.getElementById('qrOverlay').addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const focusable = e.currentTarget.querySelectorAll('button, [tabindex="0"]');
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});


/* ═══════════════════════════════════════════
   12. SERVICE CARD KEYBOARD SUPPORT
   ═══════════════════════════════════════════ */
document.querySelectorAll('.scard[tabindex]').forEach(card => {
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter') card.click();
  });
});


/* ═══════════════════════════════════════════
   13. PERFORMANCE: lazy images (if added later)
   ═══════════════════════════════════════════ */
if ('loading' in HTMLImageElement.prototype) {
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.src = img.dataset.src || img.src;
  });
}
