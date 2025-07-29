/**
 * Gestionnaire des résumés
 * Gère la création, l'affichage, la modification et la suppression des résumés
 */
class ResumeManager {
  constructor() {
    this.currentResume = null;
    this.resumes = [];
    this.subjects = [];
    this.init();
  }

  init() {
    this.loadSubjects();
    this.loadResumes();
    this.setupEventListeners();
    this.displayResumes();
    this.displayImportedResumes();
  }

  setupEventListeners() {
    // Gestion des onglets
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Formulaire de création
    document.getElementById('resume-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveResume();
    });

    // Fermeture du modal
    document.getElementById('resume-modal').addEventListener('click', (e) => {
      if (e.target.id === 'resume-modal') {
        this.closeResumeModal();
      }
    });
  }

  switchTab(tabName) {
    // Mise à jour des boutons d'onglets
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Mise à jour du contenu des onglets
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
  }

  loadSubjects() {
    this.subjects = StudyHub.StorageManager.get('subjects') || [];
    this.populateSubjectSelects();
  }

  loadResumes() {
    this.resumes = StudyHub.StorageManager.get('resumes') || [];
  }

  populateSubjectSelects() {
    const selects = ['resume-subject', 'filter-subject-resumes'];
    
    selects.forEach(selectId => {
      const select = document.getElementById(selectId);
      if (select) {
        // Garder l'option par défaut
        const defaultOption = select.querySelector('option[value=""]');
        select.innerHTML = '';
        if (defaultOption) {
          select.appendChild(defaultOption);
        }

        // Ajouter les matières
        this.subjects.forEach(subject => {
          const option = document.createElement('option');
          option.value = subject;
          option.textContent = subject;
          select.appendChild(option);
        });
      }
    });
  }

  displayResumes() {
    const grid = document.getElementById('resumes-grid');
    grid.innerHTML = '';

    if (this.resumes.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-file-alt"></i>
          <h3>Aucun résumé créé</h3>
          <p>Créez votre premier résumé pour commencer à organiser vos cours.</p>
          <button class="btn btn-primary" onclick="resumeManager.switchTab('create')">
            <i class="fas fa-plus"></i> Créer un résumé
          </button>
        </div>
      `;
      return;
    }

    this.resumes.forEach(resume => {
      const card = this.createResumeCard(resume);
      grid.appendChild(card);
    });
  }

  createResumeCard(resume) {
    const card = document.createElement('div');
    card.className = 'resume-card';
    card.onclick = () => this.openResumeModal(resume);

    const tags = resume.tags ? resume.tags.split(',').map(tag => tag.trim()) : [];
    const tagsHtml = tags.map(tag => `<span class="tag">${tag}</span>`).join('');

    card.innerHTML = `
      <div class="resume-card-header">
        <h4>${resume.title}</h4>
        <span class="resume-subject">${resume.subject}</span>
      </div>
      <div class="resume-card-body">
        <p class="resume-description">${resume.description || 'Aucune description'}</p>
        <div class="resume-meta">
          <span class="resume-date">
            <i class="fas fa-calendar"></i>
            ${StudyHub.Utils.formatDate(resume.createdAt)}
          </span>
          <span class="resume-length">
            <i class="fas fa-text-width"></i>
            ${resume.content.length} caractères
          </span>
        </div>
        ${tagsHtml ? `<div class="resume-tags">${tagsHtml}</div>` : ''}
      </div>
      <div class="resume-card-actions">
        <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); resumeManager.editResume('${resume.id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); resumeManager.exportResume('${resume.id}')">
          <i class="fas fa-download"></i>
        </button>
        <button class="btn btn-sm btn-error" onclick="event.stopPropagation(); resumeManager.deleteResume('${resume.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    return card;
  }

  displayImportedResumes() {
    const container = document.getElementById('imported-resumes');
    const importedFiles = StudyHub.StorageManager.get('imported_files') || [];
    const importedResumes = importedFiles.filter(file => file.generatedContent && file.generatedContent.summary);

    if (importedResumes.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-file-import"></i>
          <h3>Aucun résumé importé</h3>
          <p>Importez des fichiers pour générer automatiquement des résumés.</p>
          <button class="btn btn-primary" onclick="window.location.href='import.html'">
            <i class="fas fa-upload"></i> Importer des fichiers
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    importedResumes.forEach(file => {
      const card = this.createImportedResumeCard(file);
      container.appendChild(card);
    });
  }

  createImportedResumeCard(file) {
    const card = document.createElement('div');
    card.className = 'imported-resume-card';

    card.innerHTML = `
      <div class="imported-resume-header">
        <h4>${file.title}</h4>
        <span class="imported-resume-subject">${file.subject}</span>
      </div>
      <div class="imported-resume-body">
        <p class="imported-resume-source">
          <i class="fas fa-file"></i>
          Source: ${file.name}
        </p>
        <p class="imported-resume-date">
          <i class="fas fa-calendar"></i>
          Importé le ${StudyHub.Utils.formatDate(file.importedAt)}
        </p>
        <div class="imported-resume-summary">
          <h5>Résumé généré :</h5>
          <p>${file.generatedContent.summary.substring(0, 200)}${file.generatedContent.summary.length > 200 ? '...' : ''}</p>
        </div>
      </div>
      <div class="imported-resume-actions">
        <button class="btn btn-sm btn-primary" onclick="resumeManager.viewImportedResume('${file.id}')">
          <i class="fas fa-eye"></i> Voir le résumé complet
        </button>
        <button class="btn btn-sm btn-secondary" onclick="resumeManager.saveImportedResume('${file.id}')">
          <i class="fas fa-save"></i> Sauvegarder comme résumé
        </button>
      </div>
    `;

    return card;
  }

  saveResume() {
    const formData = {
      subject: document.getElementById('resume-subject').value,
      title: document.getElementById('resume-title').value,
      description: document.getElementById('resume-description').value,
      content: document.getElementById('resume-content').value,
      tags: document.getElementById('resume-tags').value
    };

    if (!formData.subject || !formData.title || !formData.content) {
      StudyHub.NotificationManager.show('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const resume = {
      id: StudyHub.Utils.generateId(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isImported: false
    };

    this.resumes.push(resume);
    StudyHub.StorageManager.set('resumes', this.resumes);

    StudyHub.NotificationManager.show('Résumé sauvegardé avec succès !', 'success');
    this.clearResumeForm();
    this.displayResumes();
    this.switchTab('browse');
  }

  clearResumeForm() {
    document.getElementById('resume-form').reset();
  }

  openResumeModal(resume) {
    this.currentResume = resume;
    
    document.getElementById('modal-resume-title').textContent = resume.title;
    document.getElementById('modal-resume-subject').textContent = resume.subject;
    document.getElementById('modal-resume-date').textContent = StudyHub.Utils.formatDate(resume.createdAt);
    document.getElementById('modal-resume-tags').textContent = resume.tags || 'Aucun tag';
    document.getElementById('modal-resume-description').textContent = resume.description || 'Aucune description';
    document.getElementById('modal-resume-content').textContent = resume.content;

    document.getElementById('resume-modal').classList.remove('hidden');
  }

  closeResumeModal() {
    document.getElementById('resume-modal').classList.add('hidden');
    this.currentResume = null;
  }

  editResume(resumeId = null) {
    const resume = resumeId ? this.resumes.find(r => r.id === resumeId) : this.currentResume;
    if (!resume) return;

    // Remplir le formulaire
    document.getElementById('resume-subject').value = resume.subject;
    document.getElementById('resume-title').value = resume.title;
    document.getElementById('resume-description').value = resume.description || '';
    document.getElementById('resume-content').value = resume.content;
    document.getElementById('resume-tags').value = resume.tags || '';

    // Passer à l'onglet création
    this.switchTab('create');
    this.closeResumeModal();

    // Modifier le comportement du formulaire pour la mise à jour
    const form = document.getElementById('resume-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      this.updateResume(resume.id);
    };

    // Changer le texte du bouton
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Mettre à jour';
  }

  updateResume(resumeId) {
    const formData = {
      subject: document.getElementById('resume-subject').value,
      title: document.getElementById('resume-title').value,
      description: document.getElementById('resume-description').value,
      content: document.getElementById('resume-content').value,
      tags: document.getElementById('resume-tags').value
    };

    const resumeIndex = this.resumes.findIndex(r => r.id === resumeId);
    if (resumeIndex === -1) return;

    this.resumes[resumeIndex] = {
      ...this.resumes[resumeIndex],
      ...formData,
      updatedAt: new Date().toISOString()
    };

    StudyHub.StorageManager.set('resumes', this.resumes);
    StudyHub.NotificationManager.show('Résumé mis à jour avec succès !', 'success');

    // Réinitialiser le formulaire
    this.clearResumeForm();
    const form = document.getElementById('resume-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      this.saveResume();
    };
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Sauvegarder';

    this.displayResumes();
    this.switchTab('browse');
  }

  deleteResume(resumeId = null) {
    const resume = resumeId ? this.resumes.find(r => r.id === resumeId) : this.currentResume;
    if (!resume) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer le résumé "${resume.title}" ?`)) {
      this.resumes = this.resumes.filter(r => r.id !== resume.id);
      StudyHub.StorageManager.set('resumes', this.resumes);
      
      StudyHub.NotificationManager.show('Résumé supprimé avec succès !', 'success');
      this.displayResumes();
      this.closeResumeModal();
    }
  }

  exportResume(resumeId = null) {
    const resume = resumeId ? this.resumes.find(r => r.id === resumeId) : this.currentResume;
    if (!resume) return;

    const content = `
Résumé: ${resume.title}
Matière: ${resume.subject}
Date: ${StudyHub.Utils.formatDate(resume.createdAt)}
Tags: ${resume.tags || 'Aucun tag'}

Description:
${resume.description || 'Aucune description'}

Contenu:
${resume.content}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    StudyHub.NotificationManager.show('Résumé exporté avec succès !', 'success');
  }

  filterResumes() {
    const subjectFilter = document.getElementById('filter-subject-resumes').value;
    const searchFilter = document.getElementById('search-resumes').value.toLowerCase();

    const filteredResumes = this.resumes.filter(resume => {
      const matchesSubject = !subjectFilter || resume.subject === subjectFilter;
      const matchesSearch = !searchFilter || 
        resume.title.toLowerCase().includes(searchFilter) ||
        resume.description.toLowerCase().includes(searchFilter) ||
        resume.content.toLowerCase().includes(searchFilter) ||
        (resume.tags && resume.tags.toLowerCase().includes(searchFilter));

      return matchesSubject && matchesSearch;
    });

    this.displayFilteredResumes(filteredResumes);
  }

  searchResumes() {
    this.filterResumes();
  }

  displayFilteredResumes(filteredResumes) {
    const grid = document.getElementById('resumes-grid');
    grid.innerHTML = '';

    if (filteredResumes.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <h3>Aucun résumé trouvé</h3>
          <p>Aucun résumé ne correspond à vos critères de recherche.</p>
        </div>
      `;
      return;
    }

    filteredResumes.forEach(resume => {
      const card = this.createResumeCard(resume);
      grid.appendChild(card);
    });
  }

  viewImportedResume(fileId) {
    const importedFiles = StudyHub.StorageManager.get('imported_files') || [];
    const file = importedFiles.find(f => f.id === fileId);
    
    if (!file || !file.generatedContent || !file.generatedContent.summary) {
      StudyHub.NotificationManager.show('Résumé non trouvé', 'error');
      return;
    }

    // Créer un résumé temporaire pour l'affichage
    const tempResume = {
      id: fileId,
      title: file.title,
      subject: file.subject,
      description: `Résumé généré automatiquement à partir de ${file.name}`,
      content: file.generatedContent.summary,
      tags: 'importé, automatique',
      createdAt: file.importedAt,
      isImported: true
    };

    this.openResumeModal(tempResume);
  }

  saveImportedResume(fileId) {
    const importedFiles = StudyHub.StorageManager.get('imported_files') || [];
    const file = importedFiles.find(f => f.id === fileId);
    
    if (!file || !file.generatedContent || !file.generatedContent.summary) {
      StudyHub.NotificationManager.show('Résumé non trouvé', 'error');
      return;
    }

    const resume = {
      id: StudyHub.Utils.generateId(),
      title: file.title,
      subject: file.subject,
      description: `Résumé généré automatiquement à partir de ${file.name}`,
      content: file.generatedContent.summary,
      tags: 'importé, automatique',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isImported: true,
      sourceFile: fileId
    };

    this.resumes.push(resume);
    StudyHub.StorageManager.set('resumes', this.resumes);

    StudyHub.NotificationManager.show('Résumé importé sauvegardé avec succès !', 'success');
    this.displayResumes();
    this.displayImportedResumes();
  }
}

// Initialisation
let resumeManager;
document.addEventListener('DOMContentLoaded', () => {
  resumeManager = new ResumeManager();
});

// Fonctions globales pour les événements HTML
window.resumeManager = resumeManager;