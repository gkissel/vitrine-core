"use client";

import ProductGridPrice from "components/price/product-grid-price";
import { PLACEHOLDER_IMAGE_SRC } from "lib/utils";
import type { Product } from "lib/types";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { addItem } from "components/cart/actions";

type WishlistState = {
  isInWishlist?: boolean;
  wishlistId?: string;
  wishlistItemId?: string;
};

interface ProductCardWithQuickViewProps {
  product: Product;
  wishlistState?: WishlistState;
}

export function ProductCardWithQuickView({
  product,
}: ProductCardWithQuickViewProps) {
  const variantId = product.variants?.[0]?.id ?? "";
  const isAvailable = product.variants?.[0]?.availableForSale ?? false;

  const handleAddToCart = async () => {
    if (!variantId) return;

    await addItem(null, variantId);
  };

  return (
    <article className="group isolate relative flex h-full flex-col overflow-hidden rounded-md bg-white text-slate-900 [box-shadow:4px_4px_12px_0px_rgba(0,0,0,0.15)]">
      <Link
        href={`/product/${product.handle}`}
        prefetch={true}
        aria-label={`Abrir ${product.title}`}
        className="absolute inset-0 z-0 block rounded-md"
      >
        <span className="sr-only">{product.title}</span>
      </Link>

      {/* Header with badges */}
      <div className="pointer-events-none relative z-10 flex items-center justify-between px-4 pt-4 sm:px-5 sm:pt-5">
        <span className="rounded-full border border-slate-200 bg-white px-4 py-1 text-sm font-semibold text-slate-900 shadow-sm">
          Destaque
        </span>
        <span className="rounded-full bg-slate-950 px-4 py-1 text-sm font-semibold text-white shadow-sm">
          Oferta
        </span>
      </div>

      {/* Image with wishlist button */}
      <div className="pointer-events-none relative z-10 mx-4 mt-4 aspect-4/5 overflow-hidden rounded-md bg-zinc-100 sm:mx-5">
        <Image
          alt={product.featuredImage?.altText || product.title}
          src={product.featuredImage?.url || PLACEHOLDER_IMAGE_SRC}
          fill
          sizes="(min-width: 1280px) 31vw, (min-width: 1024px) 33vw, (min-width: 768px) 46vw, (min-width: 640px) 52vw, 88vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      {/* Content */}
      <div className="pointer-events-none relative z-10 flex flex-1 flex-col px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
        <h3 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
          {product.title}
        </h3>

        <p className="mt-4 line-clamp-3 text-base leading-8 text-slate-500 sm:text-[17px]">
          {product.description || product.title}
        </p>

        {/* Footer with price and add to cart */}
        <div className="mt-auto flex items-end justify-between gap-4 pt-6 sm:pt-8">
          <div className="flex items-center justify-between gap-8">
            <ProductGridPrice
              amount={product.priceRange.maxVariantPrice.amount}
              currencyCode={product.priceRange.maxVariantPrice.currencyCode}
            />
            <p
              className={`text-md font-semibold ${
                isAvailable ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {isAvailable ? "Disponível" : "Indisponível"}
            </p>
          </div>

          <button
            aria-label={`Adicionar ${product.title} ao carrinho`}
            onClick={async (event) => {
              event.preventDefault();
              event.stopPropagation();
              await handleAddToCart();
            }}
            disabled={!isAvailable}
            className="pointer-events-auto relative z-20 inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-[0_16px_28px_rgba(74,124,64,0.28)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
          >
            <ShoppingCartIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </article>
  );
}
