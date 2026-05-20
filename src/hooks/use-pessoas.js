import { useState, useMemo, useEffect, useCallback } from 'react'
import api from '@/services/api'

async function fetchTotalPerguntas() {
  try {
    const [sh, ch, fo, f] = await Promise.all([
      api.get('/fraquezas-ameacas-sh', { params: { page: 1, limit: 500 } }),
      api.get('/fraquezas-ameacas-ch', { params: { page: 1, limit: 500 } }),
      api.get('/fraquezas-oportunidades', { params: { page: 1, limit: 500 } }),
      api.get('/forcas', { params: { page: 1, limit: 500 } }),
    ])
    const total =
      (sh.data?.registros?.length ?? 0) +
      (ch.data?.registros?.length ?? 0) +
      (fo.data?.registros?.length ?? 0) +
      (f.data?.registros?.length ?? 0)
    return total > 0 ? total : null
  } catch {
    return null
  }
}

export function usePessoas(searchTerm) {
  const [pessoas, setPessoas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progressMap, setProgressMap] = useState({})
  const [sort, setSort] = useState({ key: null, dir: 'asc' })

  const loadProgressoUsuarios = useCallback(async (users, total) => {
    if (!total || users.length === 0) return

    const results = await Promise.allSettled(
      users.map((u) => api.get(`/questionario-resposta/user/${u.id}`))
    )

    const map = {}
    results.forEach((result, i) => {
      const id = users[i].id
      if (result.status === 'fulfilled') {
        const respostas = result.value.data?.respostas ?? []
        map[id] = Math.min(100, Math.round((respostas.length / total) * 100))
      } else {
        map[id] = null
      }
    })
    setProgressMap(map)
  }, [])

  const loadPessoas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [usersResp, total] = await Promise.all([
        api.get('/users', { params: { page: '1', limit: '100' } }),
        fetchTotalPerguntas(),
      ])
      const users = usersResp.data.users || []
      setPessoas(users)
      if (total) loadProgressoUsuarios(users, total)
    } catch (err) {
      console.error('Erro ao carregar pessoas:', err)
      setError('Erro ao carregar pessoas. Tente novamente.')
      setPessoas([])
    } finally {
      setLoading(false)
    }
  }, [loadProgressoUsuarios])

  useEffect(() => {
    loadPessoas()
  }, [loadPessoas])

  const handleSort = useCallback((key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    )
  }, [])

  const filteredPessoas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    let list = term
      ? pessoas.filter(
          (p) =>
            p.name?.toLowerCase().includes(term) ||
            p.email?.toLowerCase().includes(term)
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

  return { pessoas: filteredPessoas, loading, error, progressMap, sort, handleSort }
}
