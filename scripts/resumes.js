/**
 * Gestionnaire des résumés
 * Gère la création, l'affichage et la gestion des résumés
 */
class ResumesManager {
    constructor() {
        this.currentTab = 'browse';
        this.currentResume = null;
        this.subjects = [];
        this.resumes = [];
        this.importedResumes = [];
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.displayResumes();
        this.loadSubjects();
    }

    loadData() {
        // Charger les matières
        this.subjects = StudyHub.StorageManager.get('subjects') || [];
        
        // Charger les résumés manuels
        this.resumes = StudyHub.StorageManager.get('resumes') || [];
        
        // Charger les résumés importés (générés automatiquement)
        this.importedResumes = StudyHub.StorageManager.get('imported_resumes') || [];
    }

    setupEventListeners() {
        // Gestion des onglets
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Filtres
        const subjectFilter = document.getElementById('subject-filter');
        if (subjectFilter) {
            subjectFilter.addEventListener('change', () => this.filterResumes());
        }

        const searchFilter = document.getElementById('search-filter');
        if (searchFilter) {
            searchFilter.addEventListener('input', StudyHub.Utils.debounce(() => this.filterResumes(), 300));
        }

        // Formulaire de création
        const resumeForm = document.getElementById('resume-form');
        if (resumeForm) {
            resumeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveResume();
            });
        }

        // Gestion des champs dynamiques
        const addTagBtn = document.getElementById('add-tag-btn');
        if (addTagBtn) {
            addTagBtn.addEventListener('click', () => this.addTagField());
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Mettre à jour les boutons d'onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Afficher le contenu correspondant
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Charger le contenu approprié
        switch (tabName) {
            case 'browse':
                this.displayResumes();
                break;
            case 'create':
                this.loadSubjects();
                break;
            case 'imported':
                this.displayImportedResumes();
                break;
        }
    }

    loadSubjects() {
        const subjectSelect = document.getElementById('resume-subject');
        if (!subjectSelect) return;
        
        subjectSelect.innerHTML = '<option value="">Sélectionner une matière</option>';
        
        this.subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.name;
            option.textContent = subject.name;
            subjectSelect.appendChild(option);
        });
    }

    displayResumes() {
        const resumesGrid = document.getElementById('resumes-grid');
        if (!resumesGrid) return;
        
        resumesGrid.innerHTML = '';
        
        if (this.resumes.length === 0) {
            resumesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <h3>Aucun résumé créé</h3>
                    <p>Créez votre premier résumé pour commencer à organiser vos connaissances.</p>
                    <button class="btn btn-primary" onclick="resumesManager.switchTab('create')">
                        <i class="fas fa-plus"></i> Créer un résumé
                    </button>
                </div>
            `;
            return;
        }
        
        this.resumes.forEach(resume => {
            const resumeCard = this.createResumeCard(resume);
            resumesGrid.appendChild(resumeCard);
        });
    }

    createResumeCard(resume) {
        const card = document.createElement('div');
        card.className = 'resume-card card';
        card.innerHTML = `
            <div class="resume-header">
                <h3 class="resume-title">${resume.title}</h3>
                <span class="resume-subject">${resume.subject}</span>
            </div>
            <p class="resume-description">${resume.description}</p>
            <div class="resume-meta">
                <span class="resume-date">
                    <i class="fas fa-calendar"></i>
                    ${StudyHub.Utils.formatDate(resume.createdAt)}
                </span>
                ${resume.tags.length > 0 ? `
                    <div class="resume-tags">
                        ${resume.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="resume-actions">
                <button class="btn btn-secondary" onclick="resumesManager.viewResume('${resume.id}')">
                    <i class="fas fa-eye"></i> Voir
                </button>
                <button class="btn btn-primary" onclick="resumesManager.editResume('${resume.id}')">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="btn btn-error" onclick="resumesManager.deleteResume('${resume.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        return card;
    }

    filterResumes() {
        const subjectFilter = document.getElementById('subject-filter');
        const searchFilter = document.getElementById('search-filter');
        
        const selectedSubject = subjectFilter ? subjectFilter.value : '';
        const searchTerm = searchFilter ? searchFilter.value.toLowerCase() : '';
        
        const filteredResumes = this.resumes.filter(resume => {
            const matchesSubject = !selectedSubject || resume.subject === selectedSubject;
            const matchesSearch = !searchTerm || 
                resume.title.toLowerCase().includes(searchTerm) ||
                resume.description.toLowerCase().includes(searchTerm) ||
                resume.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            
            return matchesSubject && matchesSearch;
        });
        
        this.displayFilteredResumes(filteredResumes);
    }

    displayFilteredResumes(resumes) {
        const resumesGrid = document.getElementById('resumes-grid');
        if (!resumesGrid) return;
        
        resumesGrid.innerHTML = '';
        
        if (resumes.length === 0) {
            resumesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Aucun résumé trouvé</h3>
                    <p>Aucun résumé ne correspond à vos critères de recherche.</p>
                </div>
            `;
            return;
        }
        
        resumes.forEach(resume => {
            const resumeCard = this.createResumeCard(resume);
            resumesGrid.appendChild(resumeCard);
        });
    }

    saveResume() {
        const form = document.getElementById('resume-form');
        const formData = new FormData(form);
        
        const resume = {
            id: StudyHub.Utils.generateId(),
            title: formData.get('title').trim(),
            subject: formData.get('subject'),
            description: formData.get('description').trim(),
            content: formData.get('content').trim(),
            tags: this.getTagsFromForm(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Validation
        if (!resume.title || !resume.subject || !resume.content) {
            StudyHub.NotificationManager.show('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }
        
        // Ajouter aux résumés
        this.resumes.push(resume);
        StudyHub.StorageManager.set('resumes', this.resumes);
        
        // Réinitialiser le formulaire
        form.reset();
        this.clearTags();
        
        // Afficher une notification
        StudyHub.NotificationManager.show('Résumé créé avec succès !', 'success');
        
        // Basculer vers l'onglet de consultation
        this.switchTab('browse');
    }

    getTagsFromForm() {
        const tagInputs = document.querySelectorAll('.tag-input');
        const tags = [];
        tagInputs.forEach(input => {
            const tag = input.value.trim();
            if (tag) tags.push(tag);
        });
        return tags;
    }

    addTagField() {
        const tagsContainer = document.getElementById('tags-container');
        const tagGroup = document.createElement('div');
        tagGroup.className = 'tag-group';
        tagGroup.innerHTML = `
            <input type="text" class="form-input tag-input" placeholder="Tag">
            <button type="button" class="btn btn-error" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        tagsContainer.appendChild(tagGroup);
    }

    clearTags() {
        const tagsContainer = document.getElementById('tags-container');
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
        }
    }

    viewResume(resumeId) {
        const resume = this.resumes.find(r => r.id === resumeId) || 
                      this.importedResumes.find(r => r.id === resumeId);
        
        if (!resume) return;
        
        this.currentResume = resume;
        this.showResumeModal();
    }

    showResumeModal() {
        const modal = document.getElementById('resume-modal');
        if (!modal || !this.currentResume) return;
        
        const resume = this.currentResume;
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${resume.title}</h2>
                    <button class="modal-close" onclick="resumesManager.hideResumeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="resume-info">
                        <p class="resume-subject">
                            <i class="fas fa-book"></i> ${resume.subject}
                        </p>
                        <p class="resume-date">
                            <i class="fas fa-calendar"></i> 
                            Créé le ${StudyHub.Utils.formatDate(resume.createdAt)}
                        </p>
                        ${resume.tags && resume.tags.length > 0 ? `
                            <div class="resume-tags">
                                ${resume.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    
                    ${resume.description ? `
                        <div class="resume-description">
                            <h3>Description</h3>
                            <p>${resume.description}</p>
                        </div>
                    ` : ''}
                    
                    <div class="resume-content">
                        <h3>Contenu</h3>
                        <div class="content-text">${resume.content}</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="resumesManager.exportResume()">
                        <i class="fas fa-download"></i> Exporter
                    </button>
                    ${!resume.isImported ? `
                        <button class="btn btn-primary" onclick="resumesManager.editResume('${resume.id}')">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                    ` : ''}
                    <button class="btn btn-error" onclick="resumesManager.deleteResume('${resume.id}')">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    }

    hideResumeModal() {
        const modal = document.getElementById('resume-modal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentResume = null;
    }

    editResume(resumeId) {
        const resume = this.resumes.find(r => r.id === resumeId);
        if (!resume) return;
        
        // Remplir le formulaire
        const form = document.getElementById('resume-form');
        form.querySelector('[name="title"]').value = resume.title;
        form.querySelector('[name="subject"]').value = resume.subject;
        form.querySelector('[name="description"]').value = resume.description;
        form.querySelector('[name="content"]').value = resume.content;
        
        // Ajouter les tags
        this.clearTags();
        resume.tags.forEach(tag => {
            this.addTagField();
            const lastTagInput = document.querySelector('.tag-input:last-of-type');
            if (lastTagInput) lastTagInput.value = tag;
        });
        
        // Basculer vers l'onglet de création
        this.switchTab('create');
        
        // Marquer comme édition
        form.dataset.editId = resumeId;
    }

    deleteResume(resumeId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce résumé ?')) return;
        
        // Supprimer des résumés manuels
        this.resumes = this.resumes.filter(r => r.id !== resumeId);
        StudyHub.StorageManager.set('resumes', this.resumes);
        
        // Supprimer des résumés importés
        this.importedResumes = this.importedResumes.filter(r => r.id !== resumeId);
        StudyHub.StorageManager.set('imported_resumes', this.importedResumes);
        
        // Fermer le modal si ouvert
        this.hideResumeModal();
        
        // Rafraîchir l'affichage
        this.displayResumes();
        
        StudyHub.NotificationManager.show('Résumé supprimé avec succès', 'success');
    }

    exportResume() {
        if (!this.currentResume) return;
        
        const resume = this.currentResume;
        const content = `
Résumé: ${resume.title}
Matière: ${resume.subject}
Date: ${StudyHub.Utils.formatDate(resume.createdAt)}

${resume.description ? `Description: ${resume.description}\n` : ''}

${resume.content}

${resume.tags && resume.tags.length > 0 ? `Tags: ${resume.tags.join(', ')}` : ''}
        `.trim();
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resume.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        StudyHub.NotificationManager.show('Résumé exporté avec succès', 'success');
    }

    displayImportedResumes() {
        const importedGrid = document.getElementById('imported-resumes-grid');
        if (!importedGrid) return;
        
        importedGrid.innerHTML = '';
        
        if (this.importedResumes.length === 0) {
            importedGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-import"></i>
                    <h3>Aucun résumé importé</h3>
                    <p>Les résumés générés automatiquement à partir de vos fichiers importés apparaîtront ici.</p>
                    <button class="btn btn-primary" onclick="resumesManager.switchTab('browse')">
                        <i class="fas fa-file-alt"></i> Voir tous les résumés
                    </button>
                </div>
            `;
            return;
        }
        
        this.importedResumes.forEach(resume => {
            const resumeCard = this.createImportedResumeCard(resume);
            importedGrid.appendChild(resumeCard);
        });
    }

    createImportedResumeCard(resume) {
        const card = document.createElement('div');
        card.className = 'resume-card card imported';
        card.innerHTML = `
            <div class="resume-header">
                <h3 class="resume-title">${resume.title}</h3>
                <span class="resume-subject">${resume.subject}</span>
                <span class="imported-badge">
                    <i class="fas fa-robot"></i> Généré automatiquement
                </span>
            </div>
            <p class="resume-description">${resume.description}</p>
            <div class="resume-meta">
                <span class="resume-date">
                    <i class="fas fa-calendar"></i>
                    ${StudyHub.Utils.formatDate(resume.createdAt)}
                </span>
                <span class="source-file">
                    <i class="fas fa-file"></i>
                    Source: ${resume.sourceFile}
                </span>
            </div>
            <div class="resume-actions">
                <button class="btn btn-secondary" onclick="resumesManager.viewResume('${resume.id}')">
                    <i class="fas fa-eye"></i> Voir
                </button>
                <button class="btn btn-primary" onclick="resumesManager.exportResume()">
                    <i class="fas fa-download"></i> Exporter
                </button>
            </div>
        `;
        return card;
    }

    // Méthode pour ajouter un résumé importé (appelée depuis import.js)
    addImportedResume(resumeData) {
        const resume = {
            id: StudyHub.Utils.generateId(),
            title: resumeData.title,
            subject: resumeData.subject,
            description: resumeData.description,
            content: resumeData.content,
            sourceFile: resumeData.sourceFile,
            isImported: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.importedResumes.push(resume);
        StudyHub.StorageManager.set('imported_resumes', this.importedResumes);
        
        // Rafraîchir l'affichage si on est sur l'onglet des résumés importés
        if (this.currentTab === 'imported') {
            this.displayImportedResumes();
        }
    }
}

// Initialisation
let resumesManager;

document.addEventListener('DOMContentLoaded', () => {
    resumesManager = new ResumesManager();
});

// Fonctions globales pour les gestionnaires d'événements HTML
window.resumesManager = resumesManager;