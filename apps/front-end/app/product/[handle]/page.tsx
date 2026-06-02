import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductPageContent } from "components/product/product-page-content";
import { RelatedProducts as RelatedProductsComponent } from "components/product/related-products";
import { ProductReviewsSection } from "components/reviews/ProductReviewsSection";
import { HIDDEN_PRODUCT_TAG } from "lib/constants";
import {
  getCollectionProducts,
  getCollections,
  getProduct,
  getProductRecommendations,
  getProducts,
} from "lib/medusa";
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  JsonLdScript,
} from "lib/structured-data";
import type { Product } from "lib/types";
import { transformProductsToRelatedProducts } from "lib/utils";
import { Suspense } from "react";

const BUILD_PLACEHOLDER_HANDLE = "__build-placeholder__";

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  if (params.handle === BUILD_PLACEHOLDER_HANDLE) return notFound();

  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const { url, width, height, altText: alt } = product.featuredImage || {};
  const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG);

  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description,
    alternates: {
      canonical: `/product/${product.handle}`,
    },
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
      },
    },
    openGraph: url
      ? {
          images: [
            {
              url,
              width,
              height,
              alt,
            },
          ],
        }
      : null,
  };
}

export async function generateStaticParams() {
  try {
    const products = await getProducts({});
    if (products.length === 0) {
      return [{ handle: BUILD_PLACEHOLDER_HANDLE }];
    }

    return products.map((product) => ({ handle: product.handle }));
  } catch {
    return [{ handle: BUILD_PLACEHOLDER_HANDLE }];
  }
}

export default async function ProductPage(props: {
  params: Promise<{ handle: string }>;
}) {
  const params = await props.params;
  if (params.handle === BUILD_PLACEHOLDER_HANDLE) return notFound();

  const productPromise = getProduct(params.handle);
  const product = await productPromise;

  if (!product) return notFound();

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: product.title, path: `/product/${product.handle}` },
  ]);

  // console.dir({ product }, { depth: null });
  return (
    <>
      <JsonLdScript data={breadcrumbJsonLd} />
      <ProductStructuredData product={product} />
      <ProductPageContent
        productPromise={productPromise}
        reviewsSlot={
          <Suspense
            fallback={
              <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="h-32 animate-pulse rounded bg-gray-200" />
              </div>
            }
          >
            <ProductReviewsSection productPromise={productPromise} />
          </Suspense>
        }
        relatedProductsSlot={
          <Suspense
            fallback={
              <div className="mx-auto max-w-7xl px-4 py-8">
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Customers also bought
                </h2>
                <div className="h-24 animate-pulse rounded bg-gray-200" />
              </div>
            }
          >
            <RelatedProducts productPromise={productPromise} />
          </Suspense>
        }
      />
    </>
  );
}

function ProductStructuredData({ product }: { product: Product }) {
  const productJsonLd = buildProductJsonLd(product, null);

  return <JsonLdScript data={productJsonLd} />;
}

async function RelatedProducts({
  productPromise,
}: {
  productPromise: Promise<Product | undefined>;
}) {
  // Await the product promise
  const product = await productPromise;
  if (!product) return null;

  let relatedProducts = [] as Product[];

  const collections = await getCollections();
  const collectionCandidates = collections.filter(
    (collection) => collection.handle,
  );

  if (collectionCandidates.length > 0) {
    const productsByCollection = await Promise.all(
      collectionCandidates.map(async (collection) => ({
        collection,
        products: await getCollectionProducts({
          collection: collection.handle,
        }),
      })),
    );

    const matchedCollection = productsByCollection.find(({ products }) =>
      products.some((relatedProduct) => relatedProduct.id === product.id),
    );

    if (matchedCollection) {
      relatedProducts = matchedCollection.products.filter(
        (relatedProduct) => relatedProduct.id !== product.id,
      );
    }
  }

  if (relatedProducts.length === 0) {
    relatedProducts = await getProductRecommendations(product.id);
  }

  if (!relatedProducts.length) return null;

  // Transform products for Tailwind component
  const transformedRelatedProducts = transformProductsToRelatedProducts(
    relatedProducts,
    6,
  );

  return (
    <RelatedProductsComponent
      products={transformedRelatedProducts}
      fullProducts={relatedProducts}
    />
  );
}
