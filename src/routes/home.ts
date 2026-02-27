import { layout } from './layout'
import type { Classe } from '../data/classes'
import type { Cours } from '../data/cours'
import type { Exercice } from '../data/exercices'

export function renderHome(classes: Classe[], tousLesCours: Cours[], tousLesExos: Exercice[]): string {
  const derniersExos = tousLesExos.slice(0, 3)
  const coursFeatured = tousLesCours.slice(0, 3)

  const content = `
  <!-- Hero Banner -->
  <div class="bg-gradient-to-br from-blue-600 to-blue-900 text-white rounded-2xl p-6 mb-6 shadow-md">
    <div class="flex items-center gap-2 mb-2">
      <span class="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs font-medium">📱 Mobile-First</span>
      <span class="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs font-medium">🇹🇬 Togo</span>
    </div>
    <h1 class="text-2xl font-bold mb-1">Bienvenue sur<br><span class="text-blue-200">Nexora Student</span></h1>
    <p class="text-blue-100 text-sm mb-4">Ta plateforme de révision pour réussir tes examens : CEPD, BEPC, BAC 1 &amp; BAC 2</p>
    <div class="flex gap-3">
      <a href="#classes" class="bg-white text-blue-700 font-semibold px-4 py-2 rounded-xl text-sm shadow hover:shadow-md transition">
        <i class="fas fa-play mr-1"></i>Commencer
      </a>
      <a href="#exercices" class="bg-blue-500 bg-opacity-50 text-white px-4 py-2 rounded-xl text-sm border border-white border-opacity-30 hover:bg-opacity-70 transition">
        <i class="fas fa-pencil-alt mr-1"></i>Exercices
      </a>
    </div>
  </div>

  <!-- Stats rapides -->
  <div class="grid grid-cols-3 gap-3 mb-6">
    <div class="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
      <div class="text-2xl font-bold text-blue-600">${tousLesCours.length}</div>
      <div class="text-xs text-gray-500 mt-0.5">Cours</div>
    </div>
    <div class="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
      <div class="text-2xl font-bold text-green-600">${tousLesExos.length}</div>
      <div class="text-xs text-gray-500 mt-0.5">Exercices</div>
    </div>
    <div class="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
      <div class="text-2xl font-bold text-purple-600">4</div>
      <div class="text-xs text-gray-500 mt-0.5">Classes</div>
    </div>
  </div>

  <!-- Choisir sa classe -->
  <section id="classes" class="mb-6">
    <h2 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
      <i class="fas fa-layer-group text-blue-600"></i> Choisir ta classe
    </h2>
    <div class="grid grid-cols-2 gap-3">
      ${classes.map(cl => `
      <a href="/classe/${cl.id}" class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition block no-underline">
        <div class="text-3xl mb-2">${cl.icone}</div>
        <div class="font-bold text-gray-800 text-base">${cl.nom}</div>
        <div class="text-xs text-gray-500 mt-0.5">${cl.niveau}</div>
        <div class="mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full inline-block">${cl.matieres.length} matières</div>
      </a>
      `).join('')}
    </div>
  </section>

  <!-- Cours récents -->
  <section id="cours" class="mb-6">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
        <i class="fas fa-book-open text-blue-600"></i> Cours récents
      </h2>
    </div>
    <div class="space-y-2">
      ${coursFeatured.map(co => {
        const classe = classes.find(cl => cl.id === co.classeId)
        return `
        <a href="/cours/${co.classeId}/${co.id}" class="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:border-blue-200 transition flex items-center gap-3 no-underline">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style="background:${classe?.couleur}20">
            📖
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-gray-800 text-sm truncate">${co.titre}</div>
            <div class="text-xs text-gray-500">${classe?.nom} • ${co.matiere}</div>
          </div>
          <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${co.difficulte === 'Facile' ? 'bg-green-100 text-green-700' : co.difficulte === 'Moyen' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}">${co.difficulte}</span>
        </a>`
      }).join('')}
    </div>
    <a href="#classes" class="mt-3 block text-center text-blue-600 text-sm font-medium py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
      Voir tous les cours <i class="fas fa-arrow-right ml-1"></i>
    </a>
  </section>

  <!-- Exercices populaires -->
  <section id="exercices" class="mb-6">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
        <i class="fas fa-pencil-alt text-green-600"></i> Exercices populaires
      </h2>
    </div>
    <div class="space-y-2">
      ${derniersExos.map(ex => {
        const classe = classes.find(cl => cl.id === ex.classeId)
        return `
        <a href="/exercices/${ex.classeId}/${ex.id}" class="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:border-green-200 transition flex items-center gap-3 no-underline">
          <div class="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">✏️</div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-gray-800 text-sm truncate">${ex.titre}</div>
            <div class="text-xs text-gray-500">${classe?.nom} • ${ex.matiere} • ${ex.questions.length} questions</div>
          </div>
          <div class="flex-shrink-0 text-right">
            <div class="text-xs font-bold text-green-600">${ex.points} pts</div>
            <div class="text-xs text-gray-400">${ex.duree}</div>
          </div>
        </a>`
      }).join('')}
    </div>
    <a href="#classes" class="mt-3 block text-center text-green-600 text-sm font-medium py-2 bg-green-50 rounded-xl hover:bg-green-100 transition">
      Voir tous les exercices <i class="fas fa-arrow-right ml-1"></i>
    </a>
  </section>

  <!-- Sujets d'examen -->
  <section id="sujets" class="mb-6">
    <h2 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
      <i class="fas fa-file-alt text-purple-600"></i> Sujets d'examens
    </h2>
    <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-4 shadow-md">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">📄</div>
        <div>
          <div class="font-bold">Sujets officiels</div>
          <div class="text-purple-200 text-sm">CEPD, BEPC, BAC 1 &amp; BAC 2</div>
        </div>
      </div>
      <p class="text-purple-100 text-sm mb-3">Accède aux sujets des années précédentes avec leurs corrigés.</p>
      <div class="grid grid-cols-2 gap-2">
        ${classes.map(cl => `
        <a href="/sujets/${cl.id}" class="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl p-2 text-center text-white text-sm font-medium transition no-underline">
          ${cl.icone} ${cl.nom}
        </a>`).join('')}
      </div>
    </div>
  </section>

  <!-- Section Upload -->
  <section class="mb-6">
    <div class="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-4 shadow-md">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-xl">📤</div>
        <div>
          <div class="font-bold">Contribuer</div>
          <div class="text-orange-100 text-sm">Partage tes documents</div>
        </div>
      </div>
      <p class="text-orange-100 text-sm mb-3">Envoie tes fiches de révision, sujets et exercices pour aider tous les élèves.</p>
      <a href="/upload" class="bg-white text-orange-600 font-semibold px-4 py-2 rounded-xl text-sm inline-block hover:shadow-md transition">
        <i class="fas fa-cloud-upload-alt mr-1"></i>Envoyer un document
      </a>
    </div>
  </section>
  `

  return layout('Accueil', content, 'home')
}
