import { useState, useMemo, useEffect } from 'react'
import PageContainer from '@/components/page-container'
import CardPessoas from '@/components/card-pessoas'
import Search from '@/components/search'
import ModalPerguntas from '@/components/modal-perguntas'
import ModalDiario from '@/components/modal-diario'
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

  const handleSavePdf = () => {
    // Placeholder: integração de PDF virá depois
    console.log('Salvar em PDF acionado')
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

      {modalType === 'questionario' && selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

          <div className="relative z-10 w-full max-w-lg rounded-lg bg-white shadow-xl">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Respostas do Questionário</h2>
              <p className="text-slate-600 mb-2">Pessoa: {selectedPerson.name}</p>
              <p className="text-slate-500">respostas do questionário vão ficar aqui</p>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-4">
              <button
                type="button"
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={handleClose}
              >
                fechar
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleSavePdf}
              >
                salvar em pdf
              </button>
            </div>
          </div>
        </div>
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

