import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from 'next/script';
import { headers } from 'next/headers';
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/Footer";
import "./globals.css";
import { Inter, Rethink_Sans } from "next/font/google";
import { TreeStatsProvider } from "@/contexts/TreeStatsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { chromeDownloadSchemas } from "@/lib/chrome-download-schema";
import { howItWorksSchemas } from "@/lib/how-it-works-schema";
import { macDownloadSchemas } from "@/lib/mac-download-schema";
import { windowsDownloadSchemas } from "@/lib/windows-download-schema";
import { pathWithoutLocale } from "@/lib/i18n-routes";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});
const candu = localFont({
    src: "./fonts/CanduRounded.otf",
    variable: "--font-candu",
    weight: "400",
});

const rethinkSans = Rethink_Sans({
    subsets: ["latin"],
    variable: "--font-rethink-sans",
    weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "IdleForest: The Free Tree Planting App, Plant While Browsing",
    description: "The free tree planting app that works in the background. Install IdleForest and plant verified trees while you browse, no donations, no signup needed.",
    metadataBase: new URL('https://www.idleforest.com'),
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();
    const messages = await getMessages();
    const pinterestTagId = process.env.PINTEREST_TAG_ID || process.env.NEXT_PUBLIC_PINTEREST_TAG_ID;
    const pathname = headers().get('x-pathname') || '/';
    const normalizedPathname = pathWithoutLocale(pathname);
    const shouldRenderChromeDownloadSchemas = normalizedPathname === '/download/chrome';
    const shouldRenderHowItWorksSchemas = normalizedPathname === '/how-it-works';
    const shouldRenderMacDownloadSchemas = normalizedPathname === '/download/mac';
    const shouldRenderWindowsDownloadSchemas = normalizedPathname === '/download/windows';
    const isDesktopDownloadPage = shouldRenderMacDownloadSchemas || shouldRenderWindowsDownloadSchemas;
    const softwareApplicationSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "IdleForest",
        "applicationCategory": isDesktopDownloadPage ? "GreenApplication" : "BrowserExtension",
        "operatingSystem": shouldRenderMacDownloadSchemas
            ? "macOS 11+"
            : shouldRenderWindowsDownloadSchemas
                ? "Windows 10, Windows 11"
                : "Chrome, macOS, Windows",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "33"
        }
    };

    return (
        <html lang={locale}>
            <head>
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/@maptiler/sdk@3.0.1/dist/maptiler.css"
                />
                <Script id="microsoft-clarity" strategy="afterInteractive">
                    {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "q3rbr16q0x");
        `}
                </Script>
                <Script src="https://www.googletagmanager.com/gtag/js?id=G-NXHH094YJK" strategy="afterInteractive" />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-NXHH094YJK');
        `}
                </Script>
                <Script id="facebook-pixel" strategy="afterInteractive">
                    {`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1415954599536674');
fbq('track', 'PageView');
        `}
                </Script>
                <Script id="facebook-pixel-noscript" strategy="afterInteractive">
                    {`
        if (typeof window !== 'undefined') {
          var noscript = document.createElement('noscript');
          var img = document.createElement('img');
          img.height = 1;
          img.width = 1;
          img.style.display = 'none';
          img.src = 'https://www.facebook.com/tr?id=1415954599536674&ev=PageView&noscript=1';
          noscript.appendChild(img);
          document.head.appendChild(noscript);
        }
        `}
                </Script>
                {pinterestTagId ? (
                    <Script id="pinterest-tag" strategy="afterInteractive">
                        {`
        !function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
        n=window.pintrk;n.queue=[],n.version='3.0';var
        t=document.createElement('script');t.async=!0,t.src=e;var
        r=document.getElementsByTagName('script')[0];r.parentNode.insertBefore(t,r)}}
        ('https://s.pinimg.com/ct/core.js');
        pintrk('load', '${pinterestTagId}');
        pintrk('page');
        `}
                    </Script>
                ) : null}
                <Script src="https://cdn.ywxi.net/js/1.js" strategy="afterInteractive" />
                <Script src="https://cdn.tinystats.net/scripts/capi.js" strategy="afterInteractive" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify([
                            softwareApplicationSchema,
                            {
                                "@context": "https://schema.org",
                                "@type": "Organization",
                                "name": "IdleForest",
                                "url": "https://www.idleforest.com",
                                "logo": "https://www.idleforest.com/logo.png",
                                "sameAs": [
                                    "https://github.com/daniiba/idleforest",
                                    "https://www.linkedin.com/company/idleforest",
                                    "https://www.tiktok.com/@idleforest",
                                    "https://www.instagram.com/idleforest",
                                    "https://discord.gg/y9jZmRQtad"
                                ]
                            },
                            {
                                "@context": "https://schema.org",
                                "@type": "WebSite",
                                "name": "IdleForest",
                                "url": "https://www.idleforest.com"
                            }
                        ])
                    }}
                />
                {shouldRenderHowItWorksSchemas ? howItWorksSchemas.map((schema) => (
                    <script
                        key={schema["@type"]}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                    />
                )) : null}
                {shouldRenderChromeDownloadSchemas ? chromeDownloadSchemas.map((schema) => (
                    <script
                        key={schema["@type"]}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                    />
                )) : null}
                {shouldRenderMacDownloadSchemas ? macDownloadSchemas.map((schema) => (
                    <script
                        key={schema["@type"]}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                    />
                )) : null}
                {shouldRenderWindowsDownloadSchemas ? windowsDownloadSchemas.map((schema) => (
                    <script
                        key={schema["@type"]}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                    />
                )) : null}

            </head>
            <body
                className={`${inter.variable} ${candu.variable} ${geistSans.variable} ${geistMono.variable} ${rethinkSans.variable} antialiased`}
            >
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <TreeStatsProvider>
                        <AuthProvider>
                            {children}
                            <Toaster />
                            <Footer />
                        </AuthProvider>
                    </TreeStatsProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
