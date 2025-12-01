import { useState, useEffect } from 'react'
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'

function CreatePost({ isOpen, onClose, onSave, initialData = null }) {
  const [imageUrl, setImageUrl] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  // Atualiza os campos quando initialData muda (para edição)
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setImageUrl(initialData.imageUrl || '')
        setTitle(initialData.title || '')
        setContent(initialData.content || '')
      } else {
        // Limpa os campos quando não há dados iniciais (criação)
        setImageUrl('')
        setTitle('')
        setContent('')
      }
    }
  }, [initialData, isOpen])

  const handleSave = () => {
    onSave({ imageUrl, title, content })
    // Limpar campos após salvar
    setImageUrl('')
    setTitle('')
    setContent('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-6xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0">
          <h2 className="text-xl font-semibold text-slate-900">
            {initialData ? 'Editar postagem' : 'Criar postagem'}
          </h2>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Link da imagem de capa
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Título
            </label>
            <input
              type="text"
              placeholder="Escreva o título da postagem"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Conteúdo
            </label>
            <div className="w-full rounded-xl border border-slate-200 overflow-hidden">
              <div className="simple-editor-embed">
                <SimpleEditor
                  key={`${initialData?.id ?? 'create'}-${isOpen}-${content ? 'has-content' : 'empty'}`}
                  initialContent={content}
                  onChange={setContent}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 shrink-0">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold"
            onClick={onClose}
          >
            Fechar
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-violet-700 text-white hover:bg-violet-800 font-bold"
            onClick={handleSave}
          >
            {initialData ? 'Salvar alterações' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreatePost

