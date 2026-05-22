import { getCategories } from "lib/medusa";
import { Suspense } from "react";
import CollectionsList from "./collections-list";

async function CollectionList() {
  const categories = await getCategories();
  const categoriesWithHandles = categories.map((category) => ({
    name: category.name,
    handle: category.handle,
  }));

  return <CollectionsList collections={categoriesWithHandles} />;
}

export default function Collections() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 border-b border-gray-200 pb-6">
          <div className="h-4 w-5/6 animate-pulse rounded-sm bg-gray-200" />
          <div className="h-14 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      }
    >
      <CollectionList />
    </Suspense>
  );
}
