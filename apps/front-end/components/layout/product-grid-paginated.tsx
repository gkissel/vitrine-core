"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { ProductCardWithQuickView } from "components/product/product-card-with-quick-view";
import type { Product } from "lib/types";
import { cn } from "@/lib/utils";

type VariantWishlistState = {
  isInWishlist: boolean;
  wishlistId?: string;
  wishlistItemId?: string;
};

interface ProductGridPaginatedProps {
  products: Product[];
  wishlistStates?: Record<string, VariantWishlistState>;
  itemsPerPage?: number;
}

export default function ProductGridPaginated({
  products,
  wishlistStates,
  itemsPerPage = 6,
}: ProductGridPaginatedProps) {
  const [currentPage, setCurrentPage] = React.useState(0);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleProducts = products.slice(startIndex, endIndex);

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Pagination dots logic - show max 4 dots with sliding window
  const MAX_VISIBLE_DOTS = 4;
  let dotsStartIndex = 0;
  let dotsEndIndex = Math.min(MAX_VISIBLE_DOTS, totalPages);

  if (totalPages > MAX_VISIBLE_DOTS) {
    // Center the current page in the visible dots
    dotsStartIndex = Math.max(0, currentPage - 1);
    dotsEndIndex = Math.min(totalPages, dotsStartIndex + MAX_VISIBLE_DOTS);

    // Adjust if we're too close to the end
    if (dotsEndIndex - dotsStartIndex < MAX_VISIBLE_DOTS) {
      dotsStartIndex = Math.max(0, dotsEndIndex - MAX_VISIBLE_DOTS);
    }
  }

  const visibleDots = Array.from(
    { length: dotsEndIndex - dotsStartIndex },
    (_, i) => dotsStartIndex + i,
  );

  if (products.length === 0) {
    return <div className="text-center py-12">Nenhum produto encontrado.</div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Grid */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
        {visibleProducts.map((product) => {
          const variantId = product.variants?.[0]?.id ?? "";
          const wlState = variantId ? wishlistStates?.[variantId] : undefined;
          return (
            <ProductCardWithQuickView
              key={product.id}
              product={product}
              wishlistState={wlState}
            />
          );
        })}
      </div>

      {/* Pagination controls - only show if more than one page */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            aria-label="Página anterior"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-slate-900 shadow-[0_18px_36px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed sm:h-16 sm:w-16"
          >
            <ChevronLeftIcon className="h-4 w-4 sm:h-6 sm:w-6" />
          </button>

          <div className="flex flex-1 items-center justify-center gap-2">
            {visibleDots.map((index) => {
              const isActive = index === currentPage;

              return (
                <button
                  key={`dot-${index}`}
                  aria-label={`Ir para a página ${index + 1}`}
                  aria-pressed={isActive}
                  className={cn(
                    "h-4 rounded-full transition-all duration-300",
                    isActive
                      ? "w-12 bg-emerald-700"
                      : "w-4 bg-slate-200 hover:bg-slate-300",
                  )}
                  type="button"
                  onClick={() => goToPage(index)}
                />
              );
            })}
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1}
            aria-label="Próxima página"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-slate-900 shadow-[0_18px_36px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed sm:h-16 sm:w-16"
          >
            <ChevronRightIcon className="h-4 w-4 sm:h-6 sm:w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
