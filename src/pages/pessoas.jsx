import { useState } from 'react'
import Search from '@/components/search'
import PessoasTable from '@/components/pessoas-table'
import ModalDiario from '@/components/modal-diario'
import ModalQuestionario from '@/components/modal-questionario'
import ModalReflexoesTraco from '@/components/modal-reflexoes-traco'
import ModalRedefinirSenha from '@/components/modal-redefinir-senha'
import ModalExcluirUsuario from '@/components/modal-excluir-usuario'
import ModalCadastro from '@/components/modal-cadastro'
import { usePessoas } from '@/hooks/use-pessoas'
import { gerarPessoasAceitePdf } from '@/lib/pessoas-pdf'

function Pessoas() {
  const [searchTerm, setSearchTerm] = useState('')
  const [modalType, setModalType] = useState(null)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [gerandoPdf, setGerandoPdf] = useState(false)
  const { pessoas, loading, error, progressMap, sort, handleSort, reload } = usePessoas(searchTerm)
  const handleOpenQuestionario = (person) => { setSelectedPerson(person); setModalType('questionario') }
  const handleOpenDiario = (person) => { setSelectedPerson(person); setModalType('diario') }
  const handleOpenReflexoes = (person) => { setSelectedPerson(person); setModalType('reflexoes-traco') }
  const handleVerCadastro = (person) => { setSelectedPerson(person); setModalType('ver-cadastro') }
  const handleRedefinirSenha = (person) => { setSelectedPerson(person); setModalType('redefinir-senha') }
  const handleExcluirUsuario = (person) => { setSelectedPerson(person); setModalType('excluir-usuario') }
  const handleClose = () => { setModalType(null); setSelectedPerson(null) }

  const handleGerarPdfAceite = async () => {
    setGerandoPdf(true)
    try {
      await gerarPessoasAceitePdf(pessoas)
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
    } finally {
      setGerandoPdf(false)
    }
  }

  return (
    <>
      <h1 className="mt-10 font-bold text-3xl">Pessoas</h1>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1">
          <Search onSearch={setSearchTerm} placeholder="Buscar por nome ou e-mail..." />
        </div>
        <button
          onClick={handleGerarPdfAceite}
          disabled={loading || gerandoPdf || pessoas.length === 0}
          className="px-4 py-2 bg-slate-800 text-white rounded-md text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {gerandoPdf ? 'Gerando PDF...' : 'Gerar PDF (aceite)'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 text-center text-slate-500 py-8">Carregando pessoas...</div>
      ) : pessoas.length > 0 ? (
        <PessoasTable
          pessoas={pessoas}
          progressMap={progressMap}
          sort={sort}
          onSort={handleSort}
          onOpenQuestionario={handleOpenQuestionario}
          onOpenDiario={handleOpenDiario}
          onOpenReflexoes={handleOpenReflexoes}
          onVerCadastro={handleVerCadastro}
          onRedefinirSenha={handleRedefinirSenha}
          onExcluirUsuario={handleExcluirUsuario}
        />
      ) : (
        <div className="mt-8 text-center text-slate-500 py-8">
          {searchTerm
            ? `Nenhuma pessoa encontrada com o termo "${searchTerm}"`
            : 'Nenhuma pessoa cadastrada'}
        </div>
      )}

      {modalType === 'questionario' && <ModalQuestionario person={selectedPerson} onClose={handleClose} />}
      {modalType === 'diario' && <ModalDiario person={selectedPerson} onClose={handleClose} />}
      {modalType === 'reflexoes-traco' && <ModalReflexoesTraco person={selectedPerson} onClose={handleClose} />}
      {modalType === 'ver-cadastro' && <ModalCadastro person={selectedPerson} onClose={handleClose} />}
      {modalType === 'redefinir-senha' && <ModalRedefinirSenha person={selectedPerson} onClose={handleClose} />}
      {modalType === 'excluir-usuario' && (
        <ModalExcluirUsuario person={selectedPerson} onClose={handleClose} onDeleted={reload} />
      )}
    </>
  )
}

export default Pessoas
