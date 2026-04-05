'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

export default function AdminHomePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function verificarSessao() {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setLoading(false)
    }

    verificarSessao()
  }, [router, supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={statusBoxStyle}>Carregando painel...</div>
        </div>
      </main>
    )
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <header style={headerBoxStyle}>
          <div>
            <span style={pillStyle}>Painel administrativo</span>
            <h1 style={titleStyle}>Central de gerenciamento</h1>
            <p style={subtitleStyle}>
              Escolha qual área deseja acessar para administrar o conteúdo do site.
            </p>
          </div>

          <div style={headerActionsStyle}>
            <button
              style={secondaryButtonStyle}
              onClick={() => window.open('https://cantelli.criadorlw.com.br', '_blank')}
            >
              Ver site
            </button>

            <button style={secondaryButtonStyle} onClick={handleLogout}>
              Sair
            </button>
          </div>
        </header>

        <section style={gridStyle}>
          <article
            style={cardStyle}
            onClick={() => router.push('/admin/editoriais')}
          >
            <div style={cardIconStyle}>📰</div>
            <h2 style={cardTitleStyle}>Gerenciar editoriais</h2>
            <p style={cardTextStyle}>
              Acesse a listagem, crie novos editoriais, edite conteúdos existentes
              e gerencie publicações.
            </p>

            <div style={cardButtonsRowStyle}>
              <button
                style={primaryButtonStyle}
                onClick={(e) => {
                  e.stopPropagation()
                  router.push('/admin/editoriais')
                }}
              >
                Abrir editoriais
              </button>

              <button
                style={secondaryButtonStyle}
                onClick={(e) => {
                  e.stopPropagation()
                  router.push('/admin/novo')
                }}
              >
                Novo editorial
              </button>
            </div>
          </article>

          <article
            style={cardStyle}
            onClick={() => router.push('/admin/frases')}
          >
            <div style={cardIconStyle}>✒️</div>
            <h2 style={cardTitleStyle}>Gerenciar frases</h2>
            <p style={cardTextStyle}>
              Acesse as frases cadastradas, edite categorias, fundos, estilos
              visuais e publique novas artes.
            </p>

            <div style={cardButtonsRowStyle}>
              <button
                style={primaryButtonStyle}
                onClick={(e) => {
                  e.stopPropagation()
                  router.push('/admin/frases')
                }}
              >
                Abrir frases
              </button>

              <button
                style={secondaryButtonStyle}
                onClick={(e) => {
                  e.stopPropagation()
                  router.push('/admin/frases/nova')
                }}
              >
                Nova frase
              </button>
            </div>
          </article>
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
  maxWidth: '1180px',
  margin: '0 auto'
}

const headerBoxStyle: React.CSSProperties = {
  background: '#141f1b',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: '20px',
  padding: '24px',
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
  fontSize: '15px',
  maxWidth: '700px'
}

const headerActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap'
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '24px'
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.035)',
  border: '1px solid rgba(255,255,255,.10)',
  borderRadius: '22px',
  padding: '24px',
  boxShadow: '0 14px 30px rgba(0,0,0,.28)',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  cursor: 'pointer'
}

const cardIconStyle: React.CSSProperties = {
  width: '56px',
  height: '56px',
  borderRadius: '16px',
  display: 'grid',
  placeItems: 'center',
  background: 'rgba(255,255,255,.05)',
  border: '1px solid rgba(255,255,255,.08)',
  fontSize: '24px'
}

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.4rem',
  fontWeight: 800
}

const cardTextStyle: React.CSSProperties = {
  margin: 0,
  color: 'rgba(255,255,255,.72)',
  fontSize: '14px',
  lineHeight: 1.6
}

const cardButtonsRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: 'auto'
}

const statusBoxStyle: React.CSSProperties = {
  border: '1px dashed rgba(255,255,255,.18)',
  borderRadius: '18px',
  background: 'rgba(255,255,255,.02)',
  color: 'rgba(255,255,255,.75)',
  padding: '18px'
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