import Collections from "components/layout/search/collections";
import CollectionFilter from "components/layout/search/collection-filter";
import { Suspense } from "react";
import ChildrenWrapper from "../shared/children-wrapper";
import SearchHeader from "../shared/search-header";

export default function ListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between border-b border-gray-200 pt-4 pb-6">
          <Suspense
            fallback={
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                Produtos
              </h1>
            }
          >
            <SearchHeader />
          </Suspense>
        </div>

        <section aria-labelledby="products-heading" className="pt-6 pb-24">
          <h2 id="products-heading" className="sr-only">
            Produtos
          </h2>

          <div className="grid grid-cols-2 gap-4 pb-6">
            <Collections />
            <CollectionFilter />
          </div>

          <div>
            <Suspense fallback={null}>
              <ChildrenWrapper>{children}</ChildrenWrapper>
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  );
}
