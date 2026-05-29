import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { pathWithoutLocale, routeAlternates } from '@/lib/i18n-routes';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '/';
  const path = pathWithoutLocale(pathname);

  return {
    alternates: routeAlternates(path, params.locale),
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
