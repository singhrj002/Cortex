import { Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from './providers';
import type { Metadata } from 'next';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: {
    default: 'AI Chief of Staff',
    template: '%s | AI Chief of Staff',
  },
  description: 'Organizational intelligence platform that extracts insights from communications, tracks decisions, detects conflicts, and routes intelligent notifications to stakeholders.',
  keywords: ['AI', 'Chief of Staff', 'organizational intelligence', 'decision tracking', 'knowledge graph', 'conflict detection'],
  authors: [{ name: 'Your Organization' }],
  creator: 'Your Organization',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'AI Chief of Staff',
    description: 'Organizational intelligence platform powered by AI',
    siteName: 'AI Chief of Staff',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Chief of Staff',
    description: 'Organizational intelligence platform powered by AI',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={jakarta.className} style={{ fontFamily: 'var(--font-jakarta), system-ui, sans-serif' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
