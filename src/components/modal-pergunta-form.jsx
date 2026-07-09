import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X, Plus } from 'lucide-react'
import api from '@/services/api'
import { extrairErroApi } from '@/utils/api-errors'

// Fora do componente — função pura, sem re-criações desnecessárias
function buildForm(campos, data) {
  return campos.reduce((acc, c) => {
    if (c.type === 'array') {
      const raw = data?.[c.name]
      acc[c.name] = Array.isArray(raw)
        ? raw.map((item) => (typeof item === 'object' ? item.valor : item))
        : []
    } else {
      acc[c.name] = data?.[c.name] ?? ''
    }
    return acc
  }, {})
}

function ArrayField({ value, onChange }) {
  const items = Array.isArray(value) ? value : []
  const [texto, setTexto] = useState('')

  const add = () => {
    const trimmed = texto.trim()
    if (!trimmed || items.includes(trimmed)) return
    onChange([...items, trimmed])
    setTexto('')
  }

  const remove = (idx) => onChange(items.filter((_, i) => i !== idx))

  return (
    <div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder="Digite um valor e adicione…"
          style={{ flex: 1, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
        />
        <button
          type="button"
          onClick={add}
          disabled={!texto.trim()}
          style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: texto.trim() ? '#7c3aed' : '#e2e8f0', color: texto.trim() ? '#fff' : '#94a3b8', cursor: texto.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', flexShrink: 0 }}
        >
          <Plus size={13} /> Adicionar
        </button>
      </div>
      {items.length === 0 ? (
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>Nenhum item selecionado</p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map((item, idx) => (
            <li key={`${item}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px 10px' }}>
              <span style={{ flex: 1, fontSize: '13px', color: '#334155' }}>{item}</span>
              <button
                type="button"
                onClick={() => remove(idx)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px', display: 'flex', alignItems: 'center' }}
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ModalPerguntaForm({ tipo, pergunta, onSave, onClose }) {
  const [form, setForm] = useState(() => buildForm(tipo.campos, pergunta))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = { ...form }
      tipo.campos.filter((c) => c.type === 'number').forEach((c) => {
        const val = payload[c.name]
        if (val === '' || val === null || val === undefined) {
          delete payload[c.name]
        } else {
          const num = Number(val)
          if (!Number.isFinite(num)) {
            throw new Error(`"${c.label}" deve ser um número válido.`)
          }
          payload[c.name] = num
        }
      })
      const result = pergunta?.id
        ? await api.put(`${tipo.endpoint}/${pergunta.id}`, payload)
        : await api.post(tipo.endpoint, payload)
      onSave(result.data?.registro ?? result.data)
    } catch (err) {
      setError(extrairErroApi(err, 'Erro ao salvar.'))
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '480px', maxHeight: '90vh', background: '#fff', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Cabeçalho */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                {pergunta ? 'Editar pergunta' : 'Nova pergunta'}
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>{tipo.label}</p>
            </div>
            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', minHeight: 0 }}>
          {error && (
            <div style={{ marginBottom: '12px', padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', color: '#b91c1c' }}>
              {error}
            </div>
          )}

          <form id="form-pergunta" onSubmit={handleSubmit}>
            {tipo.campos.map((campo, idx) => (
                <div key={campo.name} style={{ marginBottom: idx < tipo.campos.length - 1 ? '14px' : 0 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '5px' }}>
                    {campo.label}
                    {campo.required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
                  </label>

                  {campo.type === 'array' ? (
                    <ArrayField
                      value={form[campo.name]}
                      onChange={(val) => setForm((prev) => ({ ...prev, [campo.name]: val }))}
                    />
                  ) : campo.type === 'textarea' ? (
                    <textarea
                      value={form[campo.name]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [campo.name]: e.target.value }))}
                      required={campo.required}
                      rows={3}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                  ) : (
                    <input
                      type={campo.type}
                      value={form[campo.name]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [campo.name]: e.target.value }))}
                      required={campo.required}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  )}
                </div>
              ))}
          </form>
        </div>

        {/* Rodapé */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
            Cancelar
          </button>
          <button type="submit" form="form-pergunta" disabled={saving} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: saving ? '#a78bfa' : '#7c3aed', color: '#fff', fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {saving && <Loader2 size={13} className="animate-spin" />}
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ModalPerguntaForm
