function PerguntasFolderTabs({ tipos, activeKey, onChange, children }) {
  return (
    <div className="mt-6">
      {/* Abas estilo pasta */}
      <div className="flex flex-wrap gap-1">
        {tipos.map((t) => {
          const active = activeKey === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              style={{
                marginBottom: active ? '-1px' : 0,
                position: active ? 'relative' : 'static',
                borderRadius: '14px 14px 0 0',
                backgroundColor: active ? '#ede9fe' : '#f1f5f9',
                borderColor: active ? '#c4b5fd' : '#e2e8f0',
                borderBottomColor: active ? '#ede9fe' : '#e2e8f0',
                color: active ? '#6d28d9' : '#64748b',
              }}
              className="px-6 py-3 text-sm font-medium transition-colors border"
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Painel de conteúdo */}
      <div className="border border-violet-300 rounded-b-[20px] rounded-tr-[20px] bg-violet-50 p-6 shadow-sm">
        {children}
      </div>
    </div>
  )
}

export default PerguntasFolderTabs
