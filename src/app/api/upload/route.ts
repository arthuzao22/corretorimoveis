import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { uploadFile, validateFile, ALLOWED_IMAGE_TYPES } from '@/lib/storage'

export const dynamic = 'force-dynamic'

/**
 * POST /api/upload
 * 
 * Handles file uploads to Vercel Blob storage.
 * Requires authentication (CORRETOR or ADMIN role).
 * 
 * Request: FormData with 'files' field (multiple files supported)
 * Response: { success: boolean, urls: string[], errors: string[] }
 */
export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Não autorizado' },
                { status: 401 }
            )
        }

        // Only CORRETOR and ADMIN can upload
        if (session.user.role !== 'CORRETOR' && session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Permissão negada' },
                { status: 403 }
            )
        }

        // Parse FormData
        const formData = await request.formData()
        const files = formData.getAll('files') as File[]
        const folder = (formData.get('folder') as string) || 'uploads'

        if (!files || files.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Nenhum arquivo enviado' },
                { status: 400 }
            )
        }

        // Validate that we received actual files
        const validFiles = files.filter((file): file is File =>
            file instanceof File && file.size > 0
        )

        if (validFiles.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Arquivos inválidos' },
                { status: 400 }
            )
        }

        // Process uploads
        const urls: string[] = []
        const errors: string[] = []

        for (const file of validFiles) {
            // Validate file
            const validation = validateFile(file)
            if (!validation.valid) {
                errors.push(`${file.name}: ${validation.error}`)
                continue
            }

            // Upload file
            const result = await uploadFile(file, folder)

            if (result.success) {
                urls.push(result.url)
            } else {
                errors.push(`${file.name}: ${result.error}`)
            }
        }

        // Return results
        if (urls.length === 0 && errors.length > 0) {
            return NextResponse.json(
                { success: false, error: errors.join('; '), urls: [], errors },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            urls,
            errors,
            uploaded: urls.length,
            failed: errors.length
        })

    } catch (error) {
        console.error('Upload API error:', error)
        return NextResponse.json(
            { success: false, error: 'Erro interno ao processar upload' },
            { status: 500 }
        )
    }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}
