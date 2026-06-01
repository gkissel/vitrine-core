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
import { useEffect } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

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

export function ProductDetail({
  product,
  sourceProduct,
  options,
  variants,
}: ProductDetailProps) {
  const { state, updateOption: updateOptionContext } = useProduct();
  const updateURL = useUpdateURL();

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

  // Derive the currently selected variant ID from option state
  const selectedVariant = combinations.find((combo) =>
    Object.entries(selectedOptionState).every(
      ([key, value]) => combo[key] === value,
    ),
  );
  const selectedVariantFromVariants =
    variants.find((variant) => variant.id === selectedVariant?.id) ??
    variants[0];

  // Select sensible defaults on first render (prefer available variant)
  useEffect(() => {
    const optionKeys = options.map((o) => o.name.toLowerCase());
    const missingKeys = optionKeys.filter((k) => !state[k]);
    if (missingKeys.length === 0) return;

    // Filter variants by currently selected state (partial match)
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
        {/* Product */}
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Image gallery */}
          <TabGroup
            className="flex flex-col-reverse"
            onChange={(index) =>
              trackClient("product_image_viewed", {
                product_id: sourceProduct.id,
                image_index: index,
              })
            }
          >
            {/* Image selector */}
            <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
              <TabList className="grid grid-cols-4 gap-6">
                {product.images.map((image) => (
                  <Tab
                    key={image.id}
                    className="group focus-visible:ring-primary-500/50 relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium text-gray-900 uppercase hover:bg-gray-50 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-offset-4"
                  >
                    <span className="sr-only">{image.name}</span>
                    <span className="absolute inset-0 overflow-hidden rounded-md">
                      <Image
                        alt={image.name || ""}
                        src={image.src}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </span>
                    <span
                      aria-hidden="true"
                      className="group-data-selected:ring-primary-500 pointer-events-none absolute inset-0 rounded-md ring-2 ring-transparent ring-offset-2"
                    />
                  </Tab>
                ))}
              </TabList>
            </div>

            <TabPanels>
              {product.images.map((image) => (
                <TabPanel key={image.id}>
                  <div className="relative aspect-square w-full overflow-hidden sm:rounded-lg">
                    <Image
                      alt={image.alt}
                      src={image.src}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>

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

            {/* Social proof */}
            <WishlistCount productId={sourceProduct.id} />

            <div className="mt-8">
              <VariantSelector options={options} variants={variants} />
            </div>

            <div className="mt-8 flex">
              <AddToCart
                product={sourceProduct}
                formClassName="max-w-xs flex-1"
                className="bg-brand hover:bg-brand flex cursor-pointer rounded-md border border-transparent px-6 py-3 text-base font-medium text-white "
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
