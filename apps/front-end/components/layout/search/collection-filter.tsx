import { getCollections } from "lib/medusa";
import { Suspense } from "react";
import CollectionsList from "./collections-list";

async function CollectionFilterList() {
  const collections = await getCollections();
  const collectionsWithHandles = collections.map((collection) => ({
    name: collection.title,
    handle: collection.handle,
  }));

  return (
    <CollectionsList
      label="Coleções"
      collections={collectionsWithHandles}
      facetType="collection"
      queryParam="collection"
    />
  );
}

export default function CollectionFilter() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 border-b border-gray-200 pb-6">
          <div className="h-4 w-5/6 animate-pulse rounded-sm bg-gray-200" />
          <div className="h-14 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      }
    >
      <CollectionFilterList />
    </Suspense>
  );
}
