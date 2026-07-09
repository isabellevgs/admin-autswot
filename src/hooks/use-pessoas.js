import { useState, useMemo, useEffect, useCallback } from 'react'
import api from '@/services/api'
import { fetchAllPages } from '@/utils/fetch-all-pages'
import { extrairErroApi } from '@/utils/api-errors'
import { calcularProgressoRespostas } from '@/utils/calcular-progresso'
import { fetchCatalogoQuestionario } from '@/utils/catalogo-questionario'

const PROGRESSO_BATCH = 5

async function loadProgressoEmLotes(users, catalogo) {
  const map = {}
  const total = catalogo?.totalRespondiveis ?? 0

  for (let i = 0; i < users.length; i += PROGRESSO_BATCH) {
    const batch = users.slice(i, i + PROGRESSO_BATCH)
    const results = await Promise.allSettled(
      batch.map((u) => api.get(`/questionario-resposta/user/${u.id}`)),
    )

    results.forEach((result, idx) => {
      const id = batch[idx].id
      if (result.status === 'fulfilled') {
        const respostas = result.value.data?.respostas ?? []
        map[id] = calcularProgressoRespostas(respostas, total, catalogo)
      } else {
        map[id] = null
      }
    })
  }

  return map
}

export function usePessoas(searchTerm) {
  const [pessoas, setPessoas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progressMap, setProgressMap] = useState({})
  const [sort, setSort] = useState({ key: null, dir: 'asc' })

  const loadPessoas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setProgressMap({})

      const [users, catalogo] = await Promise.all([
        fetchAllPages('/users', { itemsKey: 'users', limit: 100 }),
        fetchCatalogoQuestionario(),
      ])

      setPessoas(users)

      if (catalogo.totalRespondiveis > 0 && users.length > 0) {
        const map = await loadProgressoEmLotes(users, catalogo)
        setProgressMap(map)
      } else if (users.length > 0) {
        setProgressMap(Object.fromEntries(users.map((u) => [u.id, null])))
      } else {
        setProgressMap({})
      }
    } catch (err) {
      console.error('Erro ao carregar pessoas:', err)
      setError(extrairErroApi(err, 'Erro ao carregar pessoas. Tente novamente.'))
      setPessoas([])
      setProgressMap({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPessoas()
  }, [loadPessoas])

  const handleSort = useCallback((key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    )
  }, [])

  const filteredPessoas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    let list = term
      ? pessoas.filter(
          (p) =>
            p.name?.toLowerCase().includes(term) ||
            p.email?.toLowerCase().includes(term),
        )
      : [...pessoas]

    if (sort.key) {
      list.sort((a, b) => {
        let va, vb
        if (sort.key === 'progresso') {
          va = progressMap[a.id] ?? -1
          vb = progressMap[b.id] ?? -1
        } else {
          va = (a[sort.key] ?? '').toLowerCase()
          vb = (b[sort.key] ?? '').toLowerCase()
        }
        if (va < vb) return sort.dir === 'asc' ? -1 : 1
        if (va > vb) return sort.dir === 'asc' ? 1 : -1
        return 0
      })
    }

    return list
  }, [searchTerm, pessoas, sort, progressMap])

  return { pessoas: filteredPessoas, loading, error, progressMap, sort, handleSort, reload: loadPessoas }
}
