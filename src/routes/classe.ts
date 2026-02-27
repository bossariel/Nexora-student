import { layout } from './layout'
import type { Classe } from '../data/classes'
import type { Cours } from '../data/cours'
import type { Exercice } from '../data/exercices'
import type { SujetExamen } from '../data/sujets'

export function renderClasse(
  classe: Classe,
  coursByClasse: Cours[],
  exosByClasse: Exercice[],
  sujetsByClasse: SujetExamen[]
): string {
  const matieresCours = [...new Set(coursByClasse.map(c => c.matiere))]
  const matieresSujets = [...new Set(sujetsByClasse.map(s => s.matiere))]

  const content = `
  <!-- Header classe -->
  <div class="rounded-2xl text-white p-5 mb-5 shadow-md" style="background: linear-gradient(135deg, ${classe.couleur}, ${classe.couleur}cc)">
    <a href="/" class="text-white text-opacity-80 text-sm mb-3 block">
      <i class="fas fa-arrow-left mr-1"></i> Retour à l'accueil
    </a>
    <div class="text-4xl mb-2">${classe.icone}</div>
    <h1 class="text-2xl font-bold">${classe.nom}</h1>
    <p class="text-sm opacity-80 mt-1">${classe.description} • ${classe.niveau}</p>
    <div class="flex gap-2 mt-3 flex-wrap">
      <span class="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">${coursByClasse.length} cours</span>
      <span class="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">${exosByClasse.length} exercices</span>
      <span class="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">${sujetsByClasse.length} sujets</span>
    </div>
  </div>

  <!-- Navigation rapide -->
  <div class="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1 scrollbar-hide">
    <button onclick="showSection('cours')" id="btn-cours" class="section-btn flex-shrink-0 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
      <i class="fas fa-book-open mr-1"></i>Cours
    </button>
    <button onclick="showSection('exercices')" id="btn-exercices" class="section-btn flex-shrink-0 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition hover:bg-gray-200">
      <i class="fas fa-pencil-alt mr-1"></i>Exercices
    </button>
    <button onclick="showSection('sujets')" id="btn-sujets" class="section-btn flex-shrink-0 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition hover:bg-gray-200">
      <i class="fas fa-file-alt mr-1"></i>Sujets
    </button>
  </div>

  <!-- Section Cours -->
  <div id="section-cours">
    <h2 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
      <i class="fas fa-book-open text-blue-600"></i> Cours disponibles
    </h2>
    ${matieresCours.length === 0 ? `
      <div class="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
        <i class="fas fa-book text-3xl mb-2 opacity-30"></i>
        <p>Cours en cours d'ajout…</p>
      </div>
    ` : matieresCours.map(matiere => {
      const coursDeMat = coursByClasse.filter(c => c.matiere === matiere)
      return `
      <div class="mb-4">
        <div class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
          <span class="h-px flex-1 bg-gray-200"></span>${matiere}<span class="h-px flex-1 bg-gray-200"></span>
        </div>
        ${coursDeMat.map(co => `
        <a href="/cours/${classe.id}/${co.id}" class="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:border-blue-200 transition flex items-center gap-3 mb-2 no-underline">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style="background:${classe.couleur}20">📖</div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-gray-800 text-sm">${co.chapitre}</div>
            <div class="text-xs text-gray-600 truncate">${co.titre}</div>
            <div class="text-xs text-gray-400 mt-0.5"><i class="fas fa-clock mr-1"></i>${co.duree}</div>
          </div>
          <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${co.difficulte === 'Facile' ? 'bg-green-100 text-green-700' : co.difficulte === 'Moyen' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}">${co.difficulte}</span>
        </a>
        `).join('')}
      </div>`
    }).join('')}
  </div>

  <!-- Section Exercices -->
  <div id="section-exercices" class="hidden">
    <h2 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
      <i class="fas fa-pencil-alt text-green-600"></i> Exercices & QCM
    </h2>
    ${exosByClasse.length === 0 ? `
      <div class="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
        <i class="fas fa-pencil-alt text-3xl mb-2 opacity-30"></i>
        <p>Exercices en cours d'ajout…</p>
      </div>
    ` : exosByClasse.map(ex => `
      <a href="/exercices/${classe.id}/${ex.id}" class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-200 transition block mb-3 no-underline">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">✏️</div>
          <div class="flex-1">
            <div class="font-semibold text-gray-800">${ex.titre}</div>
            <div class="text-sm text-gray-500 mt-0.5">${ex.matiere}</div>
            <div class="text-xs text-gray-400 mt-1">${ex.description}</div>
            <div class="flex gap-3 mt-2">
              <span class="text-xs text-gray-500"><i class="fas fa-question-circle mr-1"></i>${ex.questions.length} questions</span>
              <span class="text-xs text-gray-500"><i class="fas fa-clock mr-1"></i>${ex.duree}</span>
              <span class="text-xs font-bold text-green-600">${ex.points} pts</span>
            </div>
          </div>
          <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0 mt-1 ${ex.difficulte === 'Facile' ? 'bg-green-100 text-green-700' : ex.difficulte === 'Moyen' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}">${ex.difficulte}</span>
        </div>
      </a>
    `).join('')}
  </div>

  <!-- Section Sujets -->
  <div id="section-sujets" class="hidden">
    <h2 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
      <i class="fas fa-file-alt text-purple-600"></i> Sujets d'examen
    </h2>
    ${sujetsByClasse.length === 0 ? `
      <div class="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
        <i class="fas fa-file-alt text-3xl mb-2 opacity-30"></i>
        <p>Sujets en cours d'ajout…</p>
      </div>
    ` : matieresSujets.map(matiere => {
      const sujetsDeMat = sujetsByClasse.filter(s => s.matiere === matiere)
      return `
      <div class="mb-4">
        <div class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
          <span class="h-px flex-1 bg-gray-200"></span>${matiere}<span class="h-px flex-1 bg-gray-200"></span>
        </div>
        ${sujetsDeMat.map(s => `
        <div class="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 mb-2">
          <div class="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📄</div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-gray-800 text-sm">${s.titre}</div>
            <div class="text-xs text-gray-500 mt-0.5">${s.annee} • ${s.nombrePages} pages</div>
          </div>
          <div class="flex flex-col gap-1">
            <a href="${s.pdfUrl}" class="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-lg hover:bg-purple-100 transition text-center">
              <i class="fas fa-download mr-1"></i>Sujet
            </a>
            ${s.corrigeUrl !== '#' ? `<a href="${s.corrigeUrl}" class="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg hover:bg-green-100 transition text-center"><i class="fas fa-check mr-1"></i>Corrigé</a>` : ''}
          </div>
        </div>
        `).join('')}
      </div>`
    }).join('')}
  </div>

  <script>
    function showSection(name) {
      ['cours', 'exercices', 'sujets'].forEach(s => {
        const el = document.getElementById('section-' + s)
        const btn = document.getElementById('btn-' + s)
        if (s === name) {
          el.classList.remove('hidden')
          btn.classList.add('bg-blue-600', 'text-white')
          btn.classList.remove('bg-gray-100', 'text-gray-700')
        } else {
          el.classList.add('hidden')
          btn.classList.remove('bg-blue-600', 'text-white')
          btn.classList.add('bg-gray-100', 'text-gray-700')
        }
      })
    }
  </script>
  `

  return layout(`${classe.nom} – Classe`, content, '')
}
