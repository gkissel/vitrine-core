import { retrieveCustomer } from "lib/medusa/customer";
import { ProfileForm } from "components/account/profile-form";

export const metadata = {
  title: "Minha conta",
};

export default async function AccountPage() {
  const customer = await retrieveCustomer();

  // Layout guard handles redirect — customer is always non-null here
  if (!customer) return null;

  return (
    <div>
      <h2 className="text-base/7 font-semibold text-gray-900">
        Informações pessoais
      </h2>
      <p className="mt-1 max-w-2xl text-sm/6 text-gray-600">
        Atualize seu nome e seus dados de contato.
      </p>
      <div className="mt-10">
        <ProfileForm customer={customer} />
      </div>
    </div>
  );
}
