// ═══════════════════════════════════════════════
// LUCKILY ACADEMY — courses.js (version corrigée)
// Corrections :
//   • loadCourses() : chemin relatif sécurisé + fallback de données intégrées
//   • handleEnroll : n'écrase plus le texte du bouton avant le modal
//   • showPayWall : toast au lieu d'alert() natif
//   • renderCourseDetail : le scroll vers #about dans l'URL est géré
//   • renderLesson : lessonImage cachée si pas d'image dispo
//   • renderDashboard : guard contre COURSES vide au render
// ═══════════════════════════════════════════════
'use strict';

let COURSES = [];

/* ─── Images Unsplash par formation ─── */
const COURSE_IMAGES = {
  'web-marketing':         'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=80',
  'negociation-commerciale':'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=700&q=80',
  'charge-clientele':      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=80',
  'dev-frontend':          'https://images.unsplash.com/photo-1547658719-da2b51169166?w=700&q=80',
  'dev-backend':           'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&q=80',
  'analyse-donnees':       'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80',
  'word-debutant':         'https://images.unsplash.com/photo-1618044619888-009e412ff12a?w=700&q=80',
  'word-intermediaire':    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=700&q=80',
  'word-avance':           'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=700&q=80',
  'excel-debutant':        'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=700&q=80',
  'excel-intermediaire':   'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=80',
  'excel-avance':          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80',
  'outils-compatibilite':  'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=700&q=80',
};

const IMG_FALLBACK = 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=700&q=80';

/* ─── Chargement des cours ─── */
async function loadCourses() {
  if (COURSES.length > 0) return COURSES;

  // Essayer le JSON externe
  try {
    const base = window.location.pathname.endsWith('.html')
      ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)
      : window.location.pathname.replace(/\/?$/, '/');
    const res = await fetch(base + 'data/courses.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    COURSES = await res.json();
    return COURSES;
  } catch (e) {
    // Fallback minimal intégré (ne jamais laisser la page vide)
    console.warn('[LA] courses.json inaccessible, fallback activé.', e);
    COURSES = [
      { id:'web-marketing', title:'Web Marketing', price:10000, currency:'FCFA', category:'Marketing', level:'Débutant → Pro', duration:'8 semaines', icon:'📢', color:'#00B4D8', description:'Maîtrisez les stratégies digitales : SEO, réseaux sociaux, publicité en ligne, email marketing et analytics.', chapters:[{id:1,title:'Introduction au Marketing Digital',lessons:[{id:1,title:'Qu\'est-ce que le Marketing Digital ?',type:'text',content:'Le marketing digital désigne l\'ensemble des actions et stratégies marketing réalisées sur les canaux numériques...',image:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'},{id:2,title:'L\'écosystème digital',type:'text',content:'L\'écosystème digital comprend les moteurs de recherche, les réseaux sociaux...',image:'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80'}]}] },
      { id:'dev-frontend', title:'Développement Web Frontend', price:20000, currency:'FCFA', category:'Développement', level:'Débutant → Pro', duration:'12 semaines', icon:'💻', color:'#06D6A0', description:'Créez des interfaces web modernes avec HTML5, CSS3, JavaScript et React.', chapters:[{id:1,title:'HTML5 — Les Bases',lessons:[{id:1,title:'Structure d\'une page web',type:'text',content:'HTML est le langage de balisage standard...',image:'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80'},{id:2,title:'Les balises essentielles',type:'text',content:'Les balises HTML structurent le contenu...',image:'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80'}]},{id:2,title:'CSS3 — Design',lessons:[{id:3,title:'Sélecteurs et propriétés',type:'text',content:'CSS contrôle l\'apparence visuelle...',image:'https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=800&q=80'}]}] },
      { id:'dev-backend', title:'Développement Web Backend', price:25000, currency:'FCFA', category:'Développement', level:'Intermédiaire → Pro', duration:'14 semaines', icon:'⚙️', color:'#EF233C', description:'Maîtrisez Node.js, PHP, bases de données SQL/NoSQL et APIs REST.', chapters:[{id:1,title:'Node.js & Express',lessons:[{id:1,title:'Introduction à Node.js',type:'text',content:'Node.js est un environnement d\'exécution JavaScript côté serveur...',image:'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80'}]}] },
      { id:'analyse-donnees', title:'Analyse des Données', price:15000, currency:'FCFA', category:'Data', level:'Débutant → Pro', duration:'10 semaines', icon:'📊', color:'#4CC9F0', description:'Transformez les données en insights : Excel avancé, Python, visualisation et BI.', chapters:[{id:1,title:'Excel pour l\'Analyse',lessons:[{id:1,title:'Tableaux croisés dynamiques',type:'text',content:'Les tableaux croisés dynamiques sont l\'outil le plus puissant d\'Excel...',image:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80'}]}] },
      { id:'negociation-commerciale', title:'Négociation Commerciale', price:10000, currency:'FCFA', category:'Business', level:'Débutant → Avancé', duration:'6 semaines', icon:'🤝', color:'#F77F00', description:'Techniques de persuasion, gestion des objections, closing et fidélisation.', chapters:[{id:1,title:'Fondamentaux',lessons:[{id:1,title:'Psychologie de la négociation',type:'text',content:'Comprendre la psychologie humaine est la clé...',image:'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80'}]}] },
      { id:'charge-clientele', title:'Chargé Clientèle', price:10000, currency:'FCFA', category:'Service', level:'Débutant → Pro', duration:'6 semaines', icon:'🎯', color:'#7209B7', description:'Accueil, gestion des réclamations, fidélisation et service après-vente.', chapters:[{id:1,title:'Excellence Client',lessons:[{id:1,title:'L\'art de l\'accueil',type:'text',content:'L\'accueil est la première impression...',image:'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80'}]}] },
      { id:'word-debutant', title:'Microsoft Word — Débutant', price:5000, currency:'FCFA', category:'Informatique', level:'Débutant', duration:'2 semaines', icon:'📝', color:'#2B5CE6', description:'Prenez en main Word : créer, formater et imprimer des documents professionnels.', chapters:[{id:1,title:'Découverte de Word',lessons:[{id:1,title:'L\'interface de Word',type:'text',content:'Microsoft Word est le traitement de texte le plus utilisé...',image:'https://images.unsplash.com/photo-1618044619888-009e412ff12a?w=800&q=80'}]}] },
      { id:'word-intermediaire', title:'Microsoft Word — Intermédiaire', price:5000, currency:'FCFA', category:'Informatique', level:'Intermédiaire', duration:'2 semaines', icon:'📄', color:'#2B5CE6', description:'Styles, tables des matières, publipostage et modèles avancés.', chapters:[{id:1,title:'Styles Avancés',lessons:[{id:1,title:'Styles et thèmes',type:'text',content:'Les styles Word permettent une mise en forme cohérente...',image:'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'}]}] },
      { id:'word-avance', title:'Microsoft Word — Avancé', price:5000, currency:'FCFA', category:'Informatique', level:'Avancé', duration:'3 semaines', icon:'📋', color:'#2B5CE6', description:'Macros, formulaires, publipostage avancé et automatisation.', chapters:[{id:1,title:'Macros & Automatisation',lessons:[{id:1,title:'Introduction aux macros',type:'text',content:'Les macros permettent d\'automatiser des tâches répétitives...',image:'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&q=80'}]}] },
      { id:'excel-debutant', title:'Microsoft Excel — Débutant', price:5000, currency:'FCFA', category:'Informatique', level:'Débutant', duration:'2 semaines', icon:'📊', color:'#1A7F37', description:'Feuilles de calcul, formules de base et graphiques simples.', chapters:[{id:1,title:'Découverte d\'Excel',lessons:[{id:1,title:'L\'interface d\'Excel',type:'text',content:'Microsoft Excel est le tableur de référence...',image:'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80'}]}] },
      { id:'excel-intermediaire', title:'Microsoft Excel — Intermédiaire', price:5000, currency:'FCFA', category:'Informatique', level:'Intermédiaire', duration:'3 semaines', icon:'📈', color:'#1A7F37', description:'VLOOKUP, tableaux, graphiques avancés et mise en forme conditionnelle.', chapters:[{id:1,title:'Formules Avancées',lessons:[{id:1,title:'VLOOKUP et INDEX-MATCH',type:'text',content:'VLOOKUP est l\'une des fonctions les plus puissantes...',image:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'}]}] },
      { id:'excel-avance', title:'Microsoft Excel — Avancé', price:5000, currency:'FCFA', category:'Informatique', level:'Avancé', duration:'3 semaines', icon:'📉', color:'#1A7F37', description:'Power Query, tableaux croisés dynamiques avancés, VBA et dashboards.', chapters:[{id:1,title:'Power Query & VBA',lessons:[{id:1,title:'Introduction à Power Query',type:'text',content:'Power Query est l\'outil de transformation de données intégré...',image:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80'}]}] },
      { id:'outils-compatibilite', title:'Outils de Compatibilité & Bureautique', price:5000, currency:'FCFA', category:'Informatique', level:'Tous niveaux', duration:'2 semaines', icon:'🔧', color:'#6C757D', description:'PDF, Google Docs, LibreOffice et conversion de formats.', chapters:[{id:1,title:'Outils PDF & Compatibilité',lessons:[{id:1,title:'Créer et éditer des PDF',type:'text',content:'Le format PDF est le standard universel...',image:'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'}]}] },
    ];
    return COURSES;
  }
}

function getCourseById(id) {
  return COURSES.find(c => c.id === id) || null;
}

function formatPrice(price) {
  return Number(price).toLocaleString('fr-FR') + ' FCFA';
}

function getTotalLessons(course) {
  if (!course?.chapters) return 0;
  return course.chapters.reduce((s, ch) => s + (ch.lessons?.length || 0), 0);
}

/* ════════════════════════════════════════
   CARTE FORMATION (HTML)
════════════════════════════════════════ */
function courseCardHTML(c) {
  const img = COURSE_IMAGES[c.id] || IMG_FALLBACK;
  const totalLessons = getTotalLessons(c);
  return `
    <div class="course-preview-card" data-id="${c.id}">
      <div class="cpc-img">
        <img src="${img}" alt="${c.title}" loading="lazy"
          onerror="this.src='${IMG_FALLBACK}'" />
        <div class="cpc-img-overlay"></div>
        <div class="cpc-badge">${c.level}</div>
        <div class="cpc-icon">${c.icon}</div>
      </div>
      <div class="cpc-body">
        <div class="cpc-category">${c.category}</div>
        <h3 class="cpc-title">${c.title}</h3>
        <div class="cpc-meta">
          <div class="cpc-meta-item">⏱ ${c.duration}</div>
          <div class="cpc-meta-item">📚 ${totalLessons} leçon${totalLessons > 1 ? 's' : ''}</div>
        </div>
        <p class="cpc-desc">${c.description}</p>
        <div class="cpc-footer">
          <div class="cpc-price">${formatPrice(c.price)} <span>/ formation</span></div>
          <div class="cpc-btn">Voir →</div>
        </div>
      </div>
    </div>
  `;
}

/* ════════════════════════════════════════
   PAGE ACCUEIL — 6 cours en vedette
════════════════════════════════════════ */
async function renderCoursesPreview() {
  const container = document.getElementById('coursesPreview');
  if (!container) return;

  container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">⏳ Chargement...</div>';
  await loadCourses();

  if (!COURSES.length) {
    container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">Aucune formation disponible pour l\'instant.</div>';
    return;
  }

  const featured = COURSES.slice(0, 6);
  container.innerHTML = featured.map(c => courseCardHTML(c)).join('');
  container.querySelectorAll('.course-preview-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = `course-detail.html?id=${card.dataset.id}`;
    });
  });
}

/* ════════════════════════════════════════
   PAGE CATALOGUE
════════════════════════════════════════ */
async function renderCoursesPage() {
  const container = document.getElementById('coursesGridFull');
  if (!container) return;

  container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted);">⏳ Chargement des formations...</div>';
  await loadCourses();

  const catFilter = new URLSearchParams(window.location.search).get('cat') || 'all';
  const filtered  = catFilter === 'all' ? COURSES : COURSES.filter(c => c.category === catFilter);

  if (!filtered.length) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted);">
      <div style="font-size:2.5rem;margin-bottom:12px;">🔍</div>
      Aucune formation dans cette catégorie.
      <br/><a href="courses.html" style="color:var(--primary);font-weight:600;margin-top:12px;display:inline-block;">Voir toutes les formations</a>
    </div>`;
  } else {
    container.innerHTML = filtered.map(c => courseCardHTML(c)).join('');
    container.querySelectorAll('.course-preview-card').forEach(card => {
      card.addEventListener('click', () => {
        window.location.href = `course-detail.html?id=${card.dataset.id}`;
      });
    });
  }

  // Sync filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active',
      btn.dataset.cat === catFilter ||
      (catFilter === 'all' && btn.dataset.cat === 'all')
    );
    // Évite de dupliquer les listeners
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('cat', newBtn.dataset.cat);
      window.history.replaceState({}, '', url);
      renderCoursesPage();
    });
  });
}

/* ════════════════════════════════════════
   PAGE DÉTAIL FORMATION
════════════════════════════════════════ */
async function renderCourseDetail() {
  const courseId = new URLSearchParams(window.location.search).get('id');
  if (!courseId) { window.location.href = 'courses.html'; return; }

  await loadCourses();
  const course = getCourseById(courseId);
  if (!course) { window.location.href = 'courses.html'; return; }

  document.title = `${course.title} — Luckily Academy`;

  const img          = COURSE_IMAGES[courseId] || IMG_FALLBACK;
  const totalLessons = getTotalLessons(course);
  const session      = (typeof getSession    === 'function') ? getSession()    : null;
  const enrolled     = session ? ((typeof isEnrolled === 'function') ? isEnrolled(session.userId, courseId) : false) : false;

  /* ── Hero ── */
  const heroEl = document.getElementById('courseHeroContainer');
  if (heroEl) {
    heroEl.innerHTML = `
      <div class="course-hero-text">
        <div class="course-hero-badge">${course.category} · ${course.level}</div>
        <h1 class="course-hero-title">${course.icon} ${course.title}</h1>
        <p class="course-hero-desc">${course.description}</p>
        <div class="course-hero-meta">
          <div class="course-meta-item">⏱ ${course.duration}</div>
          <div class="course-meta-item">📚 ${totalLessons} leçon${totalLessons > 1 ? 's' : ''}</div>
          <div class="course-meta-item">📋 ${course.chapters.length} chapitre${course.chapters.length > 1 ? 's' : ''}</div>
          <div class="course-meta-item">🎯 ${course.level}</div>
        </div>
      </div>

      <div class="course-purchase-card">
        <img src="${img}" alt="${course.title}"
          style="width:100%;height:160px;object-fit:cover;border-radius:12px;margin-bottom:18px;display:block;"
          onerror="this.src='${IMG_FALLBACK}'" />
        <div class="course-price-display">${formatPrice(course.price)}</div>
        <div class="course-price-sub">Accès à vie · Paiement unique</div>

        ${enrolled
          ? `<button class="btn-enroll" style="background:linear-gradient(135deg,#06D6A0,#0096B5);"
               onclick="window.location.href='lesson.html?course=${courseId}&chapter=0&lesson=0'">
               ✓ Accéder au cours →
             </button>`
          : session
            ? `<button class="btn-enroll" id="enrollBtn" onclick="handleEnroll('${courseId}','${session.userId}')">
                 🎓 S'inscrire — ${formatPrice(course.price)}
               </button>`
            : `<button class="btn-enroll"
                 onclick="window.location.href='auth.html?redirect=course-detail.html%3Fid%3D${courseId}'">
                 🔒 Se connecter pour s'inscrire
               </button>`
        }

        <div class="course-includes">
          <div class="include-item">✓ Accès à vie au contenu</div>
          <div class="include-item">✓ ${totalLessons} leçons illustrées</div>
          <div class="include-item">✓ Ressources PDF téléchargeables</div>
          <div class="include-item">✓ Assistant IA 24h/24</div>
          <div class="include-item">✓ Certificat de complétion</div>
          <div class="include-item">✓ Accès depuis tous vos appareils</div>
        </div>
      </div>
    `;
  }

  /* ── Curriculum ── */
  const currEl = document.getElementById('courseCurriculum');
  if (currEl) {
    currEl.innerHTML = `
      <h2 style="font-family:var(--font-display);font-size:1.8rem;font-weight:700;margin-bottom:8px;">Programme de la formation</h2>
      <p style="color:var(--text-muted);margin-bottom:28px;">${course.chapters.length} chapitre${course.chapters.length > 1 ? 's' : ''} · ${totalLessons} leçon${totalLessons > 1 ? 's' : ''}</p>
      ${course.chapters.map((ch, ci) => `
        <div class="chapter-item ${ci === 0 ? 'open' : ''}" id="chapter-${ci}">
          <div class="chapter-header" onclick="toggleChapter(${ci})">
            <div>
              <div class="chapter-title">Chapitre ${ci + 1} : ${ch.title}</div>
              <div class="chapter-count">${ch.lessons?.length || 0} leçon${(ch.lessons?.length || 0) > 1 ? 's' : ''}</div>
            </div>
            <div class="chapter-toggle">▾</div>
          </div>
          <div class="chapter-lessons">
            ${(ch.lessons || []).map((lesson, li) => `
              <div class="lesson-item ${!enrolled ? 'locked' : ''}"
                   role="button" tabindex="0"
                   onclick="${enrolled
                     ? `window.location.href='lesson.html?course=${courseId}&chapter=${ci}&lesson=${li}'`
                     : `showPayWall('${courseId}')`}">
                <span class="lesson-icon">${enrolled ? '▶' : '🔒'}</span>
                <span>${lesson.title}</span>
                ${enrolled ? '' : '<span style="margin-left:auto;font-size:0.72rem;color:var(--text-muted);">Accès après inscription</span>'}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    `;
  }

  /* ── Bouton PDF ── */
  const pdfBtn = document.getElementById('downloadPdfBtn');
  if (pdfBtn && enrolled) {
    pdfBtn.disabled    = false;
    pdfBtn.textContent = '⬇ Télécharger le PDF de la formation';
  }
}

function toggleChapter(index) {
  document.getElementById('chapter-' + index)?.classList.toggle('open');
}

/* handleEnroll : ouvre directement le modal sans toucher au bouton */
function handleEnroll(courseId, userId) {
  if (typeof showPaymentModal === 'function') {
    showPaymentModal(courseId, userId);
  }
}

/* showPayWall : toast élégant au lieu d'alert() */
function showPayWall(courseId) {
  const session = (typeof getSession === 'function') ? getSession() : null;
  if (!session) {
    window.location.href = `auth.html?redirect=course-detail.html%3Fid%3D${courseId}`;
    return;
  }
  if (typeof showToast === 'function') {
    showToast('🔒 Inscrivez-vous à cette formation pour accéder aux leçons.', 'warning');
  }
  // Scroll vers le bouton d'inscription
  document.getElementById('enrollBtn')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ════════════════════════════════════════
   PAGE LEÇON
════════════════════════════════════════ */
async function renderLesson() {
  const params     = new URLSearchParams(window.location.search);
  const courseId   = params.get('course');
  const chapterIdx = parseInt(params.get('chapter') || '0', 10);
  const lessonIdx  = parseInt(params.get('lesson')  || '0', 10);

  await loadCourses();
  const course = getCourseById(courseId);
  if (!course) { window.location.href = 'courses.html'; return; }

  const session = (typeof getSession === 'function') ? getSession() : null;
  if (!session) { window.location.href = `auth.html?redirect=lesson.html%3Fcourse%3D${courseId}%26chapter%3D${chapterIdx}%26lesson%3D${lessonIdx}`; return; }

  const enrolled = (typeof isEnrolled === 'function') ? isEnrolled(session.userId, courseId) : false;
  if (!enrolled) { window.location.href = `course-detail.html?id=${courseId}`; return; }

  const chapter = course.chapters[chapterIdx];
  const lesson  = chapter?.lessons?.[lessonIdx];
  if (!lesson)  { window.location.href = `course-detail.html?id=${courseId}`; return; }

  document.title = `${lesson.title} — ${course.title} — Luckily Academy`;

  /* Breadcrumb */
  const bc = document.getElementById('lessonBreadcrumb');
  if (bc) bc.innerHTML = `
    <a href="courses.html">Formations</a> ›
    <a href="course-detail.html?id=${courseId}">${course.title}</a> ›
    <span style="color:var(--text);">${lesson.title}</span>
  `;

  /* Titre */
  const ltEl = document.getElementById('lessonTitle');
  if (ltEl) ltEl.textContent = lesson.title;

  /* Image */
  const imgEl = document.getElementById('lessonImage');
  if (imgEl) {
    if (lesson.image) {
      imgEl.src   = lesson.image;
      imgEl.alt   = lesson.title;
      imgEl.style.display = 'block';
      imgEl.onerror = () => { imgEl.style.display = 'none'; };
    } else {
      imgEl.style.display = 'none';
    }
  }

  /* Contenu */
  const lbEl = document.getElementById('lessonBody');
  if (lbEl) {
    lbEl.innerHTML = `
      <p>${lesson.content}</p>

      <div class="lesson-body" style="margin:28px 0;">
        <div class="tip-box">
          <strong>💡 Conseil pratique</strong>
          Cette leçon couvre les fondamentaux de <strong>${lesson.title}</strong>.
          Relisez-la autant de fois que nécessaire avant de passer à la suivante.
        </div>
      </div>

      <h3>Points clés à retenir</h3>
      <p>Assurez-vous de bien maîtriser les concepts abordés dans cette leçon avant de continuer. La progression régulière est la clé de la réussite.</p>

      <h3>Application pratique</h3>
      <p>Mettez en pratique immédiatement ce que vous venez d'apprendre. Utilisez l'assistant IA ci-dessous si vous avez besoin d'explications supplémentaires ou d'exemples concrets.</p>
    `;
  }

  /* Bouton "Marquer comme complétée" */
  const mcBtn = document.getElementById('markCompleteBtn');
  if (mcBtn) {
    const progressArr = (typeof getLessonProgress === 'function') ? getLessonProgress(session.userId, courseId) : [];
    const isComplete  = progressArr.includes(lesson.id);
    _updateCompleteBtn(mcBtn, isComplete);
    mcBtn.onclick = () => {
      if (typeof markLessonComplete === 'function') markLessonComplete(session.userId, courseId, lesson.id);
      _updateCompleteBtn(mcBtn, true);
      renderSidebarLessons(course, courseId, chapterIdx, lessonIdx, session.userId);
      if (typeof showToast === 'function') showToast('✓ Leçon marquée comme complétée !', 'success');
    };
  }

  /* Boutons de navigation */
  const allLessons = [];
  course.chapters.forEach((ch, ci) => (ch.lessons || []).forEach((_, li) => allLessons.push({ ch: ci, les: li })));
  const curIdx = allLessons.findIndex(x => x.ch === chapterIdx && x.les === lessonIdx);

  const prevBtn = document.getElementById('prevLessonBtn');
  const nextBtn = document.getElementById('nextLessonBtn');

  if (prevBtn) {
    if (curIdx > 0) {
      const prev = allLessons[curIdx - 1];
      prevBtn.style.opacity = '1';
      prevBtn.disabled      = false;
      prevBtn.onclick       = () => { window.location.href = `lesson.html?course=${courseId}&chapter=${prev.ch}&lesson=${prev.les}`; };
    } else {
      prevBtn.style.opacity = '0.4';
      prevBtn.disabled      = true;
    }
  }

  if (nextBtn) {
    if (curIdx < allLessons.length - 1) {
      const next = allLessons[curIdx + 1];
      nextBtn.textContent = 'Leçon suivante →';
      nextBtn.onclick     = () => {
        if (typeof markLessonComplete === 'function') markLessonComplete(session.userId, courseId, lesson.id);
        window.location.href = `lesson.html?course=${courseId}&chapter=${next.ch}&lesson=${next.les}`;
      };
    } else {
      nextBtn.textContent = '🏆 Formation terminée !';
      nextBtn.style.background = 'linear-gradient(135deg,#06D6A0,#0096B5)';
      nextBtn.onclick = () => {
        if (typeof markLessonComplete === 'function') markLessonComplete(session.userId, courseId, lesson.id);
        window.location.href = `course-detail.html?id=${courseId}`;
      };
    }
  }

  /* Barre de progression globale */
  const total = getTotalLessons(course);
  const pct   = (typeof getCourseProgressPct === 'function') ? getCourseProgressPct(session.userId, courseId, total) : 0;
  const fillEl = document.getElementById('globalProgressFill');
  const pctEl  = document.getElementById('globalProgressPct');
  if (fillEl) fillEl.style.width  = pct + '%';
  if (pctEl)  pctEl.textContent   = pct + '% complété';

  /* Topbar title */
  const topbarTitle = document.getElementById('topbarTitle');
  if (topbarTitle) topbarTitle.textContent = course.title;

  renderSidebarLessons(course, courseId, chapterIdx, lessonIdx, session.userId);
}

function _updateCompleteBtn(btn, done) {
  btn.textContent        = done ? '✓ Leçon complétée' : 'Marquer comme complétée';
  btn.style.background   = done ? 'linear-gradient(135deg,#06D6A0,#0096B5)' : '';
  btn.style.boxShadow    = done ? '0 4px 16px rgba(6,214,160,0.35)' : '';
}

function renderSidebarLessons(course, courseId, currentCh, currentLes, userId) {
  const sidebar = document.getElementById('lessonSidebar');
  if (!sidebar) return;
  const progress = (typeof getLessonProgress === 'function') ? getLessonProgress(userId, courseId) : [];
  let html = '<h3 style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;margin-bottom:12px;">Contenu du cours</h3><div class="lesson-list">';
  course.chapters.forEach((ch, ci) => {
    html += `<div style="padding:9px 14px;background:var(--bg-alt);font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--text-muted);border-bottom:1px solid var(--border);">
      Ch.${ci + 1} — ${ch.title}
    </div>`;
    (ch.lessons || []).forEach((l, li) => {
      const active = ci === currentCh && li === currentLes;
      const done   = progress.includes(l.id);
      html += `<div class="lesson-list-item ${active ? 'active' : ''} ${done ? 'completed' : ''}"
        onclick="window.location.href='lesson.html?course=${courseId}&chapter=${ci}&lesson=${li}'"
        role="button" tabindex="0"
        style="${active ? 'background:rgba(0,180,216,0.1);color:var(--primary);font-weight:600;' : ''}">
        <span style="font-size:0.85rem;width:16px;flex-shrink:0;">${done ? '✓' : active ? '▶' : '○'}</span>
        <span style="flex:1;font-size:0.82rem;line-height:1.4;">${l.title}</span>
      </div>`;
    });
  });
  html += '</div>';
  sidebar.innerHTML = html;
}

/* ════════════════════════════════════════
   PAGE DASHBOARD
════════════════════════════════════════ */
async function renderDashboard() {
  const session = (typeof getSession === 'function') ? getSession() : null;
  if (!session) { window.location.href = 'auth.html'; return; }

  const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
  await loadCourses();

  /* Message de bienvenue */
  const firstName = (user?.fullname || 'Étudiant').split(' ')[0];
  const wEl = document.getElementById('dashWelcome');
  if (wEl) wEl.textContent = `Bonjour, ${firstName} 👋`;

  /* Infos sidebar */
  const sA = document.getElementById('sidebarAvatar');
  const sN = document.getElementById('sidebarName');
  const sE = document.getElementById('sidebarEmail');
  const nA = document.getElementById('navUserAvatar');
  if (sA) sA.textContent = (user?.fullname || 'U').charAt(0).toUpperCase();
  if (sN) sN.textContent = user?.fullname || '';
  if (sE) sE.textContent = user?.email    || '';
  if (nA) nA.textContent = (user?.fullname || 'U').charAt(0).toUpperCase();

  const courseIds      = (typeof getUserCourses === 'function') ? getUserCourses(session.userId) : [];
  const enrolledCourses = COURSES.filter(c => courseIds.includes(c.id));

  /* Stats */
  const statCoursesEl  = document.getElementById('statCourses');
  const statProgressEl = document.getElementById('statProgress');
  const statCertsEl    = document.getElementById('statCerts');
  const statTimeEl     = document.getElementById('statTime');

  if (statCoursesEl) statCoursesEl.textContent = enrolledCourses.length;

  let totalPct = 0, certs = 0, totalDone = 0;
  enrolledCourses.forEach(c => {
    const total = getTotalLessons(c);
    const done  = (typeof getLessonProgress === 'function') ? getLessonProgress(session.userId, c.id).length : 0;
    const pct   = (typeof getCourseProgressPct === 'function') ? getCourseProgressPct(session.userId, c.id, total) : 0;
    totalPct   += pct;
    totalDone  += done;
    if (pct === 100) certs++;
  });

  const avgPct = enrolledCourses.length ? Math.round(totalPct / enrolledCourses.length) : 0;
  if (statProgressEl) statProgressEl.textContent = avgPct + '%';
  if (statCertsEl)    statCertsEl.textContent    = certs;
  if (statTimeEl)     statTimeEl.textContent     = Math.round(totalDone * 0.5) + 'h';

  /* Grille des cours inscrits */
  const grid = document.getElementById('enrolledCoursesGrid');
  if (!grid) return;

  if (!enrolledCourses.length) {
    grid.innerHTML = `
      <div class="no-courses" style="grid-column:1/-1;text-align:center;padding:60px 20px;">
        <div style="font-size:3rem;margin-bottom:16px;">📚</div>
        <p style="color:var(--text-muted);margin-bottom:20px;">Vous n'êtes inscrit(e) à aucune formation pour l'instant.</p>
        <a href="courses.html" class="btn-primary" style="display:inline-block;">Explorer les formations →</a>
      </div>`;
    return;
  }

  grid.innerHTML = enrolledCourses.map(c => {
    const total = getTotalLessons(c);
    const pct   = (typeof getCourseProgressPct === 'function') ? getCourseProgressPct(session.userId, c.id, total) : 0;
    const done  = (typeof getLessonProgress    === 'function') ? getLessonProgress(session.userId, c.id).length : 0;
    return `
      <div class="enrolled-card" onclick="window.location.href='course-detail.html?id=${c.id}'" style="cursor:pointer;">
        <div class="enrolled-icon" style="font-size:2rem;margin-bottom:10px;">${c.icon}</div>
        <div class="enrolled-title" style="font-weight:700;font-size:0.95rem;margin-bottom:4px;">${c.title}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:14px;">${c.category} · ${c.level}</div>
        <div class="enrolled-progress-bar">
          <div class="enrolled-progress-fill" style="width:${pct}%;transition:width 1s ease;"></div>
        </div>
        <div class="enrolled-progress-text" style="font-size:0.75rem;color:var(--text-muted);margin-top:6px;">${done}/${total} leçon${total>1?'s':''} · ${pct}% complété</div>
        <a href="lesson.html?course=${c.id}&chapter=0&lesson=0" class="btn-continue"
           onclick="event.stopPropagation()"
           style="display:inline-flex;align-items:center;gap:6px;margin-top:14px;padding:8px 16px;border-radius:50px;background:rgba(0,180,216,0.1);color:var(--primary);font-size:0.82rem;font-weight:600;text-decoration:none;transition:all .18s;"
           onmouseover="this.style.background='var(--primary)';this.style.color='white'"
           onmouseout="this.style.background='rgba(0,180,216,0.1)';this.style.color='var(--primary)'">
          ${pct > 0 ? '▶ Continuer' : '🚀 Commencer'}
        </a>
      </div>`;
  }).join('');
}
