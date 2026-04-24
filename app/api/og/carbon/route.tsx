import { ImageResponse } from 'next/og';
import { getCarbonData, getIconUrl } from '@/lib/carbon-data';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        if (!slug) return new Response('Slug required', { status: 400 });
        
        const data = await getCarbonData(slug);

        if (!data) {
            return new Response('Not found', { status: 404 });
        }

        const iconUrl = getIconUrl(data);

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
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '24px',
                            marginBottom: '40px',
                            backgroundColor: '#FFFFFF',
                            border: '4px solid #000000',
                            padding: '24px 48px',
                            boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)',
                        }}
                    >
                        {!iconUrl.startsWith("fallback:") && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={iconUrl} width="64" height="64" alt="" />
                        )}
                        <h1
                            style={{
                                fontSize: 64,
                                fontWeight: 900,
                                margin: 0,
                                padding: 0,
                                color: '#000000',
                                textTransform: 'uppercase',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {data.app_name}
                        </h1>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            fontSize: 48,
                            fontWeight: 700,
                            color: '#000000',
                            textAlign: 'center',
                        }}
                    >
                        Carbon Footprint
                    </div>
                    
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 42,
                            fontWeight: 900,
                            color: '#000000',
                            marginTop: '24px',
                            backgroundColor: '#DDFB01',
                            padding: '12px 24px',
                            border: '4px solid #000000',
                        }}
                    >
                        {data.co2_per_hour_grams}g CO2 / hour
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
