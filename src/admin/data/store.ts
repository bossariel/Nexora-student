/**
 * Store de données admin — simule Firestore en mémoire
 * En production : remplacer par les appels Cloudflare D1 ou Firebase Admin SDK
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'etudiant' | 'administrateur'
export type UserStatus = 'actif' | 'suspendu'

export interface User {
  id: string
  email: string
  nom: string
  role: UserRole
  status: UserStatus
  createdAt: Date
  lastLogin: Date
  documentsCount: number
  suspensionReason?: string
  suspendedUntil?: Date
}

export type DocumentStatus = 'en_attente' | 'valide' | 'rejete'
export type DocumentType = 'cours' | 'exercice' | 'examen' | 'fiche' | 'aide'

export interface Document {
  id: string
  title: string
  fileName: string
  fileType: string
  authorId: string
  authorEmail: string
  authorNom: string
  status: DocumentStatus
  type: DocumentType
  classeId: string
  uploadedAt: Date
  validatedBy?: string
  validatedAt?: Date
  rejectionReason?: string
  description?: string
  metadata: { size: number; mimeType: string; pages?: number }
}

export type CourseLevel = 'debutant' | 'intermediaire' | 'avance'

export interface Course {
  id: string
  title: string
  description: string
  level: CourseLevel
  classeId: string
  matiere: string
  published: boolean
  publishedAt?: Date
  scheduledFor?: Date
  expiresAt?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  chapitres: string[]
  documentsCount: number
}

export type ExerciseType = 'qcm' | 'texte' | 'fichier'

export interface Exercise {
  id: string
  title: string
  description: string
  type: ExerciseType
  classeId: string
  matiere: string
  points: number
  courseId?: string
  availableFrom: Date
  availableUntil: Date
  createdBy: string
  createdAt: Date
  published: boolean
  submissionsCount: number
}

export type LogTargetType = 'user' | 'document' | 'course' | 'exercise' | 'system'

export interface AdminLog {
  id: string
  adminId: string
  adminEmail: string
  action: string
  targetType: LogTargetType
  targetId: string
  details: Record<string, unknown>
  timestamp: Date
  ip: string
}

export interface ActivityLog {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  message: string
  userId?: string
  userEmail?: string
  details: Record<string, unknown>
  timestamp: Date
}

// ─── Données initiales (seed) ─────────────────────────────────────────────────

const now = new Date()
const d = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000)
const h = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600000)

// Utilisateurs
export const usersStore: User[] = [
  { id: 'admin-001', email: 'admin@nexora.tg', nom: 'Super Admin', role: 'administrateur', status: 'actif', createdAt: d(120), lastLogin: h(1), documentsCount: 0 },
  { id: 'admin-002', email: 'moderateur@nexora.tg', nom: 'Koffi Mensah', role: 'administrateur', status: 'actif', createdAt: d(90), lastLogin: h(8), documentsCount: 3 },
  { id: 'user-001', email: 'ama.doe@gmail.com', nom: 'Ama Doe', role: 'etudiant', status: 'actif', createdAt: d(45), lastLogin: h(2), documentsCount: 7 },
  { id: 'user-002', email: 'kofi.asante@yahoo.fr', nom: 'Kofi Asante', role: 'etudiant', status: 'actif', createdAt: d(30), lastLogin: h(5), documentsCount: 12 },
  { id: 'user-003', email: 'abena.kwame@gmail.com', nom: 'Abena Kwame', role: 'etudiant', status: 'actif', createdAt: d(20), lastLogin: d(2), documentsCount: 4 },
  { id: 'user-004', email: 'yao.bright@gmail.com', nom: 'Yao Bright', role: 'etudiant', status: 'actif', createdAt: d(18), lastLogin: d(1), documentsCount: 9 },
  { id: 'user-005', email: 'efua.manu@hotmail.com', nom: 'Efua Manu', role: 'etudiant', status: 'suspendu', createdAt: d(60), lastLogin: d(15), documentsCount: 2, suspensionReason: 'Contenu inapproprié uploadé', suspendedUntil: d(-7) },
  { id: 'user-006', email: 'kweku.nti@gmail.com', nom: 'Kweku Nti', role: 'etudiant', status: 'actif', createdAt: d(10), lastLogin: h(12), documentsCount: 1 },
  { id: 'user-007', email: 'akosua.sarpong@gmail.com', nom: 'Akosua Sarpong', role: 'etudiant', status: 'actif', createdAt: d(8), lastLogin: h(3), documentsCount: 5 },
  { id: 'user-008', email: 'nana.adjei@gmail.com', nom: 'Nana Adjei', role: 'etudiant', status: 'actif', createdAt: d(5), lastLogin: h(6), documentsCount: 3 },
  { id: 'user-009', email: 'esi.bonsu@gmail.com', nom: 'Esi Bonsu', role: 'etudiant', status: 'actif', createdAt: d(3), lastLogin: h(1), documentsCount: 0 },
  { id: 'user-010', email: 'kwame.asare@yahoo.fr', nom: 'Kwame Asare', role: 'etudiant', status: 'actif', createdAt: d(2), lastLogin: h(0.5), documentsCount: 2 },
  { id: 'user-011', email: 'adwoa.sarfo@gmail.com', nom: 'Adwoa Sarfo', role: 'etudiant', status: 'actif', createdAt: d(1), lastLogin: h(2), documentsCount: 0 },
  { id: 'user-012', email: 'kofi.boateng@gmail.com', nom: 'Kofi Boateng', role: 'etudiant', status: 'actif', createdAt: d(0.5), lastLogin: h(4), documentsCount: 1 },
]

// Documents
export const documentsStore: Document[] = [
  { id: 'doc-001', title: 'Fiche de révision Maths BAC2', fileName: 'maths_bac2_revision.pdf', fileType: 'PDF', authorId: 'user-002', authorEmail: 'kofi.asante@yahoo.fr', authorNom: 'Kofi Asante', status: 'en_attente', type: 'fiche', classeId: 'bac2', uploadedAt: h(2), description: 'Résumé complet des formules de dérivées et intégrales', metadata: { size: 1240000, mimeType: 'application/pdf', pages: 8 } },
  { id: 'doc-002', title: 'Sujet BEPC Physique 2023', fileName: 'bepc_physique_2023.pdf', fileType: 'PDF', authorId: 'user-001', authorEmail: 'ama.doe@gmail.com', authorNom: 'Ama Doe', status: 'en_attente', type: 'examen', classeId: 'bepc', uploadedAt: h(5), description: 'Sujet officiel physique session 2023', metadata: { size: 890000, mimeType: 'application/pdf', pages: 4 } },
  { id: 'doc-003', title: 'Cours SVT Cellule - Exercices', fileName: 'svt_cellule_exercices.pdf', fileType: 'PDF', authorId: 'user-004', authorEmail: 'yao.bright@gmail.com', authorNom: 'Yao Bright', status: 'en_attente', type: 'exercice', classeId: 'bepc', uploadedAt: h(8), description: 'Série d\'exercices sur la cellule avec corrigés', metadata: { size: 650000, mimeType: 'application/pdf', pages: 6 } },
  { id: 'doc-004', title: 'Photo exercice Algebra', fileName: 'algebra_help.jpg', fileType: 'IMAGE', authorId: 'user-003', authorEmail: 'abena.kwame@gmail.com', authorNom: 'Abena Kwame', status: 'en_attente', type: 'aide', classeId: 'bac1', uploadedAt: h(10), description: 'Je ne comprends pas cet exercice, quelqu\'un peut aider?', metadata: { size: 320000, mimeType: 'image/jpeg' } },
  { id: 'doc-005', title: 'Fiche Philosophie Conscience', fileName: 'philo_conscience.pdf', fileType: 'PDF', authorId: 'user-007', authorEmail: 'akosua.sarpong@gmail.com', authorNom: 'Akosua Sarpong', status: 'en_attente', type: 'fiche', classeId: 'bac1', uploadedAt: h(14), description: 'Fiche de révision sur la conscience et l\'identité', metadata: { size: 540000, mimeType: 'application/pdf', pages: 3 } },
  { id: 'doc-006', title: 'Corrigé CEPD Français 2024', fileName: 'cepd_fr_corrige_2024.pdf', fileType: 'PDF', authorId: 'user-006', authorEmail: 'kweku.nti@gmail.com', authorNom: 'Kweku Nti', status: 'valide', type: 'examen', classeId: 'cepd', uploadedAt: d(5), validatedBy: 'admin@nexora.tg', validatedAt: d(4), description: 'Corrigé officiel session 2024', metadata: { size: 780000, mimeType: 'application/pdf', pages: 5 } },
  { id: 'doc-007', title: 'Exercices Nombres CEPD', fileName: 'cepd_maths_nombres.pdf', fileType: 'PDF', authorId: 'user-008', authorEmail: 'nana.adjei@gmail.com', authorNom: 'Nana Adjei', status: 'valide', type: 'exercice', classeId: 'cepd', uploadedAt: d(8), validatedBy: 'admin@nexora.tg', validatedAt: d(7), description: 'Série d\'exercices pour les nombres', metadata: { size: 410000, mimeType: 'application/pdf', pages: 2 } },
  { id: 'doc-008', title: 'Document contenu inapproprié', fileName: 'spam_file.pdf', fileType: 'PDF', authorId: 'user-005', authorEmail: 'efua.manu@hotmail.com', authorNom: 'Efua Manu', status: 'rejete', type: 'aide', classeId: 'bepc', uploadedAt: d(15), validatedBy: 'admin@nexora.tg', validatedAt: d(14), rejectionReason: 'Contenu non éducatif et publicitaire', description: 'upload test', metadata: { size: 1200000, mimeType: 'application/pdf', pages: 10 } },
  { id: 'doc-009', title: 'Fiche BAC1 Anglais', fileName: 'bac1_anglais_vocab.pdf', fileType: 'PDF', authorId: 'user-010', authorEmail: 'kwame.asare@yahoo.fr', authorNom: 'Kwame Asare', status: 'valide', type: 'fiche', classeId: 'bac1', uploadedAt: d(3), validatedBy: 'moderateur@nexora.tg', validatedAt: d(2), description: 'Vocabulaire essentiel anglais BAC1', metadata: { size: 320000, mimeType: 'application/pdf', pages: 4 } },
]

// Cours gérés par l'admin
export const coursesStore: Course[] = [
  { id: 'course-001', title: 'Les nombres entiers de 0 à 1000', description: 'Lire, écrire, comparer et ordonner les nombres entiers', level: 'debutant', classeId: 'cepd', matiere: 'Mathématiques', published: true, publishedAt: d(30), createdBy: 'admin@nexora.tg', createdAt: d(35), updatedAt: d(10), tags: ['nombres', 'arithmétique', 'cepd'], chapitres: ['Les chiffres', 'Écriture des nombres', 'Comparaison'], documentsCount: 2 },
  { id: 'course-002', title: 'La phrase simple : sujet et prédicat', description: 'Structure grammaticale de la phrase simple', level: 'debutant', classeId: 'cepd', matiere: 'Français', published: true, publishedAt: d(28), createdBy: 'admin@nexora.tg', createdAt: d(30), updatedAt: d(5), tags: ['grammaire', 'phrase', 'cepd'], chapitres: ['Définition', 'Le sujet', 'Le prédicat', 'Types de phrases'], documentsCount: 1 },
  { id: 'course-003', title: 'Équations du premier degré', description: 'Résoudre des équations à une inconnue', level: 'intermediaire', classeId: 'bepc', matiere: 'Mathématiques', published: true, publishedAt: d(20), createdBy: 'admin@nexora.tg', createdAt: d(25), updatedAt: d(3), tags: ['algèbre', 'équations', 'bepc'], chapitres: ['Définition', 'Règles d\'équivalence', 'Applications'], documentsCount: 3 },
  { id: 'course-004', title: 'La cellule, unité du vivant', description: 'Structure et fonctions de la cellule', level: 'intermediaire', classeId: 'bepc', matiere: 'SVT', published: true, publishedAt: d(15), createdBy: 'admin@nexora.tg', createdAt: d(18), updatedAt: d(1), tags: ['biologie', 'cellule', 'bepc'], chapitres: ['Types de cellules', 'Organites', 'Fonctions'], documentsCount: 2 },
  { id: 'course-005', title: 'La conscience et l\'identité personnelle', description: 'Philosophie de la conscience, Descartes, Locke', level: 'avance', classeId: 'bac1', matiere: 'Philosophie', published: true, publishedAt: d(12), createdBy: 'admin@nexora.tg', createdAt: d(14), updatedAt: d(2), tags: ['conscience', 'philosophie', 'bac1'], chapitres: ['Définition', 'Le Cogito', 'Locke et la mémoire', 'Problèmes'], documentsCount: 1 },
  { id: 'course-006', title: 'Les dérivées et leurs applications', description: 'Calcul différentiel et étude des variations', level: 'avance', classeId: 'bac2', matiere: 'Mathématiques', published: false, createdBy: 'admin@nexora.tg', createdAt: d(5), updatedAt: d(1), tags: ['dérivées', 'analyse', 'bac2'], chapitres: ['Définition', 'Dérivées usuelles', 'Tableaux de variations'], documentsCount: 0 },
  { id: 'course-007', title: 'La photosynthèse', description: 'Mécanismes de la photosynthèse chez les plantes', level: 'intermediaire', classeId: 'bepc', matiere: 'SVT', published: false, scheduledFor: new Date(now.getTime() + 3 * 86400000), createdBy: 'moderateur@nexora.tg', createdAt: d(2), updatedAt: d(0.5), tags: ['photosynthèse', 'plantes', 'bepc'], chapitres: ['Chlorophylle', 'Réactions lumineuses', 'Cycle de Calvin'], documentsCount: 0 },
]

// Exercices
export const exercisesStore: Exercise[] = [
  { id: 'ex-001', title: 'Comparer les nombres', description: 'QCM sur la comparaison des nombres entiers', type: 'qcm', classeId: 'cepd', matiere: 'Mathématiques', points: 100, courseId: 'course-001', availableFrom: d(30), availableUntil: new Date(now.getTime() + 365 * 86400000), createdBy: 'admin@nexora.tg', createdAt: d(30), published: true, submissionsCount: 47 },
  { id: 'ex-002', title: 'Types de phrases', description: 'Identifier les types de phrases', type: 'qcm', classeId: 'cepd', matiere: 'Français', points: 80, courseId: 'course-002', availableFrom: d(28), availableUntil: new Date(now.getTime() + 365 * 86400000), createdBy: 'admin@nexora.tg', createdAt: d(28), published: true, submissionsCount: 38 },
  { id: 'ex-003', title: 'Équations du premier degré', description: 'Résoudre des équations simples', type: 'qcm', classeId: 'bepc', matiere: 'Mathématiques', points: 120, courseId: 'course-003', availableFrom: d(20), availableUntil: new Date(now.getTime() + 365 * 86400000), createdBy: 'admin@nexora.tg', createdAt: d(20), published: true, submissionsCount: 62 },
  { id: 'ex-004', title: 'La cellule vivante', description: 'Questions sur la structure cellulaire', type: 'qcm', classeId: 'bepc', matiere: 'SVT', points: 100, courseId: 'course-004', availableFrom: d(15), availableUntil: new Date(now.getTime() + 365 * 86400000), createdBy: 'admin@nexora.tg', createdAt: d(15), published: true, submissionsCount: 29 },
  { id: 'ex-005', title: 'La conscience', description: 'Philosophie de la conscience', type: 'qcm', classeId: 'bac1', matiere: 'Philosophie', points: 150, courseId: 'course-005', availableFrom: d(12), availableUntil: new Date(now.getTime() + 365 * 86400000), createdBy: 'admin@nexora.tg', createdAt: d(12), published: true, submissionsCount: 18 },
  { id: 'ex-006', title: 'Dérivées et variations', description: 'Calcul de dérivées', type: 'qcm', classeId: 'bac2', matiere: 'Mathématiques', points: 200, availableFrom: new Date(now.getTime() + 5 * 86400000), availableUntil: new Date(now.getTime() + 60 * 86400000), createdBy: 'admin@nexora.tg', createdAt: d(5), published: false, submissionsCount: 0 },
]

// Logs admin
export const adminLogsStore: AdminLog[] = [
  { id: 'log-001', adminId: 'admin-001', adminEmail: 'admin@nexora.tg', action: 'DOCUMENT_VALIDATED', targetType: 'document', targetId: 'doc-006', details: { documentTitle: 'Corrigé CEPD Français 2024' }, timestamp: d(4), ip: '41.82.10.5' },
  { id: 'log-002', adminId: 'admin-001', adminEmail: 'admin@nexora.tg', action: 'USER_SUSPENDED', targetType: 'user', targetId: 'user-005', details: { reason: 'Contenu inapproprié', duration: '30 jours' }, timestamp: d(14), ip: '41.82.10.5' },
  { id: 'log-003', adminId: 'admin-001', adminEmail: 'admin@nexora.tg', action: 'DOCUMENT_REJECTED', targetType: 'document', targetId: 'doc-008', details: { reason: 'Contenu non éducatif' }, timestamp: d(14), ip: '41.82.10.5' },
  { id: 'log-004', adminId: 'admin-002', adminEmail: 'moderateur@nexora.tg', action: 'DOCUMENT_VALIDATED', targetType: 'document', targetId: 'doc-009', details: { documentTitle: 'Fiche BAC1 Anglais' }, timestamp: d(2), ip: '197.232.4.11' },
  { id: 'log-005', adminId: 'admin-001', adminEmail: 'admin@nexora.tg', action: 'COURSE_CREATED', targetType: 'course', targetId: 'course-006', details: { courseTitle: 'Les dérivées et leurs applications' }, timestamp: d(5), ip: '41.82.10.5' },
  { id: 'log-006', adminId: 'admin-001', adminEmail: 'admin@nexora.tg', action: 'DOCUMENT_VALIDATED', targetType: 'document', targetId: 'doc-007', details: { documentTitle: 'Exercices Nombres CEPD' }, timestamp: d(7), ip: '41.82.10.5' },
]

// Logs d'activité système
export const activityLogsStore: ActivityLog[] = [
  { id: 'act-001', type: 'info', message: 'Nouvel utilisateur inscrit', userId: 'user-012', userEmail: 'kofi.boateng@gmail.com', details: { method: 'email' }, timestamp: h(4) },
  { id: 'act-002', type: 'info', message: 'Document uploadé en attente', userId: 'user-002', userEmail: 'kofi.asante@yahoo.fr', details: { fileName: 'maths_bac2_revision.pdf' }, timestamp: h(2) },
  { id: 'act-003', type: 'info', message: 'Connexion admin', userId: 'admin-001', userEmail: 'admin@nexora.tg', details: { ip: '41.82.10.5' }, timestamp: h(1) },
  { id: 'act-004', type: 'info', message: 'Nouvel utilisateur inscrit', userId: 'user-011', userEmail: 'adwoa.sarfo@gmail.com', details: { method: 'email' }, timestamp: d(1) },
  { id: 'act-005', type: 'warning', message: 'Tentative de connexion échouée', details: { email: 'hacker@test.com', ip: '92.3.1.44', attempts: 3 }, timestamp: d(2) },
  { id: 'act-006', type: 'info', message: 'Document validé et publié', userId: 'admin-002', userEmail: 'moderateur@nexora.tg', details: { documentId: 'doc-009' }, timestamp: d(2) },
  { id: 'act-007', type: 'success', message: 'Cours mis à jour avec succès', userId: 'admin-001', userEmail: 'admin@nexora.tg', details: { courseId: 'course-004' }, timestamp: d(1) },
  { id: 'act-008', type: 'error', message: 'Erreur upload fichier trop volumineux', userId: 'user-003', userEmail: 'abena.kwame@gmail.com', details: { fileSize: '25MB', limit: '10MB' }, timestamp: d(3) },
  { id: 'act-009', type: 'info', message: 'QCM soumis par un étudiant', userId: 'user-001', userEmail: 'ama.doe@gmail.com', details: { exoId: 'ex-003', score: 80 }, timestamp: h(2) },
  { id: 'act-010', type: 'info', message: 'Nouveau document uploadé', userId: 'user-001', userEmail: 'ama.doe@gmail.com', details: { fileName: 'bepc_physique_2023.pdf' }, timestamp: h(5) },
]

// Sessions admin actives (Map sessionId → userId)
export const adminSessions = new Map<string, { userId: string; email: string; nom: string; createdAt: Date; lastActivity: Date }>()

// ─── Utilitaires ──────────────────────────────────────────────────────────────

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}

export function addAdminLog(log: Omit<AdminLog, 'id'>): void {
  adminLogsStore.unshift({ ...log, id: generateId('log') })
  // Garder les 500 derniers logs
  if (adminLogsStore.length > 500) adminLogsStore.splice(500)
}

export function addActivityLog(log: Omit<ActivityLog, 'id'>): void {
  activityLogsStore.unshift({ ...log, id: generateId('act') })
  if (activityLogsStore.length > 1000) activityLogsStore.splice(1000)
}

// ─── Statistiques dashboard ───────────────────────────────────────────────────

export function getDashboardStats() {
  const totalUsers = usersStore.length
  const activeUsers = usersStore.filter(u => u.status === 'actif').length
  const suspendedUsers = usersStore.filter(u => u.status === 'suspendu').length
  const pendingDocs = documentsStore.filter(d => d.status === 'en_attente').length
  const validatedDocs = documentsStore.filter(d => d.status === 'valide').length
  const rejectedDocs = documentsStore.filter(d => d.status === 'rejete').length
  const publishedCourses = coursesStore.filter(c => c.published).length
  const totalExercises = exercisesStore.length
  const publishedExercises = exercisesStore.filter(e => e.published).length

  // Inscriptions des 7 derniers jours
  const registrationsLast7Days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now)
    day.setDate(day.getDate() - (6 - i))
    const dayStr = day.toLocaleDateString('fr-FR', { weekday: 'short' })
    const count = usersStore.filter(u => {
      const diff = Math.floor((day.getTime() - u.createdAt.getTime()) / 86400000)
      return diff >= 0 && diff < 1
    }).length
    return { jour: dayStr, inscriptions: count, uploads: Math.floor(Math.random() * 4) }
  })

  return {
    totalUsers, activeUsers, suspendedUsers,
    pendingDocs, validatedDocs, rejectedDocs,
    publishedCourses, totalExercises, publishedExercises,
    registrationsLast7Days
  }
}
