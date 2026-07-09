import { useState, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X } from 'lucide-react'
import api from '@/services/api'
import { fetchAllPages } from '@/utils/fetch-all-pages'
import { extrairErroApi } from '@/utils/api-errors'
import BulletListField from '@/components/bullet-list-field'
import AutoResizeTextarea from '@/components/auto-resize-textarea'
import {
  TIPOS_RELATORIO_TRACO,
  montarPayloadTracoDetalhe,
  tituloDoTraco,
  GRUPOS_RELATORIO,
} from '@/constants/relatorios-config'

function secoesDoCampo(campo) {
  if (campo.sections?.length) return campo.sections
  if (campo.section) return [campo.section]
  return []
}

function chaveSecoes(campo) {
  return secoesDoCampo(campo).map((s) => s.legend).join('|')
}

function SecaoBadges({ secoes }) {
  const visiveis = secoes.filter((s) => s.legend !== 'Neutro')
  if (!visiveis.length) return null
  return visiveis.map((secao) => (
    <span
      key={secao.legend}
      className={`inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${secao.badgeClass}`}
    >
      {secao.legend}
    </span>
  ))
}

function arrayParaTexto(valor, split = 'paragraph') {
  if (!Array.isArray(valor)) return ''
  if (split === 'line') return valor.join('\n')
  return valor.join('\n\n')
}

function textoParaArray(texto, split = 'paragraph') {
  const raw = (texto ?? '').trim()
  if (!raw) return []
  if (split === 'line') {
    return raw.split('\n').map((s) => s.trim()).filter(Boolean)
  }
  return raw.split(/\n\n+/).map((s) => s.trim()).filter(Boolean)
}

function buildForm(campos, data) {
  return campos.reduce((acc, campo) => {
    if (campo.type === 'bulletList') {
      const arr = Array.isArray(data?.[campo.name]) ? data[campo.name] : []
      acc[campo.name] = arr.length > 0 ? [...arr] : ['']
    } else if (campo.type === 'textArray') {
      acc[campo.name] = arrayParaTexto(data?.[campo.name], campo.split)
    } else {
      acc[campo.name] = data?.[campo.name] ?? ''
    }
    return acc
  }, {})
}

const HINTS = {
  paragraph: 'Separe parágrafos com uma linha em branco.',
}

const selectClass =
  'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-violet-400 bg-white'

function ModalRelatorioForm({ tipo, relatorio, relatoriosExistentes = [], onSave, onClose }) {
  const campos = tipo.campos ?? []
  const isAmeaca = tipo.variant === 'ameaca'
  const isTracoDetalhe = !!tipo.tipoBanco
  const selecionaTraco = isAmeaca || isTracoDetalhe
  const isEdit = !!relatorio?.id

  const [tipoRelatorio, setTipoRelatorio] = useState(
    relatorio?.tipoRelatorio ?? (isTracoDetalhe ? tipo.tipoBanco : 'SH')
  )
  const [numeroTraco, setNumeroTraco] = useState(relatorio?.numeroTraco ? String(relatorio.numeroTraco) : '')
  const [tituloRelatorio, setTituloRelatorio] = useState(relatorio?.titulo ?? '')
  const [tracos, setTracos] = useState([])
  const [loadingTracos, setLoadingTracos] = useState(false)
  const [form, setForm] = useState(() => buildForm(campos, relatorio))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const configTraco = isAmeaca ? TIPOS_RELATORIO_TRACO[tipoRelatorio] : null
  const endpoint = isTracoDetalhe ? tipo.endpoint : configTraco?.endpoint
  const tracosEndpoint = isAmeaca ? configTraco?.tracosEndpoint : tipo.tracosEndpoint

  const loadTracos = useCallback(async () => {
    if (!selecionaTraco || !tracosEndpoint) return
    setLoadingTracos(true)
    try {
      const lista = await fetchAllPages(tracosEndpoint, { itemsKey: 'registros', limit: 100 })
      setTracos(lista.sort((a, b) => a.numeroTraco - b.numeroTraco))
    } catch (err) {
      setTracos([])
      setError(extrairErroApi(err, 'Não foi possível carregar os traços. Tente novamente.'))
    } finally {
      setLoadingTracos(false)
    }
  }, [selecionaTraco, tracosEndpoint])

  useEffect(() => { loadTracos() }, [loadTracos])

  const tracosUsados = useMemo(() => {
    if (!selecionaTraco || isEdit) return new Set()
    return new Set(
      relatoriosExistentes
        .filter((r) => !isAmeaca || r.tipoRelatorio === tipoRelatorio)
        .map((r) => r.numeroTraco)
    )
  }, [relatoriosExistentes, tipoRelatorio, isAmeaca, selecionaTraco, isEdit])

  const tracosDisponiveis = useMemo(
    () => tracos.filter((t) => !tracosUsados.has(t.numeroTraco)),
    [tracos, tracosUsados]
  )

  useEffect(() => {
    if (isEdit || !numeroTraco) return
    if (tracosUsados.has(Number(numeroTraco))) {
      setNumeroTraco('')
    }
  }, [tipoRelatorio, tracosUsados, numeroTraco, isEdit])

  useEffect(() => {
    if (isEdit) {
      setTituloRelatorio(relatorio?.titulo ?? '')
      return
    }
    if (!numeroTraco) {
      setTituloRelatorio('')
      return
    }
    const traco = tracos.find((t) => String(t.numeroTraco) === numeroTraco)
    if (traco) {
      setTituloRelatorio(tituloDoTraco(traco) ?? '')
    }
  }, [isEdit, relatorio?.titulo, numeroTraco, tracos])

  const handleTipoChange = (novoTipo) => {
    setTipoRelatorio(novoTipo)
    if (!isEdit) {
      setNumeroTraco('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const tituloFinal = tituloRelatorio.trim()

    try {
      if (selecionaTraco && !numeroTraco) {
        setError('Selecione um traço.')
        setSaving(false)
        return
      }
      if (selecionaTraco && !Number.isFinite(Number(numeroTraco))) {
        setError('Traço inválido.')
        setSaving(false)
        return
      }
      if (selecionaTraco && !tituloFinal) {
        setError('Informe o título do relatório.')
        setSaving(false)
        return
      }
      if (selecionaTraco && !isEdit && tracosUsados.has(Number(numeroTraco))) {
        setError('Este traço já possui um relatório cadastrado.')
        setSaving(false)
        return
      }

      const payload = { ...form }

      campos.filter((c) => c.type === 'bulletList').forEach((c) => {
        payload[c.name] = (payload[c.name] || []).map((s) => s.trim()).filter(Boolean)
      })

      campos.filter((c) => c.type === 'textArray').forEach((c) => {
        payload[c.name] = textoParaArray(payload[c.name], c.split)
      })

      campos.filter((c) => c.type === 'text').forEach((c) => {
        payload[c.name] = (payload[c.name] || '').trim()
      })

      let body = payload

      if (isAmeaca) {
        body = { ...payload, numeroTraco: Number(numeroTraco), titulo: tituloFinal }
      } else if (isTracoDetalhe) {
        body = isEdit
          ? { ...payload, titulo: tituloFinal }
          : montarPayloadTracoDetalhe(tipo.tipoBanco, numeroTraco, tituloFinal, payload)
      }

      const result = isEdit
        ? await api.put(`${endpoint}/${relatorio.id}`, body)
        : await api.post(endpoint, body)

      onSave({ ...result.data, tipoRelatorio: isTracoDetalhe ? tipo.tipoBanco : tipoRelatorio })
    } catch (err) {
      setError(extrairErroApi(err, 'Erro ao salvar.'))
    } finally {
      setSaving(false)
    }
  }

  const renderCamposOrdenados = () => {
    const nodes = []
    let i = 0
    let secaoAnterior = null

    while (i < campos.length) {
      const campo = campos[i]

      if (campo.group && GRUPOS_RELATORIO[campo.group]) {
        const grupoKey = campo.group
        const grupo = []
        while (i < campos.length && campos[i].group === grupoKey) {
          grupo.push(campos[i])
          i++
        }

        const meta = GRUPOS_RELATORIO[grupoKey]
        const secoesGrupo = secoesDoCampo(grupo[0] ?? {})

        nodes.push(
          <fieldset key={grupoKey} className="space-y-4 rounded-xl border border-slate-200 p-4">
            <legend className="px-1">
              <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800">
                <SecaoBadges secoes={secoesGrupo} />
                {meta.titulo}
              </span>
            </legend>
            {secoesGrupo[0]?.hint && (
              <p className="text-xs text-slate-500 -mt-2">{secoesGrupo[0].hint}</p>
            )}
            <p className="text-xs text-slate-500 -mt-2">{meta.hint}</p>
            {grupo.map((c) => renderCampo(c, secaoAnterior, (s) => { secaoAnterior = s }, { hideSectionBadge: true }))}
          </fieldset>
        )
      } else {
        nodes.push(renderCampo(campo, secaoAnterior, (s) => { secaoAnterior = s }))
        i++
      }
    }

    return nodes
  }

  const renderCampo = (campo, secaoAnterior, setSecaoAnterior, opts = {}) => {
    const { hideSectionBadge = false } = opts
    const hint = campo.type === 'textArray' ? HINTS[campo.split ?? 'paragraph'] : null
    const secoes = secoesDoCampo(campo)
    const secaoChave = chaveSecoes(campo)
    const secaoMudou = !hideSectionBadge && secaoChave && secaoChave !== secaoAnterior
    if (secaoMudou) setSecaoAnterior(secaoChave)

    return (
      <div key={campo.name}>
        <div className="mb-1">
          <label className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
            {!hideSectionBadge && <SecaoBadges secoes={secoes} />}
            <span>
              {campo.label}
              {campo.required && <span className="text-red-500 ml-0.5">*</span>}
            </span>
          </label>
          {secaoMudou && secoes[0]?.hint && (
            <p className="text-xs text-slate-500 mt-1 ml-0.5">{secoes[0].hint}</p>
          )}
        </div>

        {campo.type === 'bulletList' ? (
          <BulletListField
            value={form[campo.name]}
            onChange={(val) => setForm((prev) => ({ ...prev, [campo.name]: val }))}
          />
        ) : campo.type === 'textArray' || campo.type === 'text' ? (
          <>
            <AutoResizeTextarea
              value={form[campo.name]}
              onChange={(e) => setForm((prev) => ({ ...prev, [campo.name]: e.target.value }))}
              minRows={1}
              required={campo.required}
            />
            {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
          </>
        ) : null}
      </div>
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {isEdit ? 'Editar relatório' : 'Novo relatório'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{tipo.label}</p>
            </div>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between gap-3">
              <span>{error}</span>
              {selecionaTraco && (
                <button
                  type="button"
                  onClick={loadTracos}
                  disabled={loadingTracos}
                  className="shrink-0 text-sm font-semibold text-red-800 hover:underline disabled:opacity-50"
                >
                  Tentar novamente
                </button>
              )}
            </div>
          )}

          <form id="form-relatorio" onSubmit={handleSubmit} className="space-y-4">
            {selecionaTraco && (
              <div className={`grid grid-cols-1 ${isAmeaca ? 'sm:grid-cols-2' : ''} gap-4 p-4 rounded-xl border border-violet-200 bg-violet-50/40`}>
                {isAmeaca && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tipo do traço
                    </label>
                    <select
                      value={tipoRelatorio}
                      onChange={(e) => handleTipoChange(e.target.value)}
                      disabled={isEdit}
                      className={selectClass}
                      required
                    >
                      {Object.values(TIPOS_RELATORIO_TRACO).map((t) => (
                        <option key={t.key} value={t.key}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={isAmeaca ? '' : 'sm:col-span-2'}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Traço
                  </label>
                  {isEdit ? (
                    <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2">
                      {relatorio.numeroTraco}. {relatorio.titulo}
                    </p>
                  ) : (
                    <>
                      <select
                        value={numeroTraco}
                        onChange={(e) => setNumeroTraco(e.target.value)}
                        disabled={loadingTracos || tracosDisponiveis.length === 0}
                        className={selectClass}
                        required
                      >
                        <option value="">
                          {loadingTracos
                            ? 'Carregando traços...'
                            : tracosDisponiveis.length === 0
                              ? 'Nenhum traço disponível'
                              : 'Selecione um traço'}
                        </option>
                        {tracosDisponiveis.map((t) => {
                          const titulo = tituloDoTraco(t)
                          return (
                            <option key={t.numeroTraco} value={String(t.numeroTraco)}>
                              {t.numeroTraco}. {titulo || `Traço ${t.numeroTraco}`}
                            </option>
                          )
                        })}
                      </select>
                      {!loadingTracos && tracosDisponiveis.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          Todos os traços deste tipo já possuem relatório cadastrado.
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="titulo-relatorio" className="block text-sm font-medium text-slate-700 mb-1">
                    Título do relatório
                  </label>
                  <input
                    id="titulo-relatorio"
                    type="text"
                    value={tituloRelatorio}
                    onChange={(e) => setTituloRelatorio(e.target.value)}
                    maxLength={300}
                    className={selectClass}
                    required
                    placeholder="Título exibido no SWOT e no PDF"
                  />
                </div>
              </div>
            )}

            {renderCamposOrdenados()}
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-relatorio"
            disabled={saving || (selecionaTraco && !isEdit && tracosDisponiveis.length === 0)}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ModalRelatorioForm
