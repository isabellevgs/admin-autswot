import { useState, useEffect, useRef } from 'react'
import CreatePost from '@/components/create-post'
import Search from '@/components/search'
import CardPost from '@/components/card-post'
import CreatePostButton from '@/components/create-post-button'
import PageContainer from '@/components/page-container'
import api from '@/services/api'

function Posts() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [cards, setCards] = useState([])
  const [editingCard, setEditingCard] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const searchTimeoutRef = useRef(null)

  // Carregar posts ao montar o componente
  useEffect(() => {
    loadPosts('')
  }, [])

  // Debounce para busca - aguarda 500ms após parar de digitar
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadPosts(searchTerm)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

  const loadPosts = async (search = '') => {
    try {
      setLoading(true)
      setError(null)
      const params = {
        page: '1',
        limit: '100', // Carregar muitos posts de uma vez
        ...(search.trim() && { search: search.trim() }),
      }
      const response = await api.get('/posts', { params })
      setCards(response.data.posts || [])
    } catch (err) {
      console.error('Erro ao carregar posts:', err)
      setError('Erro ao carregar posts. Tente novamente.')
      setCards([])
    } finally {
      setLoading(false)
    }
  }

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
        // Atualizar post existente
        await api.put(`/posts/${editingCard.id}`, {
          title,
          content,
          imageUrl: imageUrl || undefined,
        })
      } else {
        // Criar novo post
        await api.post('/posts', {
          title,
          content,
          imageUrl: imageUrl || undefined,
        })
      }
      // Recarregar posts após salvar
      await loadPosts(searchTerm)
      closeCreate()
    } catch (err) {
      console.error('Erro ao salvar post:', err)
      setError(err.response?.data?.error || 'Erro ao salvar post. Tente novamente.')
    }
  }

  const handleDelete = async (postId) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) {
      return
    }
    try {
      setError(null)
      await api.delete(`/posts/${postId}`)
      await loadPosts(searchTerm)
    } catch (err) {
      console.error('Erro ao excluir post:', err)
      setError(err.response?.data?.error || 'Erro ao excluir post. Tente novamente.')
    }
  }

  return (
    <PageContainer>
      <h1 className="mt-10 font-bold text-3xl">Comunidade</h1>

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
        initialData={editingCard}
      />
    </PageContainer>
  )
}

export default Posts

