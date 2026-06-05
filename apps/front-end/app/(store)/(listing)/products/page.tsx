import ProductGridPaginated from "components/layout/product-grid-paginated";
import { defaultSort, sorting } from "lib/constants";
import { getCategories, getCollections, getProducts } from "lib/medusa";
import { getVariantsWishlistStates } from "lib/medusa/wishlist";
import { buildItemListJsonLd, JsonLdScript } from "lib/structured-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse all products.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { sort } = (searchParams || {}) as { [key: string]: string };
  const categoryHandle = (searchParams?.category as string | undefined) || "";
  const collectionHandle =
    (searchParams?.collection as string | undefined) || "";
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;
  const [categories, collections] = await Promise.all([
    getCategories(),
    getCollections(),
  ]);
  const categoryId = categories.find(
    (category) => category.handle === categoryHandle,
  )?.id;
  const collectionId = collections.find(
    (collection) => collection.handle === collectionHandle,
  )?.id;
  const products = await getProducts({
    sortKey,
    reverse,
    categoryId,
    collectionId,
  });
  const filteredProducts = collectionHandle
    ? products.filter(
        (product) => product.collection?.handle === collectionHandle,
      )
    : products;

  // Fetch wishlist states
  const variantIds = filteredProducts
    .map((p) => p.variants?.[0]?.id)
    .filter((id): id is string => Boolean(id));

  const wishlistStatesMap = await getVariantsWishlistStates(variantIds);
  const wishlistStates = Object.fromEntries(wishlistStatesMap);

  const itemListJsonLd = buildItemListJsonLd(
    filteredProducts.map((product, index) => ({
      position: index + 1,
      name: product.title,
      path: `/product/${product.handle}`,
      image: product.featuredImage?.url,
    })),
  );

  return (
    <div>
      {filteredProducts.length > 0 ? (
        <ProductGridPaginated
          products={filteredProducts}
          wishlistStates={wishlistStates}
          itemsPerPage={6}
        />
      ) : null}
      <JsonLdScript data={itemListJsonLd} />
    </div>
  );
}
