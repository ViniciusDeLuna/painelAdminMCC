export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0b0f14',
        color: '#e9eef6'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>
          Painel Admin
        </h1>
        <p style={{ opacity: 0.8 }}>
          Projeto iniciado com sucesso.
        </p>
      </div>
    </main>
  )
}