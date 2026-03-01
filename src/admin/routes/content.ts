/**
 * Gestion du contenu pédagogique — cours, exercices, examens
 */
import { adminLayout } from './layout'
import { coursesStore, exercisesStore, documentsStore, addAdminLog, generateId } from '../data/store'
import type { AdminSession } from './layout'
import type { CourseLevel, ExerciseType } from '../data/store'

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 1) return 'il y a moins d\'1h'
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${days}j`
}

function formatDate(date?: Date): string {
  if (!date) return '—'
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const levelLabels: Record<CourseLevel, { label: string; color: string }> = {
  debutant: { label: 'Débutant', color: 'bg-green-100 text-green-700' },
  intermediaire: { label: 'Intermédiaire', color: 'bg-yellow-100 text-yellow-700' },
  avance: { label: 'Avancé', color: 'bg-red-100 text-red-700' },
}

const exTypeLabels: Record<ExerciseType, { label: string; color: string; icon: string }> = {
  qcm: { label: 'QCM', color: 'bg-blue-100 text-blue-700', icon: 'fa-list-ul' },
  texte: { label: 'Texte libre', color: 'bg-purple-100 text-purple-700', icon: 'fa-pen' },
  fichier: { label: 'Fichier', color: 'bg-orange-100 text-orange-700', icon: 'fa-file-upload' },
}

// ─── PAGE COURS ──────────────────────────────────────────────────────────────

export function renderCourses(session: AdminSession, action?: string): string {
  const pendingCount = documentsStore.filter(d => d.status === 'en_attente').length
  const showForm = action === 'new'

  const content = `
  <!-- En-tête + bouton nouveau cours -->
  <div class="flex items-center justify-between mb-5">
    <div>
      <p class="text-sm text-slate-500">${coursesStore.length} cours au total · ${coursesStore.filter(c => c.published).length} publiés</p>
    </div>
    <a href="/admin/courses?action=new" class="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition no-underline flex items-center gap-2">
      <i class="fas fa-plus"></i> Nouveau cours
    </a>
  </div>

  <!-- Formulaire de création -->
  ${showForm ? `
  <div class="bg-white rounded-2xl shadow-sm border border-blue-200 p-5 mb-5">
    <h2 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
      <i class="fas fa-plus-circle text-blue-500"></i> Créer un nouveau cours
    </h2>
    <form id="course-form" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-slate-700 mb-1">Titre du cours *</label>
          <input type="text" id="c-title" required placeholder="Ex: Les fractions — Introduction" 
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">Classe *</label>
          <select id="c-classe" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="cepd">CEPD</option>
            <option value="bepc">BEPC</option>
            <option value="bac1">BAC 1</option>
            <option value="bac2">BAC 2</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">Matière *</label>
          <input type="text" id="c-matiere" placeholder="Ex: Mathématiques" required
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">Niveau</label>
          <select id="c-level" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="debutant">Débutant</option>
            <option value="intermediaire" selected>Intermédiaire</option>
            <option value="avance">Avancé</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">Publication programmée</label>
          <input type="datetime-local" id="c-scheduled"
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-slate-700 mb-1">Description *</label>
          <textarea id="c-desc" rows="3" required placeholder="Description du cours..."
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-slate-700 mb-1">Tags (séparés par des virgules)</label>
          <input type="text" id="c-tags" placeholder="algèbre, équations, bepc..."
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div class="md:col-span-2 flex items-center gap-2">
          <input type="checkbox" id="c-publish" class="w-4 h-4 text-blue-600 rounded">
          <label for="c-publish" class="text-sm text-slate-700">Publier immédiatement</label>
        </div>
      </div>
      <div class="flex gap-3 pt-2">
        <button type="button" onclick="createCourse()"
          class="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          <i class="fas fa-save mr-1"></i>Créer le cours
        </button>
        <a href="/admin/courses" class="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200 transition no-underline">
          Annuler
        </a>
      </div>
    </form>
  </div>` : ''}

  <!-- Liste des cours -->
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <table class="w-full">
      <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
        <tr>
          <th class="px-5 py-3 text-left">Cours</th>
          <th class="px-5 py-3 text-left hidden md:table-cell">Niveau</th>
          <th class="px-5 py-3 text-left hidden lg:table-cell">Mis à jour</th>
          <th class="px-5 py-3 text-center">Statut</th>
          <th class="px-5 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-50">
        ${coursesStore.map(course => `
        <tr class="table-row">
          <td class="px-5 py-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0
                ${course.classeId === 'cepd' ? 'bg-green-50' : course.classeId === 'bepc' ? 'bg-blue-50' : course.classeId === 'bac1' ? 'bg-orange-50' : 'bg-purple-50'}">
                📖
              </div>
              <div>
                <div class="text-sm font-medium text-slate-800">${course.title}</div>
                <div class="text-xs text-slate-400">${course.classeId.toUpperCase()} · ${course.matiere}</div>
                <div class="flex flex-wrap gap-1 mt-0.5">
                  ${course.tags.map(t => `<span class="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">${t}</span>`).join('')}
                </div>
              </div>
            </div>
          </td>
          <td class="px-5 py-3 hidden md:table-cell">
            <span class="text-xs px-2 py-1 rounded-full font-medium ${levelLabels[course.level].color}">${levelLabels[course.level].label}</span>
          </td>
          <td class="px-5 py-3 text-sm text-slate-500 hidden lg:table-cell">${timeAgo(course.updatedAt)}</td>
          <td class="px-5 py-3 text-center">
            ${course.scheduledFor && !course.published ? `
            <span class="text-xs px-2 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700">
              <i class="fas fa-calendar mr-1"></i>Programmé ${formatDate(course.scheduledFor)}
            </span>` : course.published ? `
            <span class="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">
              <i class="fas fa-globe mr-1"></i>Publié
            </span>` : `
            <span class="text-xs px-2 py-1 rounded-full font-medium bg-slate-100 text-slate-600">
              <i class="fas fa-eye-slash mr-1"></i>Brouillon
            </span>`}
          </td>
          <td class="px-5 py-3">
            <div class="flex items-center justify-end gap-1">
              <a href="/cours/${course.classeId}/${course.id}" target="_blank"
                class="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition text-xs" title="Prévisualiser">
                <i class="fas fa-eye"></i>
              </a>
              <button onclick="togglePublish('${course.id}', '${course.title}', ${course.published})"
                class="w-7 h-7 ${course.published ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'} rounded-lg flex items-center justify-center transition text-xs"
                title="${course.published ? 'Dépublier' : 'Publier'}">
                <i class="fas ${course.published ? 'fa-eye-slash' : 'fa-globe'}"></i>
              </button>
              <button onclick="deleteCourse('${course.id}', '${course.title}')"
                class="w-7 h-7 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition text-xs" title="Supprimer">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <script>
    async function courseApi(url, method, body, msg) {
      try {
        const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: body ? JSON.stringify(body) : undefined });
        const data = await res.json();
        if (data.success) { showToast(msg, 'success'); setTimeout(() => location.href='/admin/courses', 800); }
        else showToast(data.error || 'Erreur', 'error');
      } catch(e) { showToast('Erreur réseau', 'error'); }
    }

    function togglePublish(id, title, isPublished) {
      const action = isPublished ? 'Dépublier' : 'Publier';
      if (confirm(\`\${action} le cours "\${title}" ?\`)) {
        courseApi(\`/api/admin/courses/\${id}/publish\`, 'POST', { publish: !isPublished }, \`Cours "\${title}" \${isPublished ? 'dépublié' : 'publié'}\`);
      }
    }

    function deleteCourse(id, title) {
      if (confirm(\`⚠️ Supprimer le cours "\${title}" et tout son contenu ?\`)) {
        courseApi(\`/api/admin/courses/\${id}\`, 'DELETE', null, \`Cours "\${title}" supprimé\`);
      }
    }

    function createCourse() {
      const body = {
        title: document.getElementById('c-title').value,
        classeId: document.getElementById('c-classe').value,
        matiere: document.getElementById('c-matiere').value,
        level: document.getElementById('c-level').value,
        description: document.getElementById('c-desc').value,
        tags: document.getElementById('c-tags').value.split(',').map(t=>t.trim()).filter(Boolean),
        published: document.getElementById('c-publish').checked,
        scheduledFor: document.getElementById('c-scheduled').value || null,
      };
      if (!body.title || !body.matiere || !body.description) { showToast('Remplissez tous les champs requis', 'error'); return; }
      courseApi('/api/admin/courses', 'POST', body, \`Cours "\${body.title}" créé\`);
    }
  </script>
  `

  return adminLayout('Gestion des cours', content, 'courses', session, pendingCount)
}

// ─── PAGE EXERCICES ──────────────────────────────────────────────────────────

export function renderExercises(session: AdminSession, action?: string): string {
  const pendingCount = documentsStore.filter(d => d.status === 'en_attente').length
  const showForm = action === 'new'

  const content = `
  <div class="flex items-center justify-between mb-5">
    <p class="text-sm text-slate-500">${exercisesStore.length} exercices · ${exercisesStore.filter(e => e.published).length} publiés · ${exercisesStore.reduce((s, e) => s + e.submissionsCount, 0)} soumissions totales</p>
    <a href="/admin/exercises?action=new" class="bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition no-underline flex items-center gap-2">
      <i class="fas fa-plus"></i> Nouvel exercice
    </a>
  </div>

  <!-- Formulaire création -->
  ${showForm ? `
  <div class="bg-white rounded-2xl shadow-sm border border-green-200 p-5 mb-5">
    <h2 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
      <i class="fas fa-plus-circle text-green-500"></i>Créer un exercice
    </h2>
    <form class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-slate-700 mb-1">Titre *</label>
          <input type="text" id="e-title" required placeholder="Ex: QCM Algèbre — Équations"
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">Type *</label>
          <select id="e-type" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="qcm">QCM</option>
            <option value="texte">Texte libre</option>
            <option value="fichier">Fichier</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">Classe *</label>
          <select id="e-classe" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="cepd">CEPD</option>
            <option value="bepc">BEPC</option>
            <option value="bac1">BAC 1</option>
            <option value="bac2">BAC 2</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">Matière *</label>
          <input type="text" id="e-matiere" placeholder="Ex: Mathématiques"
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">Points</label>
          <input type="number" id="e-points" value="100" min="0"
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">Disponible du</label>
          <input type="datetime-local" id="e-from"
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">Jusqu'au</label>
          <input type="datetime-local" id="e-until"
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-slate-700 mb-1">Description *</label>
          <textarea id="e-desc" rows="3" placeholder="Description de l'exercice..."
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"></textarea>
        </div>
        <div class="md:col-span-2 flex items-center gap-2">
          <input type="checkbox" id="e-publish" class="w-4 h-4 text-green-600 rounded">
          <label for="e-publish" class="text-sm text-slate-700">Publier immédiatement</label>
        </div>
      </div>
      <div class="flex gap-3">
        <button type="button" onclick="createExercise()"
          class="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition">
          <i class="fas fa-save mr-1"></i>Créer
        </button>
        <a href="/admin/exercises" class="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200 transition no-underline">Annuler</a>
      </div>
    </form>
  </div>` : ''}

  <!-- Statistiques rapides -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
    ${[
      { label: 'Total soumissions', value: exercisesStore.reduce((s, e) => s + e.submissionsCount, 0), icon: 'fa-paper-plane', color: 'text-blue-600 bg-blue-50' },
      { label: 'Plus populaire', value: exercisesStore.sort((a,b) => b.submissionsCount - a.submissionsCount)[0]?.title.substring(0, 15) + '…', icon: 'fa-star', color: 'text-yellow-600 bg-yellow-50' },
      { label: 'QCM actifs', value: exercisesStore.filter(e => e.type === 'qcm' && e.published).length, icon: 'fa-list-ul', color: 'text-green-600 bg-green-50' },
      { label: 'Non publiés', value: exercisesStore.filter(e => !e.published).length, icon: 'fa-eye-slash', color: 'text-slate-600 bg-slate-100' },
    ].map(s => `
    <div class="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
      <div class="w-8 h-8 rounded-lg flex items-center justify-center ${s.color} mb-2 text-sm">
        <i class="fas ${s.icon}"></i>
      </div>
      <div class="font-bold text-slate-800">${s.value}</div>
      <div class="text-xs text-slate-500">${s.label}</div>
    </div>`).join('')}
  </div>

  <!-- Tableau exercices -->
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <table class="w-full">
      <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
        <tr>
          <th class="px-5 py-3 text-left">Exercice</th>
          <th class="px-5 py-3 text-left hidden md:table-cell">Type</th>
          <th class="px-5 py-3 text-center hidden lg:table-cell">Soumissions</th>
          <th class="px-5 py-3 text-center">Statut</th>
          <th class="px-5 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-50">
        ${exercisesStore.map(ex => `
        <tr class="table-row">
          <td class="px-5 py-3">
            <div class="text-sm font-medium text-slate-800">${ex.title}</div>
            <div class="text-xs text-slate-400">${ex.classeId.toUpperCase()} · ${ex.matiere} · ${ex.points} pts</div>
          </td>
          <td class="px-5 py-3 hidden md:table-cell">
            <span class="text-xs px-2 py-1 rounded-full font-medium ${exTypeLabels[ex.type].color}">
              <i class="fas ${exTypeLabels[ex.type].icon} mr-1"></i>${exTypeLabels[ex.type].label}
            </span>
          </td>
          <td class="px-5 py-3 text-center hidden lg:table-cell">
            <div class="text-lg font-bold text-slate-700">${ex.submissionsCount}</div>
          </td>
          <td class="px-5 py-3 text-center">
            ${ex.published ? `
            <span class="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">
              <i class="fas fa-globe mr-1"></i>Publié
            </span>` : `
            <span class="text-xs px-2 py-1 rounded-full font-medium bg-slate-100 text-slate-600">
              <i class="fas fa-eye-slash mr-1"></i>Brouillon
            </span>`}
          </td>
          <td class="px-5 py-3">
            <div class="flex items-center justify-end gap-1">
              <a href="/exercices/${ex.classeId}/${ex.id}" target="_blank"
                class="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition text-xs" title="Voir l'exercice">
                <i class="fas fa-eye"></i>
              </a>
              <button onclick="toggleExPublish('${ex.id}', '${ex.title}', ${ex.published})"
                class="w-7 h-7 ${ex.published ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'} rounded-lg flex items-center justify-center hover:opacity-75 transition text-xs">
                <i class="fas ${ex.published ? 'fa-eye-slash' : 'fa-globe'}"></i>
              </button>
              <button onclick="deleteExercise('${ex.id}', '${ex.title}')"
                class="w-7 h-7 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition text-xs">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <script>
    async function exApi(url, method, body, msg) {
      try {
        const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: body ? JSON.stringify(body) : undefined });
        const data = await res.json();
        if (data.success) { showToast(msg, 'success'); setTimeout(() => location.href='/admin/exercises', 800); }
        else showToast(data.error || 'Erreur', 'error');
      } catch(e) { showToast('Erreur réseau', 'error'); }
    }

    function toggleExPublish(id, title, pub) {
      if (confirm(\`\${pub ? 'Dépublier' : 'Publier'} "\${title}" ?\`))
        exApi(\`/api/admin/exercises/\${id}/publish\`, 'POST', { publish: !pub }, \`"\${title}" \${pub ? 'dépublié' : 'publié'}\`);
    }
    function deleteExercise(id, title) {
      if (confirm(\`Supprimer l'exercice "\${title}" ?\`))
        exApi(\`/api/admin/exercises/\${id}\`, 'DELETE', null, \`"\${title}" supprimé\`);
    }
    function createExercise() {
      const body = {
        title: document.getElementById('e-title').value,
        type: document.getElementById('e-type').value,
        classeId: document.getElementById('e-classe').value,
        matiere: document.getElementById('e-matiere').value,
        points: parseInt(document.getElementById('e-points').value) || 100,
        description: document.getElementById('e-desc').value,
        published: document.getElementById('e-publish').checked,
        availableFrom: document.getElementById('e-from').value || new Date().toISOString(),
        availableUntil: document.getElementById('e-until').value || new Date(Date.now() + 365*86400000).toISOString(),
      };
      if (!body.title || !body.matiere || !body.description) { showToast('Champs requis manquants', 'error'); return; }
      exApi('/api/admin/exercises', 'POST', body, \`Exercice "\${body.title}" créé\`);
    }
  </script>
  `

  return adminLayout('Gestion des exercices', content, 'exercises', session, pendingCount)
}
