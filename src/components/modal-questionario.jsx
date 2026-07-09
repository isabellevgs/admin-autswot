import { useState, useEffect, useCallback } from 'react'
import { FileText, Download, TrendingUp, TrendingDown, Plus, AlertTriangle } from 'lucide-react'
import api from '@/services/api'
import { extrairErroApi } from '@/utils/api-errors'
import { gerarSwotPdf } from '@/lib/swot-pdf'
import { coletarDadosTracosParaPdf } from '@/lib/coletar-dados-tracos-pdf'
import { transformarDadosSwot } from '@/utils/swotUtils'

// Configuração dos módulos SWOT
const SWOT_MODULOS = {
  ameacas: {
    titulo: 'Ameaças',
    icon: AlertTriangle,
    gradient: 'red',
  },
  fraquezas: {
    titulo: 'Fraquezas',
    icon: TrendingDown,
    gradient: 'orange',
  },
  oportunidades: {
    titulo: 'Oportunidades',
    icon: Plus,
    gradient: 'blue',
  },
  forcas: {
    titulo: 'Forças',
    icon: TrendingUp,
    gradient: 'green',
  }
}

// Ordem de exibição dos módulos SWOT
const SWOT_ORDEM = ['ameacas', 'fraquezas', 'oportunidades', 'forcas']

// Classes de gradiente
const gradientClasses = {
  red: 'bg-linear-to-r from-red-500 to-red-600',
  orange: 'bg-linear-to-r from-yellow-500 to-orange-500',
  blue: 'bg-linear-to-r from-blue-500 to-blue-600',
  green: 'bg-linear-to-r from-green-500 to-green-600',
}

/**
 * Transforma dados da API em formato de módulos SWOT (com metadados por traço).
 */
function prepararDadosSwot(swotData) {
  return transformarDadosSwot(swotData)
}

function ModalQuestionario({ person, onClose }) {
  const [swotData, setSwotData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [gerandoPdf, setGerandoPdf] = useState(false)
  const [erroPdf, setErroPdf] = useState(null)
  const [error, setError] = useState(null)

  const loadSwot = useCallback(async () => {
    if (!person?.id) {
      setSwotData(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (
        typeof person.id !== 'string' ||
        !person.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      ) {
        setError('ID da pessoa inválido.')
        setSwotData(null)
        return
      }

      const response = await api.get(`/questionario-resposta/swot/user/${person.id}`)
      setSwotData(prepararDadosSwot(response.data))
    } catch (err) {
      console.error('Erro ao carregar SWOT:', err)
      const statusCode = err.response?.status

      if (statusCode === 404) {
        setError('Usuário não encontrado ou não possui SWOT.')
      } else if (statusCode === 401) {
        setError('Não autorizado. Faça login novamente.')
      } else if (statusCode === 403) {
        setError('Acesso negado. Você não tem permissão para ver este SWOT.')
      } else {
        setError(extrairErroApi(err, 'Erro ao carregar SWOT.'))
      }
      setSwotData(null)
    } finally {
      setLoading(false)
    }
  }, [person?.id])

  useEffect(() => {
    loadSwot()
  }, [loadSwot])

  if (!person) return null

  const handleSavePdf = async () => {
    if (!swotData || !person?.id || gerandoPdf) return
    setGerandoPdf(true)
    setErroPdf(null)
    try {
      const tracosDetalhados = await coletarDadosTracosParaPdf(swotData, person.id)
      gerarSwotPdf(person.name, swotData, tracosDetalhados)
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      setErroPdf(
        'Não foi possível gerar o PDF. Tente novamente ou entre em contato com a pesquisadora principal.',
      )
    } finally {
      setGerandoPdf(false)
    }
  }

  const totalItens = swotData 
    ? Object.values(swotData).reduce((acc, modulo) => acc + (modulo.items?.length || 0), 0)
    : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] rounded-lg bg-white shadow-xl flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">SWOT - Respostas do Questionário</h2>
              <p className="text-slate-600">Pessoa: {person.name}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {erroPdf && (
                <p className="text-xs text-red-600 max-w-xs text-right">{erroPdf}</p>
              )}
              <button
                type="button"
                onClick={handleSavePdf}
                disabled={!swotData || totalItens === 0 || loading || gerandoPdf}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {gerandoPdf ? 'Gerando…' : 'PDF'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center text-slate-500 py-8">Carregando SWOT...</div>
          ) : !swotData ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhum resultado encontrado</p>
              <p className="text-gray-400 text-sm mt-2">Esta pessoa ainda não possui respostas do questionário ou o SWOT não foi gerado.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {SWOT_ORDEM.map((secaoKey) => {
                const modulo = SWOT_MODULOS[secaoKey]
                const dados = swotData[secaoKey]
                const items = dados?.items || []
                const semTracos = items.length === 0

                return (
                  <div
                    key={secaoKey}
                    className={`rounded-lg p-6 shadow-md ${gradientClasses[modulo.gradient] || 'bg-linear-to-r from-gray-500 to-gray-600'}`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <modulo.icon className="w-6 h-6 text-white" />
                      <h3 className="text-white font-bold text-xl">
                        {modulo.titulo}
                        <span className="ml-2 text-white/80 text-base font-normal">
                          ({items.length} {items.length === 1 ? 'traço' : 'traços'})
                        </span>
                      </h3>
                      {semTracos && (
                        <span className="ml-auto bg-black/30 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          0 traços
                        </span>
                      )}
                    </div>

                    {semTracos ? (
                      <p className="text-white/90 text-sm sm:text-base bg-black/20 rounded-lg px-3 py-2">
                        Nenhum traço neste quadrante (0 traços).
                      </p>
                    ) : (
                      <ul className="space-y-2 mt-4">
                        {items.map((item, index) => (
                          <li
                            key={index}
                            className="text-white text-base bg-white/10 rounded-md p-3 backdrop-blur-sm"
                          >
                            {item.label ?? item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-4">
          <div className="text-sm text-gray-500 mr-auto">
            Total: {totalItens} {totalItens === 1 ? 'item' : 'itens'}
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalQuestionario
