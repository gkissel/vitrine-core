import type { Product } from "lib/types";

export const MEILISEARCH_ENABLED = false;
export const MEILISEARCH_INDEX_NAME = "products";
export const searchClient = null;
export const meilisearchClient = null;

export type MeilisearchProductDocument = {
  id: string;
  title: string;
  description?: string | null;
  handle: string;
  thumbnail?: string | null;
  collection_titles?: string[];
  collection_handles?: string[];
  tag_values?: string[];
  variant_prices?: number[];
  min_variant_price?: number | null;
  max_variant_price?: number | null;
  availability?: boolean;
  created_at?: string;
  updated_at?: string;
};

type SearchIndexedProductsOptions = {
  collection?: string | null;
  availability?: boolean;
  limit?: number;
  maxPrice?: number | null;
  minPrice?: number | null;
  offset?: number;
  sort?: string | null;
};

type SearchIndexedProductsResult = {
  hits: MeilisearchProductDocument[];
  totalCount: number;
};

export function meilisearchHitToProduct(
  hit: MeilisearchProductDocument,
): Product {
  return {
    id: hit.id,
    handle: hit.handle,
    availableForSale: hit.availability ?? true,
    title: hit.title,
    description: hit.description || "",
    descriptionHtml: hit.description || "",
    options: [],
    priceRange: {
      minVariantPrice: {
        amount: Number(hit.min_variant_price || 0).toFixed(2),
        currencyCode: "BRL",
      },
      maxVariantPrice: {
        amount: Number(hit.max_variant_price || 0).toFixed(2),
        currencyCode: "BRL",
      },
    },
    variants: [],
    featuredImage: hit.thumbnail
      ? {
          url: hit.thumbnail,
          altText: hit.title,
          width: 0,
          height: 0,
        }
      : { url: "", altText: hit.title, width: 0, height: 0 },
    images: [],
    seo: { title: hit.title, description: "" },
    tags: hit.tag_values || [],
    updatedAt: hit.updated_at || new Date().toISOString(),
  };
}

export async function searchIndexedProducts(
  _query: string,
  _options: SearchIndexedProductsOptions = {},
): Promise<SearchIndexedProductsResult> {
  return { hits: [], totalCount: 0 };
}
