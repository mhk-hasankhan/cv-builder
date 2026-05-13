import { useState } from 'react'
import { ZoomIn, ZoomOut } from 'lucide-react'
import { CVRenderer } from '../../templates/index.jsx'

export function CVPreview({ cv, previewRef }) {
  const [zoom, setZoom] = useState(0.62)

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-surface-1">
        <span className="text-xs text-zinc-500">Live Preview — A4</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(0.3, z - 0.08))}
            className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-zinc-200 transition-colors">
            <ZoomOut size={14} />
          </button>
          <span className="text-xs text-zinc-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.2, z + 0.08))}
            className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-zinc-200 transition-colors">
            <ZoomIn size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6 flex justify-center">
        <div
          style={{ width: `${794 * zoom}px`, height: `${1123 * zoom}px`, flexShrink: 0 }}
          className="shadow-2xl shadow-black/50 rounded overflow-hidden"
        >
          <div ref={previewRef} style={{ width: 794, height: 1123, transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
            <CVRenderer cv={cv} />
          </div>
        </div>
      </div>
    </div>
  )
}
