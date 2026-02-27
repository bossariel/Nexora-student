import { layout } from './layout'
import { classes } from '../data/classes'

export function renderUpload(): string {
  const content = `
  <div class="mb-4">
    <a href="/" class="text-blue-600 text-sm font-medium">
      <i class="fas fa-arrow-left mr-1"></i> Retour à l'accueil
    </a>
  </div>

  <div class="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-5 mb-5 shadow-md">
    <div class="text-3xl mb-2">📤</div>
    <h1 class="text-xl font-bold mb-1">Envoyer un document</h1>
    <p class="text-orange-100 text-sm">Partage tes ressources avec tous les élèves de Nexora Student !</p>
  </div>

  <!-- Onglets types d'upload -->
  <div class="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1 scrollbar-hide">
    <button onclick="setUploadType('aide')" id="tab-aide" class="upload-tab flex-shrink-0 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
      <i class="fas fa-question-circle mr-1"></i>Demander de l'aide
    </button>
    <button onclick="setUploadType('contribuer')" id="tab-contribuer" class="upload-tab flex-shrink-0 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
      <i class="fas fa-hand-holding-heart mr-1"></i>Contribuer
    </button>
    <button onclick="setUploadType('perso')" id="tab-perso" class="upload-tab flex-shrink-0 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
      <i class="fas fa-user mr-1"></i>Espace perso
    </button>
  </div>

  <!-- Description des onglets -->
  <div id="desc-aide" class="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-700">
    <i class="fas fa-info-circle mr-1"></i>
    Prends en photo un exercice que tu ne comprends pas et pose ta question. Nos contributeurs t'aideront !
  </div>
  <div id="desc-contribuer" class="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-700 hidden">
    <i class="fas fa-info-circle mr-1"></i>
    Partage tes sujets d'examen, fiches de révision ou exercices pour aider d'autres élèves.
  </div>
  <div id="desc-perso" class="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4 text-sm text-purple-700 hidden">
    <i class="fas fa-info-circle mr-1"></i>
    Retrouve ici l'historique de tes documents envoyés et leur statut de modération.
  </div>

  <!-- Formulaire d'upload -->
  <form id="upload-form" class="space-y-4" onsubmit="submitUpload(event)" enctype="multipart/form-data">
    <input type="hidden" name="typeUpload" id="typeUpload" value="aide">

    <!-- Classe -->
    <div>
      <label class="block text-sm font-semibold text-gray-700 mb-1.5">
        <i class="fas fa-graduation-cap text-blue-500 mr-1"></i>Classe concernée
      </label>
      <select name="classeId" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <option value="">-- Sélectionner une classe --</option>
        ${classes.map(cl => `<option value="${cl.id}">${cl.icone} ${cl.nom} – ${cl.niveau}</option>`).join('')}
      </select>
    </div>

    <!-- Zone de fichier -->
    <div>
      <label class="block text-sm font-semibold text-gray-700 mb-1.5">
        <i class="fas fa-paperclip text-blue-500 mr-1"></i>Fichier à envoyer
      </label>
      <div id="dropzone"
        class="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
        onclick="document.getElementById('file-input').click()"
        ondragover="handleDragOver(event)"
        ondragleave="handleDragLeave(event)"
        ondrop="handleDrop(event)">
        <div id="dropzone-content">
          <div class="text-4xl mb-2">📁</div>
          <p class="text-sm font-medium text-gray-600">Clique ou glisse ton fichier ici</p>
          <p class="text-xs text-gray-400 mt-1">JPG, PNG, PDF, DOC, DOCX • Max 10 MB</p>
        </div>
        <div id="file-selected" class="hidden">
          <div class="text-4xl mb-2" id="file-icon">📄</div>
          <p class="text-sm font-medium text-gray-700" id="file-name">fichier.pdf</p>
          <p class="text-xs text-gray-400 mt-1" id="file-size">0 KB</p>
          <button type="button" onclick="clearFile(event)" class="mt-2 text-xs text-red-500 hover:text-red-700">
            <i class="fas fa-times mr-1"></i>Supprimer
          </button>
        </div>
      </div>
      <input type="file" id="file-input" name="fichier" class="hidden"
        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
        onchange="handleFileSelect(event)">
    </div>

    <!-- Description -->
    <div>
      <label class="block text-sm font-semibold text-gray-700 mb-1.5">
        <i class="fas fa-comment text-blue-500 mr-1"></i>
        <span id="desc-label">Ta question ou description</span>
      </label>
      <textarea name="description" id="description"
        rows="4"
        placeholder="Décris ton document ou pose ta question..."
        class="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
    </div>

    <!-- Bouton submit -->
    <button type="submit" id="submit-btn"
      class="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-2xl text-base hover:from-orange-600 hover:to-red-600 transition shadow-md">
      <i class="fas fa-paper-plane mr-2"></i>Envoyer le document
    </button>
  </form>

  <!-- Résultat upload -->
  <div id="upload-result" class="hidden mt-4"></div>

  <!-- Section espace perso (historique simulé) -->
  <div id="perso-section" class="hidden mt-4">
    <h2 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
      <i class="fas fa-history text-purple-600"></i> Mes envois récents
    </h2>
    <div class="space-y-2">
      <div class="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3">
        <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl">📄</div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-700">Sujet BEPC Math 2024.pdf</div>
          <div class="text-xs text-gray-400">Envoyé il y a 2 jours</div>
        </div>
        <span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">En attente</span>
      </div>
      <div class="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3">
        <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl">📸</div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-700">Exercice Physique BAC2.jpg</div>
          <div class="text-xs text-gray-400">Envoyé il y a 5 jours</div>
        </div>
        <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Publié ✓</span>
      </div>
    </div>
  </div>

  <script>
    let currentTab = 'aide';

    function setUploadType(type) {
      currentTab = type;
      document.getElementById('typeUpload').value = type;

      // Onglets
      document.querySelectorAll('.upload-tab').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-700');
      });
      const activeTab = document.getElementById('tab-' + type);
      activeTab.classList.add('bg-blue-600', 'text-white');
      activeTab.classList.remove('bg-gray-100', 'text-gray-700');

      // Descriptions
      ['aide', 'contribuer', 'perso'].forEach(t => {
        document.getElementById('desc-' + t).classList.add('hidden');
      });
      document.getElementById('desc-' + type).classList.remove('hidden');

      // Espace perso
      const form = document.getElementById('upload-form');
      const perso = document.getElementById('perso-section');
      if (type === 'perso') {
        form.classList.add('hidden');
        perso.classList.remove('hidden');
      } else {
        form.classList.remove('hidden');
        perso.classList.add('hidden');
      }

      // Label description
      const labels = {
        aide: 'Ta question (décris ce que tu ne comprends pas)',
        contribuer: 'Description du document (titre, matière, classe...)'
      };
      const descLabel = document.getElementById('desc-label');
      if (descLabel && labels[type]) descLabel.textContent = labels[type];
    }

    function handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) showFilePreview(file);
    }

    function handleDragOver(event) {
      event.preventDefault();
      document.getElementById('dropzone').classList.add('border-blue-500', 'bg-blue-50');
    }

    function handleDragLeave(event) {
      document.getElementById('dropzone').classList.remove('border-blue-500', 'bg-blue-50');
    }

    function handleDrop(event) {
      event.preventDefault();
      document.getElementById('dropzone').classList.remove('border-blue-500', 'bg-blue-50');
      const file = event.dataTransfer.files[0];
      if (file) {
        const input = document.getElementById('file-input');
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        showFilePreview(file);
      }
    }

    function showFilePreview(file) {
      const icons = { 'application/pdf': '📕', 'image/jpeg': '🖼️', 'image/png': '🖼️' };
      const icon = icons[file.type] || '📄';
      const size = file.size < 1024 ? file.size + ' B'
        : file.size < 1024*1024 ? (file.size/1024).toFixed(1) + ' KB'
        : (file.size/1024/1024).toFixed(1) + ' MB';

      document.getElementById('dropzone-content').classList.add('hidden');
      document.getElementById('file-selected').classList.remove('hidden');
      document.getElementById('file-icon').textContent = icon;
      document.getElementById('file-name').textContent = file.name;
      document.getElementById('file-size').textContent = size;
    }

    function clearFile(event) {
      event.stopPropagation();
      document.getElementById('file-input').value = '';
      document.getElementById('dropzone-content').classList.remove('hidden');
      document.getElementById('file-selected').classList.add('hidden');
    }

    async function submitUpload(event) {
      event.preventDefault();
      const btn = document.getElementById('submit-btn');
      const result = document.getElementById('upload-result');
      const form = document.getElementById('upload-form');

      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Envoi en cours...';

      try {
        const formData = new FormData(form);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();

        result.classList.remove('hidden');
        if (data.success) {
          result.innerHTML = \`
            <div class="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
              <div class="text-4xl mb-2">✅</div>
              <h3 class="font-bold text-green-700 mb-1">Fichier envoyé avec succès !</h3>
              <p class="text-sm text-green-600 mb-3">\${data.message}</p>
              <div class="bg-white rounded-xl p-3 text-left text-xs text-gray-600 space-y-1">
                <div><strong>Fichier :</strong> \${data.details.nom}</div>
                <div><strong>Taille :</strong> \${data.details.taille}</div>
                <div><strong>Statut :</strong> <span class="text-yellow-600 font-medium">\${data.details.statut}</span></div>
              </div>
              <button onclick="resetForm()" class="mt-3 bg-green-600 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition">
                <i class="fas fa-plus mr-1"></i>Envoyer un autre fichier
              </button>
            </div>
          \`;
          form.reset();
          clearFile(new Event('click'));
        } else {
          result.innerHTML = \`
            <div class="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
              <div class="text-4xl mb-2">❌</div>
              <h3 class="font-bold text-red-700 mb-1">Erreur</h3>
              <p class="text-sm text-red-600">\${data.error}</p>
            </div>
          \`;
        }
      } catch(e) {
        result.classList.remove('hidden');
        result.innerHTML = \`
          <div class="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <div class="text-4xl mb-2">❌</div>
            <p class="text-sm text-red-600">Erreur de connexion. Réessaie.</p>
          </div>
        \`;
      }

      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Envoyer le document';
    }

    function resetForm() {
      document.getElementById('upload-result').classList.add('hidden');
      document.getElementById('upload-form').reset();
    }
  </script>
  `

  return layout('Envoyer un document', content, '')
}
