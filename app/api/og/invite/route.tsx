import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Link preview for personal invite links (WhatsApp, iMessage, Slack, ...).
// The preview card is the first thing a friend sees, so it names the inviter.
const OG_INVITE_COPY = {
    en: { eyebrow: 'Personal invite', title: '{name} invited you to grow a forest', tagline: 'Free. Runs in the background. Plants real trees.' },
    de: { eyebrow: 'Persönliche Einladung', title: '{name} hat dich eingeladen, einen Wald wachsen zu lassen', tagline: 'Kostenlos. Läuft im Hintergrund. Pflanzt echte Bäume.' },
    es: { eyebrow: 'Invitación personal', title: '{name} te ha invitado a hacer crecer un bosque', tagline: 'Gratis. Funciona en segundo plano. Planta árboles reales.' },
    fr: { eyebrow: 'Invitation personnelle', title: '{name} vous invite à faire pousser une forêt', tagline: 'Gratuit. Fonctionne en arrière-plan. Plante de vrais arbres.' },
    pt: { eyebrow: 'Convite pessoal', title: '{name} convidou você para fazer uma floresta crescer', tagline: 'Grátis. Funciona em segundo plano. Planta árvores de verdade.' },
} as const

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const copy = OG_INVITE_COPY[locale as keyof typeof OG_INVITE_COPY] || OG_INVITE_COPY.en
    const name = (searchParams.get('name') || '').trim().slice(0, 40) || 'A friend'
    const title = copy.title.replace('{name}', name)
    const logoUrl = new URL('/logo.png', request.url).toString()

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: '#0B101F',
                    padding: '64px 72px',
                    fontFamily: 'sans-serif',
                    borderBottom: '20px solid #E0F146',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                        style={{
                            display: 'flex',
                            backgroundColor: '#E0F146',
                            border: '4px solid #000000',
                            padding: '10px 22px',
                            fontSize: 28,
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            color: '#0B101F',
                        }}
                    >
                        {copy.eyebrow}
                    </div>
                    <div style={{ display: 'flex', backgroundColor: '#E0F146', border: '4px solid #000000', padding: '12px 18px' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoUrl} width={182} height={50} alt="" />
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        fontSize: title.length > 48 ? 64 : 76,
                        fontWeight: 900,
                        lineHeight: 1.05,
                        color: '#FFFFFF',
                        textTransform: 'uppercase',
                        maxWidth: '1050px',
                    }}
                >
                    {title}
                </div>

                <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, color: '#E0F146' }}>
                    {copy.tagline}
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            headers: {
                'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            },
        }
    )
}
