import { siteBrand } from "@repo/site-config";
import type { Metadata } from "next";
import { DEFAULT_SITE_DESCRIPTION } from "lib/structured-data";
import { baseUrl } from "lib/utils";

const siteName = process.env.SITE_NAME?.trim() || siteBrand.siteName;

export const defaultSocialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `Prévia social de ${siteName}`,
};

export const rootMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: siteName,
  manifest: "/manifest.webmanifest",
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: DEFAULT_SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName,
    title: siteName,
    description: DEFAULT_SITE_DESCRIPTION,
    url: baseUrl,
    images: [defaultSocialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: DEFAULT_SITE_DESCRIPTION,
    images: [defaultSocialImage.url],
  },
  robots: {
    follow: true,
    index: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};
