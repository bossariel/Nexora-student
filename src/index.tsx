import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { classes } from './data/classes'
import { cours } from './data/cours'
import { exercices } from './data/exercices'
import { sujetsExamen } from './data/sujets'
import { renderHome } from './routes/home'
import { renderClasse } from './routes/classe'
import { renderCours, renderLecon } from './routes/cours'
import { renderExercices, renderQCM } from './routes/exercices'
import { renderSujets } from './routes/sujets'
import { renderUpload } from './routes/upload'

const app = new Hono()

// Servir les fichiers statiques
app.use('/static/*', serveStatic({ root: './public' }))

// ===== PAGE D'ACCUEIL =====
app.get('/', (c) => {
  return c.html(renderHome(classes, cours, exercices))
})

// ===== PAGES PAR CLASSE =====
app.get('/classe/:classeId', (c) => {
  const classeId = c.req.param('classeId')
  const classe = classes.find(cl => cl.id === classeId)
  if (!classe) return c.notFound()
  const coursByClasse = cours.filter(co => co.classeId === classeId)
  const exosByClasse = exercices.filter(ex => ex.classeId === classeId)
  const sujetsByClasse = sujetsExamen.filter(s => s.classeId === classeId)
  return c.html(renderClasse(classe, coursByClasse, exosByClasse, sujetsByClasse))
})

// ===== SECTION COURS =====
app.get('/cours/:classeId', (c) => {
  const classeId = c.req.param('classeId')
  const classe = classes.find(cl => cl.id === classeId)
  if (!classe) return c.notFound()
  const coursByClasse = cours.filter(co => co.classeId === classeId)
  return c.html(renderCours(classe, coursByClasse))
})

app.get('/cours/:classeId/:coursId', (c) => {
  const { classeId, coursId } = c.req.param()
  const classe = classes.find(cl => cl.id === classeId)
  const lecon = cours.find(co => co.id === coursId)
  if (!classe || !lecon) return c.notFound()
  return c.html(renderLecon(classe, lecon))
})

// ===== SECTION EXERCICES =====
app.get('/exercices/:classeId', (c) => {
  const classeId = c.req.param('classeId')
  const classe = classes.find(cl => cl.id === classeId)
  if (!classe) return c.notFound()
  const exosByClasse = exercices.filter(ex => ex.classeId === classeId)
  return c.html(renderExercices(classe, exosByClasse))
})

app.get('/exercices/:classeId/:exoId', (c) => {
  const { classeId, exoId } = c.req.param()
  const classe = classes.find(cl => cl.id === classeId)
  const exercice = exercices.find(ex => ex.id === exoId)
  if (!classe || !exercice) return c.notFound()
  return c.html(renderQCM(classe, exercice))
})

// ===== API : Soumettre résultat QCM =====
app.post('/api/exercices/:exoId/submit', async (c) => {
  const exoId = c.req.param('exoId')
  const exercice = exercices.find(ex => ex.id === exoId)
  if (!exercice) return c.json({ error: 'Exercice non trouvé' }, 404)

  const body = await c.req.json()
  const { reponses } = body as { reponses: Record<number, number> }

  let score = 0
  const corrections = exercice.questions.map(q => {
    const repUtilisateur = reponses[q.id]
    const correct = repUtilisateur === q.bonne_reponse
    if (correct) score++
    return {
      questionId: q.id,
      question: q.question,
      reponseUtilisateur: repUtilisateur,
      bonneReponse: q.bonne_reponse,
      correct,
      explication: q.explication
    }
  })

  const pourcentage = Math.round((score / exercice.questions.length) * 100)
  const mention =
    pourcentage >= 80 ? 'Excellent ! 🏆' :
    pourcentage >= 60 ? 'Bien ! 👍' :
    pourcentage >= 40 ? 'Assez bien 📚' : 'À revoir 💪'

  return c.json({
    score,
    total: exercice.questions.length,
    pourcentage,
    mention,
    corrections
  })
})

// ===== SECTION SUJETS D'EXAMEN =====
app.get('/sujets/:classeId', (c) => {
  const classeId = c.req.param('classeId')
  const classe = classes.find(cl => cl.id === classeId)
  if (!classe) return c.notFound()
  const sujetsByClasse = sujetsExamen.filter(s => s.classeId === classeId)
  return c.html(renderSujets(classe, sujetsByClasse))
})

// ===== SECTION UPLOAD =====
app.get('/upload', (c) => {
  return c.html(renderUpload())
})

app.post('/api/upload', async (c) => {
  try {
    const formData = await c.req.formData()
    const fichier = formData.get('fichier') as File | null
    const typeUpload = formData.get('typeUpload') as string
    const description = formData.get('description') as string
    const classeId = formData.get('classeId') as string

    if (!fichier) {
      return c.json({ error: 'Aucun fichier fourni' }, 400)
    }

    // Vérification du type de fichier
    const typesAutorises = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!typesAutorises.includes(fichier.type)) {
      return c.json({ error: 'Type de fichier non autorisé. Formats acceptés : JPG, PNG, PDF, DOC, DOCX' }, 400)
    }

    // Vérification de la taille (10 MB max)
    const tailleMaxMB = 10
    const tailleMaxBytes = tailleMaxMB * 1024 * 1024
    if (fichier.size > tailleMaxBytes) {
      return c.json({ error: `Fichier trop volumineux. Taille maximale : ${tailleMaxMB} MB` }, 400)
    }

    // Simulation d'upload (en production, on utiliserait R2 ou Supabase)
    return c.json({
      success: true,
      message: 'Fichier reçu avec succès ! Il sera examiné par notre équipe avant publication.',
      details: {
        nom: fichier.name,
        type: fichier.type,
        taille: `${(fichier.size / 1024).toFixed(1)} KB`,
        typeUpload,
        description,
        classeId,
        statut: 'En attente de modération'
      }
    })
  } catch {
    return c.json({ error: 'Erreur lors du traitement du fichier' }, 500)
  }
})

// ===== API : Données =====
app.get('/api/classes', (c) => c.json(classes))
app.get('/api/cours', (c) => c.json(cours))
app.get('/api/exercices', (c) => c.json(exercices))
app.get('/api/sujets', (c) => c.json(sujetsExamen))

export default app
