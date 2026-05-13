import { useState, useEffect } from 'react'
import { Check, Link2 } from 'lucide-react'
import { Modal } from '../ui/Elements.jsx'
import { shareApi } from '../../utils/api.js'

export function ShareModal({ cvId, open, onClose }) {
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    shareApi.generate(cvId).then(res => setShareUrl(res.url))
  }, [open, cvId])

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal open={open} onClose={onClose} title="Share CV">
      <div className="space-y-3">
        <p className="text-sm text-zinc-400">Share a read-only link to your CV:</p>
        <div className="flex gap-2">
          <input className="input-field flex-1 text-xs" value={shareUrl} readOnly />
          <button onClick={handleCopy} className={`btn-secondary px-3 ${copied ? 'text-emerald-400' : ''}`}>
            {copied ? <Check size={14} /> : <Link2 size={14} />}
          </button>
        </div>
        <p className="text-xs text-zinc-500">Anyone with this link can view your CV.</p>
      </div>
    </Modal>
  )
}
