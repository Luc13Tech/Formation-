const COURSES_DATA = [
  {
    id: "web-fullstack",
    title: "Développement Web Fullstack",
    category: "Développement",
    level: "Débutant à Avancé",
    price: "45.000 FCFA",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600",
    description: "Apprenez à créer des sites web modernes avec HTML, CSS, JS, React et Node.js.",
    modules: [
      { title: "Introduction au Web", lessons: ["Histoire du Web", "Comment fonctionne Internet"] },
      { title: "HTML5 & CSS3", lessons: ["Structure Sémantique", "Flexbox & Grid"] }
    ]
  },
  {
    id: "ai-prompt",
    title: "Intelligence Artificielle & Prompt Engineering",
    category: "IA",
    level: "Tous niveaux",
    price: "25.000 FCFA",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600",
    description: "Maîtrisez ChatGPT, Midjourney et apprenez à automatiser vos tâches quotidiennes.",
    modules: [
      { title: "Bases de l'IA", lessons: ["Qu'est-ce qu'un LLM ?", "Éthique et IA"] },
      { title: "Art du Prompting", lessons: ["Frameworks de prompts", "IA Générative d'images"] }
    ]
  }
];

function getAllCourses() {
  return COURSES_DATA;
}

function getCourseById(id) {
  return COURSES_DATA.find(c => c.id === id);
}

function isEnrolled(userId, courseId) {
  const users = JSON.parse(localStorage.getItem('la_users') || '[]');
  const user = users.find(u => u.id === userId);
  return user ? user.enrolled.includes(courseId) : false;
}

function enrollUser(userId, courseId) {
  const users = JSON.parse(localStorage.getItem('la_users') || '[]');
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    if (!users[idx].enrolled.includes(courseId)) {
      users[idx].enrolled.push(courseId);
      localStorage.setItem('la_users', JSON.stringify(users));
      // Mettre aussi à jour la session active
      const session = JSON.parse(localStorage.getItem('la_session'));
      session.enrolled.push(courseId);
      localStorage.setItem('la_session', JSON.stringify(session));
      return true;
    }
  }
  return false;
}
