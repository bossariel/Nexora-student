/**
 * Gestion des utilisateurs — liste, filtres, actions CRUD, journal
 */
import { adminLayout } from './layout'
import { usersStore, documentsStore, adminLogsStore, addAdminLog, generateId } from '../data/store'
import type { AdminSession } from './layout'
import type { UserRole, UserStatus } from '../data/store'

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

interface UserFilters {
  role?: string
  status?: string
  search?: string
  page?: number
  id?: string
}

const PAGE_SIZE = 20

export function renderUsers(session: AdminSession, filters: UserFilters = {}): string {
  const pendingCount = documentsStore.filter(d => d.status === 'en_attente').length

  // Utilisateur sélectionné pour détails
  const selectedUser = filters.id ? usersStore.find(u => u.id === filters.id) : null

  // Filtrage
  let filtered = [...usersStore]
  if (filters.role) filtered = filtered.filter(u => u.role === filters.role)
  if (filters.status) filtered = filtered.filter(u => u.status === filters.status)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter(u => u.email.toLowerCase().includes(q) || u.nom.toLowerCase().includes(q))
  }
  // Tri par date (plus récents en premier)
  filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const page = filters.page || 1
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Modal détails utilisateur
  const userModal = selectedUser ? `
  <div id="user-modal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
      <div class="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-5 flex items-center gap-4">
        <div class="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          ${selectedUser.nom.charAt(0)}
        </div>
        <div class="flex-1">
          <div class="text-white font-bold text-lg">${selectedUser.nom}</div>
          <div class="text-slate-300 text-sm">${selectedUser.email}</div>
          <div class="flex gap-2 mt-1">
            <span class="text-xs px-2 py-0.5 rounded-full font-medium ${selectedUser.role === 'administrateur' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}">${selectedUser.role}</span>
            <span class="text-xs px-2 py-0.5 rounded-full font-medium ${selectedUser.status === 'actif' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}">${selectedUser.status}</span>
          </div>
        </div>
        <a href="/admin/users" class="text-slate-400 hover:text-white">
          <i class="fas fa-times text-xl"></i>
        </a>
      </div>
      <div class="p-5 space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-slate-50 rounded-xl p-3">
            <div class="text-xs text-slate-500 mb-1">Documents uploadés</div>
            <div class="font-bold text-slate-800 text-lg">${selectedUser.documentsCount}</div>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <div class="text-xs text-slate-500 mb-1">Inscrit</div>
            <div class="font-bold text-slate-800 text-sm">${selectedUser.createdAt.toLocaleDateString('fr-FR')}</div>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <div class="text-xs text-slate-500 mb-1">Dernière connexion</div>
            <div class="font-bold text-slate-800 text-sm">${timeAgo(selectedUser.lastLogin)}</div>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <div class="text-xs text-slate-500 mb-1">ID Utilisateur</div>
            <div class="font-mono text-xs text-slate-600 break-all">${selectedUser.id}</div>
          </div>
        </div>
        ${selectedUser.suspensionReason ? `
        <div class="bg-red-50 border border-red-200 rounded-xl p-3">
          <div class="text-xs font-semibold text-red-700 mb-1"><i class="fas fa-ban mr-1"></i>Motif de suspension</div>
          <div class="text-sm text-red-600">${selectedUser.suspensionReason}</div>
        </div>` : ''}

        <!-- Historique des logs de cet utilisateur -->
        <div>
          <div class="text-sm font-semibold text-slate-700 mb-2"><i class="fas fa-history mr-1 text-slate-400"></i>Actions admin récentes</div>
          ${adminLogsStore.filter(l => l.targetId === selectedUser.id).slice(0, 3).map(log => `
          <div class="flex items-center gap-2 text-xs text-slate-500 py-1.5 border-b border-slate-100">
            <i class="fas fa-circle text-slate-300" style="font-size:6px"></i>
            <span>${log.action.replace(/_/g, ' ').toLowerCase()}</span>
            <span class="ml-auto">${log.timestamp.toLocaleDateString('fr-FR')}</span>
          </div>`).join('') || '<div class="text-xs text-slate-400">Aucune action enregistrée</div>'}
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-2 border-t border-slate-100">
          <button onclick="changeRole('${selectedUser.id}', '${selectedUser.nom}', '${selectedUser.role}')"
            class="flex-1 bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium py-2 rounded-xl text-sm transition">
            <i class="fas fa-user-shield mr-1"></i>Changer rôle
          </button>
          ${selectedUser.status === 'actif' ? `
          <button onclick="suspendUser('${selectedUser.id}', '${selectedUser.nom}')"
            class="flex-1 bg-orange-50 text-orange-700 hover:bg-orange-100 font-medium py-2 rounded-xl text-sm transition">
            <i class="fas fa-ban mr-1"></i>Suspendre
          </button>` : `
          <button onclick="activateUser('${selectedUser.id}', '${selectedUser.nom}')"
            class="flex-1 bg-green-50 text-green-700 hover:bg-green-100 font-medium py-2 rounded-xl text-sm transition">
            <i class="fas fa-check mr-1"></i>Réactiver
          </button>`}
          <button onclick="deleteUser('${selectedUser.id}', '${selectedUser.nom}')"
            class="flex-1 bg-red-50 text-red-700 hover:bg-red-100 font-medium py-2 rounded-xl text-sm transition">
            <i class="fas fa-trash mr-1"></i>Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>` : ''

  const content = `
  ${userModal}

  <!-- Barre de filtres -->
  <form method="GET" action="/admin/users" class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-5 flex flex-wrap gap-3 items-end">
    <div class="flex-1 min-w-48">
      <label class="block text-xs font-medium text-slate-600 mb-1">Rechercher</label>
      <div class="relative">
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
        <input type="text" name="search" value="${filters.search || ''}"
          placeholder="Email ou nom..."
          class="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      </div>
    </div>
    <div>
      <label class="block text-xs font-medium text-slate-600 mb-1">Rôle</label>
      <select name="role" class="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">Tous</option>
        <option value="etudiant" ${filters.role === 'etudiant' ? 'selected' : ''}>Étudiant</option>
        <option value="administrateur" ${filters.role === 'administrateur' ? 'selected' : ''}>Administrateur</option>
      </select>
    </div>
    <div>
      <label class="block text-xs font-medium text-slate-600 mb-1">Statut</label>
      <select name="status" class="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">Tous</option>
        <option value="actif" ${filters.status === 'actif' ? 'selected' : ''}>Actif</option>
        <option value="suspendu" ${filters.status === 'suspendu' ? 'selected' : ''}>Suspendu</option>
      </select>
    </div>
    <button type="submit" class="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
      <i class="fas fa-filter mr-1"></i>Filtrer
    </button>
    ${(filters.role || filters.status || filters.search) ? `
    <a href="/admin/users" class="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200 transition no-underline">
      <i class="fas fa-times mr-1"></i>Réinitialiser
    </a>` : ''}
  </form>

  <!-- Info résultats -->
  <div class="flex items-center justify-between mb-3">
    <div class="text-sm text-slate-600">
      <span class="font-semibold">${filtered.length}</span> utilisateur(s) trouvé(s)
      ${filters.search || filters.role || filters.status ? `<span class="text-slate-400">· filtré(s)</span>` : ''}
    </div>
    <div class="text-xs text-slate-400">Page ${page} / ${totalPages || 1}</div>
  </div>

  <!-- Tableau utilisateurs -->
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
          <tr>
            <th class="px-5 py-3 text-left">Utilisateur</th>
            <th class="px-5 py-3 text-left">Rôle</th>
            <th class="px-5 py-3 text-left">Statut</th>
            <th class="px-5 py-3 text-left hidden lg:table-cell">Inscrit</th>
            <th class="px-5 py-3 text-left hidden xl:table-cell">Dernière co.</th>
            <th class="px-5 py-3 text-center hidden md:table-cell">Docs</th>
            <th class="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          ${paginated.map(user => `
          <tr class="table-row">
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0
                  ${user.role === 'administrateur' ? 'bg-purple-500' : 'bg-gradient-to-br from-blue-400 to-blue-600'}">
                  ${user.nom.charAt(0)}
                </div>
                <div>
                  <div class="text-sm font-medium text-slate-800">${user.nom}</div>
                  <div class="text-xs text-slate-400">${user.email}</div>
                </div>
              </div>
            </td>
            <td class="px-5 py-3">
              <span class="text-xs px-2 py-1 rounded-full font-medium ${user.role === 'administrateur' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">
                ${user.role === 'administrateur' ? '👑 Admin' : '🎓 Étudiant'}
              </span>
            </td>
            <td class="px-5 py-3">
              <span class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${user.status === 'actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                <span class="w-1.5 h-1.5 rounded-full inline-block ${user.status === 'actif' ? 'bg-green-500' : 'bg-red-500'}"></span>
                ${user.status}
              </span>
            </td>
            <td class="px-5 py-3 text-sm text-slate-500 hidden lg:table-cell">
              ${user.createdAt.toLocaleDateString('fr-FR')}
            </td>
            <td class="px-5 py-3 text-sm text-slate-500 hidden xl:table-cell">
              ${timeAgo(user.lastLogin)}
            </td>
            <td class="px-5 py-3 text-center hidden md:table-cell">
              <span class="text-sm font-medium text-slate-700">${user.documentsCount}</span>
            </td>
            <td class="px-5 py-3">
              <div class="flex items-center justify-end gap-1">
                <a href="/admin/users?id=${user.id}"
                   class="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition text-xs" title="Voir détails">
                  <i class="fas fa-eye"></i>
                </a>
                <button onclick="changeRole('${user.id}', '${user.nom}', '${user.role}')"
                  class="w-7 h-7 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center hover:bg-purple-100 transition text-xs" title="Changer rôle">
                  <i class="fas fa-user-shield"></i>
                </button>
                ${user.status === 'actif' ? `
                <button onclick="suspendUser('${user.id}', '${user.nom}')"
                  class="w-7 h-7 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center hover:bg-orange-100 transition text-xs" title="Suspendre">
                  <i class="fas fa-ban"></i>
                </button>` : `
                <button onclick="activateUser('${user.id}', '${user.nom}')"
                  class="w-7 h-7 bg-green-50 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-100 transition text-xs" title="Réactiver">
                  <i class="fas fa-check"></i>
                </button>`}
                <button onclick="deleteUser('${user.id}', '${user.nom}')"
                  class="w-7 h-7 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition text-xs" title="Supprimer">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    ${totalPages > 1 ? `
    <div class="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
      <div class="text-xs text-slate-500">${(page-1)*PAGE_SIZE + 1} – ${Math.min(page*PAGE_SIZE, filtered.length)} sur ${filtered.length}</div>
      <div class="flex gap-1">
        ${page > 1 ? `<a href="/admin/users?page=${page-1}${filters.search ? '&search='+filters.search : ''}${filters.role ? '&role='+filters.role : ''}${filters.status ? '&status='+filters.status : ''}" class="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs hover:bg-slate-200 no-underline">← Préc.</a>` : ''}
        ${page < totalPages ? `<a href="/admin/users?page=${page+1}${filters.search ? '&search='+filters.search : ''}${filters.role ? '&role='+filters.role : ''}${filters.status ? '&status='+filters.status : ''}" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 no-underline">Suiv. →</a>` : ''}
      </div>
    </div>` : ''}
  </div>

  <!-- Scripts actions -->
  <script>
    async function apiAction(url, method, body, successMsg) {
      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined
        });
        const data = await res.json();
        if (data.success) {
          showToast(successMsg || data.message, 'success');
          setTimeout(() => location.reload(), 800);
        } else {
          showToast(data.error || 'Erreur', 'error');
        }
      } catch(e) {
        showToast('Erreur de connexion', 'error');
      }
    }

    function changeRole(userId, nom, currentRole) {
      const newRole = currentRole === 'etudiant' ? 'administrateur' : 'etudiant';
      const msg = \`Changer le rôle de "\${nom}" vers "\${newRole}" ?\`;
      if (confirm(msg)) {
        apiAction(\`/api/admin/users/\${userId}/role\`, 'PATCH', { role: newRole },
          \`Rôle de \${nom} modifié → \${newRole}\`);
      }
    }

    function suspendUser(userId, nom) {
      const reason = prompt(\`Motif de suspension pour "\${nom}" :\`, 'Contenu inapproprié');
      if (reason !== null) {
        apiAction(\`/api/admin/users/\${userId}/suspend\`, 'POST', { reason },
          \`\${nom} suspendu(e)\`);
      }
    }

    function activateUser(userId, nom) {
      if (confirm(\`Réactiver le compte de "\${nom}" ?\`)) {
        apiAction(\`/api/admin/users/\${userId}/activate\`, 'POST', {},
          \`\${nom} réactivé(e)\`);
      }
    }

    function deleteUser(userId, nom) {
      const confirm1 = confirm(\`⚠️ Supprimer définitivement l'utilisateur "\${nom}" ?\`);
      if (!confirm1) return;
      const confirm2 = confirm(\`DERNIÈRE CONFIRMATION : Supprimer "\${nom}" et tous ses documents ?\`);
      if (confirm2) {
        apiAction(\`/api/admin/users/\${userId}\`, 'DELETE', null,
          \`\${nom} supprimé(e)\`);
      }
    }
  </script>
  `

  return adminLayout('Gestion des utilisateurs', content, 'users', session, pendingCount)
}
