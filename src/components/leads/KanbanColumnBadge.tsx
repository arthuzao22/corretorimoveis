interface KanbanColumnBadgeProps {
  column: {
    name: string
    color: string | null
  }
  size?: 'sm' | 'md' | 'lg'
}

export function KanbanColumnBadge({ column, size = 'md' }: KanbanColumnBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  const backgroundColor = column.color || '#6b7280'
  
  // Calculate if we should use light or dark text based on background color
  const getLuminance = (hex: string) => {
    // Validate hex color format
    if (!hex || typeof hex !== 'string' || !hex.match(/^#[0-9A-Fa-f]{6}$/)) {
      return 0.5 // Default to medium luminance for invalid colors
    }
    
    const rgb = parseInt(hex.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255
  }
  
  const textColor = getLuminance(backgroundColor) > 0.5 ? '#000000' : '#ffffff'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {column.name}
    </span>
  )
}
