"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "components/ui/carousel";
import { cn } from "@/lib/utils";

import type { Product } from "./types";

interface TrendingProductsProps {
  products: Product[];
  title?: string;
  description?: string;
}

export function TrendingProducts({
  products,
  title = "Lorem Ipsum Ametr",
  description = "Ad et et. Accusamus esse in voluptatem odio dolor nobis. Doloribus rerum sed et voluptatem deserunt et.",
}: TrendingProductsProps) {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi | null>(
    null,
  );
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [snapCount, setSnapCount] = React.useState(0);

  React.useEffect(() => {
    if (!carouselApi) return;

    const updateState = () => {
      setSelectedIndex(carouselApi.selectedScrollSnap());
      setSnapCount(carouselApi.scrollSnapList().length);
    };

    updateState();
    carouselApi.on("select", updateState);
    carouselApi.on("reInit", updateState);

    return () => {
      carouselApi.off("select", updateState);
      carouselApi.off("reInit", updateState);
    };
  }, [carouselApi]);

  if (products.length === 0) {
    return (
      <section
        aria-labelledby="trending-heading"
        className="bg-black py-16 text-white sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-4xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
            <h2
              id="trending-heading"
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-300">
              {description}
            </p>
            <p className="mt-8 text-sm text-slate-400">
              Nenhum produto disponível no momento.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="trending-heading"
      className="bg-white pt-8 pb-16 text-black sm:pt-10 sm:pb-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2
              id="trending-heading"
              className="text-3xl font-semibold tracking-tight text-black sm:text-4xl lg:text-5xl"
            >
              {title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg sm:leading-9">
              {description}
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex w-full items-center justify-center rounded-md bg-brand px-6 py-4 text-base font-semibold text-white transition-colors  sm:w-auto sm:min-w-80"
          >
            Ver todos os produtos
          </Link>
        </div>

        <Carousel
          opts={{ align: "start", containScroll: "trimSnaps" }}
          setApi={setCarouselApi}
          className="relative"
        >
          <CarouselContent className="pb-3">
            {products.map((product, index) => (
              <CarouselItem
                key={product.id}
                className="basis-[88%] sm:basis-[52%] md:basis-[46%] lg:basis-1/3 xl:basis-[31%]"
              >
                <article className="group isolate relative flex h-full flex-col overflow-hidden rounded-4xl bg-white text-slate-900 [box-shadow:4px_4px_12px_0px_rgba(0,0,0,0.15)]">
                  <Link
                    href={product.href}
                    aria-label={`Abrir ${product.name}`}
                    className="absolute inset-0 z-0 block rounded-4xl"
                  >
                    <span className="sr-only">{product.name}</span>
                  </Link>

                  <div className="pointer-events-none relative z-10 flex items-center justify-between px-4 pt-4 sm:px-5 sm:pt-5">
                    <span className="rounded-full border border-slate-200 bg-white px-4 py-1 text-sm font-semibold text-slate-900 shadow-sm">
                      {index % 2 === 0 ? "Destaque" : "Mais vendida"}
                    </span>
                    <span className="rounded-full bg-slate-950 px-4 py-1 text-sm font-semibold text-white shadow-sm">
                      Oferta
                    </span>
                  </div>
                  <div className="pointer-events-none relative z-10 mx-4 mt-4 aspect-4/5 overflow-hidden rounded-3xl bg-zinc-100 sm:mx-5">
                    <Image
                      alt={product.imageAlt}
                      src={product.imageSrc}
                      fill
                      sizes="(min-width: 1280px) 31vw, (min-width: 1024px) 33vw, (min-width: 768px) 46vw, (min-width: 640px) 52vw, 88vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="pointer-events-none relative z-10 flex flex-1 flex-col px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
                    <h3 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                      {product.name}
                    </h3>

                    <p className="mt-4 line-clamp-3 text-base leading-8 text-slate-500 sm:text-[17px]">
                      {product.description ?? product.color}
                    </p>

                    <div className="mt-auto flex items-end justify-between gap-4 pt-6 sm:pt-8">
                      <div className="flex items-center justify-between gap-8">
                        <p className="text-lg font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
                          {product.price}
                        </p>
                        <p
                          className={cn(
                            "text-md font-semibold",
                            product.availableForSale === false
                              ? "text-rose-600"
                              : "text-green-700",
                          )}
                        >
                          {product.availableForSale === false
                            ? "Indisponível"
                            : "Disponível"}
                        </p>
                      </div>

                      <button
                        aria-label={`Adicionar ${product.name} ao carrinho`}
                        className="pointer-events-auto relative z-20 inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-[0_16px_28px_rgba(74,124,64,0.28)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-green-800"
                        type="button"
                      >
                        <ShoppingCartIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="mt-6 flex items-center justify-between gap-4 sm:mt-8">
            <CarouselPrevious
              className="static h-12 w-12 shrink-0 translate-x-0 translate-y-0 rounded-md border border-gray-200 bg-white text-slate-900 shadow-[0_18px_36px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-50 sm:h-16 sm:w-16"
              iconClassName="h-4 w-4"
            />
            <div className="flex flex-1 items-center justify-center gap-2">
              {Array.from({ length: snapCount || products.length }).map(
                (_, index) => {
                  const isActive = index === selectedIndex;
                  const snapPoint =
                    carouselApi?.scrollSnapList()[index] ?? index;

                  return (
                    <button
                      key={`trending-dot-${snapPoint}`}
                      aria-label={`Ir para o slide ${index + 1}`}
                      aria-pressed={isActive}
                      className={cn(
                        "h-4 rounded-full transition-all duration-300",
                        isActive
                          ? "w-12 bg-brand"
                          : "w-4 bg-slate-200 hover:bg-slate-300",
                      )}
                      type="button"
                      onClick={() => carouselApi?.scrollTo(index)}
                    />
                  );
                },
              )}
            </div>

            <CarouselNext
              className="static h-12 w-12 shrink-0 translate-x-0  translate-y-0 rounded-md border border-gray-200 bg-white text-slate-900 shadow-[0_18px_36px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-50 sm:h-16 sm:w-16"
              iconClassName="h-4 w-4"
            />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
