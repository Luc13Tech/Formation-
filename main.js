// ═══════════════════════════════════════════════════════════════
// LUCKILY ACADEMY — main.js  (version corrigée & améliorée)
// ═══════════════════════════════════════════════════════════════
'use strict';

/* ══ THEME — appliqué immédiatement pour éviter le flash blanc ══ */
(function applyThemeEarly() {
  const saved = localStorage.getItem('la_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();

/* ══ LOADER ══ */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 1400);
});

/* ══ DARK MODE ══ */
function updateThemeBtn(theme) {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const icon = btn.querySelector('.theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('la_theme', next);
  updateThemeBtn(next);
  const settingToggle = document.getElementById('darkModeToggle');
  if (settingToggle) settingToggle.checked = (next === 'dark');
}

function initTheme() {
  const saved = localStorage.getItem('la_theme') || 'light';
  updateThemeBtn(saved);
  const settingToggle = document.getElementById('darkModeToggle');
  if (settingToggle) settingToggle.checked = (saved === 'dark');
}

/* ══ NAVBAR ══ */
function initNavbar() {
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const navLinks    = document.getElementById('navLinks');
  const themeBtn    = document.getElementById('themeToggle');
  const langBtn     = document.getElementById('langBtn');
  const langDropdown = document.getElementById('langDropdown');

  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', open);
    });
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
      });
    });
    document.addEventListener('click', (e) => {
      if (navbar && !navbar.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
      }
    });
  }

  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  if (langBtn && langDropdown) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => langDropdown.classList.remove('open'));
  }

  const currentPage = (window.location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('?')[0].split('#')[0];
    link.classList.toggle('active', href === currentPage || (currentPage === '' && href === 'index.html'));
  });
}

/* ══ AUTH NAV ══ */
function updateNavAuth() {
  const authBtn  = document.getElementById('authNavBtn');
  const dashBtn  = document.getElementById('dashNavBtn');
  const avatarEl = document.getElementById('navUserAvatar');
  const session  = (typeof getSession === 'function') ? getSession() : null;

  if (session) {
    if (authBtn)  authBtn.classList.add('hidden');
    if (dashBtn)  dashBtn.classList.remove('hidden');
    if (avatarEl) avatarEl.textContent = (session.fullname || 'U').charAt(0).toUpperCase();
  } else {
    if (authBtn)  authBtn.classList.remove('hidden');
    if (dashBtn)  dashBtn.classList.add('hidden');
  }
}

/* ══ SCROLL ANIMATIONS ══ */
let scrollObserver = null;

function observeEl(el) {
  if (!scrollObserver || el.classList.contains('anim-watched')) return;
  el.classList.add('anim-watched', 'animate-in');
  scrollObserver.observe(el);
}

function initScrollAnimations() {
  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        scrollObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  const sel = '.feature-card,.course-preview-card,.testi-card,.about-card-main,.enrolled-card,.dash-stat-card,.settings-card';
  document.querySelectorAll(sel).forEach(observeEl);

  new MutationObserver(() => {
    document.querySelectorAll(sel).forEach(observeEl);
  }).observe(document.body, { childList: true, subtree: true });
}

/* ══ COUNTER ANIMATION ══ */
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        const target = parseInt(entry.target.dataset.count, 10);
        const stepMs = 16;
        const steps  = 1800 / stepMs;
        const inc    = target / steps;
        let current  = 0;
        const timer  = setInterval(() => {
          current += inc;
          if (current >= target) { current = target; clearInterval(timer); }
          entry.target.textContent = Math.floor(current).toLocaleString('fr-FR');
        }, stepMs);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach(el => obs.observe(el));
}

/* ══ AI MODAL ══ */
function openAIModal() {
  const modal = document.getElementById('aiModal');
  if (modal) {
    modal.classList.add('open');
    setTimeout(() => document.getElementById('aiModalInput')?.focus(), 300);
  }
}
function closeAIModal() {
  document.getElementById('aiModal')?.classList.remove('open');
}

document.addEventListener('click', (e) => {
  const modal = document.getElementById('aiModal');
  if (modal && e.target === modal) closeAIModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeAIModal(); closePaymentModal(); }
});

/* ══ AI CHAT ══ */
const aiHistory = { modal: [], demo: [] };
let aiSending   = { modal: false, demo: false };

async function callClaudeAI(userMessage, containerId) {
  const key = containerId === 'aiModalMessages' ? 'modal' : 'demo';
  if (aiSending[key]) return;
  aiSending[key] = true;

  const messagesEl = document.getElementById(containerId);

  const typingEl = document.createElement('div');
  typingEl.className = 'ai-msg bot';
  typingEl.innerHTML = `<div class="msg-bubble ai-typing"><span></span><span></span><span></span></div>`;
  messagesEl?.appendChild(typingEl);
  if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;

  aiHistory[key].push({ role: 'user', content: userMessage });

  const lang = (typeof currentLang !== 'undefined') ? currentLang : 'fr';
  const langLabel = lang === 'en' ? 'English' : lang === 'es' ? 'Español' : lang === 'pt' ? 'Português' : 'Français';

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: `Tu es Luckily IA, l'assistant officiel de Luckily Academy — plateforme de formation professionnelle en ligne fondée par Luc DEGUENON, Spécialiste en Technologie Moderne, basée à Cotonou, Bénin.

FORMATIONS ET PRIX :
• Web Marketing → 10 000 FCFA
• Négociation Commerciale → 10 000 FCFA
• Chargé Clientèle → 10 000 FCFA
• Développement Web Frontend → 20 000 FCFA
• Développement Web Backend → 25 000 FCFA
• Analyse des Données → 15 000 FCFA
• Microsoft Word (Débutant / Intermédiaire / Avancé) → 5 000 FCFA chacun
• Microsoft Excel (Débutant / Intermédiaire / Avancé) → 5 000 FCFA chacun
• Outils de Compatibilité → 5 000 FCFA

CONTACT : WhatsApp +229 01 59 60 95 81 | Email : cultech49@gmail.com

Réponds en ${langLabel}, de façon chaleureuse, concise et professionnelle. Pour tout paiement, oriente vers le bouton d'inscription sur la page de la formation.`,
        messages: aiHistory[key]
      })
    });

    const data  = await res.json();
    const reply = data.content?.[0]?.text ||
      (lang === 'en' ? "I'm here to help! What would you like to know?" : "Je suis là pour vous aider ! Que souhaitez-vous savoir ?");

    aiHistory[key].push({ role: 'assistant', content: reply });
    typingEl.parentNode?.removeChild(typingEl);
    appendAIMessage(reply, 'bot', containerId);

  } catch {
    typingEl.parentNode?.removeChild(typingEl);
    appendAIMessage(
      lang === 'en' ? "Connection issue. Please try again." : "Problème de connexion. Réessayez.",
      'bot', containerId
    );
  } finally {
    aiSending[key] = false;
  }
}

function appendAIMessage(text, type, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const div = document.createElement('div');
  div.className = `ai-msg ${type}`;
  div.innerHTML = `<div class="msg-bubble">${text.replace(/\n/g, '<br>')}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

async function sendAiMessage() {
  const input = document.getElementById('aiModalInput');
  if (!input || !input.value.trim() || aiSending.modal) return;
  const msg = input.value.trim();
  input.value = '';
  appendAIMessage(msg, 'user', 'aiModalMessages');
  await callClaudeAI(msg, 'aiModalMessages');
}

async function sendAiDemo() {
  const input = document.getElementById('aiDemoInput');
  if (!input || !input.value.trim() || aiSending.demo) return;
  const msg = input.value.trim();
  input.value = '';
  appendAIMessage(msg, 'user', 'aiDemoMessages');
  await callClaudeAI(msg, 'aiDemoMessages');
}

/* ══════════════════════════════════════════════════════════════
   PAIEMENT → WHATSAPP
   Flux : bouton Inscrire → Modal récap + choix paiement
          → Validation → Message WhatsApp pré-rempli → Confirmation
══════════════════════════════════════════════════════════════ */
const WA_NUMBER = '2290159609581';

function showPaymentModal(courseId, userId) {
  const course = (typeof getCourseById === 'function') ? getCourseById(courseId) : null;
  if (!course) return;

  const user    = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
  const session = (typeof getSession    === 'function') ? getSession()      : null;

  closePaymentModal();

  const modal = document.createElement('div');
  modal.id        = 'paymentModal';
  modal.className = 'modal-overlay open';

  modal.innerHTML = `
    <div id="payModalBox" style="
      background:var(--bg-card);border-radius:28px;width:100%;max-width:500px;
      overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,0.25);
      animation:payModalIn .35s cubic-bezier(.34,1.56,.64,1) both;
      max-height:90vh;overflow-y:auto;
    ">

      <!-- HEADER -->
      <div style="background:linear-gradient(135deg,#00B4D8,#0077B6);padding:20px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:2;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:1.2rem;">💳</span>
          <span style="font-weight:700;color:#fff;font-size:0.98rem;font-family:var(--font-body);">Finaliser l'inscription</span>
        </div>
        <button onclick="closePaymentModal()" style="
          color:rgba(255,255,255,.85);font-size:1rem;width:30px;height:30px;border-radius:50%;
          background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:background .2s;border:none;
        "
        onmouseover="this.style.background='rgba(255,255,255,.3)'"
        onmouseout="this.style.background='rgba(255,255,255,.15)'">✕</button>
      </div>

      <div style="padding:24px 24px 0;">

        <!-- RÉCAP FORMATION -->
        <div style="background:var(--bg-alt);border-radius:16px;padding:16px;display:flex;align-items:center;gap:14px;margin-bottom:22px;border:1px solid var(--border);">
          <div style="font-size:2.2rem;flex-shrink:0;">${course.icon}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-family:var(--font-display);font-weight:700;font-size:1rem;line-height:1.2;margin-bottom:3px;">${course.title}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${course.category} · ${course.level} · ${course.duration}</div>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <div style="font-family:var(--font-display);font-size:1.35rem;font-weight:800;color:var(--primary);">${formatPrice(course.price)}</div>
            <div style="font-size:0.68rem;color:var(--text-muted);">Accès à vie</div>
          </div>
        </div>

        <!-- MOYEN DE PAIEMENT -->
        <div style="margin-bottom:18px;">
          <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:10px;">Moyen de paiement</div>
          <div style="display:flex;flex-direction:column;gap:8px;">

            <label id="lbl_mtn" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border:2px solid var(--primary);border-radius:12px;background:rgba(0,180,216,.05);cursor:pointer;transition:all .18s;">
              <input type="radio" name="payMethod" value="mtn" checked style="accent-color:var(--primary);width:15px;height:15px;" onchange="highlightPayMethod()"/>
              <span style="font-size:1.2rem;">📱</span>
              <div><div style="font-weight:600;font-size:0.87rem;">MTN Mobile Money</div><div style="font-size:0.72rem;color:var(--text-muted);">Paiement instantané MoMo</div></div>
            </label>

            <label id="lbl_moov" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border:2px solid var(--border);border-radius:12px;cursor:pointer;transition:all .18s;">
              <input type="radio" name="payMethod" value="moov" style="accent-color:var(--primary);width:15px;height:15px;" onchange="highlightPayMethod()"/>
              <span style="font-size:1.2rem;">🔵</span>
              <div><div style="font-weight:600;font-size:0.87rem;">Moov Money (Flooz)</div><div style="font-size:0.72rem;color:var(--text-muted);">Paiement via Flooz</div></div>
            </label>

            <label id="lbl_wave" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border:2px solid var(--border);border-radius:12px;cursor:pointer;transition:all .18s;">
              <input type="radio" name="payMethod" value="wave" style="accent-color:var(--primary);width:15px;height:15px;" onchange="highlightPayMethod()"/>
              <span style="font-size:1.2rem;">🌊</span>
              <div><div style="font-weight:600;font-size:0.87rem;">Wave</div><div style="font-size:0.72rem;color:var(--text-muted);">Paiement via Wave</div></div>
            </label>

            <label id="lbl_carte" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border:2px solid var(--border);border-radius:12px;cursor:pointer;transition:all .18s;">
              <input type="radio" name="payMethod" value="carte" style="accent-color:var(--primary);width:15px;height:15px;" onchange="highlightPayMethod()"/>
              <span style="font-size:1.2rem;">💳</span>
              <div><div style="font-weight:600;font-size:0.87rem;">Carte Visa / Mastercard</div><div style="font-size:0.72rem;color:var(--text-muted);">Carte bancaire internationale</div></div>
            </label>

          </div>
        </div>

        <!-- TÉLÉPHONE -->
        <div style="margin-bottom:16px;">
          <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:8px;">
            Votre numéro de téléphone <span style="color:#EF233C;">*</span>
          </div>
          <input type="tel" id="payerPhone" placeholder="+229 01 XX XX XX XX"
            value="${user?.phone || ''}"
            style="width:100%;padding:12px 14px;border-radius:12px;border:1.5px solid var(--border);background:var(--bg-alt);font-size:0.9rem;color:var(--text);outline:none;font-family:var(--font-body);box-sizing:border-box;transition:border-color .2s;"
            onfocus="this.style.borderColor='var(--primary)'"
            onblur="this.style.borderColor='var(--border)'"
          />
        </div>

        <!-- NOM si non connecté -->
        ${!session ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:8px;">Votre nom complet <span style="color:#EF233C;">*</span></div>
          <input type="text" id="payerName" placeholder="Prénom Nom"
            style="width:100%;padding:12px 14px;border-radius:12px;border:1.5px solid var(--border);background:var(--bg-alt);font-size:0.9rem;color:var(--text);outline:none;font-family:var(--font-body);box-sizing:border-box;transition:border-color .2s;"
            onfocus="this.style.borderColor='var(--primary)'"
            onblur="this.style.borderColor='var(--border)'"
          />
        </div>` : ''}

        <!-- EMAIL si non connecté -->
        ${!session ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:8px;">Votre email</div>
          <input type="email" id="payerEmail" placeholder="votre@email.com"
            style="width:100%;padding:12px 14px;border-radius:12px;border:1.5px solid var(--border);background:var(--bg-alt);font-size:0.9rem;color:var(--text);outline:none;font-family:var(--font-body);box-sizing:border-box;transition:border-color .2s;"
            onfocus="this.style.borderColor='var(--primary)'"
            onblur="this.style.borderColor='var(--border)'"
          />
        </div>` : ''}

      </div>

      <!-- FOOTER -->
      <div style="padding:16px 24px 24px;">

        <!-- BOUTON PRINCIPAL WhatsApp -->
        <button id="goWABtn" onclick="redirectToWhatsApp('${courseId}')" style="
          width:100%;padding:14px;border-radius:50px;
          background:linear-gradient(135deg,#25D366,#128C7E);
          color:#fff;font-size:0.95rem;font-weight:700;cursor:pointer;
          transition:all .25s;box-shadow:0 6px 24px rgba(37,211,102,.35);
          display:flex;align-items:center;justify-content:center;gap:10px;
          margin-bottom:12px;border:none;
        "
        onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 12px 36px rgba(37,211,102,.45)'"
        onmouseout="this.style.transform='';this.style.boxShadow='0 6px 24px rgba(37,211,102,.35)'">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="white" style="flex-shrink:0;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Continuer vers WhatsApp
        </button>

        <p style="text-align:center;font-size:0.72rem;color:var(--text-muted);line-height:1.5;margin:0;">
          🔒 Votre paiement est confirmé manuellement par notre équipe.<br/>
          Accès activé <strong>dans les 5 minutes</strong> après validation.
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closePaymentModal();
  });
}

// Met en surbrillance le mode de paiement sélectionné
function highlightPayMethod() {
  const selected = document.querySelector('input[name="payMethod"]:checked')?.value;
  ['mtn','moov','wave','carte'].forEach(m => {
    const lbl = document.getElementById('lbl_' + m);
    if (!lbl) return;
    lbl.style.border     = `2px solid ${m === selected ? 'var(--primary)' : 'var(--border)'}`;
    lbl.style.background = m === selected ? 'rgba(0,180,216,0.06)' : '';
  });
}

function closePaymentModal() {
  const modal = document.getElementById('paymentModal');
  if (modal) { modal.remove(); document.body.style.overflow = ''; }
  const enrollBtn = document.getElementById('enrollBtn');
  if (enrollBtn) {
    enrollBtn.disabled = false;
    const cId    = new URLSearchParams(window.location.search).get('id');
    const course = (typeof getCourseById === 'function') ? getCourseById(cId) : null;
    if (course) enrollBtn.textContent = `S'inscrire maintenant — ${formatPrice(course.price)}`;
  }
}

function redirectToWhatsApp(courseId) {
  const course = (typeof getCourseById === 'function') ? getCourseById(courseId) : null;
  if (!course) return;

  const session = (typeof getSession === 'function') ? getSession() : null;
  const user    = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;

  // Collecte des infos
  const method  = document.querySelector('input[name="payMethod"]:checked')?.value || 'mtn';
  const phone   = document.getElementById('payerPhone')?.value?.trim() || '';
  const nameInput  = document.getElementById('payerName');
  const emailInput = document.getElementById('payerEmail');
  const nom     = nameInput  ? (nameInput.value.trim()  || '') : (user?.fullname || session?.fullname || '');
  const email   = emailInput ? (emailInput.value.trim() || '') : (user?.email    || session?.email    || '');

  // Validation
  if (!phone) {
    const phoneInput = document.getElementById('payerPhone');
    if (phoneInput) {
      phoneInput.style.borderColor = '#EF233C';
      phoneInput.focus();
    }
    showToast('⚠ Veuillez renseigner votre numéro de téléphone.', 'error');
    return;
  }
  if (!session && !nom) {
    const nameInput2 = document.getElementById('payerName');
    if (nameInput2) { nameInput2.style.borderColor = '#EF233C'; nameInput2.focus(); }
    showToast('⚠ Veuillez renseigner votre nom.', 'error');
    return;
  }

  const methodLabels = {
    mtn:   'MTN Mobile Money',
    moov:  'Moov Money (Flooz)',
    wave:  'Wave',
    carte: 'Carte Visa / Mastercard'
  };
  const refCode  = 'LA-' + Date.now().toString(36).toUpperCase();
  const dateStr  = new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' });

  const message =
`🎓 *LUCKILY ACADEMY — Demande de paiement*

Bonjour, je souhaite m'inscrire à la formation suivante :

📚 *Formation :* ${course.title}
🎯 *Niveau :* ${course.level}
⏱ *Durée :* ${course.duration}
💰 *Montant :* ${formatPrice(course.price)}

────────────────────
👤 *Mes informations :*
• Nom : ${nom || 'Non renseigné'}
• Email : ${email || 'Non renseigné'}
• Téléphone : ${phone}

💳 *Mode de paiement :* ${methodLabels[method] || method}
📅 *Date :* ${dateStr}
🔖 *Référence :* ${refCode}
────────────────────

Merci de me communiquer les instructions de paiement pour finaliser mon inscription ! 🙏`;

  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

  // Ouvre WhatsApp dans un nouvel onglet
  window.open(waUrl, '_blank', 'noopener');

  // Écran de confirmation dans le modal
  const box = document.getElementById('payModalBox');
  if (box) {
    box.innerHTML = `
      <div style="padding:48px 28px;text-align:center;">
        <div style="font-size:3.8rem;margin-bottom:18px;animation:successBounce .5s ease both;">✅</div>
        <h2 style="font-family:var(--font-display);font-size:1.6rem;font-weight:700;margin-bottom:10px;color:var(--text);">WhatsApp ouvert !</h2>
        <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:6px;">Votre demande d'inscription a été préparée avec toutes vos informations.</p>
        <div style="background:var(--bg-alt);border-radius:12px;padding:12px 16px;margin:16px 0;display:inline-block;">
          <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:2px;">Référence de votre demande</div>
          <div style="font-family:var(--font-display);font-size:1.2rem;font-weight:800;color:var(--primary);letter-spacing:.05em;">${refCode}</div>
        </div>
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:28px;">Notre équipe vous confirme les instructions de paiement et active votre accès <strong>dans les 5 minutes</strong> après votre virement.</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <a href="${waUrl}" target="_blank" rel="noopener" style="
            padding:12px 24px;border-radius:50px;
            background:linear-gradient(135deg,#25D366,#128C7E);
            color:#fff;font-weight:700;font-size:0.86rem;
            display:inline-flex;align-items:center;gap:6px;text-decoration:none;
          ">💬 Ré-ouvrir WhatsApp</a>
          <button onclick="closePaymentModal()" style="
            padding:12px 24px;border-radius:50px;
            border:1.5px solid var(--border);color:var(--text);
            font-weight:600;font-size:0.86rem;cursor:pointer;
            background:transparent;
          ">Fermer</button>
        </div>
      </div>
    `;
  }
}

/* ══ SETTINGS PAGE ══ */
function initSettings() {
  const darkToggle = document.getElementById('darkModeToggle');
  if (darkToggle) {
    darkToggle.checked = document.documentElement.getAttribute('data-theme') === 'dark';
    darkToggle.addEventListener('change', toggleTheme);
  }

  const notifToggle = document.getElementById('notifToggle');
  if (notifToggle) {
    notifToggle.checked = localStorage.getItem('la_notif') !== 'false';
    notifToggle.addEventListener('change', (e) => localStorage.setItem('la_notif', e.target.checked));
  }

  const langSelect = document.getElementById('settingsLangSelect');
  if (langSelect) {
    langSelect.value = (typeof currentLang !== 'undefined') ? currentLang : 'fr';
    langSelect.addEventListener('change', (e) => {
      if (typeof setLanguage === 'function') setLanguage(e.target.value);
    });
  }

  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (user) {
      const pn = document.getElementById('profileName');
      const pe = document.getElementById('profileEmail');
      const pp = document.getElementById('profilePhone');
      if (pn) pn.value = user.fullname || '';
      if (pe) pe.value = user.email    || '';
      if (pp) pp.value = user.phone    || '';

      const sA = document.getElementById('sidebarAvatar');
      const sN = document.getElementById('sidebarName');
      const sE = document.getElementById('sidebarEmail');
      const nA = document.getElementById('navUserAvatar');
      if (sA) sA.textContent = user.fullname.charAt(0).toUpperCase();
      if (sN) sN.textContent = user.fullname;
      if (sE) sE.textContent = user.email;
      if (nA) nA.textContent = user.fullname.charAt(0).toUpperCase();
    }

    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const session = (typeof getSession === 'function') ? getSession() : null;
      if (!session) return;
      const users = (typeof getUsers === 'function') ? getUsers() : [];
      const idx   = users.findIndex(u => u.id === session.userId);
      if (idx !== -1) {
        users[idx].fullname = document.getElementById('profileName')?.value || users[idx].fullname;
        users[idx].phone    = document.getElementById('profilePhone')?.value || '';
        if (typeof saveUsers === 'function') saveUsers(users);
        showToast('✓ Profil mis à jour !', 'success');
      }
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => { if (typeof logout === 'function') logout(); });
}

/* ══ TOAST ══ */
function showToast(message, type = 'info') {
  document.querySelector('.la-toast')?.remove();
  const colors = { success: '#06D6A0', error: '#EF233C', info: '#00B4D8', warning: '#F77F00' };
  const t = document.createElement('div');
  t.className = 'la-toast';
  t.textContent = message;
  t.style.cssText = `
    position:fixed;bottom:88px;left:50%;transform:translateX(-50%) translateY(16px);
    background:${colors[type]||colors.info};color:#fff;
    padding:11px 22px;border-radius:50px;font-size:0.86rem;font-weight:600;
    box-shadow:0 8px 32px rgba(0,0,0,0.18);z-index:10000;
    opacity:0;transition:all .3s cubic-bezier(.34,1.56,.64,1);
    white-space:nowrap;pointer-events:none;
  `;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)'; });
  setTimeout(() => {
    t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(16px)';
    setTimeout(() => t.remove(), 350);
  }, 3200);
}

/* ══ SMOOTH SCROLL ══ */
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;
  const href = anchor.getAttribute('href');
  if (!href || href === '#') return;
  const target = document.querySelector(href);
  if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
});

/* ══ CSS RUNTIME ══ */
const runtimeStyle = document.createElement('style');
runtimeStyle.textContent = `
  @keyframes successBounce {
    0%  { transform:scale(0) rotate(-10deg); }
    60% { transform:scale(1.2) rotate(3deg); }
    100%{ transform:scale(1)  rotate(0deg); }
  }
  @keyframes payModalIn {
    0%  { opacity:0; transform:scale(.88) translateY(30px); }
    100%{ opacity:1; transform:scale(1)   translateY(0); }
  }
  .animate-in { opacity:0; transform:translateY(28px); transition:opacity .65s ease, transform .65s ease; }
  .animate-in.visible { opacity:1; transform:translateY(0); }
  #loader.hidden { opacity:0; visibility:hidden; pointer-events:none; transition:opacity .6s, visibility .6s; }
  .hamburger.open span:nth-child(1){ transform:rotate(45deg) translate(5px,5px); }
  .hamburger.open span:nth-child(2){ opacity:0; }
  .hamburger.open span:nth-child(3){ transform:rotate(-45deg) translate(5px,-5px); }
`;
document.head.appendChild(runtimeStyle);

/* ══ INIT ══ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  updateNavAuth();
  initScrollAnimations();
  animateCounters();

  const rawPage = window.location.pathname.split('/').pop() || 'index.html';
  const page    = rawPage.replace(/\.html$/, '') || 'index';

  if (page === 'index' || page === '')           { if (typeof renderCoursesPreview === 'function') renderCoursesPreview(); }
  if (page === 'courses')                         { if (typeof renderCoursesPage    === 'function') renderCoursesPage(); }
  if (page === 'course-detail')                   { if (typeof renderCourseDetail   === 'function') renderCourseDetail(); }
  if (page === 'lesson')                          { if (typeof renderLesson         === 'function') renderLesson(); }
  if (page === 'dashboard')                       { if (typeof renderDashboard      === 'function') renderDashboard(); }
  if (page === 'profile')                         { initSettings(); }
});
