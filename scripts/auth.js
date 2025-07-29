// Système d'authentification StudyHub
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.authOverlay = document.getElementById('auth-overlay');
    this.loginBtn = document.getElementById('login-btn');
    this.logoutBtn = document.getElementById('logout-btn');
    this.userInfo = document.getElementById('user-info');
    this.userName = document.getElementById('user-name');
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkAuthStatus();
  }

  setupEventListeners() {
    // Boutons d'authentification
    this.loginBtn?.addEventListener('click', () => this.showAuthModal());
    this.logoutBtn?.addEventListener('click', () => this.logout());
    
    // Gestion des onglets d'authentification
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchAuthTab(tab.dataset.tab));
    });
    
    // Formulaires d'authentification
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
    registerForm?.addEventListener('submit', (e) => this.handleRegister(e));
    
    // Fermeture de la modal
    this.authOverlay?.addEventListener('click', (e) => {
      if (e.target === this.authOverlay) {
        this.hideAuthModal();
      }
    });
    
    // Boutons Google
    const googleBtns = document.querySelectorAll('.btn-google');
    googleBtns.forEach(btn => {
      btn.addEventListener('click', () => this.handleGoogleAuth());
    });
  }

  checkAuthStatus() {
    const userData = localStorage.getItem('studyhub_user');
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
        this.updateUI();
        this.syncUserData();
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        this.logout();
      }
    }
  }

  showAuthModal() {
    this.authOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  hideAuthModal() {
    this.authOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}-form`).classList.add('active');
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
      const user = await this.login(email, password);
      if (user) {
        this.currentUser = user;
        this.saveUserData();
        this.updateUI();
        this.hideAuthModal();
        this.syncUserData();
        NotificationManager.show('Connexion réussie !', 'success');
      }
    } catch (error) {
      NotificationManager.show('Erreur de connexion: ' + error.message, 'error');
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (password !== confirmPassword) {
      NotificationManager.show('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    
    try {
      const user = await this.register(name, email, password);
      if (user) {
        this.currentUser = user;
        this.saveUserData();
        this.updateUI();
        this.hideAuthModal();
        NotificationManager.show('Inscription réussie !', 'success');
      }
    } catch (error) {
      NotificationManager.show('Erreur d\'inscription: ' + error.message, 'error');
    }
  }

  async login(email, password) {
    // Simulation d'une API d'authentification
    // En production, cela serait remplacé par Firebase Auth ou une API backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('studyhub_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
          resolve({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
          });
        } else {
          reject(new Error('Email ou mot de passe incorrect'));
        }
      }, 1000);
    });
  }

  async register(name, email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('studyhub_users') || '[]');
        
        // Vérifier si l'email existe déjà
        if (users.find(u => u.email === email)) {
          reject(new Error('Cet email est déjà utilisé'));
          return;
        }
        
        const newUser = {
          id: Utils.generateId(),
          name,
          email,
          password, // En production, le mot de passe serait hashé
          createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('studyhub_users', JSON.stringify(users));
        
        resolve({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt
        });
      }, 1000);
    });
  }

  async handleGoogleAuth() {
    // Simulation de l'authentification Google
    // En production, cela utiliserait Firebase Auth ou Google OAuth
    NotificationManager.show('Authentification Google en cours de développement', 'info');
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('studyhub_user');
    this.updateUI();
    NotificationManager.show('Déconnexion réussie', 'info');
  }

  saveUserData() {
    if (this.currentUser) {
      localStorage.setItem('studyhub_user', JSON.stringify(this.currentUser));
    }
  }

  updateUI() {
    if (this.currentUser) {
      this.loginBtn.classList.add('hidden');
      this.userInfo.classList.remove('hidden');
      this.userName.textContent = this.currentUser.name;
    } else {
      this.loginBtn.classList.remove('hidden');
      this.userInfo.classList.add('hidden');
      this.userName.textContent = '';
    }
  }

  async syncUserData() {
    if (!this.currentUser) return;
    
    try {
      // Synchronisation des données utilisateur avec le cloud
      // En production, cela utiliserait Firebase Firestore ou une API backend
      const userData = {
        subjects: JSON.parse(localStorage.getItem('subjects') || '[]'),
        qcm_data: JSON.parse(localStorage.getItem('qcm_data') || '{}'),
        qcm_results: JSON.parse(localStorage.getItem('qcm_results') || '{}'),
        flashcards: JSON.parse(localStorage.getItem('flashcards') || '{}'),
        resumes: JSON.parse(localStorage.getItem('resumes') || '{}')
      };
      
      // Sauvegarder dans le cloud (simulation)
      localStorage.setItem(`studyhub_cloud_${this.currentUser.id}`, JSON.stringify(userData));
      
      console.log('Données synchronisées avec le cloud');
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
    }
  }

  // Méthodes utilitaires pour la gestion des données utilisateur
  getUserData() {
    if (!this.currentUser) return null;
    
    const cloudData = localStorage.getItem(`studyhub_cloud_${this.currentUser.id}`);
    if (cloudData) {
      return JSON.parse(cloudData);
    }
    
    return {
      subjects: [],
      qcm_data: {},
      qcm_results: {},
      flashcards: {},
      resumes: {}
    };
  }

  saveUserDataToCloud(data) {
    if (!this.currentUser) return;
    
    localStorage.setItem(`studyhub_cloud_${this.currentUser.id}`, JSON.stringify(data));
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

// Initialisation du gestionnaire d'authentification
const authManager = new AuthManager();

// Export pour utilisation dans d'autres modules
window.AuthManager = AuthManager;
window.authManager = authManager;