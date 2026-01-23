/**
 * Loading Strategy System
 * 
 * Provides a structured 3-layer loading approach:
 * - GLOBAL: Full-page navigation loading
 * - SECTION: Component/modal/drawer loading
 * - FIELD: Individual button/input loading
 */

export enum LoadingLevel {
  GLOBAL = 'global',      // Full page navigation
  SECTION = 'section',    // Modal, Drawer, Widget, Card
  FIELD = 'field',        // Button, Input, Single Action
}

export enum LoadingStrategy {
  OVERLAY = 'overlay',        // Overlay with backdrop blur
  SKELETON = 'skeleton',      // Skeleton placeholder
  SPINNER = 'spinner',        // Spinner in specific place
  INLINE = 'inline',          // Inline badge/text
}

/**
 * Maps loading levels to recommended strategies
 */
export const LOADING_STRATEGY_MAP: Record<LoadingLevel, LoadingStrategy[]> = {
  [LoadingLevel.GLOBAL]: [LoadingStrategy.OVERLAY],
  [LoadingLevel.SECTION]: [LoadingStrategy.OVERLAY, LoadingStrategy.SKELETON, LoadingStrategy.SPINNER],
  [LoadingLevel.FIELD]: [LoadingStrategy.SPINNER, LoadingStrategy.INLINE],
}

/**
 * Configuration for different loading strategies
 */
export interface LoadingConfig {
  level: LoadingLevel
  strategy: LoadingStrategy
  message?: string
  progress?: number  // 0-100
  steps?: string[]
  currentStep?: number
  timeout?: number   // Auto-cancel after X ms
}

/**
 * Default loading configurations by level
 */
export const DEFAULT_LOADING_CONFIG: Record<LoadingLevel, Partial<LoadingConfig>> = {
  [LoadingLevel.GLOBAL]: {
    strategy: LoadingStrategy.OVERLAY,
    message: 'Carregando...',
    timeout: 30000, // 30 seconds
  },
  [LoadingLevel.SECTION]: {
    strategy: LoadingStrategy.OVERLAY,
    message: 'Processando...',
    timeout: 15000, // 15 seconds
  },
  [LoadingLevel.FIELD]: {
    strategy: LoadingStrategy.SPINNER,
    timeout: 10000, // 10 seconds
  },
}
