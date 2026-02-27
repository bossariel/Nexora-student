import { layout } from './layout'
import type { Classe } from '../data/classes'
import type { Cours } from '../data/cours'

// Page liste des cours d'une classe
export function renderCours(classe: Classe, coursByClasse: Cours[]): string {
  const matieres = [...new Set(coursByClasse.map(c => c.matiere))]

  const content = `
  <div class="mb-4">
    <a href="/classe/${classe.id}" class="text-blue-600 text-sm font-medium">
      <i class="fas fa-arrow-left mr-1"></i> Retour à ${classe.nom}
    </a>
  </div>
  <div class="flex items-center gap-3 mb-5">
    <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style="background:${classe.couleur}20">
      ${classe.icone}
    </div>
    <div>
      <h1 class="text-xl font-bold text-gray-800">Cours – ${classe.nom}</h1>
      <p class="text-sm text-gray-500">${coursByClasse.length} cours disponibles</p>
    </div>
  </div>

  ${matieres.map(matiere => {
    const coursDeMatiere = coursByClasse.filter(c => c.matiere === matiere)
    return `
    <div class="mb-5">
      <div class="flex items-center gap-2 mb-3">
        <span class="font-bold text-gray-800">${matiere}</span>
        <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">${coursDeMatiere.length}</span>
      </div>
      ${coursDeMatiere.map(co => `
      <a href="/cours/${classe.id}/${co.id}" class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-blue-200 transition flex items-start gap-3 mb-3 no-underline">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style="background:${classe.couleur}20">📖</div>
        <div class="flex-1 min-w-0">
          <div class="text-xs text-gray-500 font-medium uppercase tracking-wide">${co.chapitre}</div>
          <div class="font-semibold text-gray-800 mt-0.5">${co.titre}</div>
          <div class="text-xs text-gray-500 mt-1 line-clamp-2">${co.resume}</div>
          <div class="flex gap-3 mt-2">
            <span class="text-xs text-gray-400"><i class="fas fa-clock mr-1"></i>${co.duree}</span>
            <span class="text-xs px-2 py-0.5 rounded-full ${co.difficulte === 'Facile' ? 'bg-green-100 text-green-700' : co.difficulte === 'Moyen' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}">${co.difficulte}</span>
          </div>
        </div>
        <i class="fas fa-chevron-right text-gray-400 text-sm mt-1 flex-shrink-0"></i>
      </a>
      `).join('')}
    </div>`
  }).join('')}
  `

  return layout(`Cours – ${classe.nom}`, content, 'cours')
}

// Page d'une leçon
export function renderLecon(classe: Classe, lecon: Cours): string {
  // Convertir le markdown basique en HTML
  const htmlContenu = markdownToHtml(lecon.contenu)

  const content = `
  <div class="mb-4">
    <a href="/cours/${classe.id}" class="text-blue-600 text-sm font-medium">
      <i class="fas fa-arrow-left mr-1"></i> Retour aux cours
    </a>
  </div>

  <!-- En-tête de la leçon -->
  <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">${classe.nom}</span>
      <span class="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">${lecon.matiere}</span>
      <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">${lecon.chapitre}</span>
    </div>
    <h1 class="text-xl font-bold text-gray-800 mb-2">${lecon.titre}</h1>
    <p class="text-sm text-gray-600 leading-relaxed">${lecon.resume}</p>
    <div class="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
      <span class="text-xs text-gray-500 flex items-center gap-1">
        <i class="fas fa-clock text-blue-400"></i> ${lecon.duree}
      </span>
      <span class="text-xs px-2 py-0.5 rounded-full ${lecon.difficulte === 'Facile' ? 'bg-green-100 text-green-700' : lecon.difficulte === 'Moyen' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}">
        ${lecon.difficulte === 'Facile' ? '🟢' : lecon.difficulte === 'Moyen' ? '🟡' : '🔴'} ${lecon.difficulte}
      </span>
      ${lecon.pdfUrl !== '#' ? `
      <a href="${lecon.pdfUrl}" class="ml-auto text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-100 transition">
        <i class="fas fa-download"></i> PDF
      </a>` : ''}
    </div>
  </div>

  <!-- Contenu de la leçon -->
  <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 lesson-content">
    ${htmlContenu}
  </div>

  <!-- Actions bas de page -->
  <div class="mt-4 flex gap-3">
    <a href="/cours/${classe.id}" class="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-center text-sm hover:bg-gray-200 transition">
      <i class="fas fa-list mr-1"></i> Autres cours
    </a>
    <a href="/exercices/${classe.id}" class="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl text-center text-sm hover:bg-blue-700 transition">
      <i class="fas fa-pencil-alt mr-1"></i> S'entraîner
    </a>
  </div>
  `

  return layout(lecon.titre, content, 'cours')
}

// Convertisseur Markdown simplifié → HTML
function markdownToHtml(md: string): string {
  return md
    // Titres
    .replace(/^### (.+)$/gm, '<h3 class="font-bold text-gray-800 text-base mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-bold text-gray-800 text-lg mt-5 mb-3 border-b border-gray-100 pb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-bold text-gray-900 text-xl mt-4 mb-3">$1</h1>')
    // Gras et italique
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // Code
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```/g, '').trim()
      return `<pre class="bg-gray-900 text-green-300 p-3 rounded-xl text-xs overflow-x-auto my-3 leading-relaxed">${code}</pre>`
    })
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-3 my-3 text-gray-700 italic bg-blue-50 py-2 pr-3 rounded-r-lg">$1</blockquote>')
    // Listes
    .replace(/^- (.+)$/gm, '<li class="text-gray-700 text-sm py-0.5">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="text-gray-700 text-sm py-0.5 list-decimal">$2</li>')
    // Tableaux basiques
    .replace(/^\|(.+)\|$/gm, (line) => {
      if (line.includes('---')) return ''
      const cells = line.split('|').filter(c => c.trim())
      return '<tr>' + cells.map(c => `<td class="border border-gray-200 px-3 py-1.5 text-sm text-gray-700">${c.trim()}</td>`).join('') + '</tr>'
    })
    // Envelopper les listes li
    .replace(/(<li[^>]*>.*?<\/li>\s*)+/gs, (match) => `<ul class="list-none space-y-1 my-2 pl-2">${match}</ul>`)
    // Envelopper les tr dans table
    .replace(/(<tr>.*?<\/tr>\s*)+/gs, (match) => `<div class="overflow-x-auto my-3"><table class="w-full border-collapse border border-gray-200 rounded-xl overflow-hidden text-sm">${match}</table></div>`)
    // Paragraphes
    .replace(/^(?!<[h|l|b|u|o|p|d|t|c]).+$/gm, (line) => line.trim() ? `<p class="text-gray-700 text-sm leading-relaxed my-1.5">${line}</p>` : '')
    // Nettoyer les lignes vides
    .replace(/\n{3,}/g, '\n\n')
}
