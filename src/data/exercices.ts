// Données des exercices avec QCM
export const exercices = [
  {
    id: 'exo-cepd-math-001',
    classeId: 'cepd',
    matiere: 'Mathématiques',
    titre: 'Comparer les nombres',
    description: 'Testez vos connaissances sur la comparaison des nombres entiers',
    difficulte: 'Facile',
    duree: '10 min',
    points: 100,
    questions: [
      {
        id: 1,
        question: 'Quel est le plus grand nombre parmi ces quatre ?',
        options: ['345', '99', '1001', '287'],
        bonne_reponse: 2,
        explication: '1001 a 4 chiffres alors que les autres n\'en ont que 2 ou 3, il est donc le plus grand.'
      },
      {
        id: 2,
        question: 'Dans le nombre 573, quel est le chiffre des dizaines ?',
        options: ['5', '7', '3', '57'],
        bonne_reponse: 1,
        explication: 'Dans 573 : 3 = unités, 7 = dizaines, 5 = centaines. Le chiffre des dizaines est 7.'
      },
      {
        id: 3,
        question: 'Complète : 450 ... 540',
        options: ['>', '=', '<', '≥'],
        bonne_reponse: 2,
        explication: '450 < 540 car 4 centaines < 5 centaines.'
      },
      {
        id: 4,
        question: 'Comment s\'écrit "huit cent vingt-trois" en chiffres ?',
        options: ['823', '8023', '80023', '8230'],
        bonne_reponse: 0,
        explication: 'Huit cent = 800, vingt-trois = 23, donc 800 + 23 = 823.'
      },
      {
        id: 5,
        question: 'Quel est le chiffre des centaines dans 764 ?',
        options: ['4', '6', '7', '764'],
        bonne_reponse: 2,
        explication: 'Dans 764 : 4 = unités, 6 = dizaines, 7 = centaines.'
      }
    ]
  },
  {
    id: 'exo-cepd-fr-001',
    classeId: 'cepd',
    matiere: 'Français',
    titre: 'Types de phrases',
    description: 'Identifiez les différents types de phrases',
    difficulte: 'Facile',
    duree: '8 min',
    points: 80,
    questions: [
      {
        id: 1,
        question: 'Quel type de phrase est : "Ferme la porte !"',
        options: ['Déclarative', 'Interrogative', 'Exclamative', 'Impérative'],
        bonne_reponse: 3,
        explication: 'Une phrase impérative donne un ordre. "Ferme la porte" est un ordre.'
      },
      {
        id: 2,
        question: 'Quelle est la phrase interrogative ?',
        options: ['Le soleil brille.', 'Quel beau soleil !', 'Est-ce que le soleil brille ?', 'Regarde le soleil.'],
        bonne_reponse: 2,
        explication: 'Une phrase interrogative pose une question. Elle se termine par "?".'
      },
      {
        id: 3,
        question: 'Identifie le sujet dans : "Les enfants jouent au football."',
        options: ['jouent', 'Les enfants', 'au football', 'jouent au football'],
        bonne_reponse: 1,
        explication: 'Le sujet répond à la question "Qui est-ce qui joue ?" → Les enfants.'
      },
      {
        id: 4,
        question: 'Par quoi commence toujours une phrase ?',
        options: ['Un point', 'Une majuscule', 'Un verbe', 'Un nom'],
        bonne_reponse: 1,
        explication: 'Une phrase commence toujours par une majuscule.'
      }
    ]
  },
  {
    id: 'exo-bepc-math-001',
    classeId: 'bepc',
    matiere: 'Mathématiques',
    titre: 'Équations du premier degré',
    description: 'Résolvez des équations du premier degré',
    difficulte: 'Moyen',
    duree: '15 min',
    points: 120,
    questions: [
      {
        id: 1,
        question: 'Quelle est la solution de l\'équation : 2x = 10 ?',
        options: ['x = 20', 'x = 5', 'x = 8', 'x = 12'],
        bonne_reponse: 1,
        explication: '2x = 10, donc x = 10/2 = 5.'
      },
      {
        id: 2,
        question: 'Résoudre : x + 7 = 15',
        options: ['x = 22', 'x = 8', 'x = 105', 'x = 7'],
        bonne_reponse: 1,
        explication: 'x = 15 - 7 = 8.'
      },
      {
        id: 3,
        question: 'Quelle est la solution de : 3x - 6 = 0 ?',
        options: ['x = -2', 'x = 0', 'x = 2', 'x = 18'],
        bonne_reponse: 2,
        explication: '3x = 6, donc x = 6/3 = 2.'
      },
      {
        id: 4,
        question: 'Résoudre : 5x + 3 = 18',
        options: ['x = 4,2', 'x = 3', 'x = 3,5', 'x = 21'],
        bonne_reponse: 1,
        explication: '5x = 18 - 3 = 15, donc x = 15/5 = 3.'
      },
      {
        id: 5,
        question: 'Pour quelle valeur de x a-t-on : 4x = -12 ?',
        options: ['x = 3', 'x = -3', 'x = -48', 'x = 48'],
        bonne_reponse: 1,
        explication: 'x = -12/4 = -3.'
      },
      {
        id: 6,
        question: 'Résoudre : 2(x + 3) = 14',
        options: ['x = 4', 'x = 5,5', 'x = 4', 'x = 8'],
        bonne_reponse: 0,
        explication: '2x + 6 = 14, 2x = 8, x = 4.'
      }
    ]
  },
  {
    id: 'exo-bepc-svt-001',
    classeId: 'bepc',
    matiere: 'SVT',
    titre: 'La cellule vivante',
    description: 'Questions sur la structure et le rôle de la cellule',
    difficulte: 'Moyen',
    duree: '12 min',
    points: 100,
    questions: [
      {
        id: 1,
        question: 'Quel organite est spécifique à la cellule végétale ?',
        options: ['Le noyau', 'Le chloroplaste', 'La mitochondrie', 'Le cytoplasme'],
        bonne_reponse: 1,
        explication: 'Le chloroplaste est présent uniquement dans les cellules végétales. Il permet la photosynthèse.'
      },
      {
        id: 2,
        question: 'Quelle est la fonction de la mitochondrie ?',
        options: ['Photosynthèse', 'Production d\'énergie (ATP)', 'Contenir l\'ADN', 'Protection cellulaire'],
        bonne_reponse: 1,
        explication: 'La mitochondrie est le "centre énergétique" de la cellule. Elle produit de l\'ATP par respiration cellulaire.'
      },
      {
        id: 3,
        question: 'Qu\'est-ce que la membrane cellulaire ?',
        options: ['Une couche rigide en cellulose', 'Une enveloppe souple entourant la cellule', 'Le noyau de la cellule', 'Un organite producteur d\'énergie'],
        bonne_reponse: 1,
        explication: 'La membrane cellulaire est une enveloppe souple et semi-perméable qui délimite la cellule.'
      },
      {
        id: 4,
        question: 'Où se trouve l\'ADN dans une cellule eucaryote ?',
        options: ['Dans les mitochondries uniquement', 'Dans le cytoplasme', 'Dans le noyau', 'Dans les chloroplastes uniquement'],
        bonne_reponse: 2,
        explication: 'Dans les cellules eucaryotes, l\'ADN est principalement contenu dans le noyau.'
      }
    ]
  },
  {
    id: 'exo-bac1-philo-001',
    classeId: 'bac1',
    matiere: 'Philosophie',
    titre: 'La conscience',
    description: 'Questions sur la conscience et l\'identité personnelle',
    difficulte: 'Difficile',
    duree: '20 min',
    points: 150,
    questions: [
      {
        id: 1,
        question: 'Quelle est la formulation exacte du Cogito de Descartes ?',
        options: [
          '"Je suis, donc je pense"',
          '"Je pense, donc je suis"',
          '"Je doute, donc je suis"',
          '"L\'être précède l\'existence"'
        ],
        bonne_reponse: 1,
        explication: 'Le Cogito de Descartes est "Cogito ergo sum" = "Je pense, donc je suis". La pensée prouve l\'existence.'
      },
      {
        id: 2,
        question: 'Pour Locke, l\'identité personnelle repose sur :',
        options: ['Le corps physique', 'La mémoire et la continuité de conscience', 'L\'âme immortelle', 'Le nom de naissance'],
        bonne_reponse: 1,
        explication: 'Selon Locke, c\'est la mémoire qui assure la continuité de l\'identité personnelle dans le temps.'
      },
      {
        id: 3,
        question: 'Quel philosophe a développé la théorie de l\'inconscient ?',
        options: ['Descartes', 'Kant', 'Freud', 'Platon'],
        bonne_reponse: 2,
        explication: 'Sigmund Freud a développé la psychanalyse et la théorie de l\'inconscient.'
      },
      {
        id: 4,
        question: 'La conscience "immédiate" est :',
        options: [
          'La conscience que nous avons du monde extérieur',
          'La conscience réfléchie sur soi-même',
          'Le sentiment spontané d\'exister',
          'La conscience morale'
        ],
        bonne_reponse: 2,
        explication: 'La conscience immédiate (ou préréflexive) est le sentiment brut et spontané d\'exister.'
      },
      {
        id: 5,
        question: 'Qu\'est-ce que la "mauvaise foi" selon Sartre ?',
        options: [
          'Mentir aux autres',
          'Se mentir à soi-même pour fuir sa liberté',
          'Manquer à sa parole',
          'Nier l\'existence de Dieu'
        ],
        bonne_reponse: 1,
        explication: 'La mauvaise foi (Sartre) est un mensonge à soi-même par lequel on refuse d\'assumer sa liberté et sa responsabilité.'
      }
    ]
  },
  {
    id: 'exo-bac2-math-001',
    classeId: 'bac2',
    matiere: 'Mathématiques',
    titre: 'Dérivées et variations',
    description: 'Calculer des dérivées et étudier les variations',
    difficulte: 'Difficile',
    duree: '25 min',
    points: 200,
    questions: [
      {
        id: 1,
        question: 'Quelle est la dérivée de f(x) = x³ ?',
        options: ['f\'(x) = x²', 'f\'(x) = 3x²', 'f\'(x) = 3x', 'f\'(x) = x⁴/4'],
        bonne_reponse: 1,
        explication: 'La dérivée de xⁿ est n·xⁿ⁻¹. Donc (x³)\' = 3x².'
      },
      {
        id: 2,
        question: 'Si f\'(x) > 0 sur un intervalle, alors f est :',
        options: ['Décroissante', 'Constante', 'Croissante', 'Nulle'],
        bonne_reponse: 2,
        explication: 'Quand la dérivée est positive, la fonction est croissante (elle monte).'
      },
      {
        id: 3,
        question: 'Quelle est la dérivée de f(x) = e^x ?',
        options: ['f\'(x) = e^(x-1)', 'f\'(x) = x·e^(x-1)', 'f\'(x) = e^x', 'f\'(x) = ln(x)'],
        bonne_reponse: 2,
        explication: 'La dérivée de e^x est e^x elle-même. C\'est une propriété remarquable.'
      },
      {
        id: 4,
        question: 'La dérivée de f(x) = sin(x) est :',
        options: ['-sin(x)', 'cos(x)', '-cos(x)', 'tan(x)'],
        bonne_reponse: 1,
        explication: '(sin x)\' = cos x. C\'est une formule à connaître absolument.'
      },
      {
        id: 5,
        question: 'Pour f(x) = 2x² - 8x, trouver les x où f\'(x) = 0 :',
        options: ['x = 2', 'x = 4', 'x = 2 et x = -2', 'x = 0'],
        bonne_reponse: 0,
        explication: 'f\'(x) = 4x - 8. f\'(x) = 0 ⟹ 4x = 8 ⟹ x = 2.'
      }
    ]
  }
]

export type Exercice = typeof exercices[0]
export type Question = typeof exercices[0]['questions'][0]
