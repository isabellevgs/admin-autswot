import { useState, useEffect } from 'react'
import { FileText, Download, TrendingUp, TrendingDown, Plus, AlertTriangle } from 'lucide-react'
import api from '@/services/api'

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
 * Mapeia um traço da API para formato de exibição
 */
function mapearTraco(traco) {
  // Se o campo swot existir e não estiver vazio, usa ele. Caso contrário, usa o formato antigo
  if (traco.swot && traco.swot.trim() !== '') {
    return traco.swot
  }
  
  const tipoLabel = {
    'SH': 'Fraquezas e Ameaças SH',
    'CH': 'Fraquezas e Ameaças CH',
    'FO': 'Fraquezas e Oportunidades',
    'F': 'Forças'
  }[traco.tipo] || traco.tipo
  
  return `Traço ${traco.numeroTraco} - ${tipoLabel}`
}

/**
 * Transforma dados da API em formato de módulos SWOT
 */
function transformarDadosSwot(swotData) {
  // Função auxiliar para mapear e filtrar itens válidos
  const mapearEFiltrar = (array) => {
    if (!array || !Array.isArray(array)) return []
    return array
      .map(mapearTraco)
      .filter(item => item && item.trim() !== '') // Remove itens vazios ou null
  }

  return {
    ameacas: {
      items: mapearEFiltrar(swotData.ameacas)
    },
    fraquezas: {
      items: mapearEFiltrar(swotData.fraquezas)
    },
    oportunidades: {
      items: mapearEFiltrar(swotData.oportunidades)
    },
    forcas: {
      items: mapearEFiltrar(swotData.forcas)
    }
  }
}

function ModalQuestionario({ person, onClose }) {
  const [swotData, setSwotData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  if (!person) return null

  // Carregar SWOT ao abrir o modal
  useEffect(() => {
    if (person?.id) {
      loadSwot()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person?.id])

  const loadSwot = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Verificar se person.id é um UUID válido
      if (!person.id || typeof person.id !== 'string' || !person.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.error('ID inválido:', person.id)
        setError('ID da pessoa inválido.')
        setSwotData(null)
        setLoading(false)
        return
      }

      // Buscar SWOT do usuário específico
      const response = await api.get(`/questionario-resposta/swot/user/${person.id}`)
      const dadosTransformados = transformarDadosSwot(response.data)
      
      setSwotData(dadosTransformados)
    } catch (err) {
      console.error('Erro ao carregar SWOT:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Erro desconhecido'
      const statusCode = err.response?.status
      
      if (statusCode === 404) {
        setError('Usuário não encontrado ou não possui SWOT.')
      } else if (statusCode === 401) {
        setError('Não autorizado. Faça login novamente.')
      } else if (statusCode === 403) {
        setError('Acesso negado. Você não tem permissão para ver este SWOT.')
      } else {
        setError(`Erro ao carregar SWOT: ${errorMessage}`)
      }
      setSwotData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePdf = () => {
    // Placeholder: integração de PDF virá depois
    console.log('Salvar em PDF acionado para:', person.name)
    alert('Funcionalidade de PDF em desenvolvimento')
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
            <button
              type="button"
              onClick={handleSavePdf}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
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
          ) : !swotData || totalItens === 0 ? (
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
                
                if (items.length === 0) return null

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
                          ({items.length} {items.length === 1 ? 'item' : 'itens'})
                        </span>
                      </h3>
                    </div>
                    
                    <ul className="space-y-2 mt-4">
                      {items.map((item, index) => (
                        <li 
                          key={index} 
                          className="text-white text-base bg-white/10 rounded-md p-3 backdrop-blur-sm"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
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
