import { useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'

function Search({ onSearch, placeholder = 'Buscar...' }) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch?.(value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch?.(searchTerm)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex items-center gap-3 w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleChange}
        className="flex-1 rounded-lg border border-violet-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-700"
      />
      <button
        type="submit"
        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-700 text-white rounded-lg hover:bg-violet-800 transition"
        style={{ whiteSpace: 'nowrap' }}
      >
        <SearchIcon className="w-5 h-5" />
        <p className="font-bold">Buscar</p>
      </button>
    </form>
  )
}

export default Search

