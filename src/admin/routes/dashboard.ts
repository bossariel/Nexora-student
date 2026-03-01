/**
 * Dashboard admin — tableau de bord avec statistiques, activité récente et alertes
 */
import { adminLayout } from './layout'
import { getDashboardStats, activityLogsStore, documentsStore, usersStore, adminLogsStore } from '../data/store'
import type { AdminSession } from './layout'

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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

export function renderDashboard(session: AdminSession): string {
  const stats = getDashboardStats()
  const recentActivity = activityLogsStore.slice(0, 10)
  const pendingDocs = documentsStore.filter(d => d.status === 'en_attente').slice(0, 5)
  const recentUsers = usersStore
    .filter(u => u.role === 'etudiant')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
  const pendingCount = stats.pendingDocs

  const chartData = JSON.stringify(stats.registrationsLast7Days)

  const content = `
  <!-- ═══ STATS CARDS ═══ -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- Utilisateurs totaux -->
    <div class="stat-card bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div class="flex items-center justify-between mb-3">
        <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <i class="fas fa-users text-blue-600"></i>
        </div>
        <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+${recentUsers.length} récents</span>
      </div>
      <div class="text-3xl font-bold text-slate-800">${stats.totalUsers}</div>
      <div class="text-sm text-slate-500 mt-0.5">Utilisateurs totaux</div>
      <div class="text-xs text-slate-400 mt-1">${stats.activeUsers} actifs · ${stats.suspendedUsers} suspendus</div>
    </div>

    <!-- Documents en attente -->
    <div class="stat-card bg-white rounded-2xl p-4 shadow-sm border ${stats.pendingDocs > 0 ? 'border-orange-200' : 'border-slate-100'}">
      <div class="flex items-center justify-between mb-3">
        <div class="w-10 h-10 ${stats.pendingDocs > 0 ? 'bg-orange-50' : 'bg-slate-50'} rounded-xl flex items-center justify-center">
          <i class="fas fa-clock ${stats.pendingDocs > 0 ? 'text-orange-500' : 'text-slate-400'}"></i>
        </div>
        ${stats.pendingDocs > 0 ? `<span class="badge-pending text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">${stats.pendingDocs}</span>` : ''}
      </div>
      <div class="text-3xl font-bold text-slate-800">${stats.pendingDocs}</div>
      <div class="text-sm text-slate-500 mt-0.5">En attente</div>
      <div class="text-xs text-slate-400 mt-1">${stats.validatedDocs} validés · ${stats.rejectedDocs} rejetés</div>
    </div>

    <!-- Cours publiés -->
    <div class="stat-card bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div class="flex items-center justify-between mb-3">
        <div class="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
          <i class="fas fa-book text-purple-600"></i>
        </div>
        <a href="/admin/courses" class="text-xs text-purple-600 hover:underline">Gérer</a>
      </div>
      <div class="text-3xl font-bold text-slate-800">${stats.publishedCourses}</div>
      <div class="text-sm text-slate-500 mt-0.5">Cours publiés</div>
      <div class="text-xs text-slate-400 mt-1">${stats.totalExercises} exercices dont ${stats.publishedExercises} publiés</div>
    </div>

    <!-- Uploads aujourd'hui -->
    <div class="stat-card bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div class="flex items-center justify-between mb-3">
        <div class="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
          <i class="fas fa-cloud-upload-alt text-green-600"></i>
        </div>
      </div>
      <div class="text-3xl font-bold text-slate-800">${documentsStore.filter(d => Date.now() - d.uploadedAt.getTime() < 86400000).length}</div>
      <div class="text-sm text-slate-500 mt-0.5">Uploads aujourd'hui</div>
      <div class="text-xs text-slate-400 mt-1">${documentsStore.length} total documents</div>
    </div>
  </div>

  <!-- ═══ GRAPHIQUE + ACTIVITÉ ═══ -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

    <!-- Graphique d'activité 7 jours -->
    <div class="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-slate-800 flex items-center gap-2">
          <i class="fas fa-chart-bar text-blue-500"></i>
          Activité — 7 derniers jours
        </h2>
        <span class="text-xs text-slate-400">Inscriptions &amp; uploads</span>
      </div>
      <div class="relative" style="height:200px">
        <canvas id="activityChart"></canvas>
      </div>
    </div>

    <!-- Alertes & Notifications -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <h2 class="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <i class="fas fa-bell text-orange-500"></i>
        Alertes
      </h2>
      <div class="space-y-3">
        ${pendingCount > 0 ? `
        <div class="flex items-start gap-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
          <i class="fas fa-exclamation-circle text-orange-500 mt-0.5 flex-shrink-0"></i>
          <div>
            <div class="text-sm font-medium text-orange-800">${pendingCount} document(s) en attente</div>
            <div class="text-xs text-orange-600 mt-0.5">Validation requise</div>
            <a href="/admin/documents" class="text-xs text-orange-700 font-medium hover:underline">Traiter maintenant →</a>
          </div>
        </div>` : `
        <div class="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200 text-sm text-green-700">
          <i class="fas fa-check-circle text-green-500"></i>
          File d'attente vide
        </div>`}

        ${stats.suspendedUsers > 0 ? `
        <div class="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
          <i class="fas fa-user-slash text-red-500 mt-0.5 flex-shrink-0"></i>
          <div>
            <div class="text-sm font-medium text-red-800">${stats.suspendedUsers} compte(s) suspendu(s)</div>
            <a href="/admin/users?status=suspendu" class="text-xs text-red-700 font-medium hover:underline">Voir les comptes →</a>
          </div>
        </div>` : ''}

        <div class="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <i class="fas fa-info-circle text-blue-500 mt-0.5 flex-shrink-0"></i>
          <div>
            <div class="text-sm font-medium text-blue-800">Session en cours</div>
            <div class="text-xs text-blue-600">${session.email}</div>
            <div class="text-xs text-blue-500 mt-0.5">Expiration dans 30 min</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ DOCUMENTS EN ATTENTE + ACTIVITÉ RÉCENTE ═══ -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

    <!-- Documents en attente -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-semibold text-slate-800 flex items-center gap-2">
          <i class="fas fa-inbox text-orange-500"></i>
          File de validation
          ${pendingCount > 0 ? `<span class="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">${pendingCount}</span>` : ''}
        </h2>
        <a href="/admin/documents" class="text-xs text-blue-600 hover:underline font-medium">Tout voir →</a>
      </div>
      ${pendingDocs.length === 0 ? `
      <div class="p-8 text-center text-slate-400">
        <i class="fas fa-check-circle text-3xl mb-2 text-green-400"></i>
        <p class="text-sm">Aucun document en attente</p>
      </div>` : `
      <div class="divide-y divide-slate-50">
        ${pendingDocs.map(doc => `
        <div class="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base
            ${doc.fileType === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}">
            <i class="fas ${doc.fileType === 'PDF' ? 'fa-file-pdf' : 'fa-image'}"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-slate-800 truncate">${doc.title}</div>
            <div class="text-xs text-slate-400">${doc.authorNom} · ${timeAgo(doc.uploadedAt)}</div>
          </div>
          <div class="flex gap-1 flex-shrink-0">
            <a href="/admin/documents?action=validate&id=${doc.id}"
               class="w-7 h-7 bg-green-50 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-100 transition text-xs" title="Valider">
              <i class="fas fa-check"></i>
            </a>
            <a href="/admin/documents?id=${doc.id}"
               class="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition text-xs" title="Voir">
              <i class="fas fa-eye"></i>
            </a>
          </div>
        </div>
        `).join('')}
      </div>`}
    </div>

    <!-- Activité récente -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-semibold text-slate-800 flex items-center gap-2">
          <i class="fas fa-history text-blue-500"></i>
          Activité récente
        </h2>
        <a href="/admin/logs" class="text-xs text-blue-600 hover:underline font-medium">Logs complets →</a>
      </div>
      <div class="divide-y divide-slate-50 max-h-80 overflow-y-auto">
        ${recentActivity.map(log => {
          const iconMap: Record<string, string> = {
            info: 'fa-info-circle text-blue-400',
            success: 'fa-check-circle text-green-500',
            warning: 'fa-exclamation-triangle text-yellow-500',
            error: 'fa-times-circle text-red-500'
          }
          const bgMap: Record<string, string> = {
            info: 'bg-blue-50',
            success: 'bg-green-50',
            warning: 'bg-yellow-50',
            error: 'bg-red-50'
          }
          return `
          <div class="px-5 py-3 flex items-start gap-3">
            <div class="w-7 h-7 ${bgMap[log.type] || 'bg-slate-50'} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <i class="fas ${iconMap[log.type] || 'fa-circle text-slate-400'} text-xs"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm text-slate-700">${log.message}</div>
              ${log.userEmail ? `<div class="text-xs text-slate-400">${log.userEmail}</div>` : ''}
            </div>
            <div class="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">${timeAgo(log.timestamp)}</div>
          </div>`
        }).join('')}
      </div>
    </div>
  </div>

  <!-- ═══ INSCRIPTIONS RÉCENTES ═══ -->
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
      <h2 class="font-semibold text-slate-800 flex items-center gap-2">
        <i class="fas fa-user-plus text-green-500"></i>
        Inscriptions récentes
      </h2>
      <a href="/admin/users" class="text-xs text-blue-600 hover:underline font-medium">Gérer les utilisateurs →</a>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
          <tr>
            <th class="px-5 py-3 text-left">Utilisateur</th>
            <th class="px-5 py-3 text-left hidden sm:table-cell">Rôle</th>
            <th class="px-5 py-3 text-left hidden md:table-cell">Statut</th>
            <th class="px-5 py-3 text-left">Inscrit</th>
            <th class="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          ${recentUsers.map(user => `
          <tr class="table-row">
            <td class="px-5 py-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  ${user.nom.charAt(0)}
                </div>
                <div>
                  <div class="text-sm font-medium text-slate-800">${user.nom}</div>
                  <div class="text-xs text-slate-400">${user.email}</div>
                </div>
              </div>
            </td>
            <td class="px-5 py-3 hidden sm:table-cell">
              <span class="text-xs px-2 py-1 rounded-full font-medium ${user.role === 'administrateur' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">
                ${user.role === 'administrateur' ? '👑 Admin' : '🎓 Étudiant'}
              </span>
            </td>
            <td class="px-5 py-3 hidden md:table-cell">
              <span class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${user.status === 'actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                <span class="w-1.5 h-1.5 rounded-full ${user.status === 'actif' ? 'bg-green-500' : 'bg-red-500'}"></span>
                ${user.status}
              </span>
            </td>
            <td class="px-5 py-3 text-sm text-slate-500">${timeAgo(user.createdAt)}</td>
            <td class="px-5 py-3 text-right">
              <a href="/admin/users?id=${user.id}" class="text-xs text-blue-600 hover:underline">Voir</a>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Script graphique -->
  <script>
  (function() {
    const data = ${chartData};
    const ctx = document.getElementById('activityChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.jour),
        datasets: [
          {
            label: 'Inscriptions',
            data: data.map(d => d.inscriptions),
            backgroundColor: 'rgba(59,130,246,0.7)',
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: 'Uploads',
            data: data.map(d => d.uploads),
            backgroundColor: 'rgba(249,115,22,0.7)',
            borderRadius: 6,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: '#f1f5f9' } },
          x: { ticks: { font: { size: 10 } }, grid: { display: false } }
        }
      }
    });
  })();
  </script>
  `

  return adminLayout('Tableau de bord', content, 'dashboard', session, pendingCount)
}
