import { layout } from './layout'
import type { Classe } from '../data/classes'
import type { Exercice } from '../data/exercices'

// Page liste des exercices
export function renderExercices(classe: Classe, exosByClasse: Exercice[]): string {
  const matieres = [...new Set(exosByClasse.map(e => e.matiere))]

  const content = `
  <div class="mb-4">
    <a href="/classe/${classe.id}" class="text-blue-600 text-sm font-medium">
      <i class="fas fa-arrow-left mr-1"></i> Retour à ${classe.nom}
    </a>
  </div>
  <div class="flex items-center gap-3 mb-5">
    <div class="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">✏️</div>
    <div>
      <h1 class="text-xl font-bold text-gray-800">Exercices – ${classe.nom}</h1>
      <p class="text-sm text-gray-500">${exosByClasse.length} exercices disponibles</p>
    </div>
  </div>

  ${matieres.map(matiere => {
    const exosDeMat = exosByClasse.filter(e => e.matiere === matiere)
    return `
    <div class="mb-5">
      <div class="flex items-center gap-2 mb-3">
        <span class="font-bold text-gray-800">${matiere}</span>
        <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">${exosDeMat.length}</span>
      </div>
      ${exosDeMat.map(ex => `
      <a href="/exercices/${classe.id}/${ex.id}" class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-200 transition block mb-3 no-underline">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">✏️</div>
          <div class="flex-1">
            <div class="font-semibold text-gray-800">${ex.titre}</div>
            <div class="text-xs text-gray-500 mt-0.5 leading-relaxed">${ex.description}</div>
            <div class="flex items-center gap-3 mt-2 flex-wrap">
              <span class="text-xs text-gray-500"><i class="fas fa-question-circle mr-1 text-blue-400"></i>${ex.questions.length} questions</span>
              <span class="text-xs text-gray-500"><i class="fas fa-clock mr-1 text-blue-400"></i>${ex.duree}</span>
              <span class="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">${ex.points} pts</span>
              <span class="text-xs px-2 py-0.5 rounded-full ${ex.difficulte === 'Facile' ? 'bg-green-100 text-green-700' : ex.difficulte === 'Moyen' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}">${ex.difficulte}</span>
            </div>
          </div>
          <i class="fas fa-play-circle text-green-500 text-xl flex-shrink-0"></i>
        </div>
      </a>
      `).join('')}
    </div>`
  }).join('')}
  `

  return layout(`Exercices – ${classe.nom}`, content, 'exercices')
}

// Page QCM interactif
export function renderQCM(classe: Classe, exercice: Exercice): string {
  const questionsJSON = JSON.stringify(exercice.questions)

  const content = `
  <div class="mb-4">
    <a href="/exercices/${classe.id}" class="text-blue-600 text-sm font-medium">
      <i class="fas fa-arrow-left mr-1"></i> Retour aux exercices
    </a>
  </div>

  <!-- En-tête exercice -->
  <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">${classe.nom}</span>
      <span class="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">${exercice.matiere}</span>
    </div>
    <h1 class="text-xl font-bold text-gray-800 mb-1">${exercice.titre}</h1>
    <p class="text-sm text-gray-500">${exercice.description}</p>
    <div class="flex gap-3 mt-3 pt-3 border-t border-gray-100">
      <span class="text-xs text-gray-500"><i class="fas fa-question-circle mr-1 text-blue-400"></i>${exercice.questions.length} questions</span>
      <span class="text-xs text-gray-500"><i class="fas fa-clock mr-1 text-blue-400"></i>${exercice.duree}</span>
      <span class="text-xs font-bold text-green-600">${exercice.points} pts</span>
    </div>
  </div>

  <!-- Zone QCM -->
  <div id="quiz-container">
    <!-- Barre de progression -->
    <div class="flex items-center gap-3 mb-4">
      <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div id="progress-bar" class="h-full bg-blue-500 rounded-full transition-all duration-500" style="width:0%"></div>
      </div>
      <span id="progress-text" class="text-xs text-gray-500 font-medium whitespace-nowrap">0 / ${exercice.questions.length}</span>
    </div>

    <!-- Questions affichées une par une -->
    <div id="question-zone"></div>

    <!-- Boutons de navigation -->
    <div class="flex gap-3 mt-4">
      <button id="btn-prev" onclick="prevQuestion()" class="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-200 transition hidden">
        <i class="fas fa-chevron-left mr-1"></i> Précédent
      </button>
      <button id="btn-next" onclick="nextQuestion()" class="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl text-sm hover:bg-blue-700 transition">
        Suivant <i class="fas fa-chevron-right ml-1"></i>
      </button>
      <button id="btn-submit" onclick="submitQuiz()" class="flex-1 bg-green-600 text-white font-semibold py-3 rounded-xl text-sm hover:bg-green-700 transition hidden">
        <i class="fas fa-check mr-1"></i> Terminer
      </button>
    </div>
  </div>

  <!-- Zone résultat (cachée au départ) -->
  <div id="result-zone" class="hidden"></div>

  <script>
    const questions = ${questionsJSON};
    const exoId = '${exercice.id}';
    const classeId = '${classe.id}';
    let currentQ = 0;
    const reponses = {};

    function renderQuestion(index) {
      const q = questions[index];
      const userRep = reponses[q.id];
      const zone = document.getElementById('question-zone');
      const total = questions.length;

      // Mise à jour progression
      document.getElementById('progress-bar').style.width = ((index) / total * 100) + '%';
      document.getElementById('progress-text').textContent = index + ' / ' + total;

      zone.innerHTML = \`
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <div class="text-xs text-blue-600 font-semibold mb-2 uppercase tracking-wide">Question \${index+1} sur \${total}</div>
          <p class="font-semibold text-gray-800 text-base leading-relaxed mb-4">\${q.question}</p>
          <div class="space-y-2">
            \${q.options.map((opt, i) => \`
            <button onclick="selectOption(\${q.id}, \${i})" id="opt-\${q.id}-\${i}"
              class="w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition \${
                userRep === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }">
              <span class="inline-block w-6 h-6 rounded-full text-center leading-6 text-xs font-bold mr-2 \${
                userRep === i ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
              }">\${String.fromCharCode(65+i)}</span>
              \${opt}
            </button>
            \`).join('')}
          </div>
        </div>
      \`;

      // Boutons nav
      const btnPrev = document.getElementById('btn-prev');
      const btnNext = document.getElementById('btn-next');
      const btnSubmit = document.getElementById('btn-submit');

      btnPrev.classList.toggle('hidden', index === 0);
      if (index === total - 1) {
        btnNext.classList.add('hidden');
        btnSubmit.classList.remove('hidden');
      } else {
        btnNext.classList.remove('hidden');
        btnSubmit.classList.add('hidden');
      }
    }

    function selectOption(questionId, optionIndex) {
      reponses[questionId] = optionIndex;
      renderQuestion(currentQ);
    }

    function nextQuestion() {
      if (currentQ < questions.length - 1) {
        currentQ++;
        renderQuestion(currentQ);
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
    }

    function prevQuestion() {
      if (currentQ > 0) {
        currentQ--;
        renderQuestion(currentQ);
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
    }

    async function submitQuiz() {
      // Vérifier que toutes les questions ont été répondues
      const nonRepondues = questions.filter(q => reponses[q.id] === undefined);
      if (nonRepondues.length > 0) {
        if (!confirm(\`Tu n'as pas répondu à \${nonRepondues.length} question(s). Continuer quand même ?\`)) return;
      }

      try {
        const res = await fetch('/api/exercices/' + exoId + '/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reponses })
        });
        const data = await res.json();
        showResults(data);
      } catch(e) {
        alert('Erreur lors de la soumission. Réessaie.');
      }
    }

    function showResults(data) {
      document.getElementById('quiz-container').classList.add('hidden');
      const zone = document.getElementById('result-zone');
      zone.classList.remove('hidden');

      const couleurMention = data.pourcentage >= 80 ? 'text-yellow-500' : data.pourcentage >= 60 ? 'text-blue-500' : data.pourcentage >= 40 ? 'text-orange-500' : 'text-red-500';
      const bgScore = data.pourcentage >= 80 ? 'from-yellow-400 to-orange-400' : data.pourcentage >= 60 ? 'from-blue-500 to-blue-600' : data.pourcentage >= 40 ? 'from-orange-400 to-orange-500' : 'from-red-400 to-red-500';

      zone.innerHTML = \`
        <div class="bg-gradient-to-br \${bgScore} text-white rounded-2xl p-6 text-center mb-5 shadow-md">
          <div class="text-5xl mb-2">\${data.pourcentage >= 80 ? '🏆' : data.pourcentage >= 60 ? '👍' : data.pourcentage >= 40 ? '📚' : '💪'}</div>
          <div class="text-4xl font-bold">\${data.pourcentage}%</div>
          <div class="text-lg font-semibold mt-1">\${data.mention}</div>
          <div class="text-white text-opacity-80 text-sm mt-1">\${data.score} / \${data.total} bonnes réponses</div>
        </div>

        <h2 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <i class="fas fa-clipboard-check text-green-600"></i> Corrections détaillées
        </h2>

        \${data.corrections.map((cor, i) => \`
        <div class="bg-white rounded-xl p-4 shadow-sm border \${cor.correct ? 'border-green-200' : 'border-red-200'} mb-3">
          <div class="flex items-start gap-2 mb-2">
            <span class="\${cor.correct ? 'text-green-500' : 'text-red-500'} text-lg flex-shrink-0">
              \${cor.correct ? '✅' : '❌'}
            </span>
            <p class="font-medium text-gray-800 text-sm">\${cor.question}</p>
          </div>
          \${!cor.correct ? \`
          <div class="text-sm text-red-600 mb-1">
            <i class="fas fa-times mr-1"></i>Ta réponse : <em>\${questions[i].options[cor.reponseUtilisateur] ?? 'Sans réponse'}</em>
          </div>
          <div class="text-sm text-green-600 mb-1">
            <i class="fas fa-check mr-1"></i>Bonne réponse : <strong>\${questions[i].options[cor.bonneReponse]}</strong>
          </div>
          \` : \`
          <div class="text-sm text-green-600 mb-1">
            <i class="fas fa-check mr-1"></i>Correct : <strong>\${questions[i].options[cor.bonneReponse]}</strong>
          </div>
          \`}
          <div class="text-xs text-gray-500 bg-blue-50 rounded-lg p-2 mt-2">
            <i class="fas fa-lightbulb text-yellow-500 mr-1"></i>\${cor.explication}
          </div>
        </div>
        \`).join('')}

        <div class="flex gap-3 mt-5">
          <button onclick="restartQuiz()" class="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-200 transition">
            <i class="fas fa-redo mr-1"></i> Recommencer
          </button>
          <a href="/exercices/\${classeId}" class="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl text-sm text-center hover:bg-blue-700 transition no-underline">
            <i class="fas fa-list mr-1"></i> Autres exercices
          </a>
        </div>
      \`;
      window.scrollTo({top: 0, behavior: 'smooth'});
    }

    function restartQuiz() {
      currentQ = 0;
      Object.keys(reponses).forEach(k => delete reponses[k]);
      document.getElementById('result-zone').classList.add('hidden');
      document.getElementById('quiz-container').classList.remove('hidden');
      renderQuestion(0);
      window.scrollTo({top: 0, behavior: 'smooth'});
    }

    // Démarrer
    renderQuestion(0);
  </script>
  `

  return layout(exercice.titre, content, 'exercices')
}
