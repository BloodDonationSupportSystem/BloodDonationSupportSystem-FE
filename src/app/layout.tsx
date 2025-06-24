import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blood Donation System",
  description: "Find, donate, and learn about blood donation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
          <header style={{
            background: 'var(--primary-light)',
            borderBottom: '1px solid var(--card-border)',
            padding: '32px 0 24px 0',
            marginBottom: 32,
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <span style={{ fontSize: 40, color: 'var(--primary)' }} aria-label="Blood Drop" role="img">🩸</span>
              <h1 style={{ fontWeight: 800, fontSize: 32, color: 'var(--primary)', margin: 0 }}>Blood Donation System</h1>
            </div>
            <p style={{ color: 'var(--foreground)', fontSize: 18, marginTop: 12 }}>
              Give the gift of life. Find, donate, and learn about blood donation.
            </p>
          </header>
          <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
