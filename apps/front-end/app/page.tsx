"use cache";
import { Hero } from "components/home/hero";
import { TrendingProducts } from "components/home/trending-products";
import { MasonryFeatures } from "components/home/masonry-features";
import { PromoBanners } from "components/home/promo-banners";
import { getProducts } from "lib/medusa";
import {
  buildWebsiteJsonLd,
  buildOrganizationJsonLd,
  DEFAULT_SITE_DESCRIPTION,
  getSiteSchemaConfig,
  JsonLdScript,
} from "lib/structured-data";
import { transformProductToTailwind } from "lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  description: DEFAULT_SITE_DESCRIPTION,
};

export default async function HomePage() {
  // Fetch products from Medusa - most recent first
  const allProducts = await getProducts({
    sortKey: "CREATED_AT",
    reverse: true,
    limit: 8,
  });

  // Split products for two sections
  const firstCategoryProducts = allProducts
    .slice(0, 4)
    .map(transformProductToTailwind);
  const secondCategoryProducts = allProducts
    .slice(4, 8)
    .map(transformProductToTailwind);

  const siteSchemaConfig = getSiteSchemaConfig({
    description: DEFAULT_SITE_DESCRIPTION,
  });
  const organizationJsonLd = buildOrganizationJsonLd(siteSchemaConfig);
  const websiteJsonLd = buildWebsiteJsonLd(siteSchemaConfig);

  return (
    <>
      <JsonLdScript data={organizationJsonLd} />
      <JsonLdScript data={websiteJsonLd} />

      <Hero />

      <MasonryFeatures
        title={
          <>
            Cultivada com cuidado,{" "}
            <span className="font-normal italic bg-[#9FBD3B33]">
              "com orgulho entregue"
            </span>{" "}
            optio para todo o Brasil.
          </>
        }
      />

      <TrendingProducts
        products={firstCategoryProducts.length > 0 ? firstCategoryProducts : []}
        title="Nossos Produtos"
        description="Da erva cancheada ao chimarrão pronto para beber. Encontre o blend ideal para o seu momento."
      />

      <PromoBanners />
    </>
  );
}
