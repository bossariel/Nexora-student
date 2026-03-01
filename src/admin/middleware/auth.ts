/**
 * Middleware d'authentification admin
 * Vérifie la session à chaque requête sur les routes /admin/*
 * Utilise un cookie sécurisé httpOnly pour stocker le sessionId
 */
import type { Context, Next } from 'hono'
import { adminSessions } from '../data/store'

const SESSION_COOKIE = 'nexora_admin_session'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

/**
 * Récupère la session active depuis le cookie
 */
export function getSession(c: Context) {
  const cookieHeader = c.req.header('Cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(s => {
      const [k, ...v] = s.trim().split('=')
      return [k, v.join('=')]
    })
  )
  const sessionId = cookies[SESSION_COOKIE]
  if (!sessionId) return null

  const session = adminSessions.get(sessionId)
  if (!session) return null

  // Vérifier l'expiration (30 min inactivité)
  const elapsed = Date.now() - session.lastActivity.getTime()
  if (elapsed > SESSION_TIMEOUT_MS) {
    adminSessions.delete(sessionId)
    return null
  }

  // Renouveler l'activité
  session.lastActivity = new Date()
  return { sessionId, ...session }
}

/**
 * Middleware de protection des routes admin
 * Redirige vers /admin/login si pas de session valide
 */
export async function adminAuthMiddleware(c: Context, next: Next) {
  const session = getSession(c)
  if (!session) {
    return c.redirect('/admin/login?redirect=' + encodeURIComponent(c.req.path))
  }
  // Injecter la session dans le contexte
  c.set('adminSession', session)
  await next()
}

/**
 * Créer une nouvelle session admin
 */
export function createSession(userId: string, email: string, nom: string): string {
  const sessionId = crypto.randomUUID()
  adminSessions.set(sessionId, {
    userId,
    email,
    nom,
    createdAt: new Date(),
    lastActivity: new Date()
  })
  return sessionId
}

/**
 * Supprimer une session (déconnexion)
 */
export function destroySession(sessionId: string): void {
  adminSessions.delete(sessionId)
}

/**
 * Construire le cookie de session sécurisé
 */
export function buildSessionCookie(sessionId: string): string {
  return `${SESSION_COOKIE}=${sessionId}; HttpOnly; SameSite=Strict; Path=/admin; Max-Age=1800`
}

/**
 * Cookie de suppression de session
 */
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/admin; Max-Age=0`
}

/**
 * Récupère l'IP du client
 */
export function getClientIp(c: Context): string {
  return c.req.header('CF-Connecting-IP')
    || c.req.header('X-Forwarded-For')?.split(',')[0]?.trim()
    || c.req.header('X-Real-IP')
    || '0.0.0.0'
}

/**
 * Comptes administrateurs autorisés
 * En production : vérifier dans Firestore users/{id}.role === 'administrateur'
 */
export const ADMIN_CREDENTIALS: Record<string, { password: string; userId: string; nom: string }> = {
  'admin@nexora.tg': {
    password: 'Admin@Nexora2024',
    userId: 'admin-001',
    nom: 'Super Admin'
  },
  'moderateur@nexora.tg': {
    password: 'Modo@Nexora2024',
    userId: 'admin-002',
    nom: 'Koffi Mensah'
  }
}
