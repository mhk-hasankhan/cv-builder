import { Modal } from '../ui/Elements.jsx'

export function ConflictModal({ conflict, resolveConflict }) {
  return (
    <Modal open={!!conflict} onClose={null} title="Edit Conflict">
      <div className="space-y-4">
        <p className="text-sm text-zinc-300">
          This CV was modified in another tab or session. Your unsaved changes cannot be auto-saved until you resolve the conflict.
        </p>
        <div className="glass rounded-lg p-3 text-xs text-zinc-400">
          Last saved elsewhere:{' '}
          <span className="text-zinc-200 font-medium">
            {conflict ? new Date(conflict.updated_at.replace(' ', 'T') + 'Z').toLocaleTimeString() : ''}
          </span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => resolveConflict('reload')} className="btn-secondary flex-1 justify-center">
            Discard my changes
          </button>
          <button onClick={() => resolveConflict('overwrite')} className="btn-primary flex-1 justify-center">
            Keep my version
          </button>
        </div>
      </div>
    </Modal>
  )
}
