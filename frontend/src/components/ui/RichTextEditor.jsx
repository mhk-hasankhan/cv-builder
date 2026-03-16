import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Bold, Italic, UnderlineIcon, List, ListOrdered } from 'lucide-react'
import { useEffect } from 'react'

export default function RichTextEditor({ value, onChange, placeholder = 'Write something...' }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value || '',
    editorProps: {
      attributes: { 'data-placeholder': placeholder }
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false)
    }
  }, [value])

  if (!editor) return null

  const ToolBtn = ({ action, active, icon }) => (
    <button type="button" onMouseDown={e => { e.preventDefault(); action() }}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-indigo-500/30 text-indigo-300' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}>
      {icon}
    </button>
  )

  return (
    <div className="tiptap-editor">
      <div className="flex gap-0.5 mb-1 p-1 bg-white/5 rounded-t-lg border border-b-0 border-white/10">
        <ToolBtn action={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={<Bold size={14} />} />
        <ToolBtn action={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={<Italic size={14} />} />
        <ToolBtn action={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={<UnderlineIcon size={14} />} />
        <div className="w-px bg-white/10 mx-1" />
        <ToolBtn action={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={<List size={14} />} />
        <ToolBtn action={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} icon={<ListOrdered size={14} />} />
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
