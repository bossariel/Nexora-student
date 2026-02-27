// Données des classes disponibles
export const classes = [
  {
    id: 'cepd',
    nom: 'CEPD',
    description: 'Certificat d\'Études du Premier Degré',
    niveau: 'Primaire',
    couleur: '#4CAF50',
    icone: '🎒',
    matieres: ['Français', 'Mathématiques', 'Sciences', 'Histoire-Géographie', 'Éducation Civique']
  },
  {
    id: 'bepc',
    nom: 'BEPC',
    description: 'Brevet d\'Études du Premier Cycle',
    niveau: 'Collège',
    couleur: '#2196F3',
    icone: '📚',
    matieres: ['Français', 'Mathématiques', 'Sciences Physiques', 'SVT', 'Histoire-Géographie', 'Anglais', 'Philosophie']
  },
  {
    id: 'bac1',
    nom: 'BAC 1',
    description: 'Baccalauréat - Première Année',
    niveau: 'Lycée',
    couleur: '#FF9800',
    icone: '🎓',
    matieres: ['Français', 'Mathématiques', 'Sciences Physiques', 'SVT', 'Histoire-Géographie', 'Anglais', 'Philosophie', 'Économie']
  },
  {
    id: 'bac2',
    nom: 'BAC 2',
    description: 'Baccalauréat - Terminale',
    niveau: 'Lycée',
    couleur: '#9C27B0',
    icone: '🏆',
    matieres: ['Français', 'Mathématiques', 'Sciences Physiques', 'SVT', 'Histoire-Géographie', 'Anglais', 'Philosophie', 'Économie']
  }
]

export type Classe = typeof classes[0]
