import { MetadataRoute } from "next";
import { siteBrand } from "@repo/site-config";
import { DEFAULT_SITE_DESCRIPTION } from "lib/structured-data";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: siteBrand.siteName,
    short_name: "Erva Mate",
    description: DEFAULT_SITE_DESCRIPTION,
    lang: siteBrand.locale,
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#f7f4e8",
    theme_color: "#436939",
    categories: ["shopping", "food", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/images/pwa-screenshot-wide.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Vitrine de produtos da Erva Mate para o Brasil",
      },
      {
        src: "/images/pwa-screenshot-mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Experiência mobile da loja Erva Mate para o Brasil",
      },
    ],
    shortcuts: [
      {
        name: "Produtos",
        short_name: "Produtos",
        description: "Ver produtos em destaque",
        url: "/search",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Minha conta",
        short_name: "Conta",
        description: "Acessar pedidos e dados da conta",
        url: "/account",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
