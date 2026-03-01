/**
 * Gestion des documents — file d'attente, validation, rejet, documents publiés
 */
import { adminLayout } from './layout'
import { documentsStore, usersStore, addAdminLog } from '../data/store'
import type { AdminSession } from './layout'
import type { DocumentStatus, DocumentType } from '../data/store'

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'À l\'instant'
  if (mins < 60) return `il y a ${mins} min`
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${days}j`
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

const typeLabels: Record<DocumentType, { label: string; color: string; icon: string }> = {
  cours: { label: 'Cours', color: 'bg-blue-100 text-blue-700', icon: 'fa-book' },
  exercice: { label: 'Exercice', color: 'bg-green-100 text-green-700', icon: 'fa-pencil-alt' },
  examen: { label: 'Examen', color: 'bg-purple-100 text-purple-700', icon: 'fa-file-alt' },
  fiche: { label: 'Fiche', color: 'bg-yellow-100 text-yellow-700', icon: 'fa-sticky-note' },
  aide: { label: 'Aide', color: 'bg-orange-100 text-orange-700', icon: 'fa-question-circle' },
}

const statusLabels: Record<DocumentStatus, { label: string; color: string; icon: string }> = {
  en_attente: { label: 'En attente', color: 'bg-orange-100 text-orange-700', icon: 'fa-clock' },
  valide: { label: 'Validé', color: 'bg-green-100 text-green-700', icon: 'fa-check-circle' },
  rejete: { label: 'Rejeté', color: 'bg-red-100 text-red-700', icon: 'fa-times-circle' },
}

interface DocFilters {
  status?: string
  type?: string
  classeId?: string
  search?: string
  id?: string
}

export function renderDocuments(session: AdminSession, filters: DocFilters = {}): string {
  const pendingCount = documentsStore.filter(d => d.status === 'en_attente').length

  // Document sélectionné pour aperçu/validation
  const selectedDoc = filters.id ? documentsStore.find(d => d.id === filters.id) : null

  // Filtrage
  let filtered = [...documentsStore]
  if (filters.status) filtered = filtered.filter(d => d.status === filters.status)
  if (filters.type) filtered = filtered.filter(d => d.type === filters.type)
  if (filters.classeId) filtered = filtered.filter(d => d.classeId === filters.classeId)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.authorEmail.toLowerCase().includes(q) ||
      d.fileName.toLowerCase().includes(q)
    )
  }
  filtered.sort((a, b) => {
    // Trier : en_attente en premier, puis par date
    if (a.status === 'en_attente' && b.status !== 'en_attente') return -1
    if (b.status === 'en_attente' && a.status !== 'en_attente') return 1
    return b.uploadedAt.getTime() - a.uploadedAt.getTime()
  })

  // Modal aperçu document
  const docModal = selectedDoc ? `
  <div id="doc-modal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
      <!-- Header modal -->
      <div class="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center
            ${selectedDoc.fileType === 'PDF' ? 'bg-red-500' : 'bg-blue-500'} text-white">
            <i class="fas ${selectedDoc.fileType === 'PDF' ? 'fa-file-pdf' : 'fa-image'}"></i>
          </div>
          <div>
            <div class="text-white font-bold text-sm">${selectedDoc.title}</div>
            <div class="text-slate-300 text-xs">${selectedDoc.fileName} · ${formatSize(selectedDoc.metadata.size)}</div>
          </div>
        </div>
        <a href="/admin/documents" class="text-slate-400 hover:text-white">
          <i class="fas fa-times text-xl"></i>
        </a>
      </div>

      <div class="p-5">
        <!-- Infos document -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-slate-50 rounded-xl p-3">
            <div class="text-xs text-slate-500 mb-1">Auteur</div>
            <div class="font-medium text-slate-800 text-sm">${selectedDoc.authorNom}</div>
            <div class="text-xs text-slate-500">${selectedDoc.authorEmail}</div>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <div class="text-xs text-slate-500 mb-1">Uploadé</div>
            <div class="font-medium text-slate-800 text-sm">${timeAgo(selectedDoc.uploadedAt)}</div>
            <div class="text-xs text-slate-500">${selectedDoc.uploadedAt.toLocaleDateString('fr-FR')}</div>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <div class="text-xs text-slate-500 mb-1">Type</div>
            <span class="text-xs px-2 py-1 rounded-full font-medium ${typeLabels[selectedDoc.type].color}">
              <i class="fas ${typeLabels[selectedDoc.type].icon} mr-1"></i>${typeLabels[selectedDoc.type].label}
            </span>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <div class="text-xs text-slate-500 mb-1">Statut actuel</div>
            <span class="text-xs px-2 py-1 rounded-full font-medium ${statusLabels[selectedDoc.status].color}">
              <i class="fas ${statusLabels[selectedDoc.status].icon} mr-1"></i>${statusLabels[selectedDoc.status].label}
            </span>
          </div>
        </div>

        ${selectedDoc.description ? `
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
          <div class="text-xs font-semibold text-blue-700 mb-1"><i class="fas fa-comment mr-1"></i>Description de l'auteur</div>
          <div class="text-sm text-blue-600">${selectedDoc.description}</div>
        </div>` : ''}

        ${selectedDoc.rejectionReason ? `
        <div class="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <div class="text-xs font-semibold text-red-700 mb-1"><i class="fas fa-times-circle mr-1"></i>Motif de rejet</div>
          <div class="text-sm text-red-600">${selectedDoc.rejectionReason}</div>
        </div>` : ''}

        <!-- Zone de validation -->
        ${selectedDoc.status === 'en_attente' ? `
        <div class="border border-orange-200 rounded-xl p-4 bg-orange-50">
          <div class="text-sm font-semibold text-orange-800 mb-3">
            <i class="fas fa-gavel mr-1"></i>Action de modération
          </div>
          <div class="mb-3">
            <label class="block text-xs font-medium text-slate-700 mb-1">Commentaire pour l'auteur (optionnel)</label>
            <textarea id="mod-comment" rows="2" placeholder="Message envoyé à l'auteur..."
              class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          <div class="flex gap-2">
            <button onclick="validateDoc('${selectedDoc.id}', '${selectedDoc.title}')"
              class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-1">
              <i class="fas fa-check"></i> Valider et publier
            </button>
            <button onclick="rejectDoc('${selectedDoc.id}', '${selectedDoc.title}')"
              class="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-1">
              <i class="fas fa-times"></i> Rejeter
            </button>
          </div>
          <button onclick="deleteDoc('${selectedDoc.id}', '${selectedDoc.title}')"
            class="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2 rounded-xl text-sm transition">
            <i class="fas fa-trash mr-1"></i>Supprimer définitivement
          </button>
        </div>` : `
        <div class="flex gap-2">
          ${selectedDoc.status === 'valide' ? `
          <button onclick="unpublishDoc('${selectedDoc.id}', '${selectedDoc.title}')"
            class="flex-1 bg-orange-50 text-orange-700 hover:bg-orange-100 font-medium py-2.5 rounded-xl text-sm transition">
            <i class="fas fa-eye-slash mr-1"></i>Dépublier
          </button>` : `
          <button onclick="validateDoc('${selectedDoc.id}', '${selectedDoc.title}')"
            class="flex-1 bg-green-50 text-green-700 hover:bg-green-100 font-medium py-2.5 rounded-xl text-sm transition">
            <i class="fas fa-check mr-1"></i>Re-valider
          </button>`}
          <button onclick="deleteDoc('${selectedDoc.id}', '${selectedDoc.title}')"
            class="flex-1 bg-red-50 text-red-700 hover:bg-red-100 font-medium py-2.5 rounded-xl text-sm transition">
            <i class="fas fa-trash mr-1"></i>Supprimer
          </button>
        </div>`}
      </div>
    </div>
  </div>` : ''

  const content = `
  ${docModal}

  <!-- Onglets de statut -->
  <div class="flex gap-2 mb-5 flex-wrap">
    <a href="/admin/documents" class="px-4 py-2 rounded-xl text-sm font-medium no-underline transition ${!filters.status ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">
      Tous <span class="ml-1 text-xs opacity-70">(${documentsStore.length})</span>
    </a>
    <a href="/admin/documents?status=en_attente" class="px-4 py-2 rounded-xl text-sm font-medium no-underline transition ${filters.status === 'en_attente' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">
      <i class="fas fa-clock mr-1"></i>En attente
      ${pendingCount > 0 ? `<span class="ml-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full badge-pending">${pendingCount}</span>` : ''}
    </a>
    <a href="/admin/documents?status=valide" class="px-4 py-2 rounded-xl text-sm font-medium no-underline transition ${filters.status === 'valide' ? 'bg-green-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">
      <i class="fas fa-check-circle mr-1"></i>Validés (${documentsStore.filter(d => d.status === 'valide').length})
    </a>
    <a href="/admin/documents?status=rejete" class="px-4 py-2 rounded-xl text-sm font-medium no-underline transition ${filters.status === 'rejete' ? 'bg-red-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">
      <i class="fas fa-times-circle mr-1"></i>Rejetés (${documentsStore.filter(d => d.status === 'rejete').length})
    </a>
  </div>

  <!-- Filtre recherche/type -->
  <form method="GET" action="/admin/documents" class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-5 flex flex-wrap gap-3 items-end">
    ${filters.status ? `<input type="hidden" name="status" value="${filters.status}">` : ''}
    <div class="flex-1 min-w-48">
      <label class="block text-xs font-medium text-slate-600 mb-1">Rechercher</label>
      <div class="relative">
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
        <input type="text" name="search" value="${filters.search || ''}"
          placeholder="Titre, nom de fichier, auteur..."
          class="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>
    </div>
    <div>
      <label class="block text-xs font-medium text-slate-600 mb-1">Type</label>
      <select name="type" class="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">Tous types</option>
        ${Object.entries(typeLabels).map(([k, v]) => `<option value="${k}" ${filters.type === k ? 'selected' : ''}>${v.label}</option>`).join('')}
      </select>
    </div>
    <div>
      <label class="block text-xs font-medium text-slate-600 mb-1">Classe</label>
      <select name="classeId" class="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">Toutes</option>
        ${['cepd','bepc','bac1','bac2'].map(cl => `<option value="${cl}" ${filters.classeId === cl ? 'selected' : ''}>${cl.toUpperCase()}</option>`).join('')}
      </select>
    </div>
    <button type="submit" class="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
      <i class="fas fa-filter mr-1"></i>Filtrer
    </button>
  </form>

  <!-- Liste documents -->
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <div class="px-5 py-3 border-b border-slate-100 text-xs text-slate-500">
      ${filtered.length} document(s) — Cliquer pour aperçu et action
    </div>
    ${filtered.length === 0 ? `
    <div class="p-10 text-center text-slate-400">
      <i class="fas fa-folder-open text-4xl mb-3 opacity-30"></i>
      <p>Aucun document trouvé</p>
    </div>` : `
    <div class="divide-y divide-slate-50">
      ${filtered.map(doc => {
        const typeInfo = typeLabels[doc.type]
        const statusInfo = statusLabels[doc.status]
        return `
        <div class="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition cursor-pointer" onclick="location.href='/admin/documents?id=${doc.id}${filters.status ? '&status='+filters.status : ''}'">
          <!-- Icône fichier -->
          <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-lg
            ${doc.fileType === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}">
            <i class="fas ${doc.fileType === 'PDF' ? 'fa-file-pdf' : 'fa-image'}"></i>
          </div>

          <!-- Infos -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-medium text-slate-800 text-sm">${doc.title}</span>
              ${doc.status === 'en_attente' ? '<span class="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold badge-pending">NOUVEAU</span>' : ''}
            </div>
            <div class="text-xs text-slate-400 mt-0.5">
              ${doc.fileName} · ${formatSize(doc.metadata.size)} · ${doc.authorNom}
            </div>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <span class="text-xs px-1.5 py-0.5 rounded-full font-medium ${typeInfo.color}">
                <i class="fas ${typeInfo.icon} mr-0.5"></i>${typeInfo.label}
              </span>
              <span class="text-xs text-slate-400">${doc.classeId.toUpperCase()}</span>
              <span class="text-xs text-slate-400">${timeAgo(doc.uploadedAt)}</span>
            </div>
          </div>

          <!-- Statut -->
          <div class="flex-shrink-0 text-right">
            <span class="text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}">
              <i class="fas ${statusInfo.icon} mr-1"></i>${statusInfo.label}
            </span>
            ${doc.validatedBy ? `<div class="text-xs text-slate-400 mt-1">par ${doc.validatedBy.split('@')[0]}</div>` : ''}
          </div>
        </div>`
      }).join('')}
    </div>`}
  </div>

  <!-- Scripts -->
  <script>
    async function docApiAction(url, method, body, msg) {
      const comment = document.getElementById('mod-comment')?.value || '';
      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, comment })
        });
        const data = await res.json();
        if (data.success) {
          showToast(msg || data.message, 'success');
          setTimeout(() => location.href = '/admin/documents', 800);
        } else {
          showToast(data.error || 'Erreur', 'error');
        }
      } catch(e) {
        showToast('Erreur de connexion', 'error');
      }
    }

    function validateDoc(id, title) {
      if (confirm(\`✅ Valider et publier "\${title}" ?\`)) {
        docApiAction(\`/api/admin/documents/\${id}/validate\`, 'POST', {}, \`"\${title}" validé et publié\`);
      }
    }

    function rejectDoc(id, title) {
      const reason = prompt(\`Motif de rejet pour "\${title}" :\`, 'Contenu non conforme aux règles de la plateforme');
      if (reason !== null) {
        docApiAction(\`/api/admin/documents/\${id}/reject\`, 'POST', { reason }, \`"\${title}" rejeté\`);
      }
    }

    function unpublishDoc(id, title) {
      if (confirm(\`Dépublier "\${title}" ?\`)) {
        docApiAction(\`/api/admin/documents/\${id}/unpublish\`, 'POST', {}, \`"\${title}" dépublié\`);
      }
    }

    function deleteDoc(id, title) {
      if (confirm(\`⚠️ Supprimer définitivement "\${title}" ? Cette action est irréversible.\`)) {
        docApiAction(\`/api/admin/documents/\${id}\`, 'DELETE', {}, \`"\${title}" supprimé\`);
      }
    }
  </script>
  `

  return adminLayout('Gestion des documents', content, 'documents', session, pendingCount)
}
