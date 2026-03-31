'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '../../../../lib/supabase'

export default function EditarEditorialPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const id = params.id as string

  const [loadingPage, setLoadingPage] = useState(true)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('Mauricio C. Cantelli')
  const [editorialDate, setEditorialDate] = useState('')
  const [published, setPublished] = useState(true)
  const [imageUrlAtual, setImageUrlAtual] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    async function carregarPost() {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setErro('Não foi possível carregar o editorial.')
        setLoadingPage(false)
        return
      }

      setTitle(data.title || '')
      setSlug(data.slug || '')
      setExcerpt(data.excerpt || '')
      setContent(data.content || '')
      setAuthor(data.author || 'Mauricio C. Cantelli')
      setEditorialDate(data.editorial_date || '')
      setPublished(!!data.published)
      setImageUrlAtual(data.image_url || '')
      setLoadingPage(false)
    }

    if (id) {
      carregarPost()
    }
  }, [id, router, supabase])

  function handleImagemChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    setImageFile(file)
  }

  async function uploadImagem(): Promise<string> {
    if (!imageFile) return imageUrlAtual

    const extensao = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const nomeArquivo = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extensao}`

    const { error } = await supabase.storage
      .from('post-images')
      .upload(nomeArquivo, imageFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error('Erro ao enviar a nova imagem.')
    }

    const { data } = supabase.storage
      .from('post-images')
      .getPublicUrl(nomeArquivo)

    return data.publicUrl
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setSaving(true)

    try {
      const novaImageUrl = await uploadImagem()

      const { error } = await supabase
        .from('posts')
        .update({
          title,
          slug,
          excerpt,
          content,
          author,
          editorial_date: editorialDate || null,
          published,
          image_url: novaImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        throw new Error('Erro ao atualizar o editorial.')
      }

      setSucesso('Editorial atualizado com sucesso.')

      setTimeout(() => {
        router.push('/admin')
      }, 900)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setSaving(false)
    }
  }

  if (loadingPage) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={statusBoxStyle}>Carregando editorial...</div>
        </div>
      </main>
    )
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ marginBottom: '18px' }}>
          <button style={secondaryButtonStyle} onClick={() => router.push('/admin')}>
            ← Voltar ao painel
          </button>
        </div>

        <section style={formWrapStyle}>
          <div style={{ marginBottom: '24px' }}>
            <span style={pillStyle}>Edição</span>
            <h1 style={titleStyle}>Editar editorial</h1>
            <p style={subtitleStyle}>
              Atualize o conteúdo mantendo o mesmo padrão visual do site.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Resumo</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                required
                style={textareaStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Conteúdo</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                required
                style={textareaStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Autor</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Data do editorial</label>
                <input
                  type="date"
                  value={editorialDate}
                  onChange={(e) => setEditorialDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Imagem atual</label>
              {imageUrlAtual ? (
                <img
                  src={imageUrlAtual}
                  alt="Imagem atual do editorial"
                  style={{
                    width: '100%',
                    maxWidth: '320px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,.10)',
                    display: 'block',
                    marginBottom: '12px'
                  }}
                />
              ) : (
                <div style={statusBoxStyle}>Nenhuma imagem cadastrada.</div>
              )}
            </div>

            <div>
              <label style={labelStyle}>Trocar imagem de capa</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImagemChange}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                id="published"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              <label htmlFor="published" style={{ fontSize: '14px', color: 'rgba(255,255,255,.84)' }}>
                Publicado
              </label>
            </div>

            {erro && <div style={errorBoxStyle}>{erro}</div>}
            {sucesso && <div style={successBoxStyle}>{sucesso}</div>}

            <button type="submit" disabled={saving} style={primaryButtonStyle}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </form>
        </section>
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
  maxWidth: '980px',
  margin: '0 auto'
}

const formWrapStyle: React.CSSProperties = {
  background: '#141f1b',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: '20px',
  padding: '24px',
  boxShadow: '0 18px 45px rgba(0,0,0,.30)'
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
  fontSize: '2rem',
  fontWeight: 800
}

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  color: 'rgba(255,255,255,.72)',
  fontSize: '15px'
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '14px',
  color: 'rgba(255,255,255,.86)'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,.10)',
  background: 'rgba(255,255,255,.03)',
  color: '#e9eef6',
  outline: 'none'
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,.10)',
  background: 'rgba(255,255,255,.03)',
  color: '#e9eef6',
  outline: 'none',
  resize: 'vertical'
}

const baseButtonStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '14px'
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

const statusBoxStyle: React.CSSProperties = {
  border: '1px dashed rgba(255,255,255,.18)',
  borderRadius: '16px',
  background: 'rgba(255,255,255,.02)',
  color: 'rgba(255,255,255,.72)',
  padding: '16px'
}

const errorBoxStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '14px',
  background: 'rgba(255,0,0,.08)',
  border: '1px solid rgba(255,0,0,.18)',
  color: '#ffb3b3'
}

const successBoxStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '14px',
  background: 'rgba(34,197,94,.10)',
  border: '1px solid rgba(34,197,94,.25)',
  color: '#b9f5c8'
}