import { Squares2X2Icon } from "@heroicons/react/20/solid";
import Collections from "components/layout/search/collections";
import MobileFiltersWrapper from "components/layout/search/mobile-filters-wrapper";
import { SortFilter } from "components/layout/search/sort-filter";
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

          <div className="pb-6 lg:hidden">
            <Collections />
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
            <div className="hidden lg:block">
              <Collections />
            </div>

            <div className="lg:col-span-3">
              <Suspense fallback={null}>
                <ChildrenWrapper>{children}</ChildrenWrapper>
              </Suspense>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
