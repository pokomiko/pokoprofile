import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://poko-profile.example";
const siteName = "PokoProfile";
const description =
  "PokoProfile is a pastel-blue PokoOS portfolio for system engineering, DevOps practice, monitoring, automation, and VRChat gallery work.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - System Engineer Portfolio`,
    template: `%s | ${siteName}`
  },
  description,
  keywords: [
    "Poko",
    "PokoProfile",
    "System Engineer",
    "DevOps",
    "Linux",
    "Docker",
    "Kubernetes",
    "Monitoring",
    "Automation",
    "VRChat"
  ],
  authors: [{ name: "Poko" }],
  creator: "Poko",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName,
    title: `${siteName} - System Engineer Portfolio`,
    description,
    images: [
      {
        url: "/images/poko-logo.webp",
        width: 1200,
        height: 630,
        alt: "PokoProfile logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - System Engineer Portfolio`,
    description,
    images: ["/images/poko-logo.webp"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: "/images/poko-logo.webp",
    shortcut: "/images/poko-logo.webp",
    apple: "/images/poko-logo.webp"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eaf3f8" },
    { media: "(prefers-color-scheme: dark)", color: "#071019" }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
