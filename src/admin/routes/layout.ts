/**
 * AdminLayout — mise en page commune à toutes les pages du back-office
 * Navigation latérale desktop + topbar + timer de session
 */

export interface AdminSession {
  sessionId: string
  userId: string
  email: string
  nom: string
}

export function adminLayout(
  title: string,
  content: string,
  activeNav: string,
  session: AdminSession,
  pendingCount = 0
): string {
  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: 'fas fa-chart-pie', href: '/admin' },
    { id: 'users', label: 'Utilisateurs', icon: 'fas fa-users', href: '/admin/users' },
    { id: 'documents', label: 'Documents', icon: 'fas fa-file-alt', href: '/admin/documents', badge: pendingCount },
    { id: 'courses', label: 'Cours', icon: 'fas fa-book', href: '/admin/courses' },
    { id: 'exercises', label: 'Exercices', icon: 'fas fa-pencil-alt', href: '/admin/exercises' },
    { id: 'logs', label: 'Supervision', icon: 'fas fa-shield-alt', href: '/admin/logs' },
  ]

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>${title} — Administration Nexora</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link rel="stylesheet" href="/static/styles.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            admin: { DEFAULT: '#1e293b', sidebar: '#0f172a', accent: '#3b82f6', danger: '#ef4444', success: '#22c55e', warning: '#f59e0b' }
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; }
    .sidebar-item.active { background: rgba(59,130,246,0.15); color: #60a5fa; border-left: 3px solid #3b82f6; }
    .sidebar-item { border-left: 3px solid transparent; }
    .sidebar-item:hover:not(.active) { background: rgba(255,255,255,0.05); }
    #sidebar { transition: transform 0.2s ease; }
    .stat-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
    .session-bar { background: linear-gradient(90deg, #22c55e, #16a34a); transition: width 1s linear; }
    @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .pulse-dot { animation: pulse-dot 2s infinite; }
    .table-row:hover { background: #f8fafc; }
    .badge-pending { animation: pulse-dot 2s infinite; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #1e293b; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
  </style>
</head>
<body class="bg-slate-100 flex h-screen overflow-hidden">

  <!-- ═══ SIDEBAR ═══ -->
  <aside id="sidebar" class="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 h-full z-40">
    <!-- Logo -->
    <div class="px-5 py-4 border-b border-slate-700">
      <a href="/admin" class="flex items-center gap-3 no-underline">
        <div class="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
          <i class="fas fa-graduation-cap text-white text-base"></i>
        </div>
        <div>
          <div class="font-bold text-white text-sm">Nexora</div>
          <div class="text-xs text-blue-400 font-medium">Back-office</div>
        </div>
      </a>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      ${navItems.map(item => `
      <a href="${item.href}"
         class="sidebar-item ${activeNav === item.id ? 'active' : 'text-slate-300'} flex items-center gap-3 px-3 py-2.5 rounded-r-lg rounded-l-none text-sm font-medium no-underline transition cursor-pointer">
        <i class="${item.icon} w-4 text-center ${activeNav === item.id ? 'text-blue-400' : 'text-slate-400'}"></i>
        <span class="flex-1">${item.label}</span>
        ${item.badge && item.badge > 0 ? `<span class="badge-pending bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">${item.badge}</span>` : ''}
      </a>
      `).join('')}
    </nav>

    <!-- Profil admin & déconnexion -->
    <div class="px-3 py-4 border-t border-slate-700">
      <div class="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-slate-800">
        <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
          ${session.nom.charAt(0).toUpperCase()}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-white truncate">${session.nom}</div>
          <div class="text-xs text-slate-400 truncate">${session.email}</div>
        </div>
        <div class="pulse-dot w-2 h-2 bg-green-400 rounded-full flex-shrink-0" title="Session active"></div>
      </div>
      <a href="/" class="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-200 text-xs transition no-underline">
        <i class="fas fa-external-link-alt"></i> Voir le site
      </a>
      <form action="/admin/logout" method="POST">
        <button type="submit" class="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 text-xs transition cursor-pointer">
          <i class="fas fa-sign-out-alt"></i> Déconnexion
        </button>
      </form>
    </div>
  </aside>

  <!-- ═══ ZONE PRINCIPALE ═══ -->
  <div class="flex-1 flex flex-col overflow-hidden">

    <!-- Topbar -->
    <header class="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
      <div class="flex items-center gap-4">
        <button onclick="toggleSidebar()" class="text-slate-500 hover:text-slate-700 lg:hidden">
          <i class="fas fa-bars text-lg"></i>
        </button>
        <div>
          <h1 class="font-bold text-slate-800 text-base leading-tight">${title}</h1>
          <div class="text-xs text-slate-500">Administration Nexora Student</div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <!-- Timer session -->
        <div class="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
          <i class="fas fa-clock text-blue-500"></i>
          <span>Session : </span>
          <span id="session-timer" class="font-mono font-bold text-slate-700">30:00</span>
        </div>
        <!-- Badge documents en attente -->
        ${pendingCount > 0 ? `
        <a href="/admin/documents" class="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200 hover:bg-red-100 transition no-underline">
          <i class="fas fa-clock"></i>
          ${pendingCount} en attente
        </a>` : ''}
        <!-- Retour site -->
        <a href="/" class="hidden md:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition no-underline">
          <i class="fas fa-arrow-left"></i> Site
        </a>
      </div>
    </header>

    <!-- Barre de progression de session -->
    <div class="h-0.5 bg-slate-200">
      <div id="session-bar" class="session-bar h-full" style="width:100%"></div>
    </div>

    <!-- Contenu scrollable -->
    <main class="flex-1 overflow-y-auto p-6">
      ${content}
    </main>

  </div>

  <script>
    // ─── Timer de session (30 min) ─────────────────────────────────────────────
    let sessionSeconds = 30 * 60;
    const totalSeconds = 30 * 60;

    function updateTimer() {
      if (sessionSeconds <= 0) {
        document.getElementById('session-timer').textContent = '00:00';
        document.getElementById('session-bar').style.width = '0%';
        // Auto-déconnexion
        alert('⚠️ Session expirée. Vous allez être déconnecté.');
        window.location.href = '/admin/login?expired=1';
        return;
      }
      const m = Math.floor(sessionSeconds / 60);
      const s = sessionSeconds % 60;
      document.getElementById('session-timer').textContent =
        String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');

      const pct = (sessionSeconds / totalSeconds) * 100;
      const bar = document.getElementById('session-bar');
      bar.style.width = pct + '%';

      // Changer couleur quand < 5 min
      if (sessionSeconds < 300) {
        bar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        document.getElementById('session-timer').style.color = '#ef4444';
      }
      sessionSeconds--;
    }

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    // Réinitialiser le timer à chaque interaction
    ['click', 'keypress', 'scroll'].forEach(evt =>
      document.addEventListener(evt, () => {
        sessionSeconds = totalSeconds;
        document.getElementById('session-bar').style.background = '';
        document.getElementById('session-timer').style.color = '';
      }, { passive: true })
    );

    // ─── Toggle sidebar mobile ──────────────────────────────────────────────────
    function toggleSidebar() {
      const sb = document.getElementById('sidebar');
      sb.classList.toggle('-translate-x-full');
    }

    // ─── Notifications toast ────────────────────────────────────────────────────
    function showToast(message, type = 'success') {
      const colors = { success: 'bg-green-600', error: 'bg-red-600', warning: 'bg-yellow-600', info: 'bg-blue-600' };
      const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
      const toast = document.createElement('div');
      toast.className = \`fixed top-4 right-4 z-50 \${colors[type]} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium\`;
      toast.innerHTML = \`<i class="fas \${icons[type]}"></i> \${message}\`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3500);
    }

    // ─── Confirmation modale ────────────────────────────────────────────────────
    function confirmAction(message, callback) {
      if (confirm(message)) callback();
    }

    // Exposer globalement
    window.showToast = showToast;
    window.confirmAction = confirmAction;
  </script>
</body>
</html>`
}

/**
 * Page de login admin
 */
export function renderAdminLogin(error?: string, redirect?: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Connexion Admin — Nexora</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
</head>
<body class="bg-slate-900 min-h-screen flex items-center justify-center p-4">
  <div class="w-full max-w-sm">
    <!-- Logo -->
    <div class="text-center mb-8">
      <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
        <i class="fas fa-graduation-cap text-white text-2xl"></i>
      </div>
      <h1 class="text-white text-2xl font-bold">Nexora Student</h1>
      <p class="text-slate-400 text-sm mt-1">Administration — Accès restreint</p>
    </div>

    <!-- Carte de connexion -->
    <div class="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
      <h2 class="text-white font-semibold text-lg mb-5 flex items-center gap-2">
        <i class="fas fa-lock text-blue-400 text-base"></i>
        Connexion administrateur
      </h2>

      ${error ? `
      <div class="bg-red-900 bg-opacity-50 border border-red-700 text-red-300 rounded-xl px-4 py-3 mb-4 text-sm flex items-center gap-2">
        <i class="fas fa-exclamation-triangle"></i>
        ${error}
      </div>` : ''}

      <form method="POST" action="/admin/login" class="space-y-4">
        <input type="hidden" name="redirect" value="${redirect || '/admin'}">

        <div>
          <label class="block text-slate-300 text-sm font-medium mb-1.5">
            <i class="fas fa-envelope text-slate-500 mr-1"></i>Email
          </label>
          <input type="email" name="email" required
            placeholder="admin@nexora.tg"
            class="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>

        <div>
          <label class="block text-slate-300 text-sm font-medium mb-1.5">
            <i class="fas fa-key text-slate-500 mr-1"></i>Mot de passe
          </label>
          <div class="relative">
            <input type="password" name="password" id="pwd-input" required
              placeholder="••••••••••••"
              class="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <button type="button" onclick="togglePwd()" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              <i class="fas fa-eye text-sm" id="pwd-eye"></i>
            </button>
          </div>
        </div>

        <button type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md">
          <i class="fas fa-sign-in-alt"></i>
          Se connecter
        </button>
      </form>

      <div class="mt-4 pt-4 border-t border-slate-700 text-center">
        <a href="/" class="text-slate-400 hover:text-slate-200 text-xs transition no-underline">
          <i class="fas fa-arrow-left mr-1"></i>Retour au site
        </a>
      </div>
    </div>

    <!-- Infos de démo -->
    <div class="mt-4 bg-slate-800 bg-opacity-50 rounded-xl p-4 border border-slate-700 text-xs text-slate-400">
      <div class="font-medium text-slate-300 mb-2"><i class="fas fa-info-circle mr-1 text-blue-400"></i>Comptes de démonstration :</div>
      <div class="space-y-1">
        <div><span class="text-slate-300">Email :</span> admin@nexora.tg</div>
        <div><span class="text-slate-300">Mot de passe :</span> Admin@Nexora2024</div>
      </div>
    </div>
  </div>

  <script>
    function togglePwd() {
      const input = document.getElementById('pwd-input');
      const eye = document.getElementById('pwd-eye');
      if (input.type === 'password') {
        input.type = 'text';
        eye.className = 'fas fa-eye-slash text-sm';
      } else {
        input.type = 'password';
        eye.className = 'fas fa-eye text-sm';
      }
    }
  </script>
</body>
</html>`
}
