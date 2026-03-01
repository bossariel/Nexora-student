/**
 * Supervision — logs d'activité, journaux admin, statistiques avancées
 */
import { adminLayout } from './layout'
import { adminLogsStore, activityLogsStore, documentsStore, exercisesStore, usersStore } from '../data/store'
import type { AdminSession } from './layout'

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

const actionLabels: Record<string, { label: string; color: string; icon: string }> = {
  DOCUMENT_VALIDATED: { label: 'Document validé', color: 'text-green-600', icon: 'fa-check-circle' },
  DOCUMENT_REJECTED: { label: 'Document rejeté', color: 'text-red-600', icon: 'fa-times-circle' },
  DOCUMENT_DELETED: { label: 'Document supprimé', color: 'text-red-600', icon: 'fa-trash' },
  USER_SUSPENDED: { label: 'Utilisateur suspendu', color: 'text-orange-600', icon: 'fa-ban' },
  USER_ACTIVATED: { label: 'Utilisateur réactivé', color: 'text-green-600', icon: 'fa-user-check' },
  USER_DELETED: { label: 'Utilisateur supprimé', color: 'text-red-600', icon: 'fa-user-times' },
  USER_ROLE_CHANGED: { label: 'Rôle modifié', color: 'text-purple-600', icon: 'fa-user-shield' },
  COURSE_CREATED: { label: 'Cours créé', color: 'text-blue-600', icon: 'fa-book-open' },
  COURSE_PUBLISHED: { label: 'Cours publié', color: 'text-green-600', icon: 'fa-globe' },
  COURSE_DELETED: { label: 'Cours supprimé', color: 'text-red-600', icon: 'fa-trash' },
}

export function renderLogs(session: AdminSession, tab: string = 'admin'): string {
  const pendingCount = documentsStore.filter(d => d.status === 'en_attente').length

  // Stats pour affichage
  const totalSubmissions = exercisesStore.reduce((s, e) => s + e.submissionsCount, 0)
  const mostPopularExo = exercisesStore.sort((a, b) => b.submissionsCount - a.submissionsCount)[0]
  const topDocument = documentsStore.filter(d => d.status === 'valide')[0]
  const activeUsersCount = usersStore.filter(u => {
    const diff = Date.now() - u.lastLogin.getTime()
    return diff < 7 * 86400000
  }).length

  const content = `
  <!-- Onglets -->
  <div class="flex gap-2 mb-5 flex-wrap">
    <a href="/admin/logs?tab=admin" class="px-4 py-2 rounded-xl text-sm font-medium no-underline transition ${tab === 'admin' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">
      <i class="fas fa-shield-alt mr-1"></i>Logs admin (${adminLogsStore.length})
    </a>
    <a href="/admin/logs?tab=activity" class="px-4 py-2 rounded-xl text-sm font-medium no-underline transition ${tab === 'activity' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">
      <i class="fas fa-history mr-1"></i>Activité système (${activityLogsStore.length})
    </a>
    <a href="/admin/logs?tab=stats" class="px-4 py-2 rounded-xl text-sm font-medium no-underline transition ${tab === 'stats' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">
      <i class="fas fa-chart-bar mr-1"></i>Statistiques avancées
    </a>
  </div>

  ${tab === 'admin' ? `
  <!-- ─── LOGS ADMIN ─── -->
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
      <div class="text-sm font-semibold text-slate-800">Journal des actions administrateurs</div>
      <button onclick="exportLogs()" class="text-xs text-blue-600 hover:underline flex items-center gap-1">
        <i class="fas fa-download"></i>Exporter CSV
      </button>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
          <tr>
            <th class="px-5 py-3 text-left">Date/Heure</th>
            <th class="px-5 py-3 text-left">Admin</th>
            <th class="px-5 py-3 text-left">Action</th>
            <th class="px-5 py-3 text-left hidden md:table-cell">Cible</th>
            <th class="px-5 py-3 text-left hidden lg:table-cell">Détails</th>
            <th class="px-5 py-3 text-left hidden xl:table-cell">IP</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          ${adminLogsStore.map(log => {
            const actionInfo = actionLabels[log.action] || { label: log.action, color: 'text-slate-600', icon: 'fa-circle' }
            return `
            <tr class="table-row">
              <td class="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">${formatDateTime(log.timestamp)}</td>
              <td class="px-5 py-3">
                <div class="text-xs font-medium text-slate-700">${log.adminEmail.split('@')[0]}</div>
                <div class="text-xs text-slate-400">${log.adminEmail}</div>
              </td>
              <td class="px-5 py-3">
                <span class="text-xs font-medium ${actionInfo.color} flex items-center gap-1">
                  <i class="fas ${actionInfo.icon}"></i>
                  ${actionInfo.label}
                </span>
              </td>
              <td class="px-5 py-3 hidden md:table-cell">
                <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">${log.targetType}</span>
                <div class="text-xs text-slate-400 mt-0.5 font-mono truncate max-w-24">${log.targetId}</div>
              </td>
              <td class="px-5 py-3 hidden lg:table-cell">
                <div class="text-xs text-slate-500 max-w-48 truncate">
                  ${Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(', ')}
                </div>
              </td>
              <td class="px-5 py-3 hidden xl:table-cell">
                <span class="text-xs font-mono text-slate-400">${log.ip}</span>
              </td>
            </tr>`
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>` : ''}

  ${tab === 'activity' ? `
  <!-- ─── LOGS D'ACTIVITÉ ─── -->
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
      <div class="text-sm font-semibold text-slate-800">Journal d'activité système</div>
      <div class="flex gap-2 text-xs">
        ${['info', 'success', 'warning', 'error'].map(t => `
        <span class="px-2 py-1 rounded-full
          ${t === 'info' ? 'bg-blue-100 text-blue-700' : t === 'success' ? 'bg-green-100 text-green-700' : t === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}">
          ${activityLogsStore.filter(l => l.type === t).length} ${t}
        </span>`).join('')}
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
          <tr>
            <th class="px-5 py-3 text-left">Date/Heure</th>
            <th class="px-5 py-3 text-left">Type</th>
            <th class="px-5 py-3 text-left">Message</th>
            <th class="px-5 py-3 text-left hidden md:table-cell">Utilisateur</th>
            <th class="px-5 py-3 text-left hidden lg:table-cell">Détails</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          ${activityLogsStore.map(log => {
            const typeConfig = {
              info: { color: 'bg-blue-100 text-blue-700', icon: 'fa-info-circle' },
              success: { color: 'bg-green-100 text-green-700', icon: 'fa-check-circle' },
              warning: { color: 'bg-yellow-100 text-yellow-700', icon: 'fa-exclamation-triangle' },
              error: { color: 'bg-red-100 text-red-700', icon: 'fa-times-circle' },
            }[log.type] || { color: 'bg-slate-100 text-slate-600', icon: 'fa-circle' }
            return `
            <tr class="table-row">
              <td class="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">${formatDateTime(log.timestamp)}</td>
              <td class="px-5 py-3">
                <span class="text-xs px-2 py-1 rounded-full font-medium ${typeConfig.color}">
                  <i class="fas ${typeConfig.icon} mr-1"></i>${log.type}
                </span>
              </td>
              <td class="px-5 py-3 text-sm text-slate-700">${log.message}</td>
              <td class="px-5 py-3 text-xs text-slate-500 hidden md:table-cell">${log.userEmail || '—'}</td>
              <td class="px-5 py-3 hidden lg:table-cell">
                <div class="text-xs text-slate-400 max-w-48 truncate">
                  ${Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(', ')}
                </div>
              </td>
            </tr>`
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>` : ''}

  ${tab === 'stats' ? `
  <!-- ─── STATISTIQUES AVANCÉES ─── -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
    <!-- Utilisateurs actifs -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-slate-700 text-sm">Utilisateurs actifs (7j)</h3>
        <i class="fas fa-users text-blue-400"></i>
      </div>
      <div class="text-4xl font-bold text-slate-800 mb-1">${activeUsersCount}</div>
      <div class="text-xs text-slate-500">sur ${usersStore.length} inscrits</div>
      <div class="mt-3 h-2 bg-slate-100 rounded-full">
        <div class="h-full bg-blue-500 rounded-full" style="width:${Math.round(activeUsersCount/usersStore.length*100)}%"></div>
      </div>
      <div class="text-xs text-blue-600 mt-1 font-medium">${Math.round(activeUsersCount/usersStore.length*100)}% taux d'activité</div>
    </div>

    <!-- Exercices : soumissions -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-slate-700 text-sm">Total soumissions QCM</h3>
        <i class="fas fa-pencil-alt text-green-400"></i>
      </div>
      <div class="text-4xl font-bold text-slate-800 mb-1">${totalSubmissions}</div>
      <div class="text-xs text-slate-500">sur ${exercisesStore.length} exercices</div>
      <div class="mt-3 space-y-1.5">
        ${exercisesStore.slice(0, 3).map(ex => `
        <div class="flex items-center gap-2">
          <div class="text-xs text-slate-600 flex-1 truncate">${ex.title.substring(0, 20)}…</div>
          <div class="text-xs font-bold text-slate-700">${ex.submissionsCount}</div>
          <div class="w-16 h-1.5 bg-slate-100 rounded-full">
            <div class="h-full bg-green-500 rounded-full" style="width:${Math.round(ex.submissionsCount/Math.max(...exercisesStore.map(e=>e.submissionsCount))*100)}%"></div>
          </div>
        </div>`).join('')}
      </div>
    </div>

    <!-- Documents par type -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-slate-700 text-sm">Documents par type</h3>
        <i class="fas fa-file-alt text-purple-400"></i>
      </div>
      ${['cours','exercice','examen','fiche','aide'].map(type => {
        const count = documentsStore.filter(d => d.type === type).length
        const pct = documentsStore.length > 0 ? Math.round(count / documentsStore.length * 100) : 0
        const colors: Record<string, string> = { cours: 'bg-blue-500', exercice: 'bg-green-500', examen: 'bg-purple-500', fiche: 'bg-yellow-500', aide: 'bg-orange-500' }
        return `
        <div class="flex items-center gap-2 mb-1.5">
          <div class="text-xs text-slate-600 w-16 capitalize">${type}</div>
          <div class="flex-1 h-2 bg-slate-100 rounded-full">
            <div class="h-full ${colors[type] || 'bg-slate-400'} rounded-full" style="width:${pct}%"></div>
          </div>
          <div class="text-xs font-bold text-slate-700 w-4 text-right">${count}</div>
        </div>`
      }).join('')}
    </div>

    <!-- Taux de validation -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-slate-700 text-sm">Taux de validation</h3>
        <i class="fas fa-chart-pie text-orange-400"></i>
      </div>
      <div class="relative" style="height:150px">
        <canvas id="validationChart"></canvas>
      </div>
    </div>

    <!-- Actions admin les + fréquentes -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-slate-700 text-sm">Actions admin les + fréquentes</h3>
        <i class="fas fa-shield-alt text-slate-400"></i>
      </div>
      ${Object.entries(
        adminLogsStore.reduce((acc, log) => {
          acc[log.action] = (acc[log.action] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).sort(([,a],[,b]) => b-a).slice(0,5).map(([action, count]) => {
        const info = actionLabels[action] || { label: action, color: 'text-slate-600', icon: 'fa-circle' }
        return `
        <div class="flex items-center gap-2 mb-2">
          <i class="fas ${info.icon} ${info.color} text-xs w-4"></i>
          <div class="text-xs text-slate-600 flex-1 truncate">${info.label}</div>
          <span class="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">${count}</span>
        </div>`
      }).join('')}
    </div>

    <!-- Export données -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-slate-700 text-sm">Export &amp; Maintenance</h3>
        <i class="fas fa-tools text-slate-400"></i>
      </div>
      <div class="space-y-2">
        <button onclick="exportLogs()" class="w-full flex items-center gap-2 text-left text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-2.5 rounded-xl transition">
          <i class="fas fa-download text-blue-500"></i>Exporter logs admin CSV
        </button>
        <button onclick="exportUsers()" class="w-full flex items-center gap-2 text-left text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-2.5 rounded-xl transition">
          <i class="fas fa-users text-green-500"></i>Exporter utilisateurs CSV
        </button>
        <button onclick="exportDocuments()" class="w-full flex items-center gap-2 text-left text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-2.5 rounded-xl transition">
          <i class="fas fa-file-csv text-purple-500"></i>Exporter documents CSV
        </button>
        <button onclick="if(confirm('Vider les logs système ?')) showToast('Logs système nettoyés', 'success')"
          class="w-full flex items-center gap-2 text-left text-sm text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2.5 rounded-xl transition">
          <i class="fas fa-broom"></i>Nettoyer les logs anciens
        </button>
      </div>
    </div>
  </div>

  <script>
  (function() {
    const ctx = document.getElementById('validationChart')?.getContext('2d');
    if (!ctx) return;
    const validated = ${documentsStore.filter(d => d.status === 'valide').length};
    const rejected = ${documentsStore.filter(d => d.status === 'rejete').length};
    const pending = ${documentsStore.filter(d => d.status === 'en_attente').length};
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Validés', 'Rejetés', 'En attente'],
        datasets: [{ data: [validated, rejected, pending], backgroundColor: ['#22c55e','#ef4444','#f59e0b'], borderWidth: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font:{size:10}, boxWidth: 10 } } }
      }
    });
  })();
  </script>` : ''}

  <script>
    function exportLogs() {
      const rows = [['Date','Admin','Action','CibleType','CibleId','IP']];
      ${JSON.stringify(adminLogsStore.map(l => [
        l.timestamp.toISOString(), l.adminEmail, l.action, l.targetType, l.targetId, l.ip
      ]))}.forEach(r => rows.push(r));
      const csv = rows.map(r => r.join(',')).join('\\n');
      downloadCSV(csv, 'nexora_admin_logs.csv');
      showToast('Export lancé', 'success');
    }

    function exportUsers() {
      const rows = [['ID','Email','Nom','Rôle','Statut','Inscrit','Dernière co.','Documents']];
      ${JSON.stringify(usersStore.map(u => [
        u.id, u.email, u.nom, u.role, u.status,
        u.createdAt.toISOString(), u.lastLogin.toISOString(), u.documentsCount
      ]))}.forEach(r => rows.push(r));
      downloadCSV(rows.map(r => r.join(',')).join('\\n'), 'nexora_users.csv');
      showToast('Export utilisateurs lancé', 'success');
    }

    function exportDocuments() {
      const rows = [['ID','Titre','Auteur','Type','Statut','Classe','Date upload']];
      ${JSON.stringify(documentsStore.map(d => [
        d.id, d.title, d.authorEmail, d.type, d.status, d.classeId, d.uploadedAt.toISOString()
      ]))}.forEach(r => rows.push(r));
      downloadCSV(rows.map(r => r.join(',')).join('\\n'), 'nexora_documents.csv');
      showToast('Export documents lancé', 'success');
    }

    function downloadCSV(content, filename) {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }
  </script>
  `

  return adminLayout('Supervision & Logs', content, 'logs', session, pendingCount)
}
