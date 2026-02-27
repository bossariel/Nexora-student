// Données des cours par classe et matière
export const cours = [
  // CEPD - Mathématiques
  {
    id: 'cepd-math-001',
    classeId: 'cepd',
    matiere: 'Mathématiques',
    chapitre: 'Les Nombres',
    titre: 'Les nombres entiers de 0 à 1000',
    resume: 'Dans ce cours, nous allons apprendre à lire, écrire et comparer les nombres entiers de 0 à 1000. Les nombres sont utilisés dans notre vie quotidienne pour compter, mesurer et ordonner les choses.',
    contenu: `## Les nombres entiers de 0 à 1000

### Lire et écrire les nombres
Les nombres s'écrivent avec des chiffres : 0, 1, 2, 3, 4, 5, 6, 7, 8, 9.

**Exemples :**
- 100 : cent
- 250 : deux cent cinquante  
- 999 : neuf cent quatre-vingt-dix-neuf

### Comparer les nombres
Pour comparer deux nombres, on regarde d'abord le nombre de chiffres.
- Le nombre qui a plus de chiffres est le plus grand.

**Exemples :**
- 45 < 120 (deux chiffres < trois chiffres)
- 300 > 299

### Les positions : unités, dizaines, centaines
- **Unités** : chiffre des unités (position 1)
- **Dizaines** : chiffre des dizaines (position 2)
- **Centaines** : chiffre des centaines (position 3)

**Exemple avec 356 :**
- 6 est le chiffre des **unités**
- 5 est le chiffre des **dizaines**
- 3 est le chiffre des **centaines**`,
    pdfUrl: '#',
    duree: '45 min',
    difficulte: 'Facile'
  },
  // CEPD - Français
  {
    id: 'cepd-fr-001',
    classeId: 'cepd',
    matiere: 'Français',
    chapitre: 'Grammaire',
    titre: 'La phrase simple : sujet et prédicat',
    resume: 'Une phrase est un ensemble de mots qui a un sens complet. Elle commence par une majuscule et se termine par un point.',
    contenu: `## La phrase simple

### Définition
Une phrase est un groupe de mots qui exprime une idée complète.

**Caractéristiques d'une phrase :**
- Elle commence par une **majuscule**
- Elle se termine par un **point** (. ! ?)
- Elle a un **sens complet**

### Les parties de la phrase
Toute phrase est formée de deux parties essentielles :

1. **Le sujet** : indique de qui ou de quoi on parle
2. **Le prédicat** (ce qu'on dit du sujet) : contient le verbe

**Exemple :**
> *Les élèves* **étudient leurs leçons.**
- Sujet : *Les élèves*
- Prédicat : *étudient leurs leçons*

### Les types de phrases
- **Déclarative** : affirme ou nie quelque chose → *La classe est propre.*
- **Interrogative** : pose une question → *Est-ce que tu comprends ?*
- **Exclamative** : exprime un sentiment → *Quelle belle journée !*
- **Impérative** : donne un ordre → *Ouvre ton livre !*`,
    pdfUrl: '#',
    duree: '30 min',
    difficulte: 'Facile'
  },
  // BEPC - Mathématiques
  {
    id: 'bepc-math-001',
    classeId: 'bepc',
    matiere: 'Mathématiques',
    chapitre: 'Algèbre',
    titre: 'Les équations du premier degré',
    resume: 'Une équation est une égalité qui contient une ou plusieurs inconnues. Résoudre une équation, c\'est trouver la valeur de l\'inconnue qui rend l\'égalité vraie.',
    contenu: `## Les équations du premier degré à une inconnue

### Définition
Une **équation du premier degré** est une équation de la forme :
> **ax + b = 0** (avec a ≠ 0)

### Résolution
Pour résoudre une équation, on utilise les règles d'équivalence :
- On peut **additionner** ou **soustraire** le même nombre des deux membres
- On peut **multiplier** ou **diviser** les deux membres par le même nombre non nul

**Exemple 1 :** Résoudre 2x + 6 = 0
\`\`\`
2x + 6 = 0
2x = -6        (on soustrait 6 des deux membres)
x = -3         (on divise par 2)
\`\`\`
**Vérification :** 2×(-3) + 6 = -6 + 6 = 0 ✓

### Applications pratiques
Les équations servent à résoudre des problèmes de la vie réelle :
- Calculs de prix
- Partage de quantités
- Problèmes de distance et vitesse`,
    pdfUrl: '#',
    duree: '60 min',
    difficulte: 'Moyen'
  },
  // BEPC - SVT
  {
    id: 'bepc-svt-001',
    classeId: 'bepc',
    matiere: 'SVT',
    chapitre: 'La cellule',
    titre: 'La cellule, unité du vivant',
    resume: 'La cellule est la plus petite unité structurale et fonctionnelle du vivant. Tout être vivant est composé d\'une ou plusieurs cellules.',
    contenu: `## La cellule, unité du vivant

### Définition
La **cellule** est la plus petite unité de base de tous les êtres vivants.

### Les types de cellules
**1. Cellule animale :**
- Membrane cellulaire
- Noyau contenant l'ADN
- Cytoplasme
- Mitochondries

**2. Cellule végétale :**
- Paroi cellulaire (rigide)
- Chloroplastes (photosynthèse)
- Grande vacuole centrale
- Tous les organites de la cellule animale

### Les fonctions de la cellule
- **Nutrition** : absorption et transformation des nutriments
- **Respiration** : production d'énergie (ATP)
- **Reproduction** : division cellulaire
- **Communication** : échanges avec d'autres cellules`,
    pdfUrl: '#',
    duree: '50 min',
    difficulte: 'Moyen'
  },
  // BAC1 - Philosophie
  {
    id: 'bac1-philo-001',
    classeId: 'bac1',
    matiere: 'Philosophie',
    chapitre: 'La conscience',
    titre: 'La conscience et l\'identité personnelle',
    resume: 'La conscience est la faculté de l\'esprit humain à se percevoir lui-même et à percevoir le monde extérieur. Elle est au cœur de la notion d\'identité personnelle.',
    contenu: `## La conscience et l'identité personnelle

### Définition de la conscience
La conscience est la faculté de l'homme à :
- Se connaître lui-même (conscience de soi)
- Percevoir le monde extérieur (conscience du monde)
- Distinguer le bien du mal (conscience morale)

### Descartes et le Cogito
René Descartes dans ses *Méditations Métaphysiques* pose :
> **"Je pense, donc je suis"** (*Cogito ergo sum*)

La pensée est la preuve de l'existence. La conscience est première.

### Locke et l'identité personnelle
Pour John Locke, l'identité personnelle repose sur la **continuité de la conscience** et notamment sur la **mémoire**.

**Question centrale :** Suis-je la même personne qu'il y a 10 ans ?

### Problèmes philosophiques
1. La conscience peut-elle se tromper sur elle-même ?
2. Y a-t-il une conscience inconsciente ? (Freud)
3. L'identité est-elle une construction sociale ?`,
    pdfUrl: '#',
    duree: '75 min',
    difficulte: 'Difficile'
  },
  // BAC2 - Mathématiques
  {
    id: 'bac2-math-001',
    classeId: 'bac2',
    matiere: 'Mathématiques',
    chapitre: 'Analyse',
    titre: 'Les dérivées et leurs applications',
    resume: 'La dérivée d\'une fonction mesure le taux de variation instantané. Elle est fondamentale pour étudier les variations des fonctions.',
    contenu: `## Les dérivées et leurs applications

### Définition
La **dérivée** d'une fonction f en x est :
> f'(x) = lim[h→0] (f(x+h) - f(x)) / h

### Dérivées usuelles
| Fonction f(x) | Dérivée f'(x) |
|--------------|--------------|
| k (constante) | 0 |
| x^n | n·x^(n-1) |
| e^x | e^x |
| ln(x) | 1/x |
| sin(x) | cos(x) |
| cos(x) | -sin(x) |

### Applications
**Signe de la dérivée et variations :**
- f'(x) > 0 ⟹ f est croissante
- f'(x) < 0 ⟹ f est décroissante
- f'(x) = 0 ⟹ point critique (extremum possible)

### Exemple complet
Soit f(x) = x³ - 3x + 2
f'(x) = 3x² - 3 = 3(x²-1) = 3(x-1)(x+1)

- f'(x) = 0 pour x = -1 et x = 1
- Tableau de variations à construire...`,
    pdfUrl: '#',
    duree: '90 min',
    difficulte: 'Difficile'
  }
]

export type Cours = typeof cours[0]
