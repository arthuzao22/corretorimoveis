/**
 * Simple in-memory rate limiting
 * For production, consider using Redis or Upstash
 */

type RateLimitStore = {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export type RateLimitConfig = {
  maxRequests: number // Maximum requests allowed
  windowMs: number // Time window in milliseconds
}

export type RateLimitResult = {
  success: boolean
  remaining: number
  resetTime: number
  error?: string
}

/**
 * Check if request is within rate limit
 * @param key - Unique identifier for the rate limit (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns RateLimitResult
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const entry = store[key]

  // If no entry exists or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + config.windowMs
    }
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
    }
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      error: 'Rate limit exceeded. Please try again later.'
    }
  }

  // Increment count
  entry.count++

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  // Check common headers for IP (works with proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to a placeholder (won't work in serverless, but prevents crashes)
  return 'unknown'
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  // Very strict - for sensitive operations
  STRICT: {
    maxRequests: 3,
    windowMs: 60 * 1000 // 3 requests per minute
  },
  // Moderate - for forms and user actions
  MODERATE: {
    maxRequests: 10,
    windowMs: 60 * 1000 // 10 requests per minute
  },
  // Lenient - for public API endpoints
  LENIENT: {
    maxRequests: 30,
    windowMs: 60 * 1000 // 30 requests per minute
  },
  // Very lenient - for read-only operations
  VERY_LENIENT: {
    maxRequests: 100,
    windowMs: 60 * 1000 // 100 requests per minute
  }
}
