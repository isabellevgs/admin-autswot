import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { safeImageUrl } from '@/utils/safe-image-url'

function CardPost({ card, onClick }) {
  const handleButtonClick = (e) => {
    e.stopPropagation()
  }

  const imagemSegura = safeImageUrl(card.imageUrl)

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div
        className="h-32 bg-center bg-cover bg-violet-200"
        style={imagemSegura ? { backgroundImage: `url(${imagemSegura})` } : {}}
      />
      
      <div className="p-5 bg-white border-t border-slate-200">
        <Link
          to={`/comunidade/post/${card.id}`}
          onClick={handleButtonClick}
          className="flex items-center gap-2 mb-3 text-slate-500 hover:text-violet-700 transition-colors group"
        >
          <ExternalLink className="w-4 h-4 group-hover:text-violet-700" />
          <span className="text-sm font-medium truncate">Abrir post</span>
        </Link>
        <p className="font-semibold text-slate-900 truncate leading-tight">{card.title || 'Sem título'}</p>
      </div>
    </div>
  )
}

export default CardPost
