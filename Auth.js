// Simulation simple de base de données locale
const getUsers = () => JSON.parse(localStorage.getItem('la_users') || '[]');
const saveUsers = (users) => localStorage.setItem('la_users', JSON.stringify(users));

function registerUser(userData) {
  const users = getUsers();
  if (users.find(u => u.email === userData.email)) {
    return { success: false, message: "Cet email est déjà utilisé." };
  }
  const newUser = { 
    id: Date.now().toString(), 
    ...userData, 
    enrolled: [] 
  };
  users.push(newUser);
  saveUsers(users);
  return { success: true, user: newUser };
}

function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    return { success: true, user };
  }
  return { success: false, message: "Identifiants invalides." };
}

function setSession(user) {
  localStorage.setItem('la_session', JSON.stringify(user));
}

function getSession() {
  const session = localStorage.getItem('la_session');
  return session ? JSON.parse(session) : null;
}

function logout() {
  localStorage.removeItem('la_session');
  window.location.href = 'index.html';
}

function checkAuth(redirect = true) {
  const session = getSession();
  if (!session && redirect) {
    window.location.href = 'auth.html?redirect=' + encodeURIComponent(window.location.pathname);
  }
  return session;
}

// Utilitaires UI
function showErr(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function hideErr(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}
