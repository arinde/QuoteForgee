export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-ink-400" />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink-800 mb-1">{title}</h3>
      <p className="font-body text-sm text-ink-400 mb-6 max-w-xs">{description}</p>
      {action}
    </div>
  )
}
