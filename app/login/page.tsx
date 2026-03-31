'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    setLoading(false)

    if (error) {
      setErro('Email ou senha inválidos.')
      return
    }

    router.push('/admin')
  }

  return (
    <main style={pageStyle}>
      <div style={bgGlowOne} />
      <div style={bgGlowTwo} />

      <section style={loginWrapStyle}>
        <div style={brandRowStyle}>
          <div style={brandIconStyle}>✒</div>
          <div>
            <div style={brandTitleStyle}>Mauricio C. Cantelli</div>
            <div style={brandSubtitleStyle}>Painel administrativo</div>
          </div>
        </div>

        <div style={loginCardStyle}>
          <span style={pillStyle}>Acesso restrito</span>

          <h1 style={titleStyle}>Entrar no painel</h1>
          <p style={subtitleStyle}>
            Faça login para gerenciar editoriais, imagens e publicações.
          </p>

          <form onSubmit={handleLogin} style={formStyle}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <div>
              <label style={labelStyle}>Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
                placeholder="Digite sua senha"
              />
            </div>

            {erro && (
              <div style={errorBoxStyle}>
                {erro}
              </div>
            )}

            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background:
    'radial-gradient(1200px 500px at 20% 0%, rgba(34,197,94,.10), transparent 60%), radial-gradient(900px 450px at 100% 20%, rgba(59,130,246,.08), transparent 55%), #0b0f14',
  color: 'rgba(255,255,255,.92)',
  display: 'grid',
  placeItems: 'center',
  padding: '24px',
  position: 'relative',
  overflow: 'hidden'
}

const bgGlowOne: React.CSSProperties = {
  position: 'absolute',
  width: '420px',
  height: '420px',
  borderRadius: '999px',
  background: 'rgba(34,197,94,.08)',
  filter: 'blur(80px)',
  top: '-120px',
  left: '-80px',
  pointerEvents: 'none'
}

const bgGlowTwo: React.CSSProperties = {
  position: 'absolute',
  width: '380px',
  height: '380px',
  borderRadius: '999px',
  background: 'rgba(59,130,246,.08)',
  filter: 'blur(80px)',
  bottom: '-120px',
  right: '-80px',
  pointerEvents: 'none'
}

const loginWrapStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '460px',
  position: 'relative',
  zIndex: 1
}

const brandRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '18px',
  padding: '0 6px'
}

const brandIconStyle: React.CSSProperties = {
  width: '42px',
  height: '42px',
  display: 'grid',
  placeItems: 'center',
  borderRadius: '14px',
  background: 'rgba(255,255,255,.04)',
  border: '1px solid rgba(255,255,255,.08)',
  color: 'rgba(34,197,94,.85)',
  fontSize: '20px',
  boxShadow: '0 0 12px rgba(34,197,94,.12)'
}

const brandTitleStyle: React.CSSProperties = {
  fontSize: '1.15rem',
  fontWeight: 800,
  color: 'rgba(255,255,255,.96)',
  letterSpacing: '.2px'
}

const brandSubtitleStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'rgba(255,255,255,.62)',
  marginTop: '2px'
}

const loginCardStyle: React.CSSProperties = {
  background: '#141f1b',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: '22px',
  padding: '28px',
  boxShadow: '0 20px 45px rgba(0,0,0,.34)',
  backdropFilter: 'blur(10px)'
}

const pillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '7px 12px',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,.08)',
  background: 'rgba(255,255,255,.03)',
  color: 'rgba(255,255,255,.72)',
  fontSize: '12px',
  marginBottom: '14px'
}

const titleStyle: React.CSSProperties = {
  margin: '0 0 8px 0',
  fontSize: '2rem',
  fontWeight: 800,
  lineHeight: 1.1
}

const subtitleStyle: React.CSSProperties = {
  margin: '0 0 22px 0',
  fontSize: '14px',
  color: 'rgba(255,255,255,.70)',
  lineHeight: 1.5
}

const formStyle: React.CSSProperties = {
  display: 'grid',
  gap: '16px'
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
  outline: 'none',
  fontSize: '15px'
}

const errorBoxStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '14px',
  background: 'rgba(255,0,0,.08)',
  border: '1px solid rgba(255,0,0,.18)',
  color: '#ffb3b3',
  fontSize: '14px'
}

const primaryButtonStyle: React.CSSProperties = {
  padding: '13px 16px',
  borderRadius: '14px',
  border: '1px solid rgba(34,197,94,.35)',
  background: 'rgba(34,197,94,.12)',
  color: '#e9eef6',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '15px'
}