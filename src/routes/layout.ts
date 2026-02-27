// Layout HTML commun à toutes les pages
export function layout(title: string, content: string, activeNav: string = ''): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <meta name="theme-color" content="#1a56db">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <title>${title} – Nexora Student</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link rel="stylesheet" href="/static/styles.css">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: { 50:'#eff6ff',100:'#dbeafe',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af' },
            nexora: { DEFAULT:'#1a56db', dark:'#1239a0', light:'#3b82f6' }
          }
        }
      }
    }
  </script>
</head>
<body class="bg-gray-50 font-sans min-h-screen flex flex-col">

  <!-- Header -->
  <header class="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg sticky top-0 z-50">
    <div class="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2 text-white no-underline">
        <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <i class="fas fa-graduation-cap text-sm"></i>
        </div>
        <span class="font-bold text-lg leading-tight">Nexora<span class="text-blue-200">Student</span></span>
      </a>
      <a href="/upload" class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1.5 rounded-full text-sm font-medium transition">
        <i class="fas fa-cloud-upload-alt mr-1"></i>Envoyer
      </a>
    </div>
  </header>

  <!-- Contenu principal -->
  <main class="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-24">
    ${content}
  </main>

  <!-- Navigation Bottom (Mobile) -->
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
    <div class="max-w-lg mx-auto flex items-center justify-around py-2">
      <a href="/" class="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition ${activeNav === 'home' ? 'text-blue-700' : 'text-gray-500'}">
        <i class="fas fa-home text-xl"></i>
        <span class="text-xs font-medium">Accueil</span>
      </a>
      <a href="/#cours" class="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition ${activeNav === 'cours' ? 'text-blue-700' : 'text-gray-500'}">
        <i class="fas fa-book-open text-xl"></i>
        <span class="text-xs font-medium">Cours</span>
      </a>
      <a href="/#exercices" class="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition ${activeNav === 'exercices' ? 'text-blue-700' : 'text-gray-500'}">
        <i class="fas fa-pencil-alt text-xl"></i>
        <span class="text-xs font-medium">Exercices</span>
      </a>
      <a href="/#sujets" class="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition ${activeNav === 'sujets' ? 'text-blue-700' : 'text-gray-500'}">
        <i class="fas fa-file-alt text-xl"></i>
        <span class="text-xs font-medium">Sujets</span>
      </a>
    </div>
  </nav>

</body>
</html>`
}
