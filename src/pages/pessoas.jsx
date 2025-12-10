import { useState, useMemo, useEffect } from 'react'
import PageContainer from '@/components/page-container'
import CardPessoas from '@/components/card-pessoas'
import Search from '@/components/search'
import ModalPerguntas from '@/components/modal-perguntas'
import ModalDiario from '@/components/modal-diario'
import ModalQuestionario from '@/components/modal-questionario'
import api from '@/services/api'

function Pessoas() {
  const [modalType, setModalType] = useState(null) // 'questionario' ou 'diario'
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [pessoas, setPessoas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Carregar pessoas da API
  useEffect(() => {
    loadPessoas()
  }, [])

  const loadPessoas = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/users', {
        params: {
          page: '1',
          limit: '100', // Carregar muitos usuários de uma vez
        },
      })
      setPessoas(response.data.users || [])
    } catch (err) {
      console.error('Erro ao carregar pessoas:', err)
      setError('Erro ao carregar pessoas. Tente novamente.')
      setPessoas([])
    } finally {
      setLoading(false)
    }
  }

  const filteredPessoas = useMemo(() => {
    if (!searchTerm.trim()) {
      return pessoas
    }
    return pessoas.filter((person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, pessoas])

  const handleOpenQuestionario = (person) => {
    setSelectedPerson(person)
    setModalType('questionario')
  }

  const handleOpenDiario = (person) => {
    setSelectedPerson(person)
    setModalType('diario')
  }

  const handleEditPerguntas = (person) => {
    setSelectedPerson(person)
    setModalType('editar-perguntas')
  }

  const handleClose = () => {
    setModalType(null)
    setSelectedPerson(null)
  }


  return (
    <PageContainer>
      <h1 className="mt-10 font-bold text-3xl">Pessoas</h1>
      
      <Search 
        onSearch={setSearchTerm} 
        placeholder="Buscar por nome..." 
      />

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="mt-8 text-center text-slate-500 py-8">Carregando pessoas...</div>
      ) : filteredPessoas.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPessoas.map((person) => (
            <CardPessoas
              key={person.id}
              person={person}
              onOpenQuestionario={handleOpenQuestionario}
              onOpenDiario={handleOpenDiario}
              onEditPerguntas={handleEditPerguntas}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 text-center text-slate-500 py-8">
          {searchTerm ? `Nenhuma pessoa encontrada com o termo "${searchTerm}"` : 'Nenhuma pessoa cadastrada'}
        </div>
      )}

      {modalType === 'questionario' && (
        <ModalQuestionario person={selectedPerson} onClose={handleClose} />
      )}

      {modalType === 'diario' && (
        <ModalDiario person={selectedPerson} onClose={handleClose} />
      )}

      {modalType === 'editar-perguntas' && (
        <ModalPerguntas person={selectedPerson} onClose={handleClose} />
      )}
    </PageContainer>
  )
}

export default Pessoas

