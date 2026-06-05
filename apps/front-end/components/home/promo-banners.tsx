import Image from "next/image";
import Link from "next/link";
import Fundo from "public/images/fundo1.png";
import { Star, ArrowRight } from "lucide-react";

const glassEffect =
  "bg-white/13 border border-white/22 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.15)]";

export function PromoBanners() {
  const banners = [
    {
      title: "Erva para Chimarrão",
      subtitle:
        "Blend tradicional, sabor intenso e folha selecionada da serra gaúcha.",
      label: "1500+ clientes satisfeitos",
      href: "/products?category=chimarr%C3%A3o-tradicional",
    },
    {
      title: "Erva para Tereré",
      subtitle: "Refrescante e leve, ideal para o verão brasileiro.",
      label: "1000+ clientes satisfeitos",
      href: "/products?category=terer%C3%A9",
    },
    {
      title: "Acessórios",
      subtitle: "Cuia, bomba e garrafa térmica para uma experiência completa",
      label: "750+ clientes satisfeitos",
      href: "/products?category=acess%C3%B3rios",
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {banners.map((banner, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              className="relative rounded-2xl overflow-hidden h-100 flex flex-col justify-between group"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 overflow-hidden"
              >
                <Image
                  src={Fundo}
                  alt={banner.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              />

              <div className="relative p-6 pt-10">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {banner.title}
                </h3>
                <p className="text-gray-200 text-sm">{banner.subtitle}</p>
              </div>

              <div className="relative p-6 mt-auto flex justify-between items-center">
                <span
                  className={`text-sm font-semibold text-white flex items-center gap-1 border rounded-md px-4 py-1 bg-transparent ${glassEffect}`}
                >
                  <Star className="w-4 h-4" />
                  {banner.label}
                </span>
                {/** biome-ignore lint/a11y/useButtonType: <explanation> */}
                <Link
                  href={banner.href}
                  className="bg-white text-gray-900 w-8 h-8 rounded flex items-center justify-center font-bold"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
