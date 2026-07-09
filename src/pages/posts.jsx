import { useState } from 'react'
import CreatePost from '@/components/create-post'
import Search from '@/components/search'
import CardPost from '@/components/card-post'
import CreatePostButton from '@/components/create-post-button'
import ModalConfirmarExclusao from '@/components/modal-confirmar-exclusao'
import api from '@/services/api'
import { extrairErroApi } from '@/utils/api-errors'
import { sanitizeHtml } from '@/utils/sanitize-html'
import { usePostsList } from '@/hooks/use-posts-list'

function Posts() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [postParaExcluir, setPostParaExcluir] = useState(null)
  const [excluindo, setExcluindo] = useState(false)
  const [erroExclusao, setErroExclusao] = useState(null)

  const { cards, searchTerm, setSearchTerm, loading, error, setError, reload } = usePostsList()

  const openCreate = () => {
    setEditingCard(null)
    setIsCreateOpen(true)
  }

  const openEdit = (card) => {
    setEditingCard(card)
    setIsCreateOpen(true)
  }

  const closeCreate = () => {
    setIsCreateOpen(false)
    setEditingCard(null)
  }

  const handleSave = async ({ imageUrl, title, content }) => {
    try {
      setError(null)
      if (editingCard) {
        await api.put(`/posts/${editingCard.id}`, {
          title,
          content: sanitizeHtml(content),
          imageUrl: imageUrl || undefined,
        })
      } else {
        await api.post('/posts', {
          title,
          content: sanitizeHtml(content),
          imageUrl: imageUrl || undefined,
        })
      }
      await reload()
      closeCreate()
    } catch (err) {
      console.error('Erro ao salvar post:', err)
      throw err
    }
  }

  const handleRequestDelete = (post) => {
    setPostParaExcluir(post)
    setErroExclusao(null)
  }

  const handleConfirmDelete = async () => {
    if (!postParaExcluir) return
    setExcluindo(true)
    setErroExclusao(null)
    try {
      setError(null)
      await api.delete(`/posts/${postParaExcluir.id}`)
      setPostParaExcluir(null)
      closeCreate()
      await reload()
    } catch (err) {
      console.error('Erro ao excluir post:', err)
      setErroExclusao(extrairErroApi(err, 'Erro ao excluir post. Tente novamente.'))
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <>
      <h1 className="mt-10 font-bold text-3xl">Postagens</h1>

      <Search onSearch={setSearchTerm} />

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 text-center text-slate-500">Carregando posts...</div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CreatePostButton onClick={openCreate} />
          {cards.map(card => (
            <CardPost
              key={card.id}
              card={card}
              onClick={() => openEdit(card)}
            />
          ))}
        </div>
      )}

      {!loading && cards.length === 0 && (
        <div className="mt-8 text-center text-slate-500">
          {searchTerm ? 'Nenhum post encontrado.' : 'Nenhum post ainda. Crie o primeiro!'}
        </div>
      )}

      <CreatePost
        isOpen={isCreateOpen}
        onClose={closeCreate}
        onSave={handleSave}
        onDelete={editingCard ? () => handleRequestDelete(editingCard) : undefined}
        initialData={editingCard}
      />

      {postParaExcluir && (
        <ModalConfirmarExclusao
          titulo="Excluir postagem"
          descricao={postParaExcluir.title || 'Sem título'}
          carregando={excluindo}
          erro={erroExclusao}
          onConfirmar={handleConfirmDelete}
          onCancelar={() => {
            setPostParaExcluir(null)
            setErroExclusao(null)
            setExcluindo(false)
          }}
        />
      )}
    </>
  )
}

export default Posts
