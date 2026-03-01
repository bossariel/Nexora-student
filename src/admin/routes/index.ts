/**
 * Routes admin — toutes les routes du back-office et des API admin
 * Montées sur /admin dans l'application principale
 */
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {
  adminAuthMiddleware,
  getSession,
  createSession,
  destroySession,
  buildSessionCookie,
  clearSessionCookie,
  getClientIp,
  ADMIN_CREDENTIALS
} from '../middleware/auth'
import {
  usersStore, documentsStore, coursesStore, exercisesStore,
  adminLogsStore, activityLogsStore,
  addAdminLog, addActivityLog, generateId,
  getDashboardStats
} from '../data/store'
import { renderAdminLogin } from './layout'
import { renderDashboard } from './dashboard'
import { renderUsers } from './users'
import { renderDocuments } from './documents'
import { renderCourses, renderExercises } from './content'
import { renderLogs } from './logs'

const admin = new Hono()

// ─── AUTH : Login / Logout ────────────────────────────────────────────────────

admin.get('/login', (c) => {
  const session = getSession(c)
  if (session) return c.redirect('/admin')

  const url = new URL(c.req.url)
  const redirect = url.searchParams.get('redirect') || '/admin'
  const expired = url.searchParams.get('expired')
  const error = expired ? 'Votre session a expiré. Reconnectez-vous.' : undefined
  return c.html(renderAdminLogin(error, redirect))
})

admin.post('/login', async (c) => {
  const body = await c.req.parseBody()
  const email = (body['email'] as string || '').trim().toLowerCase()
  const password = body['password'] as string || ''
  const redirect = (body['redirect'] as string) || '/admin'
  const ip = getClientIp(c)

  const adminUser = ADMIN_CREDENTIALS[email]

  if (!adminUser || adminUser.password !== password) {
    // Journaliser la tentative échouée
    addActivityLog({
      type: 'warning',
      message: 'Tentative de connexion admin échouée',
      details: { email, ip },
      timestamp: new Date()
    })
    return c.html(renderAdminLogin('Email ou mot de passe incorrect.', redirect))
  }

  // Créer la session
  const sessionId = createSession(adminUser.userId, email, adminUser.nom)

  // Journaliser la connexion
  addActivityLog({
    type: 'info',
    message: 'Connexion admin réussie',
    userId: adminUser.userId,
    userEmail: email,
    details: { ip },
    timestamp: new Date()
  })

  return new Response(null, {
    status: 302,
    headers: {
      'Location': redirect,
      'Set-Cookie': buildSessionCookie(sessionId)
    }
  })
})

admin.post('/logout', (c) => {
  const cookieHeader = c.req.header('Cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(s => {
      const [k, ...v] = s.trim().split('=')
      return [k, v.join('=')]
    })
  )
  const sessionId = cookies['nexora_admin_session']
  if (sessionId) destroySession(sessionId)

  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/admin/login',
      'Set-Cookie': clearSessionCookie()
    }
  })
})

// ─── Protection de toutes les routes ci-dessous ──────────────────────────────
admin.use('/*', adminAuthMiddleware)

// ─── PAGES HTML ──────────────────────────────────────────────────────────────

admin.get('/', (c) => {
  const session = c.get('adminSession')
  return c.html(renderDashboard(session))
})

admin.get('/users', (c) => {
  const session = c.get('adminSession')
  const url = new URL(c.req.url)
  const p = url.searchParams
  return c.html(renderUsers(session, {
    role: p.get('role') || undefined,
    status: p.get('status') || undefined,
    search: p.get('search') || undefined,
    page: parseInt(p.get('page') || '1'),
    id: p.get('id') || undefined
  }))
})

admin.get('/documents', (c) => {
  const session = c.get('adminSession')
  const url = new URL(c.req.url)
  const p = url.searchParams
  // Action rapide depuis le dashboard
  const quickAction = p.get('action')
  const quickId = p.get('id')
  if (quickAction === 'validate' && quickId) {
    const doc = documentsStore.find(d => d.id === quickId)
    if (doc && doc.status === 'en_attente') {
      doc.status = 'valide'
      doc.validatedBy = session.email
      doc.validatedAt = new Date()
      addAdminLog({
        adminId: session.userId, adminEmail: session.email,
        action: 'DOCUMENT_VALIDATED', targetType: 'document', targetId: quickId,
        details: { documentTitle: doc.title }, timestamp: new Date(), ip: getClientIp(c)
      })
    }
    return c.redirect('/admin/documents')
  }
  return c.html(renderDocuments(session, {
    status: p.get('status') || undefined,
    type: p.get('type') || undefined,
    classeId: p.get('classeId') || undefined,
    search: p.get('search') || undefined,
    id: p.get('id') || undefined
  }))
})

admin.get('/courses', (c) => {
  const session = c.get('adminSession')
  const url = new URL(c.req.url)
  return c.html(renderCourses(session, url.searchParams.get('action') || undefined))
})

admin.get('/exercises', (c) => {
  const session = c.get('adminSession')
  const url = new URL(c.req.url)
  return c.html(renderExercises(session, url.searchParams.get('action') || undefined))
})

admin.get('/logs', (c) => {
  const session = c.get('adminSession')
  const url = new URL(c.req.url)
  return c.html(renderLogs(session, url.searchParams.get('tab') || 'admin'))
})

// ─── API REST ADMIN ──────────────────────────────────────────────────────────

// --- Utilisateurs ---

admin.patch('/api/users/:id/role', async (c) => {
  const session = c.get('adminSession')
  const userId = c.req.param('id')
  const { role } = await c.req.json()
  const user = usersStore.find(u => u.id === userId)
  if (!user) return c.json({ error: 'Utilisateur non trouvé' }, 404)
  const oldRole = user.role
  user.role = role
  addAdminLog({
    adminId: session.userId, adminEmail: session.email,
    action: 'USER_ROLE_CHANGED', targetType: 'user', targetId: userId,
    details: { from: oldRole, to: role, userEmail: user.email },
    timestamp: new Date(), ip: getClientIp(c)
  })
  return c.json({ success: true, message: `Rôle modifié : ${oldRole} → ${role}` })
})

admin.post('/api/users/:id/suspend', async (c) => {
  const session = c.get('adminSession')
  const userId = c.req.param('id')
  const { reason } = await c.req.json()
  const user = usersStore.find(u => u.id === userId)
  if (!user) return c.json({ error: 'Utilisateur non trouvé' }, 404)
  user.status = 'suspendu'
  user.suspensionReason = reason
  addAdminLog({
    adminId: session.userId, adminEmail: session.email,
    action: 'USER_SUSPENDED', targetType: 'user', targetId: userId,
    details: { reason, userEmail: user.email }, timestamp: new Date(), ip: getClientIp(c)
  })
  addActivityLog({
    type: 'warning', message: `Compte suspendu: ${user.email}`,
    userId: session.userId, userEmail: session.email,
    details: { reason }, timestamp: new Date()
  })
  return c.json({ success: true, message: `${user.nom} suspendu(e)` })
})

admin.post('/api/users/:id/activate', async (c) => {
  const session = c.get('adminSession')
  const userId = c.req.param('id')
  const user = usersStore.find(u => u.id === userId)
  if (!user) return c.json({ error: 'Utilisateur non trouvé' }, 404)
  user.status = 'actif'
  user.suspensionReason = undefined
  user.suspendedUntil = undefined
  addAdminLog({
    adminId: session.userId, adminEmail: session.email,
    action: 'USER_ACTIVATED', targetType: 'user', targetId: userId,
    details: { userEmail: user.email }, timestamp: new Date(), ip: getClientIp(c)
  })
  return c.json({ success: true, message: `${user.nom} réactivé(e)` })
})

admin.delete('/api/users/:id', async (c) => {
  const session = c.get('adminSession')
  const userId = c.req.param('id')
  const index = usersStore.findIndex(u => u.id === userId)
  if (index === -1) return c.json({ error: 'Utilisateur non trouvé' }, 404)
  const user = usersStore[index]
  // Supprimer cascade : les documents de l'utilisateur → retirer
  const userDocs = documentsStore.filter(d => d.authorId === userId)
  userDocs.forEach(d => {
    const di = documentsStore.findIndex(dd => dd.id === d.id)
    if (di !== -1) documentsStore.splice(di, 1)
  })
  usersStore.splice(index, 1)
  addAdminLog({
    adminId: session.userId, adminEmail: session.email,
    action: 'USER_DELETED', targetType: 'user', targetId: userId,
    details: { userEmail: user.email, docsDeleted: userDocs.length }, timestamp: new Date(), ip: getClientIp(c)
  })
  return c.json({ success: true, message: `${user.nom} supprimé(e) (${userDocs.length} document(s) supprimé(s))` })
})

// --- Documents ---

admin.post('/api/documents/:id/validate', async (c) => {
  const session = c.get('adminSession')
  const docId = c.req.param('id')
  const doc = documentsStore.find(d => d.id === docId)
  if (!doc) return c.json({ error: 'Document non trouvé' }, 404)
  doc.status = 'valide'
  doc.validatedBy = session.email
  doc.validatedAt = new Date()
  addAdminLog({
    adminId: session.userId, adminEmail: session.email,
    action: 'DOCUMENT_VALIDATED', targetType: 'document', targetId: docId,
    details: { documentTitle: doc.title, author: doc.authorEmail }, timestamp: new Date(), ip: getClientIp(c)
  })
  addActivityLog({
    type: 'success', message: `Document validé : "${doc.title}"`,
    userId: session.userId, userEmail: session.email,
    details: { docId }, timestamp: new Date()
  })
  return c.json({ success: true, message: `"${doc.title}" validé et publié` })
})

admin.post('/api/documents/:id/reject', async (c) => {
  const session = c.get('adminSession')
  const docId = c.req.param('id')
  const { reason } = await c.req.json()
  const doc = documentsStore.find(d => d.id === docId)
  if (!doc) return c.json({ error: 'Document non trouvé' }, 404)
  doc.status = 'rejete'
  doc.validatedBy = session.email
  doc.validatedAt = new Date()
  doc.rejectionReason = reason
  addAdminLog({
    adminId: session.userId, adminEmail: session.email,
    action: 'DOCUMENT_REJECTED', targetType: 'document', targetId: docId,
    details: { documentTitle: doc.title, reason, author: doc.authorEmail }, timestamp: new Date(), ip: getClientIp(c)
  })
  return c.json({ success: true, message: `"${doc.title}" rejeté` })
})

admin.post('/api/documents/:id/unpublish', async (c) => {
  const session = c.get('adminSession')
  const docId = c.req.param('id')
  const doc = documentsStore.find(d => d.id === docId)
  if (!doc) return c.json({ error: 'Document non trouvé' }, 404)
  doc.status = 'en_attente'
  doc.validatedBy = undefined
  doc.validatedAt = undefined
  return c.json({ success: true, message: `"${doc.title}" dépublié` })
})

admin.delete('/api/documents/:id', async (c) => {
  const session = c.get('adminSession')
  const docId = c.req.param('id')
  const index = documentsStore.findIndex(d => d.id === docId)
  if (index === -1) return c.json({ error: 'Document non trouvé' }, 404)
  const doc = documentsStore[index]
  documentsStore.splice(index, 1)
  addAdminLog({
    adminId: session.userId, adminEmail: session.email,
    action: 'DOCUMENT_DELETED', targetType: 'document', targetId: docId,
    details: { documentTitle: doc.title }, timestamp: new Date(), ip: getClientIp(c)
  })
  return c.json({ success: true, message: `"${doc.title}" supprimé` })
})

// --- Cours ---

admin.post('/api/courses', async (c) => {
  const session = c.get('adminSession')
  const body = await c.req.json()
  const newCourse = {
    id: generateId('course'),
    title: body.title,
    description: body.description,
    level: body.level || 'intermediaire',
    classeId: body.classeId,
    matiere: body.matiere,
    published: body.published || false,
    publishedAt: body.published ? new Date() : undefined,
    scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
    createdBy: session.email,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: body.tags || [],
    chapitres: [],
    documentsCount: 0
  }
  coursesStore.push(newCourse)
  addAdminLog({
    adminId: session.userId, adminEmail: session.email,
    action: 'COURSE_CREATED', targetType: 'course', targetId: newCourse.id,
    details: { courseTitle: newCourse.title }, timestamp: new Date(), ip: getClientIp(c)
  })
  return c.json({ success: true, message: `Cours "${newCourse.title}" créé`, id: newCourse.id })
})

admin.post('/api/courses/:id/publish', async (c) => {
  const session = c.get('adminSession')
  const courseId = c.req.param('id')
  const { publish } = await c.req.json()
  const course = coursesStore.find(co => co.id === courseId)
  if (!course) return c.json({ error: 'Cours non trouvé' }, 404)
  course.published = publish
  course.publishedAt = publish ? new Date() : undefined
  course.updatedAt = new Date()
  addAdminLog({
    adminId: session.userId, adminEmail: session.email,
    action: publish ? 'COURSE_PUBLISHED' : 'COURSE_UNPUBLISHED', targetType: 'course', targetId: courseId,
    details: { courseTitle: course.title }, timestamp: new Date(), ip: getClientIp(c)
  })
  return c.json({ success: true, message: `Cours "${course.title}" ${publish ? 'publié' : 'dépublié'}` })
})

admin.delete('/api/courses/:id', async (c) => {
  const session = c.get('adminSession')
  const courseId = c.req.param('id')
  const index = coursesStore.findIndex(co => co.id === courseId)
  if (index === -1) return c.json({ error: 'Cours non trouvé' }, 404)
  const course = coursesStore[index]
  coursesStore.splice(index, 1)
  addAdminLog({
    adminId: session.userId, adminEmail: session.email,
    action: 'COURSE_DELETED', targetType: 'course', targetId: courseId,
    details: { courseTitle: course.title }, timestamp: new Date(), ip: getClientIp(c)
  })
  return c.json({ success: true, message: `Cours "${course.title}" supprimé` })
})

// --- Exercices ---

admin.post('/api/exercises', async (c) => {
  const session = c.get('adminSession')
  const body = await c.req.json()
  const newEx = {
    id: generateId('ex'),
    title: body.title,
    description: body.description,
    type: body.type || 'qcm',
    classeId: body.classeId,
    matiere: body.matiere,
    points: body.points || 100,
    availableFrom: new Date(body.availableFrom),
    availableUntil: new Date(body.availableUntil),
    createdBy: session.email,
    createdAt: new Date(),
    published: body.published || false,
    submissionsCount: 0
  }
  exercisesStore.push(newEx)
  return c.json({ success: true, message: `Exercice "${newEx.title}" créé`, id: newEx.id })
})

admin.post('/api/exercises/:id/publish', async (c) => {
  const exId = c.req.param('id')
  const { publish } = await c.req.json()
  const ex = exercisesStore.find(e => e.id === exId)
  if (!ex) return c.json({ error: 'Exercice non trouvé' }, 404)
  ex.published = publish
  return c.json({ success: true, message: `Exercice "${ex.title}" ${publish ? 'publié' : 'dépublié'}` })
})

admin.delete('/api/exercises/:id', async (c) => {
  const exId = c.req.param('id')
  const index = exercisesStore.findIndex(e => e.id === exId)
  if (index === -1) return c.json({ error: 'Exercice non trouvé' }, 404)
  const ex = exercisesStore[index]
  exercisesStore.splice(index, 1)
  return c.json({ success: true, message: `Exercice "${ex.title}" supprimé` })
})

// --- API Stats ---

admin.get('/api/stats', (c) => {
  return c.json(getDashboardStats())
})

export default admin
