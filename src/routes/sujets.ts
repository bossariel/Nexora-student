import { layout } from './layout'
import type { Classe } from '../data/classes'
import type { SujetExamen } from '../data/sujets'

export function renderSujets(classe: Classe, sujetsByClasse: SujetExamen[]): string {
  const annees = [...new Set(sujetsByClasse.map(s => s.annee))].sort((a, b) => b.localeCompare(a))
  const matieres = [...new Set(sujetsByClasse.map(s => s.matiere))]

  const content = `
  <div class="mb-4">
    <a href="/classe/${classe.id}" class="text-blue-600 text-sm font-medium">
      <i class="fas fa-arrow-left mr-1"></i> Retour à ${classe.nom}
    </a>
  </div>

  <div class="flex items-center gap-3 mb-5">
    <div class="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl">📄</div>
    <div>
      <h1 class="text-xl font-bold text-gray-800">Sujets d'examen – ${classe.nom}</h1>
      <p class="text-sm text-gray-500">${sujetsByClasse.length} sujets disponibles</p>
    </div>
  </div>

  <!-- Filtre par matière -->
  <div class="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1 scrollbar-hide" id="filters">
    <button onclick="filterByMatiere('all')" id="filter-all" class="filter-btn flex-shrink-0 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
      Toutes
    </button>
    ${matieres.map(m => `
    <button onclick="filterByMatiere('${m}')" id="filter-${m.replace(/\s+/g, '-')}" class="filter-btn flex-shrink-0 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
      ${m}
    </button>
    `).join('')}
  </div>

  <!-- Sujets par année -->
  <div id="sujets-list">
    ${annees.map(annee => `
    <div class="annee-group mb-5">
      <div class="flex items-center gap-2 mb-3">
        <div class="bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full text-sm flex items-center gap-1">
          <i class="fas fa-calendar mr-1"></i>${annee}
        </div>
        <span class="h-px flex-1 bg-gray-200"></span>
        <span class="text-xs text-gray-400">${sujetsByClasse.filter(s => s.annee === annee).length} sujets</span>
      </div>
      ${sujetsByClasse.filter(s => s.annee === annee).map(sujet => `
      <div class="sujet-item bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3" data-matiere="${sujet.matiere}">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📄</div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-gray-800 text-sm">${sujet.titre}</div>
            <div class="text-xs text-gray-500 mt-0.5">${sujet.description}</div>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">${sujet.matiere}</span>
              <span class="text-xs text-gray-400">${sujet.nombrePages} pages</span>
            </div>
          </div>
        </div>
        <div class="flex gap-2 mt-3">
          <a href="${sujet.pdfUrl}" class="flex-1 bg-purple-50 text-purple-700 font-medium py-2 rounded-xl text-xs text-center hover:bg-purple-100 transition">
            <i class="fas fa-download mr-1"></i>Télécharger sujet
          </a>
          <a href="${sujet.corrigeUrl}" class="flex-1 bg-green-50 text-green-700 font-medium py-2 rounded-xl text-xs text-center hover:bg-green-100 transition">
            <i class="fas fa-check-circle mr-1"></i>Voir le corrigé
          </a>
        </div>
      </div>
      `).join('')}
    </div>
    `).join('')}
  </div>

  <!-- Contribuer -->
  <div class="bg-orange-50 border border-orange-200 rounded-2xl p-4 mt-4">
    <div class="flex items-center gap-2 mb-2">
      <i class="fas fa-lightbulb text-orange-500"></i>
      <span class="font-semibold text-orange-700 text-sm">Tu as un sujet manquant ?</span>
    </div>
    <p class="text-xs text-orange-600 mb-3">Partage-le avec la communauté pour aider d'autres élèves !</p>
    <a href="/upload" class="bg-orange-500 text-white font-semibold px-4 py-2 rounded-xl text-sm inline-block hover:bg-orange-600 transition">
      <i class="fas fa-cloud-upload-alt mr-1"></i>Envoyer un sujet
    </a>
  </div>

  <script>
    function filterByMatiere(matiere) {
      const items = document.querySelectorAll('.sujet-item');
      const anneeGroups = document.querySelectorAll('.annee-group');
      
      items.forEach(item => {
        if (matiere === 'all' || item.dataset.matiere === matiere) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });

      // Cacher les groupes d'année vides
      anneeGroups.forEach(group => {
        const visibles = group.querySelectorAll('.sujet-item:not([style*="none"])');
        group.style.display = visibles.length === 0 ? 'none' : '';
      });

      // Mise à jour des boutons
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-purple-600', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-700');
      });
      const activeBtn = matiere === 'all'
        ? document.getElementById('filter-all')
        : document.getElementById('filter-' + matiere.replace(/\\s+/g, '-'));
      if (activeBtn) {
        activeBtn.classList.add('bg-purple-600', 'text-white');
        activeBtn.classList.remove('bg-gray-100', 'text-gray-700');
      }
    }
  </script>
  `

  return layout(`Sujets – ${classe.nom}`, content, 'sujets')
}
