import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchAllPages } from '@/utils/fetch-all-pages'
import { extrairErroApi } from '@/utils/api-errors'

export function usePostsList() {
  const [cards, setCards] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const searchTimeoutRef = useRef(null)
  const skipSearchDebounceRef = useRef(true)

  const loadPosts = useCallback(async (search = '') => {
    try {
      setLoading(true)
      setError(null)
      const params = search.trim() ? { search: search.trim() } : {}
      const posts = await fetchAllPages('/posts', { itemsKey: 'posts', limit: 100, params })
      setCards(posts)
    } catch (err) {
      console.error('Erro ao carregar posts:', err)
      setError(extrairErroApi(err, 'Erro ao carregar posts. Tente novamente.'))
      setCards([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts('')
  }, [loadPosts])

  useEffect(() => {
    if (skipSearchDebounceRef.current) {
      skipSearchDebounceRef.current = false
      return
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadPosts(searchTerm)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm, loadPosts])

  return { cards, searchTerm, setSearchTerm, loading, error, setError, reload: () => loadPosts(searchTerm) }
}
