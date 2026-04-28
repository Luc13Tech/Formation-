const translations = {
  fr: {
    hero_title: "Maîtrisez votre destin numérique",
    hero_sub: "Luckily Academy vous offre les clés des métiers de demain. Formations d'excellence en développement, IA et Design.",
    btn_explore: "Explorer les formations",
    footer_copy: "© 2025 Luckily Academy. Tous droits réservés. Fondée par Luc DEGUENON.",
    ai_welcome: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
    login_title: "Connexion"
  },
  en: {
    hero_title: "Master Your Digital Destiny",
    hero_sub: "Luckily Academy gives you the keys to tomorrow's careers. Excellence in Development, AI and Design.",
    btn_explore: "Explore Courses",
    footer_copy: "© 2025 Luckily Academy. All rights reserved. Founded by Luc DEGUENON.",
    ai_welcome: "Hello! How can I help you today?",
    login_title: "Login"
  }
};

function initI18n() {
  const lang = localStorage.getItem('la_lang') || 'fr';
  applyLanguage(lang);
}

function applyLanguage(lang) {
  localStorage.setItem('la_lang', lang);
  document.documentElement.lang = lang;
  
  const elements = document.querySelectorAll('[data-t]');
  elements.forEach(el => {
    const key = el.getAttribute('data-t');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
}

window.changeLang = (lang) => {
  applyLanguage(lang);
  window.location.reload();
};

document.addEventListener('DOMContentLoaded', initI18n);
