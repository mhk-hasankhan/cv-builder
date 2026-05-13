import { Download } from 'lucide-react'
import { Modal } from '../ui/Elements.jsx'
import { exportApi } from '../../utils/api.js'

export function ExportModal({ id, open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Export CV">
      <div className="space-y-3">
        <p className="text-sm text-zinc-400">Choose your export format:</p>
        <div className="grid grid-cols-2 gap-3">
          <a href={exportApi.pdf(id)} download className="btn-primary justify-center py-3">
            <Download size={14} /> PDF
          </a>
          <a href={exportApi.docx(id)} download className="btn-secondary justify-center py-3">
            <Download size={14} /> Word (.docx)
          </a>
        </div>
        <div className="glass rounded-lg p-3 mt-2">
          <p className="text-xs text-zinc-400">
            <span className="text-emerald-400 font-medium">ATS Tip:</span> Use the PDF format for online applications.
            Use DOCX if the employer requests a Word document.
          </p>
        </div>
      </div>
    </Modal>
  )
}
