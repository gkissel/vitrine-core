import ProductGridPaginated from "components/layout/product-grid-paginated";
import { defaultSort, sorting } from "lib/constants";
import {
  getCollection,
  getCollectionProducts,
  getCollections,
} from "lib/medusa";
import { getVariantsWishlistStates } from "lib/medusa/wishlist";
import {
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
  JsonLdScript,
} from "lib/structured-data";
import { Metadata } from "next";
import { notFound } from "next/navigation";

const BUILD_PLACEHOLDER_COLLECTION = "__build-placeholder__";

export async function generateStaticParams() {
  try {
    const collections = await getCollections();
    const dynamicCollections = collections
      .filter((collection) => collection.handle)
      .map((collection) => ({ collection: collection.handle }));

    if (dynamicCollections.length === 0) {
      return [{ collection: BUILD_PLACEHOLDER_COLLECTION }];
    }

    return dynamicCollections;
  } catch {
    return [{ collection: BUILD_PLACEHOLDER_COLLECTION }];
  }
}

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  if (params.collection === BUILD_PLACEHOLDER_COLLECTION) return notFound();

  const collection = await getCollection(params.collection);

  if (!collection) return notFound();

  return {
    title: collection.seo?.title || collection.title,
    description:
      collection.seo?.description ||
      collection.description ||
      `${collection.title} products`,
    alternates: { canonical: `/products/${params.collection}` },
  };
}

export default async function ProductsCollectionPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  if (params.collection === BUILD_PLACEHOLDER_COLLECTION) return notFound();

  const { sort } = (searchParams || {}) as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;
  const [collection, products] = await Promise.all([
    getCollection(params.collection),
    getCollectionProducts({ collection: params.collection, sortKey, reverse }),
  ]);

  // Fetch wishlist states
  const variantIds = products
    .map((p) => p.variants?.[0]?.id)
    .filter((id): id is string => Boolean(id));

  const wishlistStatesMap = await getVariantsWishlistStates(variantIds);
  const wishlistStates = Object.fromEntries(wishlistStatesMap);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    {
      name: collection?.title || params.collection,
      path: `/products/${params.collection}`,
    },
  ]);
  const itemListJsonLd = buildItemListJsonLd(
    products.map((product, index) => ({
      position: index + 1,
      name: product.title,
      path: `/product/${product.handle}`,
      image: product.featuredImage?.url,
    })),
  );

  return (
    <div>
      {products.length === 0 ? (
        <p className="py-3 text-lg">{`No products found in this collection`}</p>
      ) : (
        <ProductGridPaginated
          products={products}
          wishlistStates={wishlistStates}
          itemsPerPage={6}
        />
      )}
      <JsonLdScript data={breadcrumbJsonLd} />
      <JsonLdScript data={itemListJsonLd} />
    </div>
  );
}
