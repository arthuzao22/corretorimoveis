/**
 * Vercel Blob Storage Utility
 * 
 * Centralized utilities for file upload, deletion and validation
 * using Vercel Blob as the storage backend.
 * 
 * @see https://vercel.com/docs/storage/vercel-blob
 */

import { put, del } from '@vercel/blob'

// =============================================
// CONFIGURATION
// =============================================

/** Maximum file size in bytes (10MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024

/** Allowed MIME types for image uploads */
export const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
] as const

/** Allowed file extensions */
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const

// =============================================
// TYPES
// =============================================

export interface UploadResult {
    success: true
    url: string
    pathname: string
}

export interface UploadError {
    success: false
    error: string
}

export type UploadResponse = UploadResult | UploadError

export interface FileValidation {
    valid: boolean
    error?: string
}

// =============================================
// VALIDATION
// =============================================

/**
 * Validates a file for upload
 * @param file - The file to validate
 * @returns Validation result with error message if invalid
 */
export function validateFile(file: File): FileValidation {
    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
        return {
            valid: false,
            error: `Tipo de arquivo não permitido: ${file.type}. Use JPEG, PNG ou WebP.`
        }
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(2)
        return {
            valid: false,
            error: `Arquivo muito grande: ${sizeMB}MB. Máximo permitido: 10MB.`
        }
    }

    return { valid: true }
}

/**
 * Validates multiple files for upload
 * @param files - Array of files to validate
 * @returns Object with valid files and any errors
 */
export function validateFiles(files: File[]): {
    validFiles: File[]
    errors: string[]
} {
    const validFiles: File[] = []
    const errors: string[] = []

    for (const file of files) {
        const validation = validateFile(file)
        if (validation.valid) {
            validFiles.push(file)
        } else {
            errors.push(`${file.name}: ${validation.error}`)
        }
    }

    return { validFiles, errors }
}

// =============================================
// UPLOAD FUNCTIONS
// =============================================

/**
 * Generates a unique filename for upload
 * @param originalName - Original file name
 * @param folder - Folder/namespace for organization
 * @returns Unique pathname for the file
 */
export function generateFileName(originalName: string, folder: string = 'uploads'): string {
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 9)
    // Sanitize original name: remove special chars, keep extension
    const safeName = originalName
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase()

    return `${folder}/${timestamp}_${randomSuffix}_${safeName}`
}

/**
 * Uploads a single file to Vercel Blob
 * @param file - The file to upload
 * @param folder - Optional folder for organization (default: 'uploads')
 * @returns Upload result with URL or error
 */
export async function uploadFile(
    file: File,
    folder: string = 'uploads'
): Promise<UploadResponse> {
    try {
        // Validate file
        const validation = validateFile(file)
        if (!validation.valid) {
            return { success: false, error: validation.error! }
        }

        // Generate unique pathname
        const pathname = generateFileName(file.name, folder)

        // Upload to Vercel Blob
        const blob = await put(pathname, file, {
            access: 'public',
            addRandomSuffix: false, // We already have random suffix
        })

        return {
            success: true,
            url: blob.url,
            pathname: blob.pathname
        }
    } catch (error) {
        console.error('Upload error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao fazer upload'
        }
    }
}

/**
 * Uploads multiple files to Vercel Blob
 * @param files - Array of files to upload
 * @param folder - Optional folder for organization
 * @returns Object with successful URLs and any errors
 */
export async function uploadFiles(
    files: File[],
    folder: string = 'uploads'
): Promise<{
    urls: string[]
    errors: string[]
}> {
    const urls: string[] = []
    const errors: string[] = []

    // Validate all files first
    const { validFiles, errors: validationErrors } = validateFiles(files)
    errors.push(...validationErrors)

    // Upload valid files in parallel
    const uploadPromises = validFiles.map(async (file) => {
        const result = await uploadFile(file, folder)
        if (result.success) {
            return { url: result.url, error: null }
        } else {
            return { url: null, error: `${file.name}: ${result.error}` }
        }
    })

    const results = await Promise.all(uploadPromises)

    for (const result of results) {
        if (result.url) {
            urls.push(result.url)
        }
        if (result.error) {
            errors.push(result.error)
        }
    }

    return { urls, errors }
}

// =============================================
// DELETE FUNCTIONS
// =============================================

/**
 * Deletes a file from Vercel Blob by URL
 * @param url - The public URL of the file to delete
 * @returns Success status
 */
export async function deleteFile(url: string): Promise<{ success: boolean; error?: string }> {
    try {
        await del(url)
        return { success: true }
    } catch (error) {
        console.error('Delete error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao deletar arquivo'
        }
    }
}

/**
 * Deletes multiple files from Vercel Blob
 * @param urls - Array of URLs to delete
 * @returns Number of successfully deleted files and any errors
 */
export async function deleteFiles(urls: string[]): Promise<{
    deleted: number
    errors: string[]
}> {
    const errors: string[] = []
    let deleted = 0

    const deletePromises = urls.map(async (url) => {
        const result = await deleteFile(url)
        if (result.success) {
            return { success: true, url }
        } else {
            return { success: false, url, error: result.error }
        }
    })

    const results = await Promise.all(deletePromises)

    for (const result of results) {
        if (result.success) {
            deleted++
        } else {
            errors.push(`${result.url}: ${result.error}`)
        }
    }

    return { deleted, errors }
}
