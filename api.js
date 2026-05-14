// ═══════════════════════════════════════════════════════════
// LUCKILY ACADEMY — api.js
// Client API centralisé pour communiquer avec le backend
// Ce fichier est inclus dans toutes les pages HTML
// ═══════════════════════════════════════════════════════════
'use strict';

// ── URL du backend (à remplacer après déploiement Render) ──
// Backend Luckily Academy — Render
const API_BASE = window.LA_API_BASE || 'https://back-end-formation-luckily-academy-1.onrender.com';

// ── Clés localStorage ──
const K = {
  TOKEN:    'la_token',
  USER:     'la_user',
  THEME:    'la_t',
  LANG:     'la_l',
  PROGRESS: 'la_progress_cache'
};

// ──────────────────────────────────────────────────────────
// HELPERS HTTP
// ──────────────────────────────────────────────────────────
async function apiRequest(method, endpoint, body = null, requireAuth = false) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem(K.TOKEN);

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (requireAuth && !token) {
    throw new Error('AUTH_REQUIRED');
  }

  const opts = { method, headers };
  if (body && (method === 'POST' || method === 'PUT')) {
    opts.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, opts);
    const data = await res.json();

    // Token expiré → déconnecter
    if (res.status === 401 && token) {
      localStorage.removeItem(K.TOKEN);
      localStorage.removeItem(K.USER);
      // Rediriger vers login si on n'y est pas déjà
      if (!window.location.pathname.includes('auth.html')) {
        window.location.href = 'auth.html?expired=1';
      }
      throw new Error('SESSION_EXPIRED');
    }

    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    if (err.message === 'AUTH_REQUIRED' || err.message === 'SESSION_EXPIRED') throw err;
    // Erreur réseau
    throw new Error('NETWORK_ERROR');
  }
}

const api = {
  get:    (endpoint, auth = false)        => apiRequest('GET',    endpoint, null, auth),
  post:   (endpoint, body, auth = false)  => apiRequest('POST',   endpoint, body, auth),
  put:    (endpoint, body, auth = true)   => apiRequest('PUT',    endpoint, body, auth),
  delete: (endpoint, auth = true)         => apiRequest('DELETE', endpoint, null, auth),
};

// ──────────────────────────────────────────────────────────
// AUTHENTIFICATION
// ──────────────────────────────────────────────────────────
const Auth = {
  // Récupérer l'utilisateur depuis localStorage
  getUser() {
    try { return JSON.parse(localStorage.getItem(K.USER) || 'null'); } catch { return null; }
  },

  getToken() { return localStorage.getItem(K.TOKEN); },

  isLoggedIn() { return !!this.getToken(); },

  // Sauvegarder session
  saveSession(token, user) {
    localStorage.setItem(K.TOKEN, token);
    localStorage.setItem(K.USER, JSON.stringify(user));
  },

  // Effacer session
  clearSession() {
    localStorage.removeItem(K.TOKEN);
    localStorage.removeItem(K.USER);
    localStorage.removeItem(K.PROGRESS);
  },

  // Inscription
  async register(fullname, email, password, phone = '') {
    const res = await api.post('/api/auth/register', { fullname, email, password, phone });
    if (res.ok && res.data.token) {
      this.saveSession(res.data.token, res.data.user);
    }
    return res;
  },

  // Connexion
  async login(email, password) {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.ok && res.data.token) {
      this.saveSession(res.data.token, res.data.user);
    }
    return res;
  },

  // Déconnexion
  async logout() {
    try {
      await api.post('/api/auth/logout', {}, true);
    } catch { /* ignore */ }
    this.clearSession();
    window.location.href = 'index.html';
  },

  // Profil complet depuis API
  async getMe() {
    return api.get('/api/auth/me', true);
  },

  // Modifier profil
  async updateProfile(data) {
    const res = await api.put('/api/auth/profile', data);
    if (res.ok) {
      // Mettre à jour le cache local
      const user = this.getUser();
      if (user) {
        Object.assign(user, data);
        localStorage.setItem(K.USER, JSON.stringify(user));
      }
    }
    return res;
  },

  // Changer mot de passe
  async changePassword(currentPassword, newPassword) {
    return api.put('/api/auth/change-password', { currentPassword, newPassword });
  },

  // Vérifier code formation
  async verifyCode(courseId, code) {
    return api.post('/api/auth/verify-code', { courseId, code }, true);
  },

  // Marquer leçon complétée
  async markLessonDone(courseId, lessonKey) {
    // Mettre à jour le cache local immédiatement
    const cache = this._getProgressCache();
    if (!cache[courseId]) cache[courseId] = [];
    if (!cache[courseId].includes(lessonKey)) cache[courseId].push(lessonKey);
    localStorage.setItem(K.PROGRESS, JSON.stringify(cache));
    // Sync avec le backend
    return api.post('/api/auth/progress', { courseId, lessonKey }, true).catch(() => {});
  },

  // Progression locale (cache)
  _getProgressCache() {
    try { return JSON.parse(localStorage.getItem(K.PROGRESS) || '{}'); } catch { return {}; }
  },

  getLessonProgress(courseId) {
    return this._getProgressCache()[courseId] || [];
  },

  getProgressPct(courseId, total) {
    if (!total) return 0;
    return Math.round((this.getLessonProgress(courseId).length / total) * 100);
  },

  // Vérifier si inscrit (depuis cache user)
  isEnrolled(courseId) {
    const user = this.getUser();
    return user?.enrollments?.includes(courseId) || false;
  },

  // Ajouter enrollment au cache local
  addEnrollment(courseId) {
    const user = this.getUser();
    if (user) {
      if (!user.enrollments) user.enrollments = [];
      if (!user.enrollments.includes(courseId)) user.enrollments.push(courseId);
      localStorage.setItem(K.USER, JSON.stringify(user));
    }
  },

  // Supprimer compte
  async deleteAccount() {
    const res = await api.delete('/api/auth/account');
    if (res.ok) this.clearSession();
    return res;
  }
};

// ──────────────────────────────────────────────────────────
// FORMATIONS
// ──────────────────────────────────────────────────────────
const Courses = {
  // Cache simple
  _cache: {},

  async list() {
    if (this._cache.list) return { ok: true, data: { courses: this._cache.list } };
    const res = await api.get('/api/courses');
    if (res.ok) this._cache.list = res.data.courses;
    return res;
  },

  async get(id) {
    if (this._cache[id]) return { ok: true, data: { course: this._cache[id] } };
    const res = await api.get(`/api/courses/${id}`);
    if (res.ok) this._cache[id] = res.data.course;
    return res;
  },

  async getLesson(courseId, lessonId) {
    return api.get(`/api/courses/${courseId}/lesson/${lessonId}`, true);
  },

  async getPdfUrl(courseId) {
    return api.get(`/api/courses/${courseId}/pdf`, true);
  },

  clearCache() { this._cache = {}; }
};

// ──────────────────────────────────────────────────────────
// INTELLIGENCE ARTIFICIELLE
// ──────────────────────────────────────────────────────────
const AI = {
  _busy: false,
  _history: [],

  async ask(message, options = {}) {
    if (this._busy) return null;
    this._busy = true;
    try {
      const res = await api.post('/api/claude', {
        message,
        courseId: options.courseId || null,
        lessonId: options.lessonId || null,
        history: this._history.slice(-10),
        lang: localStorage.getItem(K.LANG) || 'fr'
      });
      if (res.ok) {
        this._history.push({ role: 'user', content: message });
        this._history.push({ role: 'assistant', content: res.data.reply });
        // Limiter l'historique
        if (this._history.length > 20) this._history = this._history.slice(-20);
      }
      return res;
    } finally {
      this._busy = false;
    }
  },

  async lessonHelp(courseId, lessonId, type) {
    return api.post('/api/claude/lesson-help', { courseId, lessonId, type }, true);
  },

  clearHistory() { this._history = []; },
  isBusy() { return this._busy; }
};

// ──────────────────────────────────────────────────────────
// UI HELPERS
// ──────────────────────────────────────────────────────────

// Toast notification
function toast(msg, type = 'info') {
  document.querySelector('.la-toast')?.remove();
  const colors = { success: '#06D6A0', error: '#EF233C', info: '#00B4D8', warning: '#F77F00' };
  const t = document.createElement('div');
  t.className = 'la-toast';
  t.textContent = msg;
  t.style.cssText = `position:fixed;bottom:88px;left:50%;transform:translateX(-50%) translateY(14px);
    padding:10px 22px;border-radius:9999px;font-size:.84rem;font-weight:700;
    box-shadow:0 20px 60px rgba(0,0,0,.14);z-index:10000;opacity:0;
    transition:all .3s cubic-bezier(.34,1.56,.64,1);white-space:nowrap;
    pointer-events:none;color:#fff;background:${colors[type] || colors.info};
    font-family:var(--ff-b,Jost,sans-serif);`;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => {
    t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(14px)';
    setTimeout(() => t.remove(), 350);
  }, 3200);
}

// Thème
function initTheme() {
  const t = localStorage.getItem(K.THEME) || 'light';
  document.documentElement.setAttribute('data-theme', t);
  updateThemeIcon(t);
}

function updateThemeIcon(t) {
  const el = document.getElementById('themeIcon');
  if (!el) return;
  el.innerHTML = t === 'dark'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  const nxt = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nxt);
  localStorage.setItem(K.THEME, nxt);
  updateThemeIcon(nxt);
  const dt = document.getElementById('darkToggle');
  if (dt) dt.checked = nxt === 'dark';
}

// Navbar
function initNavbar() {
  const nav  = document.getElementById('navbar');
  const hbg  = document.getElementById('hamburger');
  const nls  = document.getElementById('navLinks');
  const lbtn = document.getElementById('langBtn');
  const ldrop = document.getElementById('langDrop');
  const tBtn = document.getElementById('themeBtn');

  if (nav) window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

  if (hbg && nls) {
    hbg.addEventListener('click', e => {
      e.stopPropagation();
      const o = nls.classList.toggle('open');
      hbg.classList.toggle('open', o);
    });
    nls.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nls.classList.remove('open'); hbg.classList.remove('open');
    }));
    document.addEventListener('click', e => {
      if (nav && !nav.contains(e.target)) { nls.classList.remove('open'); hbg.classList.remove('open'); }
    });
  }

  if (tBtn) tBtn.addEventListener('click', toggleTheme);

  if (lbtn && ldrop) {
    lbtn.addEventListener('click', e => { e.stopPropagation(); ldrop.classList.toggle('open'); });
    document.addEventListener('click', () => ldrop.classList.remove('open'));
  }

  // Mettre à jour l'état auth dans la navbar
  updateNavAuth();
}

function updateNavAuth() {
  const user  = Auth.getUser();
  const authBtn = document.getElementById('authBtn');
  const dashBtn = document.getElementById('dashBtn');
  const navAv   = document.getElementById('navAv');

  if (user) {
    authBtn?.classList.add('hidden');
    dashBtn?.classList.remove('hidden');
    if (navAv) navAv.textContent = (user.fullname || 'U').charAt(0).toUpperCase();
  } else {
    authBtn?.classList.remove('hidden');
    dashBtn?.classList.add('hidden');
  }
}

// Langue
function setLang(l) {
  localStorage.setItem(K.LANG, l);
  const el = document.getElementById('curLang');
  if (el) el.textContent = l.toUpperCase();
  document.getElementById('langDrop')?.classList.remove('open');
  if (typeof applyLang === 'function') applyLang();
}

// Animations scroll
function initAnims() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  const watch = () => document.querySelectorAll('.anim:not(.vis)').forEach(el => io.observe(el));
  watch();
  new MutationObserver(watch).observe(document.body, { childList: true, subtree: true });
}

// Compteurs animés
function initCounters() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.done) {
        e.target.dataset.done = '1';
        const tgt = parseInt(e.target.dataset.count, 10);
        let cur = 0;
        const step = Math.max(1, tgt / 80);
        const t = setInterval(() => {
          cur += step;
          if (cur >= tgt) { cur = tgt; clearInterval(t); }
          e.target.textContent = Math.floor(cur).toLocaleString('fr-FR');
        }, 16);
      }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => io.observe(el));
}

// Format prix
function fmtPrice(p) { return Number(p).toLocaleString('fr-FR') + ' FCFA'; }

// Smooth scroll
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const h = a.getAttribute('href');
  if (!h || h === '#') return;
  const el = document.querySelector(h);
  if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
});

// Loader
window.addEventListener('load', () => setTimeout(() => document.getElementById('loader')?.classList.add('hidden'), 1000));

// ── AI Chat UI Helper ──
function createAIChat(msgsContainerId, inputId, sendBtnSelector, courseId = null, lessonId = null) {
  async function sendMessage() {
    const input = document.getElementById(inputId);
    if (!input || !input.value.trim() || AI.isBusy()) return;
    const msg = input.value.trim();
    input.value = '';

    addChatMsg(msg, 'user', msgsContainerId);

    // Typing indicator
    const box = document.getElementById(msgsContainerId);
    const ty = document.createElement('div');
    ty.className = 'ai-msg bot';
    ty.innerHTML = '<div class="msg-bbl ai-typing"><span></span><span></span><span></span></div>';
    box?.appendChild(ty);
    if (box) box.scrollTop = box.scrollHeight;

    const res = await AI.ask(msg, { courseId, lessonId });
    ty.parentNode?.removeChild(ty);

    if (res?.ok) {
      addChatMsg(res.data.reply, 'bot', msgsContainerId);
    } else {
      addChatMsg('Désolé, une erreur est survenue. Réessayez dans un instant.', 'bot', msgsContainerId);
    }
  }

  // Bind events
  const input = document.getElementById(inputId);
  if (input) input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

  // Return send function for button binding
  return sendMessage;
}

function addChatMsg(text, type, containerId) {
  const c = document.getElementById(containerId);
  if (!c) return;
  const d = document.createElement('div');
  d.className = 'ai-msg ' + type;
  d.innerHTML = '<div class="msg-bbl">' + text.replace(/\n/g, '<br>') + '</div>';
  c.appendChild(d);
  c.scrollTop = c.scrollHeight;
}

// ── AI Modal Global ──
function openAI(courseId = null, lessonId = null) {
  document.getElementById('aiModal')?.classList.add('open');
  setTimeout(() => document.getElementById('aiInp')?.focus(), 300);
  // Stocker le contexte courant
  window._aiCtx = { courseId, lessonId };
}

function closeAI() { document.getElementById('aiModal')?.classList.remove('open'); }

document.addEventListener('click', e => {
  const m = document.getElementById('aiModal');
  if (m && e.target === m) closeAI();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAI(); });

// Init au chargement
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initAnims();
  initCounters();

  // Bind envoi IA globale
  const aiSendBtn = document.getElementById('aiSendBtn');
  const aiInp = document.getElementById('aiInp');
  const sendAIGlobal = async () => {
    if (!aiInp || !aiInp.value.trim() || AI.isBusy()) return;
    const msg = aiInp.value.trim();
    aiInp.value = '';
    addChatMsg(msg, 'user', 'aiMsgs');
    const box = document.getElementById('aiMsgs');
    const ty = document.createElement('div');
    ty.className = 'ai-msg bot';
    ty.innerHTML = '<div class="msg-bbl ai-typing"><span></span><span></span><span></span></div>';
    box?.appendChild(ty);
    if (box) box.scrollTop = box.scrollHeight;
    const ctx = window._aiCtx || {};
    const res = await AI.ask(msg, ctx);
    ty.parentNode?.removeChild(ty);
    if (res?.ok) addChatMsg(res.data.reply, 'bot', 'aiMsgs');
    else addChatMsg('Erreur temporaire. Réessayez.', 'bot', 'aiMsgs');
  };
  if (aiSendBtn) aiSendBtn.onclick = sendAIGlobal;
  if (aiInp) aiInp.addEventListener('keypress', e => { if (e.key === 'Enter') sendAIGlobal(); });
});

// Exporter pour usage dans les pages
window.LA = { API_BASE, K, Auth, Courses, AI, toast, fmtPrice, openAI, closeAI, addChatMsg, createAIChat, setLang, toggleTheme };
