/* --- INITIALISATION --- */
window.onload = () => {
  // Masquer le loader
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => loader.style.display = 'none', 500);
    }, 800);
  }

  // Animation AOS
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, once: true });
  }

  updateAuthUI();
  initTheme();
  renderCourseCards();
};

/* --- THEME --- */
function initTheme() {
  const saved = localStorage.getItem('la_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('la_theme', next);
}

/* --- UI AUTH --- */
function updateAuthUI() {
  const session = getSession();
  const authZone = document.getElementById('authZone');
  if (!authZone) return;

  if (session) {
    authZone.innerHTML = `
      <div class="flex items-center gap-4">
        <a href="dashboard.html" class="font-medium hover:text-primary transition">Mon Espace</a>
        <button onclick="logout()" class="btn-outline text-sm py-1 px-3">Déconnexion</button>
      </div>
    `;
  }
}

/* --- AFFICHAGE COURS --- */
function renderCourseCards() {
  const grid = document.getElementById('coursesGrid');
  if (!grid) return;

  const courses = getAllCourses();
  grid.innerHTML = courses.map(c => `
    <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group" data-aos="fade-up">
      <div class="relative h-48 overflow-hidden">
        <img src="${c.image}" alt="${c.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
        <div class="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">${c.category}</div>
      </div>
      <div class="p-6">
        <h3 class="text-xl mb-2">${c.title}</h3>
        <p class="text-text-m text-sm mb-4 line-clamp-2">${c.description}</p>
        <div class="flex items-center justify-between">
          <span class="font-bold text-primary">${c.price}</span>
          <a href="course-detail.html?id=${c.id}" class="text-sm font-semibold hover:underline">Voir plus →</a>
        </div>
      </div>
    </div>
  `).join('');
}

/* --- IA MODAL --- */
function openAIModal() {
  document.getElementById('aiModal').style.display = 'flex';
}

function closeAIModal() {
  document.getElementById('aiModal').style.display = 'none';
}

async function sendAIModal() {
  const inp = document.getElementById('aiInput');
  const msg = inp.value.trim();
  if (!msg) return;

  const container = document.getElementById('aiModalMsgs');
  
  // User Message
  container.innerHTML += `<div class="ai-msg user"><div class="msg-bbl">${msg}</div></div>`;
  inp.value = '';
  container.scrollTop = container.scrollHeight;

  // Bot Loading
  const botId = 'bot-' + Date.now();
  container.innerHTML += `<div class="ai-msg bot"><div class="msg-bbl" id="${botId}">...</div></div>`;
  
  // Simulation de réponse IA
  setTimeout(() => {
    const el = document.getElementById(botId);
    let reply = "C'est une excellente question sur Luckily Academy ! En tant qu'assistant de la plateforme, je vous recommande d'explorer nos modules de Développement Web pour approfondir ce sujet.";
    if (msg.toLowerCase().includes('prix')) reply = "Nos formations commencent à partir de 25.000 FCFA. Nous acceptons les paiements mobiles.";
    el.textContent = reply;
    container.scrollTop = container.scrollHeight;
  }, 1000);
}

/* --- TOASTS --- */
function showToast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.style.borderLeftColor = type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#00B4D8';
  t.innerHTML = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}
