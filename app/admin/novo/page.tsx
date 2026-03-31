'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

export default function NovoEditorialPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('Mauricio C. Cantelli')
  const [editorialDate, setEditorialDate] = useState('')
  const [published, setPublished] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  function gerarSlugAutomatico(texto: string) {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  function handleTituloChange(e: ChangeEvent<HTMLInputElement>) {
    const valor = e.target.value
    setTitle(valor)

    if (!slug.trim()) {
      setSlug(gerarSlugAutomatico(valor))
    }
  }

  function handleImagemChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    setImageFile(file)
  }

  async function uploadImagem(): Promise<string> {
    if (!imageFile) return ''

    const extensao = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const nomeArquivo = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extensao}`

    const { error } = await supabase.storage
      .from('post-images')
      .upload(nomeArquivo, imageFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error('Erro ao enviar a imagem.')
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
    setLoading(true)

    try {
      let imageUrl = ''

      if (imageFile) {
        imageUrl = await uploadImagem()
      }

      const { error } = await supabase.from('posts').insert({
        title,
        slug,
        excerpt,
        content,
        image_url: imageUrl,
        author,
        editorial_date: editorialDate || null,
        published
      })

      if (error) {
        throw new Error('Erro ao salvar o editorial.')
      }

      setSucesso('Editorial criado com sucesso.')

      setTimeout(() => {
        router.push('/admin')
      }, 900)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
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
            <span style={pillStyle}>Novo conteúdo</span>
            <h1 style={titleStyle}>Criar editorial</h1>
            <p style={subtitleStyle}>
              Cadastre um novo editorial mantendo o mesmo padrão visual do site.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Título</label>
              <input
                type="text"
                value={title}
                onChange={handleTituloChange}
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
              <label style={labelStyle}>Imagem de capa</label>
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

            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              {loading ? 'Salvando...' : 'Salvar editorial'}
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