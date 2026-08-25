interface ProgressBarProps {
  value: number // 0-100
  color?: 'green' | 'gold' | 'blue'
  height?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
}

export function ProgressBar({
  value,
  color = 'green',
  height = 'md',
  showLabel = false,
  animated = true,
}: ProgressBarProps) {
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  const colorClasses = {
    green: 'bg-esrc-green-500',
    gold: 'bg-esrc-gold-500',
    blue: 'bg-blue-500',
  }

  const clampedValue = Math.min(Math.max(value, 0), 100)

  return (
    <div className="w-full">
      <div className={`w-full bg-muted rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all ${
            animated ? 'duration-500' : ''
          }`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs font-medium text-esrc-mid mt-1">{clampedValue}% Complete</p>
      )}
    </div>
  )
}
