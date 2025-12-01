import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Search from '@/components/search'
import CardPost from '@/components/card-post'
import PageContainer from '@/components/page-container'
import api from '@/services/api'

function Comunidade() {
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
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

  const handleCardClick = (card) => {
    navigate(`/comunidade/post/${card.id}`)
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
          {cards.map(card => (
            <CardPost
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card)}
            />
          ))}
        </div>
      )}

      {!loading && cards.length === 0 && (
        <div className="mt-8 text-center text-slate-500">
          {searchTerm ? 'Nenhum post encontrado.' : 'Nenhum post ainda.'}
        </div>
      )}
    </PageContainer>
  )
}

export default Comunidade

