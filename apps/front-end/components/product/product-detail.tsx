"use client";

import { AddToCart } from "components/cart/add-to-cart";
import Breadcrumbs from "components/layout/breadcrumbs";
import ProductDetailPrice from "components/price/product-detail-price";
import { useProduct, useUpdateURL } from "components/product/product-context";
import { VariantSelector } from "components/product/template-variant-selector";
import { WishlistCount } from "components/wishlist/wishlist-count";
import { trackClient } from "lib/analytics";
import type { Product, ProductOption, ProductVariant } from "lib/types";
import type { TailwindProductDetail } from "lib/utils";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "components/ui/carousel";
import { cn } from "lib/utils";

type Combination = {
  id: string;
  availableForSale: boolean;
  [key: string]: string | boolean;
};

interface ProductDetailProps {
  product: TailwindProductDetail;
  sourceProduct: Product;
  options: ProductOption[];
  variants: ProductVariant[];
}

/** Resolve the image list to show for a given variant.
 *  Priority: variant.images → product.images (fallback) */
function resolveImagesForVariant(
  variant: ProductVariant | undefined,
  productImages: TailwindProductDetail["images"],
) {
  if (variant?.images && variant.images.length > 0) {
    return variant.images.map((img, i) => ({
      id: `variant-img-${i}`,
      src: img.url,
      alt: img.altText ?? "",
      name: img.altText ?? "",
    }));
  }
  return productImages;
}

export function ProductDetail({
  product,
  sourceProduct,
  options,
  variants,
}: ProductDetailProps) {
  const { state, updateOption: updateOptionContext } = useProduct();
  const updateURL = useUpdateURL();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const prevVariantIdRef = useRef<string | undefined>(undefined);

  const optionKeys = new Set(
    options.map((option) => option.name.toLowerCase()),
  );
  const selectedOptionState = Object.fromEntries(
    Object.entries(state).filter(([key]) => optionKeys.has(key)),
  );

  const combinations: Combination[] = variants.map((variant) => ({
    id: variant.id,
    availableForSale: variant.availableForSale,
    ...variant.selectedOptions.reduce<Record<string, string>>(
      (accumulator, option) => {
        accumulator[option.name.toLowerCase()] = option.value;
        return accumulator;
      },
      {},
    ),
  }));

  const selectedVariant = combinations.find((combo) =>
    Object.entries(selectedOptionState).every(
      ([key, value]) => combo[key] === value,
    ),
  );
  const selectedVariantFromVariants =
    variants.find((variant) => variant.id === selectedVariant?.id) ??
    variants[0];

  // Resolve which images to display based on selected variant
  const displayImages = resolveImagesForVariant(
    selectedVariantFromVariants,
    product.images,
  );

  // When variant changes, reset carousel to first slide
  useEffect(() => {
    if (!api) return;
    const variantId = selectedVariantFromVariants?.id;
    if (variantId === prevVariantIdRef.current) return;
    prevVariantIdRef.current = variantId;
    api.scrollTo(0, true); // jump instantly on variant change
    setCurrent(0);
  }, [selectedVariantFromVariants?.id, api]);

  // Track current slide index
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    onSelect();
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const goToImage = useCallback(
    (index: number) => {
      api?.scrollTo(index);
      trackClient("product_image_viewed", {
        product_id: sourceProduct.id,
        image_index: index,
      });
    },
    [api, sourceProduct.id],
  );

  // Select sensible defaults on first render
  useEffect(() => {
    const optionKeys = options.map((o) => o.name.toLowerCase());
    const missingKeys = optionKeys.filter((k) => !state[k]);
    if (missingKeys.length === 0) return;

    const partiallyMatched = variants.filter((v) =>
      v.selectedOptions.every((opt) => {
        const key = opt.name.toLowerCase();
        return !state[key] || state[key] === opt.value;
      }),
    );

    const preferred =
      partiallyMatched.find((v) => v.availableForSale) ||
      partiallyMatched[0] ||
      variants.find((v) => v.availableForSale) ||
      variants[0];

    if (!preferred) return;

    preferred.selectedOptions.forEach((opt) => {
      const key = opt.name.toLowerCase();
      if (!state[key]) {
        const newState = updateOptionContext(key, opt.value);
        updateURL(newState);
      }
    });
  }, [options, variants, state, updateOptionContext, updateURL]);

  return (
    <main className="mx-auto max-w-7xl sm:px-6 sm:pt-12 lg:px-8">
      <div className="mx-auto max-w-2xl lg:max-w-none">
        <div className="px-4 pt-6 pb-4 sm:px-0 sm:pt-0 sm:pb-6 lg:pb-8">
          <Breadcrumbs
            items={[
              { name: "Início", href: "/" },
              { name: "Produtos", href: "/products" },
              { name: product.name },
            ]}
          />
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Image gallery */}
          <div className="flex flex-col gap-4">
            {/* Main carousel */}
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {displayImages.map((image, index) => (
                  <CarouselItem key={image.id}>
                    <div className="relative aspect-square w-full overflow-hidden sm:rounded-lg">
                      <Image
                        alt={image.alt}
                        src={image.src}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Thumbnail strip */}
            {displayImages.length > 1 && (
              <div className="mx-auto hidden w-full max-w-2xl sm:block lg:max-w-none">
                <div className="grid grid-cols-4 gap-3">
                  {displayImages.map((image, index) => (
                    <button
                      type="button"
                      key={image.id}
                      onClick={() => goToImage(index)}
                      className={cn(
                        "group relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium text-gray-900 uppercase hover:bg-gray-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-offset-4 overflow-hidden",
                        current === index
                          ? "ring-primary-500 ring-2 ring-offset-2"
                          : "ring-transparent ring-2 ring-offset-2",
                      )}
                    >
                      <span className="sr-only">{image.name}</span>
                      <Image
                        alt={image.name || ""}
                        src={image.src}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="mt-5 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              {product.name}
            </h1>
            <p className="text-sm mt-1 tracking-tight text-gray-400">
              {product.id.slice(5, -1)}
            </p>

            <div className="mt-5">
              <ProductDetailPrice
                amount={
                  selectedVariantFromVariants?.price.amount ??
                  product.priceAmount
                }
                currencyCode={
                  selectedVariantFromVariants?.price.currencyCode ??
                  product.priceCurrency
                }
              />
            </div>

            <WishlistCount productId={sourceProduct.id} />

            <div className="mt-8">
              <VariantSelector options={options} variants={variants} />
            </div>

            <div className="mt-8 flex">
              <AddToCart
                product={sourceProduct}
                formClassName="max-w-xs flex-1"
                className="bg-brand hover:bg-brand flex cursor-pointer rounded-md border border-transparent px-6 py-3 text-base font-medium text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
