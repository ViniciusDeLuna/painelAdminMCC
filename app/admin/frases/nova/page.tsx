'use client'

import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../../lib/supabase'

const CATEGORIAS = [
  { label: 'Frases de motivação', value: 'motivacao' },
  { label: 'Frases de liderança', value: 'lideranca' },
  { label: 'Frases filosóficas', value: 'filosoficas' },
  { label: 'Frases de sabedoria', value: 'sabedoria' },
  { label: 'Frases de educação', value: 'educacao' },
  { label: 'Frases de reflexão', value: 'reflexao' },
  { label: 'Curtas impactantes', value: 'curtas-impactantes' },
  { label: 'Frases estoicas', value: 'estoicas' }
]

const FUNDOS = [
  { label: 'Fundo 1', value: 'bg-01' },
  { label: 'Fundo 2', value: 'bg-02' },
  { label: 'Fundo 3', value: 'bg-03' },
  { label: 'Fundo 4', value: 'bg-04' },
  { label: 'Fundo 5', value: 'bg-05' },
  { label: 'Fundo 6', value: 'bg-06' },
  { label: 'Fundo 7', value: 'bg-07' },
  { label: 'Fundo 8', value: 'bg-08' },
  { label: 'Fundo 9', value: 'bg-09' },
  { label: 'Fundo 10', value: 'bg-10' },
  { label: 'Fundo 11', value: 'bg-11' },
  { label: 'Fundo 12', value: 'bg-12' }
]

const FONTES = [
  { label: 'Serif clássica', value: 'serif-classica' },
  { label: 'Sans elegante', value: 'sans-elegante' },
  { label: 'Impactante', value: 'impactante' },
  { label: 'Minimalista', value: 'minimalista' }
]

const TAMANHOS = [
  { label: 'Muito pequeno', value: 'xxsmall' },
  { label: 'Pequeno', value: 'xsmall' },
  { label: 'Médio', value: 'small' },
  { label: 'Grande', value: 'medium' },
  { label: 'Muito grande', value: 'large' }
]

const CORES = [
  { label: 'Branco', value: '#ffffff' },
  { label: 'Preto suave', value: '#111111' },
  { label: 'Dourado', value: '#d4af37' },
  { label: 'Bege claro', value: '#f5e6c8' },
  { label: 'Cinza claro', value: '#e5e7eb' }
]

export default function NovaFrasePage() {
  const router = useRouter()
  const supabase = createClient()

  const [text, setText] = useState('')
  const [slug, setSlug] = useState('')
  const [author, setAuthor] = useState('Mauricio C. Cantelli')
  const [categorySlug, setCategorySlug] = useState('motivacao')
  const [backgroundId, setBackgroundId] = useState('bg-01')
  const [fontFamily, setFontFamily] = useState('serif-classica')
  const [fontSize, setFontSize] = useState('medium')
  const [textColor, setTextColor] = useState('#ffffff')
  const [publishedAt, setPublishedAt] = useState('')
  const [published, setPublished] = useState(true)
  const [gerandoImagem, setGerandoImagem] = useState(false)

  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [slugEditadoManualmente, setSlugEditadoManualmente] = useState(false)

  function gerarSlugAutomatico(texto: string) {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 90)
  }

  function handleTextoChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const valor = e.target.value
    setText(valor)

    if (!slugEditadoManualmente) {
      setSlug(gerarSlugAutomatico(valor))
    }
  }

  const previewImageUrl = useMemo(() => {
    return `/fundos-frases/${backgroundId}.jpg`
  }, [backgroundId])

  const previewFontFamily = useMemo(() => {
    const mapa: Record<string, string> = {
      'serif-classica': `Georgia, 'Times New Roman', serif`,
      'sans-elegante': `Arial, Helvetica, sans-serif`,
      impactante: `Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif`,
      minimalista: `'Trebuchet MS', Verdana, sans-serif`
    }

    return mapa[fontFamily] || `Georgia, 'Times New Roman', serif`
  }, [fontFamily])

  const previewFontSize = useMemo(() => {
    const mapaBase: Record<string, number> = {
      xxsmall: 22,
      xsmall: 28,
      small: 34,
      medium: 42,
      large: 52
    }

    let tamanho = mapaBase[fontSize] || 42
    const comprimento = text.trim().length

    if (comprimento > 320) tamanho -= 10
    else if (comprimento > 260) tamanho -= 8
    else if (comprimento > 220) tamanho -= 6
    else if (comprimento > 180) tamanho -= 4
    else if (comprimento > 140) tamanho -= 2

    return `${Math.max(tamanho, 16)}px`
  }, [fontSize, text])

  async function gerarImagemDaFrase(quoteId: string, quoteSlug: string) {
  setGerandoImagem(true)

  try {
    const response = await fetch('/api/generate-quote-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        author,
        backgroundId,
        fontFamily,
        fontSize,
        textColor
      })
    })

    if (!response.ok) {
      throw new Error('Erro ao gerar a imagem.')
    }

    const blob = await response.blob()
    const nomeArquivo = `${quoteId}.png`

    const { error: uploadError } = await supabase.storage
      .from('quote-images')
      .upload(nomeArquivo, blob, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Erro ao enviar a imagem para o storage: ${uploadError.message}`)
    }

    const { data } = supabase.storage
      .from('quote-images')
      .getPublicUrl(nomeArquivo)

    const novaImageUrl = `${data.publicUrl}?t=${Date.now()}`

    const { error: updateError } = await supabase
      .from('quotes')
      .update({
        image_url: novaImageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', quoteId)

    if (updateError) {
      throw new Error(`Erro ao salvar a URL da imagem: ${updateError.message}`)
    }
  } finally {
    setGerandoImagem(false)
  }
}

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('quotes')
        .insert({
          text,
          slug,
          author,
          category_slug: categorySlug,
          background_id: backgroundId,
          font_family: fontFamily,
          font_size: fontSize,
          text_color: textColor,
          published_at: publishedAt || null,
          published
        })
        .select('id, slug')
        .single()

      if (error) {
        throw new Error('Erro ao salvar a frase.')
      }
      await gerarImagemDaFrase(data.id, data.slug)

      setSucesso('Frase criada e imagem gerada com sucesso.')

    setTimeout(() => {
      router.push('/admin/frases')
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
          <button style={secondaryButtonStyle} onClick={() => router.push('/admin/frases')}>
            ← Voltar ao painel de frases
          </button>
        </div>

        <section style={formWrapStyle}>
          <div style={{ marginBottom: '24px' }}>
            <span style={pillStyle}>Novo conteúdo</span>
            <h1 style={titleStyle}>Criar frase</h1>
            <p style={subtitleStyle}>
              Cadastre uma nova frase com categoria, fundo, estilo e publicação.
            </p>
          </div>

          <div style={previewWrapStyle}>
            <div
              style={{
                ...previewCardStyle,
                backgroundImage: `url(${previewImageUrl})`
              }}
            >
              <div style={previewOverlayStyle} />
              <div style={previewContentStyle}>
                <div
                  style={{
                    ...previewTextStyle,
                    color: textColor,
                    fontFamily: previewFontFamily,
                    fontSize: previewFontSize,
                    textShadow:
                      textColor.toLowerCase() === '#111111'
                        ? '0 2px 10px rgba(255,255,255,0.18)'
                        : '0 2px 10px rgba(0,0,0,0.45)'
                  }}
                >
                  {text || 'Sua frase aparecerá aqui no preview.'}
                </div>

                <div
                  style={{
                    ...previewAuthorStyle,
                    color: textColor,
                    fontFamily: previewFontFamily,
                    textShadow:
                      textColor.toLowerCase() === '#111111'
                        ? '0 2px 10px rgba(255,255,255,0.18)'
                        : '0 2px 10px rgba(0,0,0,0.45)'
                  }}
                >
                  {author || 'Mauricio C. Cantelli'}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Frase</label>
              <textarea
                value={text}
                onChange={handleTextoChange}
                rows={6}
                required
                style={textareaStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  const valor = e.target.value
                  setSlug(valor)
                  setSlugEditadoManualmente(valor.trim() !== '')
                }}
                required
                style={inputStyle}
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
                <label style={labelStyle}>Data de publicação</label>
                <input
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Categoria</label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  style={selectStyle}
                >
                  {CATEGORIAS.map((categoria) => (
                    <option key={categoria.value} value={categoria.value}>
                      {categoria.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Fundo</label>
                <select
                  value={backgroundId}
                  onChange={(e) => setBackgroundId(e.target.value)}
                  style={selectStyle}
                >
                  {FUNDOS.map((fundo) => (
                    <option key={fundo.value} value={fundo.value}>
                      {fundo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Fonte</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  style={selectStyle}
                >
                  {FONTES.map((fonte) => (
                    <option key={fonte.value} value={fonte.value}>
                      {fonte.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Tamanho</label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  style={selectStyle}
                >
                  {TAMANHOS.map((tamanho) => (
                    <option key={tamanho.value} value={tamanho.value}>
                      {tamanho.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Cor do texto</label>
                <select
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  style={selectStyle}
                >
                  {CORES.map((cor) => (
                    <option key={cor.value} value={cor.value}>
                      {cor.label}
                    </option>
                  ))}
                </select>
              </div>
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

            <button type="submit" disabled={loading || gerandoImagem} style={primaryButtonStyle}>
              {loading || gerandoImagem ? 'Salvando e gerando imagem...' : 'Salvar frase'}
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

const previewWrapStyle: React.CSSProperties = {
  marginBottom: '24px'
}

const previewCardStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  aspectRatio: '1080 / 1350',
  maxWidth: '420px',
  borderRadius: '22px',
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,.10)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  boxShadow: '0 18px 45px rgba(0,0,0,.35)'
}

const previewOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(to bottom, rgba(0,0,0,.18), rgba(0,0,0,.24))'
}

const previewContentStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: '70px 55px',
  gap: '22px'
}

const previewTextStyle: React.CSSProperties = {
  fontWeight: 700,
  lineHeight: 1.28,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word'
}

const previewAuthorStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  opacity: 0.96
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
  background: '#16211d',
  color: '#e9eef6',
  outline: 'none'
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,.10)',
  background: '#16211d',
  color: '#e9eef6',
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none'
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,.10)',
  background: '#16211d',
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