import { retrieveCustomer } from "lib/medusa/customer";
import { redirect } from "next/navigation";
import { AccountTabs } from "components/account/account-tabs";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await retrieveCustomer();
  if (!customer) redirect("/account/login");

  return (
    <div className="bg-neutral-50 text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Minha conta
        </h1>
        <div className="mt-4">
          <AccountTabs />
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
