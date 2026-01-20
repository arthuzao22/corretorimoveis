import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export class AuthError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'AuthError'
    }
}

export type AuthResult = {
    success: false
    error: string
} | {
    success: true
    session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>
}

/**
 * Require authentication for a server action
 * Returns the session if authenticated, or an error result if not
 */
export async function requireAuth(
    role?: 'ADMIN' | 'CORRETOR'
): Promise<AuthResult> {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return { success: false, error: 'Não autorizado' }
    }

    if (role && session.user.role !== role) {
        return { success: false, error: 'Acesso negado' }
    }

    return {
        success: true,
        session: session as AuthResult extends { success: true } ? AuthResult['session'] : never
    }
}

/**
 * Require authentication and get corretor ID
 * Returns the session with corretorId if authenticated, or an error result if not
 */
export async function requireCorretorAuth(): Promise<
    { success: false; error: string } |
    { success: true; session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>; corretorId: string }
> {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return { success: false, error: 'Não autorizado' }
    }

    if (session.user.role !== 'CORRETOR') {
        return { success: false, error: 'Acesso negado' }
    }

    if (!session.user.corretorId) {
        return { success: false, error: 'Perfil de corretor não encontrado' }
    }

    return {
        success: true,
        session,
        corretorId: session.user.corretorId
    }
}

/**
 * Require admin authentication
 * Returns the session if authenticated as admin, or an error result if not
 */
export async function requireAdminAuth(): Promise<AuthResult> {
    return requireAuth('ADMIN')
}
