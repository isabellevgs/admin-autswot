import { useNavigate } from 'react-router-dom'
import Search from '@/components/search'
import CardPost from '@/components/card-post'
import { usePostsList } from '@/hooks/use-posts-list'

function Comunidade() {
  const navigate = useNavigate()
  const { cards, searchTerm, setSearchTerm, loading, error } = usePostsList()

  const handleCardClick = (card) => {
    navigate(`/comunidade/post/${card.id}`)
  }

  return (
    <>
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
    </>
  )
}

export default Comunidade
