// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Minha Loja",
        short_name: "Loja",
        description: "Catálogo e pedidos pelo WhatsApp",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#111827",
        icons: [
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: "/icons/icon-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
        shortcuts: [
            {
                name: "Ofertas",
                short_name: "Ofertas",
                url: "/ofertas",
            },
            {
                name: "Carrinho",
                short_name: "Carrinho",
                url: "/carrinho",
            },
        ],
    };
}