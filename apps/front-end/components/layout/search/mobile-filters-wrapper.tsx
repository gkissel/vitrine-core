import { getCategories } from "lib/medusa";
import { Suspense } from "react";
import { MobileFilters } from "./mobile-filters";

async function MobileFiltersList() {
  const categories = await getCategories();
  const categoriesWithHandles = categories.map((category) => ({
    name: category.name,
    handle: category.handle,
  }));

  return <MobileFilters collections={categoriesWithHandles} />;
}

export default function MobileFiltersWrapper() {
  return (
    <Suspense fallback={null}>
      <MobileFiltersList />
    </Suspense>
  );
}
