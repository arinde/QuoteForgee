import { cn } from '../../lib/utils'

const STATUS_STYLES = {
  draft:    'bg-ink-100 text-ink-600',
  sent:     'bg-blue-50 text-blue-700',
  viewed:   'bg-amber-50 text-amber-700',
  accepted: 'bg-green-50 text-green-700',
  declined: 'bg-red-50 text-red-600',
  expired:  'bg-ink-100 text-ink-400',
}

const STATUS_DOTS = {
  draft:    'bg-ink-400',
  sent:     'bg-blue-500',
  viewed:   'bg-amber-500',
  accepted: 'bg-green-500',
  declined: 'bg-red-500',
  expired:  'bg-ink-300',
}

export function StatusBadge({ status }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-body text-xs font-medium capitalize',
      STATUS_STYLES[status] ?? STATUS_STYLES.draft
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', STATUS_DOTS[status] ?? STATUS_DOTS.draft)} />
      {status}
    </span>
  )
}
