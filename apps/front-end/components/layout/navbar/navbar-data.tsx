// biome-ignore assist/source/organizeImports: <explanation>
import { getNavigation, getCollections } from "lib/medusa";
import { retrieveCustomer } from "lib/medusa/customer";
import { NavbarClient } from "./navbar-client";

export async function NavbarData() {
  const [navigation, customer, collections] = await Promise.all([
    getNavigation(),
    retrieveCustomer(),
    getCollections(), // ← adicionar
  ]);

  const customerData = customer
    ? {
        firstName: customer.first_name,
        lastName: customer.last_name,
      }
    : null;

  return (
    <NavbarClient
      navigation={navigation}
      customer={customerData}
      collections={collections.map((c) => ({
        name: c.title,
        handle: c.handle,
      }))}
    />
  );
}
