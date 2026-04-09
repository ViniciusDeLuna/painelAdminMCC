'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  image_url: string | null
  published: boolean
  editorial_date: string | null
  author: string | null
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregar() {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, excerpt, image_url, published, editorial_date, author')
        .order('editorial_date', { ascending: false })

      if (error) {
        setErro('Erro ao carregar os editoriais.')
        setLoading(false)
        return
      }

      setPosts(data || [])
      setLoading(false)
    }

    carregar()
  }, [router, supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleDelete(id: string) {
    const confirmar = window.confirm('Deseja realmente excluir este editorial?')
    if (!confirmar) return

    const { error } = await supabase.from('posts').delete().eq('id', id)

    if (error) {
      alert('Erro ao excluir o editorial.')
      return
    }

    setPosts((estadoAnterior) => estadoAnterior.filter((post) => post.id !== id))
  }

  function formatarData(data: string | null) {
    if (!data) return '-'

    const match = String(data).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!match) return data

    return `${match[3]}/${match[2]}/${match[1]}`
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <header style={headerBoxStyle}>
          <div>
            <span style={pillStyle}>Painel administrativo</span>
            <h1 style={titleStyle}>Editoriais</h1>
            <p style={subtitleStyle}>
              Gerencie os editoriais com o mesmo padrão visual do site principal.
            </p>
          </div>

          <div style={headerActionsStyle}>
            <button
                style={secondaryButtonStyle}
                onClick={() => router.push('/admin')}
            >
                Painel
            </button>

            <button
                style={secondaryButtonStyle}
                onClick={() => router.push('/admin/frases')}
            >
                Frases
            </button>

            <button
                style={secondaryButtonStyle}
                onClick={() => window.open('https://frasesmauricioccantelli.com.br/editoriais', '_blank')}
            >
                Ver site
            </button>

            <button
                style={primaryButtonStyle}
                onClick={() => router.push('/admin/novo')}
            >
                Novo editorial
            </button>

            <button style={secondaryButtonStyle} onClick={handleLogout}>
                Sair
            </button>
            </div>
        </header>

        {loading && (
          <div style={statusBoxStyle}>
            <p style={{ margin: 0 }}>Carregando editoriais...</p>
          </div>
        )}

        {erro && (
          <div style={errorBoxStyle}>
            <p style={{ margin: 0 }}>{erro}</p>
          </div>
        )}

        {!loading && !erro && posts.length === 0 && (
          <div style={statusBoxStyle}>
            <p style={{ margin: 0 }}>Nenhum editorial cadastrado ainda.</p>
          </div>
        )}

        {!loading && !erro && posts.length > 0 && (
          <div style={gridStyle}>
            {posts.map((post) => (
              <article key={post.id} style={cardStyle}>
                <div style={imageWrapStyle}>
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title} style={imageStyle} />
                  ) : (
                    <div style={imageFallbackStyle}>Sem imagem</div>
                  )}
                </div>

                <div style={cardContentStyle}>
                  <div style={metaRowStyle}>
                    <span
                      style={{
                        ...statusPillStyle,
                        background: post.published
                          ? 'rgba(34,197,94,.10)'
                          : 'rgba(255,255,255,.05)',
                        borderColor: post.published
                          ? 'rgba(34,197,94,.28)'
                          : 'rgba(255,255,255,.10)',
                        color: post.published
                          ? 'rgba(220,255,230,.95)'
                          : 'rgba(255,255,255,.78)'
                      }}
                    >
                      {post.published ? 'Publicado' : 'Rascunho'}
                    </span>

                    <span style={metaTextStyle}>{formatarData(post.editorial_date)}</span>
                  </div>

                  <h2 style={cardTitleStyle}>{post.title}</h2>

                  <p style={cardExcerptStyle}>
                    {post.excerpt || 'Sem resumo cadastrado.'}
                  </p>

                  <div style={infoListStyle}>
                    <div style={infoItemStyle}>
                      <strong style={infoLabelStyle}>Slug:</strong>
                      <span style={infoValueStyle}>{post.slug}</span>
                    </div>

                    <div style={infoItemStyle}>
                      <strong style={infoLabelStyle}>Autor:</strong>
                      <span style={infoValueStyle}>{post.author || '-'}</span>
                    </div>
                  </div>

                  <div style={cardActionsStyle}>
                    <button
                      style={secondaryButtonStyle}
                      onClick={() => router.push(`/admin/editar/${post.id}`)}
                    >
                      Editar
                    </button>

                    <button
                      style={dangerButtonStyle}
                      onClick={() => handleDelete(post.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background:
    'radial-gradient(1200px 500px at 20% 0%, rgba(34,197,94,.10), transparent 60%), radial-gradient(900px 450px at 100% 20%, rgba(59,130,246,.08), transparent 55%), #0b0f14',
  color: 'rgba(255,255,255,.92)',
  padding: '28px 20px 50px'
}

const containerStyle: React.CSSProperties = {
  maxWidth: '1280px',
  margin: '0 auto'
}

const headerBoxStyle: React.CSSProperties = {
  background: '#141f1b',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: '20px',
  padding: '22px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '18px',
  flexWrap: 'wrap',
  boxShadow: '0 18px 45px rgba(0,0,0,.30)',
  marginBottom: '24px'
}

const pillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '7px 12px',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,.08)',
  background: 'rgba(255,255,255,.03)',
  fontSize: '12px',
  color: 'rgba(255,255,255,.75)',
  marginBottom: '10px'
}

const titleStyle: React.CSSProperties = {
  margin: '0 0 8px 0',
  fontSize: '2.1rem',
  fontWeight: 800,
  letterSpacing: '.2px'
}

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  color: 'rgba(255,255,255,.72)',
  fontSize: '15px'
}

const headerActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap'
}

const baseButtonStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'all .18s ease'
}

const primaryButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  border: '1px solid rgba(34,197,94,.35)',
  background: 'rgba(34,197,94,.12)',
  color: '#e9eef6'
}

const secondaryButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  border: '1px solid rgba(255,255,255,.08)',
  background: 'rgba(255,255,255,.03)',
  color: 'rgba(255,255,255,.90)'
}

const dangerButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  border: '1px solid rgba(255,80,80,.22)',
  background: 'rgba(255,80,80,.08)',
  color: '#ffd1d1'
}

const statusBoxStyle: React.CSSProperties = {
  border: '1px dashed rgba(255,255,255,.18)',
  borderRadius: '18px',
  background: 'rgba(255,255,255,.02)',
  color: 'rgba(255,255,255,.75)',
  padding: '18px'
}

const errorBoxStyle: React.CSSProperties = {
  border: '1px solid rgba(255,0,0,.18)',
  borderRadius: '18px',
  background: 'rgba(255,0,0,.08)',
  color: '#ffb3b3',
  padding: '18px'
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '22px'
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.035)',
  border: '1px solid rgba(255,255,255,.10)',
  borderRadius: '18px',
  overflow: 'hidden',
  boxShadow: '0 14px 30px rgba(0,0,0,.28)',
  display: 'flex',
  flexDirection: 'column'
}

const imageWrapStyle: React.CSSProperties = {
  width: '100%',
  height: '190px',
  background: 'rgba(255,255,255,.04)'
}

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block'
}

const imageFallbackStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'grid',
  placeItems: 'center',
  color: 'rgba(255,255,255,.50)',
  fontSize: '14px'
}

const cardContentStyle: React.CSSProperties = {
  padding: '18px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  flex: 1
}

const metaRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap'
}

const statusPillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  border: '1px solid',
  fontSize: '12px',
  fontWeight: 700
}

const metaTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'rgba(255,255,255,.58)'
}

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.15rem',
  lineHeight: 1.3,
  fontWeight: 800
}

const cardExcerptStyle: React.CSSProperties = {
  margin: 0,
  color: 'rgba(255,255,255,.72)',
  fontSize: '14px',
  lineHeight: 1.5
}

const infoListStyle: React.CSSProperties = {
  display: 'grid',
  gap: '8px'
}

const infoItemStyle: React.CSSProperties = {
  display: 'grid',
  gap: '4px'
}

const infoLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'rgba(255,255,255,.58)'
}

const infoValueStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'rgba(255,255,255,.90)',
  wordBreak: 'break-word'
}

const cardActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: 'auto'
}