# 🎓 Nexora Student

## Présentation du projet
**Nexora Student** est une plateforme web éducative **mobile-first** destinée aux élèves togolais en classe d'examen.

- **Public cible** : élèves préparant le CEPD, BEPC, BAC 1 et BAC 2
- **Optimisation** : pensée pour les smartphones Android avec connexion internet limitée
- **Objectif** : accès facile aux cours, exercices interactifs et sujets d'examens officiels

---

## ✅ Fonctionnalités réalisées

### 📚 Section Cours
- Navigation hiérarchique : Classe → Matière → Chapitre → Leçon
- Affichage du contenu avec rendu Markdown (titres, listes, code, tableaux)
- Informations par leçon : durée, niveau de difficulté, résumé
- Lien vers PDF téléchargeable (prêt pour intégration)

### ✏️ Section Exercices / QCM
- QCM interactifs avec navigation question par question
- Barre de progression visuelle
- Soumission via API REST (`/api/exercices/:id/submit`)
- Corrections détaillées avec explications pédagogiques
- Score automatique avec mention (Excellent, Bien, Assez bien, À revoir)
- Possibilité de recommencer l'exercice

### 📄 Section Sujets d'examen
- Classement par année (2023, 2024) et par matière
- Filtre dynamique par matière (sans rechargement)
- Téléchargement sujet PDF + accès au corrigé
- 18 sujets d'examens officiels pour les 4 classes

### 📤 Fonctionnalité d'Upload
- 3 espaces : **Demander de l'aide**, **Contribuer**, **Espace perso**
- Zone drag & drop pour les fichiers
- Formats acceptés : JPG, PNG, PDF, DOC, DOCX
- Limite : 10 MB par fichier
- Vérification côté serveur (type + taille)
- Retour visuel détaillé après envoi
- Historique des envois (espace perso)

### 🏠 Page d'accueil
- Présentation claire de la plateforme
- Accès rapide aux 4 classes
- Derniers cours et exercices populaires mis en avant
- Sections sujets et upload accessibles directement

---

## 🌐 URLs disponibles

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil |
| `/classe/:id` | Page d'une classe (CEPD, BEPC, BAC1, BAC2) |
| `/cours/:classeId` | Liste des cours d'une classe |
| `/cours/:classeId/:coursId` | Leçon complète |
| `/exercices/:classeId` | Liste des exercices d'une classe |
| `/exercices/:classeId/:exoId` | QCM interactif |
| `/sujets/:classeId` | Sujets d'examen avec filtre par matière |
| `/upload` | Formulaire d'envoi de documents |
| `/api/classes` | API JSON : liste des classes |
| `/api/cours` | API JSON : tous les cours |
| `/api/exercices` | API JSON : tous les exercices |
| `/api/sujets` | API JSON : tous les sujets |
| `/api/exercices/:id/submit` | POST : soumettre un QCM |
| `/api/upload` | POST : envoyer un document |

---

## 🗂️ Architecture des données

### Classes (4)
- **CEPD** – Primaire (5 matières)
- **BEPC** – Collège (7 matières)
- **BAC 1** – Lycée (8 matières)
- **BAC 2** – Lycée (8 matières)

### Contenu
- **6 cours** complets avec contenu Markdown
- **6 exercices QCM** (20+ questions au total)
- **18 sujets d'examen** classés par année

### Stockage
- Données statiques TypeScript (prêt pour migration vers Cloudflare D1)
- Upload géré côté serveur (prêt pour intégration Cloudflare R2 ou Supabase)

---

## 🛠️ Stack technique

| Composant | Technologie |
|-----------|-------------|
| Backend | **Hono** (TypeScript) |
| Build | **Vite** + `@hono/vite-build` |
| Déploiement | **Cloudflare Pages** |
| Styles | **Tailwind CSS** (CDN) |
| Icônes | **FontAwesome** (CDN) |
| Process Manager | **PM2** |

---

## 🚀 Déploiement

### Local (développement)
```bash
npm run build
pm2 start ecosystem.config.cjs
```

### Production (Cloudflare Pages)
```bash
npm run build
npx wrangler pages deploy dist --project-name nexora-student
```

---

## 📋 Prochaines étapes recommandées

1. **Base de données Cloudflare D1** – Migrer les données statiques vers SQLite D1
2. **Stockage R2** – Activer l'upload vers Cloudflare R2 pour les fichiers
3. **Authentification** – Système de comptes élèves (avec Cloudflare Workers ou Clerk)
4. **Mode hors ligne** – Service Worker + Cache API pour la navigation sans internet
5. **Application Android** – PWA ou wrapper React Native
6. **Gamification** – Système de points, badges, classements
7. **IA** – Correction automatique via API OpenAI/Gemini
8. **Abonnement premium** – Intégration Stripe pour le modèle économique

---

**Statut** : ✅ En ligne  
**Dernière mise à jour** : Février 2026
