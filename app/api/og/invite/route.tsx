import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Link preview for personal invite links (WhatsApp, iMessage, Slack, ...).
// The preview card is the first thing a friend sees, so it names the inviter.
const OG_INVITE_COPY = {
    en: { eyebrow: 'Personal invite', title: '{name} invited you to grow a forest', eyebrowTeam: 'Team invite', titleTeam: '{name} invited you to join {team}', titleTeamOnly: 'You\'re invited to join {team}', tagline: 'Free. Runs in the background. Plants real trees.' },
    de: { eyebrow: 'Persönliche Einladung', title: '{name} hat dich eingeladen, einen Wald wachsen zu lassen', eyebrowTeam: 'Team-Einladung', titleTeam: '{name} hat dich eingeladen, {team} beizutreten', titleTeamOnly: 'Du bist eingeladen, {team} beizutreten', tagline: 'Kostenlos. Läuft im Hintergrund. Pflanzt echte Bäume.' },
    es: { eyebrow: 'Invitación personal', title: '{name} te ha invitado a hacer crecer un bosque', eyebrowTeam: 'Invitación a un equipo', titleTeam: '{name} te ha invitado a unirte a {team}', titleTeamOnly: 'Estás invitado a unirte a {team}', tagline: 'Gratis. Funciona en segundo plano. Planta árboles reales.' },
    fr: { eyebrow: 'Invitation personnelle', title: '{name} vous invite à faire pousser une forêt', eyebrowTeam: 'Invitation à une équipe', titleTeam: '{name} vous invite à rejoindre {team}', titleTeamOnly: 'Vous êtes invité à rejoindre {team}', tagline: 'Gratuit. Fonctionne en arrière-plan. Plante de vrais arbres.' },
    pt: { eyebrow: 'Convite pessoal', title: '{name} convidou você para fazer uma floresta crescer', eyebrowTeam: 'Convite para uma equipe', titleTeam: '{name} convidou você para entrar em {team}', titleTeamOnly: 'Você foi convidado a entrar em {team}', tagline: 'Grátis. Funciona em segundo plano. Planta árvores de verdade.' },
} as const

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const copy = OG_INVITE_COPY[locale as keyof typeof OG_INVITE_COPY] || OG_INVITE_COPY.en
    const rawName = (searchParams.get('name') || '').trim().slice(0, 40)
    const name = rawName || 'A friend'
    const team = (searchParams.get('team') || '').trim().slice(0, 40)
    const title = team
        ? rawName
            ? copy.titleTeam.replace('{name}', name).replace('{team}', team)
            : copy.titleTeamOnly.replace('{team}', team)
        : copy.title.replace('{name}', name)
    const eyebrow = team ? copy.eyebrowTeam : copy.eyebrow
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
                        {eyebrow}
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
