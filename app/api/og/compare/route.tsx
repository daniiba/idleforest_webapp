import { ImageResponse } from 'next/og';
import { getCarbonData, getIconUrl } from '@/lib/carbon-data';

export const runtime = 'edge';

const OG_COMPARE_COPY = {
    en: {
        eyebrow: 'Carbon Footprint Comparison',
        perHour: 'CO2/hr',
        perTransaction: 'CO2/tx',
    },
    es: {
        eyebrow: 'Comparación de Huella de Carbono',
        perHour: 'CO2/h',
        perTransaction: 'CO2/tx',
    },
    fr: {
        eyebrow: 'Comparaison d’Empreinte Carbone',
        perHour: 'CO2/h',
        perTransaction: 'CO2/tx',
    },
    de: {
        eyebrow: 'CO2-Fußabdruck Vergleich',
        perHour: 'CO2/h',
        perTransaction: 'CO2/tx',
    },
    pt: {
        eyebrow: 'Comparação de Pegada de Carbono',
        perHour: 'CO2/h',
        perTransaction: 'CO2/tx',
    },
} as const;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const app1 = searchParams.get('app1');
        const app2 = searchParams.get('app2');
        if (!app1 || !app2) return new Response('Apps required', { status: 400 });

        const locale = searchParams.get('locale') || 'en';
        const copy = OG_COMPARE_COPY[locale as keyof typeof OG_COMPARE_COPY] || OG_COMPARE_COPY.en;

        const [data1, data2] = await Promise.all([
            getCarbonData(app1),
            getCarbonData(app2)
        ]);

        if (!data1 || !data2) {
            return new Response('Not found', { status: 404 });
        }

        const iconUrl1 = getIconUrl(data1);
        const iconUrl2 = getIconUrl(data2);
        const unit1 = data1.category === 'Crypto' ? copy.perTransaction : copy.perHour;
        const unit2 = data2.category === 'Crypto' ? copy.perTransaction : copy.perHour;

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#EBEBEA',
                        fontFamily: 'sans-serif',
                        borderBottom: '20px solid #DDFB01',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 36,
                            fontWeight: 700,
                            color: '#000000',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: '40px',
                        }}
                    >
                        {copy.eyebrow}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '40px',
                            width: '100%',
                            padding: '0 80px',
                        }}
                    >
                        {/* App 1 */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                backgroundColor: '#FFFFFF',
                                border: '4px solid #000000',
                                padding: '40px',
                                boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
                                flex: 1,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                                {!iconUrl1.startsWith("fallback:") && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={iconUrl1} width="48" height="48" alt="" />
                                )}
                                <h2 style={{ fontSize: 42, fontWeight: 900, margin: 0 }}>{data1.app_name}</h2>
                            </div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: '#404040' }}>
                                {data1.co2_per_hour_grams}g {unit1}
                            </div>
                        </div>

                        {/* VS Label */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#DDFB01',
                                border: '4px solid #000000',
                                borderRadius: '50%',
                                width: '100px',
                                height: '100px',
                                fontSize: 40,
                                fontWeight: 900,
                                zIndex: 10,
                                flexShrink: 0,
                            }}
                        >
                            VS
                        </div>

                        {/* App 2 */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                backgroundColor: '#FFFFFF',
                                border: '4px solid #000000',
                                padding: '40px',
                                boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
                                flex: 1,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                                {!iconUrl2.startsWith("fallback:") && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={iconUrl2} width="48" height="48" alt="" />
                                )}
                                <h2 style={{ fontSize: 42, fontWeight: 900, margin: 0 }}>{data2.app_name}</h2>
                            </div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: '#404040' }}>
                                {data2.co2_per_hour_grams}g {unit2}
                            </div>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        return new Response('Failed to generate image', { status: 500 });
    }
}
