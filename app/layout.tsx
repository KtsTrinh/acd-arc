import type { Metadata } from "next";
import "./globals.css";
import { getSettings } from "@/lib/settings";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  const keywords = settings.seoKeywords
    ? settings.seoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  const metadata: Metadata = {
    title: settings.seoTitle || settings.siteName,
    description: settings.seoDescription || settings.siteDescription,
    keywords,
    robots: settings.seoRobots === "noindex, nofollow" ? { index: false, follow: false } : undefined,
  };

  if (settings.seoOgImage) {
    metadata.openGraph = {
      title: settings.seoTitle || settings.siteName,
      description: settings.seoDescription || settings.siteDescription,
      images: [{ url: settings.seoOgImage }],
      type: "website",
    };
    metadata.twitter = {
      card: "summary_large_image",
      title: settings.seoTitle || settings.siteName,
      description: settings.seoDescription || settings.siteDescription,
      images: [settings.seoOgImage],
    };
  }

  if (settings.googleSiteVerification) {
    metadata.other = { "google-site-verification": settings.googleSiteVerification };
  }

  return metadata;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap"

          rel="stylesheet"
        />

        {/* Custom header embed code (ads, pixels, GTM...) - applied on every page */}
        {settings.headerEmbedCode && (
          <script dangerouslySetInnerHTML={{ __html: settings.headerEmbedCode }} />
        )}

        {/* Google Analytics */}
        {settings.googleAnalyticsId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${settings.googleAnalyticsId}');`,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-screen bg-canvas text-navy-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}

        {/* Custom body embed code - applied on every page */}
        {settings.bodyEmbedCode && (
          <script dangerouslySetInnerHTML={{ __html: settings.bodyEmbedCode }} />
        )}
      </body>
    </html>
  );
}
