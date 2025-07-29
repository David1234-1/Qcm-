/**
 * Gestionnaire des résumés
 * Gère la création, l'affichage et la gestion des résumés
 */
class ResumesManager {
    constructor() {
        this.currentTab = 'browse';
        this.currentResume = null;
        this.filteredResumes = [];
        this.init();
    }

    init() {
        this.loadSubjects();
        this.setupEventListeners();
        this.loadResumes();
        this.updateStats();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Search and filter
        const searchInput = document.getElementById('resume-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterResumes();
            });
        }

        const subjectFilter = document.getElementById('subject-filter');
        if (subjectFilter) {
            subjectFilter.addEventListener('change', () => {
                this.filterResumes();
            });
        }

        // Modal events
        const modal = document.getElementById('resume-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideResumeModal();
                }
            });
        }
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        // Load content based on tab
        switch (tabName) {
            case 'browse':
                this.loadResumes();
                break;
            case 'create':
                this.loadSubjects();
                break;
            case 'imported':
                this.loadImportedResumes();
                break;
        }
    }

    loadSubjects() {
        const subjects = StudyHub.StorageManager.get('subjects') || [];
        const subjectSelects = document.querySelectorAll('.subject-select');
        
        subjectSelects.forEach(select => {
            select.innerHTML = '<option value="">Sélectionner une matière</option>';
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                select.appendChild(option);
            });
        });
    }

    loadResumes() {
        const resumes = StudyHub.StorageManager.get('resumes') || [];
        this.filteredResumes = [...resumes];
        this.displayResumes();
    }

    displayResumes() {
        const container = document.getElementById('resumes-grid');
        if (!container) return;

        container.innerHTML = '';

        if (this.filteredResumes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt empty-icon"></i>
                    <h3>Aucun résumé trouvé</h3>
                    <p>Créez votre premier résumé ou importez des fichiers pour générer des résumés automatiquement.</p>
                </div>
            `;
            return;
        }

        this.filteredResumes.forEach(resume => {
            const card = this.createResumeCard(resume);
            container.appendChild(card);
        });
    }

    createResumeCard(resume) {
        const card = document.createElement('div');
        card.className = 'resume-card';
        card.innerHTML = `
            <div class="resume-header">
                <h3 class="resume-title">${StudyHub.Utils.sanitizeHTML(resume.title)}</h3>
                <span class="resume-subject">${StudyHub.Utils.sanitizeHTML(resume.subject)}</span>
            </div>
            <p class="resume-description">${StudyHub.Utils.sanitizeHTML(resume.description)}</p>
            <div class="resume-meta">
                <span class="resume-date">
                    <i class="fas fa-calendar"></i>
                    ${StudyHub.Utils.formatDate(resume.createdAt)}
                </span>
                <span class="resume-type ${resume.type}">
                    <i class="fas ${resume.type === 'imported' ? 'fa-file-import' : 'fa-edit'}"></i>
                    ${resume.type === 'imported' ? 'Importé' : 'Manuel'}
                </span>
            </div>
            <div class="resume-actions">
                <button class="btn btn-primary" onclick="resumesManager.viewResume('${resume.id}')">
                    <i class="fas fa-eye"></i> Voir
                </button>
                <button class="btn btn-secondary" onclick="resumesManager.editResume('${resume.id}')">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="btn btn-error" onclick="resumesManager.deleteResume('${resume.id}')">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </div>
        `;
        return card;
    }

    filterResumes() {
        const searchTerm = document.getElementById('resume-search')?.value.toLowerCase() || '';
        const subjectFilter = document.getElementById('subject-filter')?.value || '';
        const resumes = StudyHub.StorageManager.get('resumes') || [];

        this.filteredResumes = resumes.filter(resume => {
            const matchesSearch = resume.title.toLowerCase().includes(searchTerm) ||
                                resume.description.toLowerCase().includes(searchTerm) ||
                                resume.content.toLowerCase().includes(searchTerm);
            const matchesSubject = !subjectFilter || resume.subject === subjectFilter;
            return matchesSearch && matchesSubject;
        });

        this.displayResumes();
    }

    addResumeField() {
        const container = document.getElementById('resume-fields');
        const fieldCount = container.children.length;
        
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'resume-field';
        fieldDiv.innerHTML = `
            <div class="field-header">
                <h4>Section ${fieldCount + 1}</h4>
                <button type="button" class="btn btn-error btn-sm" onclick="resumesManager.removeResumeField(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="form-group">
                <label class="form-label">Titre de la section</label>
                <input type="text" class="form-input" name="section_title_${fieldCount}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Contenu</label>
                <textarea class="form-textarea" name="section_content_${fieldCount}" rows="4" required></textarea>
            </div>
        `;
        
        container.appendChild(fieldDiv);
        this.updateResumeNumbers();
    }

    removeResumeField(button) {
        button.closest('.resume-field').remove();
        this.updateResumeNumbers();
    }

    updateResumeNumbers() {
        const fields = document.querySelectorAll('.resume-field');
        fields.forEach((field, index) => {
            const header = field.querySelector('.field-header h4');
            header.textContent = `Section ${index + 1}`;
            
            const inputs = field.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                const name = input.name.split('_');
                name[name.length - 1] = index;
                input.name = name.join('_');
            });
        });
    }

    saveResume() {
        const form = document.getElementById('resume-form');
        const formData = new FormData(form);

        // Validate required fields
        const title = formData.get('title').trim();
        const subject = formData.get('subject');
        const description = formData.get('description').trim();

        if (!title || !subject || !description) {
            StudyHub.NotificationManager.show('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        // Collect sections
        const sections = [];
        const fields = document.querySelectorAll('.resume-field');
        fields.forEach(field => {
            const sectionTitle = field.querySelector('input[type="text"]').value.trim();
            const sectionContent = field.querySelector('textarea').value.trim();
            
            if (sectionTitle && sectionContent) {
                sections.push({
                    title: sectionTitle,
                    content: sectionContent
                });
            }
        });

        if (sections.length === 0) {
            StudyHub.NotificationManager.show('Veuillez ajouter au moins une section', 'error');
            return;
        }

        // Create resume object
        const resume = {
            id: StudyHub.Utils.generateId(),
            title: title,
            subject: subject,
            description: description,
            content: sections,
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
            type: 'manual',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Save to localStorage
        const resumes = StudyHub.StorageManager.get('resumes') || [];
        resumes.push(resume);
        StudyHub.StorageManager.set('resumes', resumes);

        // Reset form
        form.reset();
        document.getElementById('resume-fields').innerHTML = '';
        this.addResumeField(); // Add one default field

        StudyHub.NotificationManager.show('Résumé créé avec succès !', 'success');
        this.updateStats();
    }

    viewResume(id) {
        const resumes = StudyHub.StorageManager.get('resumes') || [];
        const resume = resumes.find(r => r.id === id);
        
        if (!resume) {
            StudyHub.NotificationManager.show('Résumé non trouvé', 'error');
            return;
        }

        this.currentResume = resume;
        this.showResumeModal();
    }

    showResumeModal() {
        const modal = document.getElementById('resume-modal');
        const content = document.getElementById('resume-modal-content');
        
        if (!modal || !content) return;

        content.innerHTML = `
            <div class="modal-header">
                <h2>${StudyHub.Utils.sanitizeHTML(this.currentResume.title)}</h2>
                <button class="modal-close" onclick="resumesManager.hideResumeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="resume-info">
                    <div class="info-item">
                        <strong>Matière:</strong> ${StudyHub.Utils.sanitizeHTML(this.currentResume.subject)}
                    </div>
                    <div class="info-item">
                        <strong>Description:</strong> ${StudyHub.Utils.sanitizeHTML(this.currentResume.description)}
                    </div>
                    <div class="info-item">
                        <strong>Créé le:</strong> ${StudyHub.Utils.formatDate(this.currentResume.createdAt)}
                    </div>
                    ${this.currentResume.tags.length > 0 ? `
                        <div class="info-item">
                            <strong>Tags:</strong>
                            <div class="tags">
                                ${this.currentResume.tags.map(tag => 
                                    `<span class="tag">${StudyHub.Utils.sanitizeHTML(tag)}</span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="resume-content">
                    <h3>Contenu</h3>
                    ${this.currentResume.content.map(section => `
                        <div class="content-section">
                            <h4>${StudyHub.Utils.sanitizeHTML(section.title)}</h4>
                            <p>${StudyHub.Utils.sanitizeHTML(section.content)}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="resumesManager.editResume('${this.currentResume.id}')">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="btn btn-primary" onclick="resumesManager.exportResume('${this.currentResume.id}')">
                    <i class="fas fa-download"></i> Exporter
                </button>
                <button class="btn btn-error" onclick="resumesManager.deleteResume('${this.currentResume.id}')">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
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

    editResume(id) {
        // For now, just show a notification
        // In a full implementation, this would populate the create form with existing data
        StudyHub.NotificationManager.show('Fonctionnalité de modification à venir', 'info');
    }

    deleteResume(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce résumé ?')) {
            return;
        }

        const resumes = StudyHub.StorageManager.get('resumes') || [];
        const updatedResumes = resumes.filter(r => r.id !== id);
        StudyHub.StorageManager.set('resumes', updatedResumes);

        if (this.currentResume && this.currentResume.id === id) {
            this.hideResumeModal();
        }

        this.loadResumes();
        this.updateStats();
        StudyHub.NotificationManager.show('Résumé supprimé avec succès', 'success');
    }

    exportResume(id) {
        const resumes = StudyHub.StorageManager.get('resumes') || [];
        const resume = resumes.find(r => r.id === id);
        
        if (!resume) {
            StudyHub.NotificationManager.show('Résumé non trouvé', 'error');
            return;
        }

        // Create export content
        let exportContent = `RÉSUMÉ: ${resume.title}\n`;
        exportContent += `Matière: ${resume.subject}\n`;
        exportContent += `Description: ${resume.description}\n`;
        exportContent += `Créé le: ${StudyHub.Utils.formatDate(resume.createdAt)}\n\n`;
        
        resume.content.forEach(section => {
            exportContent += `${section.title.toUpperCase()}\n`;
            exportContent += `${section.content}\n\n`;
        });

        // Create and download file
        const blob = new Blob([exportContent], { type: 'text/plain' });
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

    loadImportedResumes() {
        const resumes = StudyHub.StorageManager.get('resumes') || [];
        const importedResumes = resumes.filter(r => r.type === 'imported');
        
        const container = document.getElementById('imported-resumes');
        if (!container) return;

        if (importedResumes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-import empty-icon"></i>
                    <h3>Aucun résumé importé</h3>
                    <p>Importez des fichiers PDF ou Word pour générer automatiquement des résumés.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="imported-resumes-grid">
                ${importedResumes.map(resume => `
                    <div class="imported-resume-card">
                        <div class="resume-header">
                            <h3>${StudyHub.Utils.sanitizeHTML(resume.title)}</h3>
                            <span class="resume-subject">${StudyHub.Utils.sanitizeHTML(resume.subject)}</span>
                        </div>
                        <p class="resume-description">${StudyHub.Utils.sanitizeHTML(resume.description)}</p>
                        <div class="resume-meta">
                            <span class="resume-date">
                                <i class="fas fa-calendar"></i>
                                ${StudyHub.Utils.formatDate(resume.createdAt)}
                            </span>
                            <span class="resume-source">
                                <i class="fas fa-file"></i>
                                ${StudyHub.Utils.sanitizeHTML(resume.sourceFile || 'Fichier importé')}
                            </span>
                        </div>
                        <div class="resume-actions">
                            <button class="btn btn-primary" onclick="resumesManager.viewResume('${resume.id}')">
                                <i class="fas fa-eye"></i> Voir
                            </button>
                            <button class="btn btn-secondary" onclick="resumesManager.exportResume('${resume.id}')">
                                <i class="fas fa-download"></i> Exporter
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateStats() {
        const resumes = StudyHub.StorageManager.get('resumes') || [];
        const totalResumes = resumes.length;
        const manualResumes = resumes.filter(r => r.type === 'manual').length;
        const importedResumes = resumes.filter(r => r.type === 'imported').length;
        
        // Update stats display
        const statsContainer = document.getElementById('resume-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="stat-content">
                            <h3>${totalResumes}</h3>
                            <p>Total des résumés</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-edit"></i>
                        </div>
                        <div class="stat-content">
                            <h3>${manualResumes}</h3>
                            <p>Résumés manuels</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-file-import"></i>
                        </div>
                        <div class="stat-content">
                            <h3>${importedResumes}</h3>
                            <p>Résumés importés</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.resumesManager = new ResumesManager();
});

// Global functions for HTML event handlers
window.addResumeField = () => window.resumesManager?.addResumeField();
window.saveResume = () => window.resumesManager?.saveResume();
window.viewResume = (id) => window.resumesManager?.viewResume(id);
window.editResume = (id) => window.resumesManager?.editResume(id);
window.deleteResume = (id) => window.resumesManager?.deleteResume(id);
window.exportResume = (id) => window.resumesManager?.exportResume(id);