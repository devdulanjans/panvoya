import Link from 'next/link';

export default function Custom404() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        textAlign: 'center',
        padding: 24,
      }}
    >
      <h1>404</h1>
      <p>Sorry, we couldn&apos;t find that page.</p>
      <Link href="/">Go back home</Link>
    </div>
  );
}
