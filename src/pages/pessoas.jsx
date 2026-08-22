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
  const { pessoas, loading, error, progressMap, sort, handleSort, reload } = usePessoas(searchTerm)
  const handleOpenQuestionario = (person) => { setSelectedPerson(person); setModalType('questionario') }
  const handleOpenDiario = (person) => { setSelectedPerson(person); setModalType('diario') }
  const handleOpenReflexoes = (person) => { setSelectedPerson(person); setModalType('reflexoes-traco') }
  const handleVerCadastro = (person) => { setSelectedPerson(person); setModalType('ver-cadastro') }
  const handleRedefinirSenha = (person) => { setSelectedPerson(person); setModalType('redefinir-senha') }
  const handleExcluirUsuario = (person) => { setSelectedPerson(person); setModalType('excluir-usuario') }
  const handleClose = () => { setModalType(null); setSelectedPerson(null) }

  const handleGerarPdfAceite = () => {
    // ajuste "aceite" para o critério real de quem "deu aceite" (ex: possui profileRegistration preenchido)
    const pessoasComAceite = pessoas.filter((p) => p.profileRegistration)
    gerarPessoasAceitePdf(pessoasComAceite)
  }

  return (
    <>
      <div className="mt-10 flex items-center justify-between">
        <h1 className="font-bold text-3xl">Pessoas</h1>
        <button
          onClick={handleGerarPdfAceite}
          disabled={loading || pessoas.length === 0}
          className="px-4 py-2 bg-slate-800 text-white rounded-md text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Gerar PDF (aceite)
        </button>
      </div>

      <Search onSearch={setSearchTerm} placeholder="Buscar por nome ou e-mail..." />

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
