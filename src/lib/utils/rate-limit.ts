import { RATE_LIMITS, MAX_RATE_LIMIT_ENTRIES, type RateLimitConfig } from '@/lib/validators'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Check if a request is rate limited
 * @param identifier - Unique identifier (e.g., IP address, user ID, email)
 * @param config - Rate limit configuration
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const key = identifier

  // Clean up expired entries
  if (rateLimitStore.size > MAX_RATE_LIMIT_ENTRIES) {
    for (const [k, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(k)
      }
    }
  }

  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    // Create new entry
    const resetAt = now + config.interval
    rateLimitStore.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: config.maxRequests - 1, resetAt }
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { 
    allowed: true, 
    remaining: config.maxRequests - entry.count, 
    resetAt: entry.resetAt 
  }
}

/**
 * Get rate limit for a specific action
 */
export function getRateLimit(action: keyof typeof RATE_LIMITS): RateLimitConfig {
  return RATE_LIMITS[action]
}

/**
 * Reset rate limit for an identifier
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier)
}
