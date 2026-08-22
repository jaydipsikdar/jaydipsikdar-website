export const ogImageSize = { width: 1200, height: 630 }

export function OgImageContent() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#19233b',
        padding: '80px',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '9999px',
            backgroundColor: '#e84500',
            display: 'flex',
          }}
        />
        <span
          style={{
            color: '#e84500',
            fontSize: '24px',
            fontWeight: 600,
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          CMO · AI Builder · Educator
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            color: '#ffffff',
            fontSize: '76px',
            fontWeight: 300,
            letterSpacing: '-2px',
            lineHeight: 1.05,
          }}
        >
          Jaydeepp Sikdar
        </span>
        <span
          style={{
            color: '#adc0d7',
            fontSize: '30px',
            fontWeight: 300,
            lineHeight: 1.4,
            marginTop: '24px',
            maxWidth: '900px',
          }}
        >
          Free marketing tools, frameworks, and real experiments from 20 years of CMO work.
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#6d7d91', fontSize: '24px', fontWeight: 400 }}>
          jaydipsikdar.com
        </span>
        <div
          style={{
            display: 'flex',
            width: '140px',
            height: '8px',
            borderRadius: '9999px',
            backgroundColor: '#e84500',
          }}
        />
      </div>
    </div>
  )
}
