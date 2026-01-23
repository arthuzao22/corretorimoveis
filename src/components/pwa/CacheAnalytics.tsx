'use client'

import { useEffect, useState } from 'react'
import { pwaAnalytics, type CacheMetrics } from '@/lib/pwa-analytics'

export function CacheAnalytics() {
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const metrics = await pwaAnalytics.getCacheMetrics()
        setCacheMetrics(metrics)
      } catch (error) {
        console.error('Error loading cache metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
    
    // Update every minute
    const interval = setInterval(loadMetrics, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 animate-pulse">
        <div className="h-4 bg-blue-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-blue-200 rounded w-48"></div>
      </div>
    )
  }

  if (!cacheMetrics) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">Cache metrics not available</p>
      </div>
    )
  }

  const usageMB = (cacheMetrics.usage / 1024 / 1024).toFixed(2)
  const quotaMB = (cacheMetrics.quota / 1024 / 1024).toFixed(2)
  const percentUsed = cacheMetrics.percentUsed.toFixed(2)

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
        <span>📊</span>
        <span>Cache Stats</span>
      </h3>
      
      <div className="space-y-2">
        <div>
          <p className="text-sm text-blue-800 font-medium">
            {usageMB} MB / {quotaMB} MB ({percentUsed}%)
          </p>
          <div className="mt-1 w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(parseFloat(percentUsed), 100)}%` }}
            />
          </div>
        </div>

        {Object.keys(cacheMetrics.caches).length > 0 && (
          <div className="pt-2 border-t border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-1">Caches:</p>
            <ul className="text-xs text-blue-700 space-y-0.5">
              {Object.entries(cacheMetrics.caches).map(([name, count]) => (
                <li key={name} className="flex justify-between">
                  <span className="truncate flex-1">{name}</span>
                  <span className="font-medium ml-2">{count} items</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
