import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageContainer from '@/components/page-container'
import api from '@/services/api'

function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPost()
  }, [id])

  const loadPost = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/posts/${id}`)
      setPost(response.data.post)
    } catch (err) {
      console.error('Erro ao carregar post:', err)
      setError('Erro ao carregar post. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="mt-10 text-center text-slate-500">Carregando post...</div>
      </PageContainer>
    )
  }

  if (error || !post) {
    return (
      <PageContainer>
        <div className="mt-10">
          <button
            onClick={() => navigate('/comunidade')}
            className="mb-6 flex items-center gap-2 text-slate-600 hover:text-violet-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar para Comunidade</span>
          </button>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error || 'Post não encontrado'}
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <button
        onClick={() => navigate('/comunidade')}
        className="mt-10 mb-6 flex items-center gap-2 text-slate-600 hover:text-violet-700 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Voltar para Comunidade</span>
      </button>

      <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Imagem de capa */}
        {post.imageUrl && (
          <div
            className="w-full h-64 bg-center bg-cover bg-violet-200"
            style={{ backgroundImage: `url(${post.imageUrl})` }}
          />
        )}

        {/* Conteúdo */}
        <div className="p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{post.title}</h1>
          
          {/* Informações do autor */}
          {post.author && (
            <div className="mb-6 text-sm text-slate-500">
              <span>Por {post.author.name}</span>
              {post.createdAt && (
                <span className="ml-4">
                  {new Date(post.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          )}

          {/* Conteúdo HTML do post */}
          <div
            className="post-content prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-violet-700 prose-strong:text-slate-900 prose-code:text-violet-700"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    </PageContainer>
  )
}

export default PostDetail

