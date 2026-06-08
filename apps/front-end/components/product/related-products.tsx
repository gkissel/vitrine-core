"use client";

import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { addItem } from "components/cart/actions";
import { useCart } from "components/cart/cart-context";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "components/ui/carousel";
import type { Product } from "lib/types";
import type { TailwindRelatedProduct } from "lib/utils";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

interface RelatedProductsProps {
  products: TailwindRelatedProduct[];
  fullProducts: Product[];
}

export function RelatedProducts({
  products,
  fullProducts,
}: RelatedProductsProps) {
  const { addCartItem } = useCart();
  const router = useRouter();
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi | null>(
    null,
  );
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [snapCount, setSnapCount] = React.useState(0);
  const collectionHandle = fullProducts[0]?.collection?.handle?.trim();
  const allProductsHref = collectionHandle
    ? `/products/${encodeURIComponent(collectionHandle)}`
    : "/products";

  const getFullProduct = React.useCallback(
    (relatedProduct: TailwindRelatedProduct) => {
      const handle = relatedProduct.href.split("/").filter(Boolean).pop();

      if (!handle) {
        return undefined;
      }

      return fullProducts.find((product) => product.handle === handle);
    },
    [fullProducts],
  );

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

  if (!products || products.length === 0) return null;

  const totalDots = snapCount || products.length;
  const MAX_VISIBLE_DOTS = 4;
  let dotsStartIndex = 0;
  let dotsEndIndex = Math.min(MAX_VISIBLE_DOTS, totalDots);

  if (totalDots > MAX_VISIBLE_DOTS) {
    dotsStartIndex = Math.max(0, selectedIndex - 1);
    dotsEndIndex = Math.min(totalDots, dotsStartIndex + MAX_VISIBLE_DOTS);

    if (dotsEndIndex - dotsStartIndex < MAX_VISIBLE_DOTS) {
      dotsStartIndex = Math.max(0, dotsEndIndex - MAX_VISIBLE_DOTS);
    }
  }

  const visibleDots = Array.from(
    { length: dotsEndIndex - dotsStartIndex },
    (_, index) => dotsStartIndex + index,
  );

  return (
    <section
      aria-labelledby="related-heading"
      className="mx-auto mt-16 max-w-7xl px-4 py-16"
    >
      <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h2
            id="related-heading"
            className="text-lg font-bold tracking-tight text-black sm:text-4xl lg:text-5xl"
          >
            Produtos Relacionados
          </h2>
          <p className="max-w-2xl text-base leading-8 text-slate-500 sm:text-lg sm:leading-9">
            Explore mais produtos como este — ou veja a linha completa clicando
            abaixo.
          </p>
        </div>
        <Link
          href={allProductsHref}
          className="inline-flex w-full items-center justify-center rounded-md bg-brand px-6 py-4 text-base font-semibold text-white transition-colors sm:w-auto sm:min-w-80"
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
          {products.map((product, index) => {
            const fullProduct = getFullProduct(product);
            const isAvailable = fullProduct?.availableForSale ?? false;
            const cartVariant = fullProduct?.variants[0];

            return (
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
                      {fullProduct?.description ?? product.color}
                    </p>

                    <div className="mt-auto flex items-end justify-between gap-4 pt-6 sm:pt-8">
                      <div className="flex items-center justify-between gap-8">
                        <p className="text-lg font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
                          {product.price}
                        </p>
                        <p
                          className={cn(
                            "text-md font-semibold",
                            isAvailable ? "text-green-700" : "text-rose-600",
                          )}
                        >
                          {isAvailable ? "Disponível" : "Indisponível"}
                        </p>
                      </div>

                      <button
                        aria-label={`Adicionar ${product.name} ao carrinho`}
                        disabled={!isAvailable || !cartVariant}
                        onClick={async (event) => {
                          event.preventDefault();
                          event.stopPropagation();

                          if (!fullProduct || !cartVariant) {
                            return;
                          }

                          addCartItem(cartVariant, fullProduct);
                          await addItem(null, cartVariant.id);
                          router.refresh();
                        }}
                        className="pointer-events-auto relative z-20 inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-[0_16px_28px_rgba(74,124,64,0.28)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                      >
                        <ShoppingCartIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </article>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <div className="mt-6 flex items-center justify-between gap-4 sm:mt-8">
          <CarouselPrevious
            className="static h-12 w-12 shrink-0 translate-x-0 translate-y-0 rounded-md border border-gray-200 bg-white text-slate-900 shadow-[0_18px_36px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-50 sm:h-16 sm:w-16"
            iconClassName="h-4 w-4"
          />
          <div className="flex flex-1 items-center justify-center gap-2">
            {visibleDots.map((index) => {
              const isActive = index === selectedIndex;
              const snapPoint = carouselApi?.scrollSnapList()[index] ?? index;

              return (
                <button
                  key={`related-dot-${snapPoint}`}
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
            })}
          </div>

          <CarouselNext
            className="static h-12 w-12 shrink-0 translate-x-0 translate-y-0 rounded-md border border-gray-200 bg-white text-slate-900 shadow-[0_18px_36px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-50 sm:h-16 sm:w-16"
            iconClassName="h-4 w-4"
          />
        </div>
      </Carousel>
    </section>
  );
}
