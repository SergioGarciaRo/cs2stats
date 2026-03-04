import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f0f13',
          borderRadius: 6,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: '#e53e3e',
            fontFamily: 'sans-serif',
            lineHeight: 1,
          }}
        >
          T
        </span>
      </div>
    ),
    { ...size }
  )
}
