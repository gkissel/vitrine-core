"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { redactPiiFromQuery, trackClient } from "lib/analytics";
import { MEILISEARCH_ENABLED } from "lib/meilisearch";
import { createUrl } from "lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function CollectionsList({
  collections,
}: {
  collections: Array<{ name: string; handle: string }>;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const selectedCollection = searchParams.get("collection") || "";
  const isSearchPage = pathname === "/search" && MEILISEARCH_ENABLED && !!query;
  const currentCollection = isSearchPage
    ? selectedCollection
    : pathname.match(/^\/products\/([^/]+)$/)?.[1] || "";

  const currentCollectionName =
    collections.find((collection) => collection.handle === currentCollection)
      ?.name || "";

  const buildSearchHref = (overrides: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(overrides)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    return createUrl("/search", params);
  };

  const buildProductsHref = (collectionHandle: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const pathnameWithCollection = collectionHandle
      ? `/products/${collectionHandle}`
      : "/products";

    return createUrl(pathnameWithCollection, params);
  };

  return (
    <div className="space-y-3 pb-6">
      <p className="block text-lg font-normal text-gray-500">Categoria:</p>

      <Menu as="div" className="relative">
        <MenuButton className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-gray-200  px-5 py-4 text-left text-lg text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 data-open:rounded-b-none data-open:border-b-0">
          <span className="truncate">{currentCollectionName}</span>
          <ChevronDownIcon
            aria-hidden="true"
            className="ml-4 size-5 shrink-0 text-slate-500 transition-transform duration-200 group-data-open:rotate-180"
          />
        </MenuButton>

        <MenuItems
          transition
          className="absolute left-0 z-50 w-full origin-top-left overflow-hidden rounded-b-2xl border border-t-0 border-gray-200 bg-white transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
        >
          <div className="py-1">
            {collections.map((collection) => {
              const href = isSearchPage
                ? buildSearchHref({
                    collection: collection.handle || null,
                  })
                : buildProductsHref(collection.handle);
              const isActive = currentCollection === collection.handle;

              return (
                <MenuItem key={collection.name}>
                  <Link
                    href={href}
                    onClick={() => {
                      if (!isSearchPage) {
                        return;
                      }

                      trackClient("search_facet_applied", {
                        facet_type: "collection",
                        facet_value: collection.handle || "all",
                        query: redactPiiFromQuery(query),
                      });
                    }}
                    className={clsx(
                      "block px-4 py-3 text-sm text-gray-700 transition-colors data-focus:bg-gray-100 data-focus:text-gray-900",
                      isActive && "font-bold text-lg text-gray-900",
                    )}
                  >
                    {collection.name}
                  </Link>
                </MenuItem>
              );
            })}
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
}
