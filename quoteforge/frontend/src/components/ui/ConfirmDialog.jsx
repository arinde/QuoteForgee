import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  const ref = useRef(null)

  useEffect(() => {
    if (open) ref.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-xl border border-ink-200 shadow-xl w-full max-w-sm p-6 animate-fade-up">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-ink-100 transition-colors">
          <X className="w-4 h-4 text-ink-500" />
        </button>
        <h2 className="font-display text-lg font-bold text-ink-900 mb-2">{title}</h2>
        <p className="font-body text-sm text-ink-500 mb-6">{description}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 px-4 border border-ink-200 rounded-lg font-body text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors">
            Cancel
          </button>
          <button
            ref={ref}
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-lg font-body text-sm font-medium transition-colors ${
              danger
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-ink-900 text-forge-100 hover:bg-ink-800'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
