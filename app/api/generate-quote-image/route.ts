import React from 'react'
import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Payload = {
  text: string
  author?: string
  backgroundId: string
  fontFamily?: string
  fontSize?: string
  textColor?: string
}

function getFontFamily(fontFamily?: string) {
  const mapa: Record<string, string> = {
    'serif-classica': `Georgia, "Times New Roman", serif`,
    'sans-elegante': `Arial, Helvetica, sans-serif`,
    impactante: `Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif`,
    minimalista: `"Trebuchet MS", Verdana, sans-serif`
  }

  return mapa[fontFamily || 'serif-classica'] || `Georgia, "Times New Roman", serif`
}

function getFontSize(fontSize?: string, text?: string) {
  const mapaBase: Record<string, number> = {
    xxsmall: 46,
    xsmall: 58,
    small: 72,
    medium: 92,
    large: 116
  }

  let tamanho = mapaBase[fontSize || 'medium'] || 92
  const comprimento = (text || '').trim().length

  if (comprimento > 420) tamanho -= 26
  else if (comprimento > 340) tamanho -= 22
  else if (comprimento > 280) tamanho -= 18
  else if (comprimento > 220) tamanho -= 14
  else if (comprimento > 170) tamanho -= 10

  return Math.max(tamanho, 24)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload

    const text = (body.text || '').trim()
    const author = (body.author || 'Mauricio C. Cantelli').trim()
    const backgroundId = (body.backgroundId || 'bg-01').trim()
    const textColor = (body.textColor || '#ffffff').trim()
    const fontFamily = getFontFamily(body.fontFamily)
    const fontSize = getFontSize(body.fontSize, text)

    if (!text) {
      return Response.json({ error: 'Texto da frase é obrigatório.' }, { status: 400 })
    }

    const imageUrl = new URL(`/fundos-frases/${backgroundId}.jpg`, request.url).toString()

    const shadow =
      textColor.toLowerCase() === '#111111'
        ? '0 2px 10px rgba(255,255,255,0.18)'
        : '0 2px 10px rgba(0,0,0,0.45)'

    const element = React.createElement(
      'div',
      {
        style: {
          width: '1080px',
          height: '1350px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#111'
        }
      },
      React.createElement('img', {
        src: imageUrl,
        alt: 'Fundo da frase',
        style: {
          position: 'absolute',
          inset: 0,
          width: '1080px',
          height: '1350px',
          objectFit: 'cover'
        }
      }),
      React.createElement('div', {
        style: {
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.08))'
        }
      }),
      React.createElement(
        'div',
        {
          style: {
            position: 'relative',
            zIndex: 1,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '180px 141px',
            gap: '56px'
          }
        },
        React.createElement(
          'div',
          {
            style: {
              color: textColor,
              fontFamily,
              fontSize: `${fontSize}px`,
              fontWeight: 700,
              lineHeight: 1.28,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              textShadow: shadow,
              display: 'flex'
            }
          },
          text
        ),
        React.createElement(
          'div',
          {
            style: {
              color: textColor,
              fontFamily,
              fontSize: '51px',
              fontWeight: 700,
              opacity: 0.96,
              textShadow: shadow,
              display: 'flex'
            }
          },
          author
        )
      )
    )

    const imageResponse = new ImageResponse(element, {
      width: 1080,
      height: 1350
    })

    return new Response(imageResponse.body, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=0, s-maxage=31536000'
      }
    })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Erro ao gerar imagem.' }, { status: 500 })
  }
}