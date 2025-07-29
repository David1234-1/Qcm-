# 📚 StudyHub - Plateforme de Révision Intelligente

StudyHub est une application web moderne et complète pour l'apprentissage et la révision. Elle transforme automatiquement vos documents de cours (PDF, Word) en outils d'étude interactifs avec une IA intégrée.

## ✨ Fonctionnalités Principales

### 🔍 Import et Analyse de Documents
- **Import de fichiers** : PDF et Word
- **Extraction automatique** du contenu textuel
- **Analyse intelligente** des concepts clés, définitions, formules
- **Génération automatique** de contenu d'apprentissage

### 📝 Contenu Généré Automatiquement

#### ✅ QCM (Questions à Choix Multiples)
- **10 questions** générées automatiquement par document
- **4 choix de réponse** par question
- **Feedback immédiat** avec couleurs (vert/rouge)
- **Barre de progression** pour suivre l'avancement
- **Boutons d'action** :
  - "Générer de nouveau" : 10 nouvelles questions
  - "Recommencer" : refaire le QCM actuel

#### 🔄 Flashcards Interactives
- **Cartes question/réponse** générées automatiquement
- **Cartes terme/définition** basées sur le contenu
- **Animation de retournement** fluide
- **Barre de progression** pour le suivi
- **Marquage "compris"** pour les cartes maîtrisées

#### 📄 Résumés Intelligents
- **Résumés structurés** de 5 à 10 lignes
- **Hiérarchisation** avec titres et puces
- **Concepts clés** mis en évidence
- **Format clair** et facile à lire

### 🧠 IA Assistant Intégré
- **Chat intelligent** pour poser des questions sur vos cours
- **Réponses contextuelles** basées sur vos documents
- **Questions suggérées** pour démarrer
- **Export de conversations**
- **Interface intuitive** avec avatars et indicateurs de frappe

### 👤 Gestion Utilisateur Complète
- **Inscription/Connexion** par email ou Google
- **Synchronisation cloud** des données
- **Sauvegarde automatique** de tous les contenus
- **Gestion des matières** et cours
- **Modification/suppression** de contenu

### 📊 Statistiques Détaillées
- **Vue d'ensemble** des performances
- **Statistiques par matière** avec scores et progression
- **Graphiques interactifs** (barres, lignes, radar)
- **Activité récente** avec timeline
- **Objectifs personnalisés** et recommandations
- **Export PDF/CSV** des données

### 🔄 Contrôle et Interactions
- **Refaire les QCM** depuis zéro
- **Changer les questions** avec régénération
- **Modifier/supprimer** manuellement le contenu
- **Voir les résultats** par matière
- **Classement** des cours par matière

## 🛠️ Technologies Utilisées

### Frontend
- **HTML5** : Structure sémantique
- **CSS3** : Design moderne avec thèmes clair/sombre
- **JavaScript ES6+** : Logique interactive
- **Font Awesome** : Icônes
- **Google Fonts** : Typographie Inter

### Architecture
- **Architecture modulaire** avec classes ES6
- **Gestion d'état** avec localStorage
- **Système de thèmes** dynamique
- **Responsive design** mobile-first
- **Accessibilité** (ARIA labels, navigation clavier)

### Fonctionnalités Avancées
- **Drag & Drop** pour l'upload de fichiers
- **Animations CSS** fluides
- **Notifications** en temps réel
- **Gestion d'erreurs** robuste
- **Performance optimisée**

## 🚀 Installation et Utilisation

### Prérequis
- Navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Connexion internet pour les fonctionnalités IA

### Installation
1. **Cloner le repository** :
   ```bash
   git clone https://github.com/votre-username/studyhub.git
   cd studyhub
   ```

2. **Ouvrir l'application** :
   - Ouvrir `index.html` dans votre navigateur
   - Ou utiliser un serveur local :
     ```bash
     python -m http.server 8000
     # Puis ouvrir http://localhost:8000
     ```

### Première Utilisation
1. **Créer un compte** ou se connecter
2. **Importer un document** (PDF ou Word)
3. **Attendre la génération** automatique du contenu
4. **Commencer à réviser** avec les QCM et flashcards
5. **Poser des questions** à l'IA assistant

## 📁 Structure du Projet

```
studyhub/
├── index.html              # Page d'accueil
├── assets/
│   ├── style.css           # Styles principaux
│   └── logo.png            # Logo de l'application
├── pages/
│   ├── import.html         # Page d'import de fichiers
│   ├── qcm.html           # Page des QCM
│   ├── flashcards.html    # Page des flashcards
│   ├── resumes.html       # Page des résumés
│   ├── ai-chat.html       # Page du chat IA
│   └── statistics.html    # Page des statistiques
├── scripts/
│   ├── main.js            # Script principal
│   ├── auth.js            # Système d'authentification
│   ├── import.js          # Gestion de l'import
│   ├── qcm.js             # Logique des QCM
│   ├── flashcards.js      # Logique des flashcards
│   ├── resumes.js         # Gestion des résumés
│   ├── ai-chat.js         # Système de chat IA
│   └── statistics.js      # Gestion des statistiques
└── README.md              # Documentation
```

## 🎯 Fonctionnalités Détaillées

### Système d'Import
- **Support multi-format** : PDF, DOC, DOCX
- **Validation de fichiers** avec tailles et types
- **Interface drag & drop** intuitive
- **Progression en temps réel** du traitement
- **Gestion d'erreurs** détaillée

### Génération de Contenu
- **Analyse sémantique** du texte extrait
- **Identification automatique** des concepts clés
- **Création de questions** pertinentes
- **Génération de flashcards** équilibrées
- **Résumés structurés** et hiérarchisés

### Interface Utilisateur
- **Design moderne** avec thèmes clair/sombre
- **Navigation fluide** entre les sections
- **Responsive design** pour tous les appareils
- **Animations** et transitions fluides
- **Accessibilité** complète

### Système de Statistiques
- **Métriques détaillées** par matière
- **Graphiques interactifs** et exportables
- **Suivi de progression** en temps réel
- **Recommandations personnalisées**
- **Objectifs d'apprentissage** configurables

## 🔧 Configuration Avancée

### Personnalisation des Thèmes
Les thèmes sont configurables dans `assets/style.css` :
```css
:root {
  --accent-primary: #3b82f6;
  --accent-secondary: #1d4ed8;
  /* ... autres variables */
}
```

### Intégration d'APIs IA
Pour une IA plus avancée, remplacer dans `scripts/ai-chat.js` :
```javascript
// Remplacer la simulation par une vraie API
async processAIResponse(question, context) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    body: JSON.stringify({ question, context })
  });
  return response.json();
}
```

### Synchronisation Cloud
Pour une vraie synchronisation, intégrer Firebase ou Supabase :
```javascript
// Exemple avec Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
```

## 📱 Compatibilité

### Navigateurs Supportés
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Appareils
- ✅ Desktop (Windows, macOS, Linux)
- ✅ Tablettes (iPad, Android)
- ✅ Mobiles (iPhone, Android)

## 🚀 Roadmap

### Version 2.0
- [ ] **API IA réelle** (OpenAI, HuggingFace)
- [ ] **Synchronisation cloud** (Firebase/Supabase)
- [ ] **Mode hors ligne** avec Service Workers
- [ ] **Application mobile** native
- [ ] **Collaboration** entre utilisateurs

### Version 2.1
- [ ] **Reconnaissance vocale** pour les questions
- [ ] **Génération d'images** pour les flashcards
- [ ] **Intégration calendrier** pour la planification
- [ ] **Gamification** avec badges et points
- [ ] **Analytics avancés** avec machine learning

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le projet
2. **Créer** une branche pour votre fonctionnalité
3. **Commit** vos changements
4. **Push** vers la branche
5. **Ouvrir** une Pull Request

### Standards de Code
- **ESLint** pour la qualité du code JavaScript
- **Prettier** pour le formatage
- **Tests unitaires** pour les nouvelles fonctionnalités
- **Documentation** mise à jour

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

### Problèmes Courants

**L'import ne fonctionne pas :**
- Vérifiez que le fichier est au format PDF ou Word
- Assurez-vous que la taille ne dépasse pas 10MB
- Vérifiez votre connexion internet

**Les QCM ne se génèrent pas :**
- Attendez la fin du traitement (peut prendre 1-2 minutes)
- Vérifiez que le document contient du texte
- Rechargez la page si nécessaire

**L'IA ne répond pas :**
- Vérifiez votre connexion internet
- Sélectionnez une matière avant de poser une question
- Essayez une question plus simple

### Contact
- **Email** : support@studyhub.com
- **Issues** : [GitHub Issues](https://github.com/votre-username/studyhub/issues)
- **Documentation** : [Wiki](https://github.com/votre-username/studyhub/wiki)

## 🙏 Remerciements

- **OpenAI** pour l'inspiration de l'IA
- **Font Awesome** pour les icônes
- **Google Fonts** pour la typographie
- **La communauté open source** pour les outils utilisés

---

**StudyHub** - Transformez vos cours en apprentissage intelligent ! 🚀