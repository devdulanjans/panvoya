import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';
import { ContactProvider } from '../components/ContactContext';
import { FooterLinksProvider } from '../components/FooterLinksContext';
import '../styles/global.css';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ContactProvider value={pageProps.primaryContact}>
        <FooterLinksProvider value={pageProps.footerLinks}>
          <Head>
            <title>Panvoya Official Web site</title>
            <link rel="icon" href="/panvoya-faicon.svg" />
          </Head>
          <Component {...pageProps} />
        </FooterLinksProvider>
      </ContactProvider>
    </SessionProvider>
  );
}
