import { retrieveCustomer } from "lib/medusa/customer";
import { redirect } from "next/navigation";
import { RegisterForm } from "components/account/register-form";
import { AuthLayout } from "components/account/auth-layout";
import Link from "next/link";

export const metadata = {
  title: "Criar conta",
};

export default async function RegisterPage() {
  const customer = await retrieveCustomer();
  if (customer) redirect("/account");

  return (
    <AuthLayout
      heading="Crie sua conta"
      subtext={
        <>
          Já tem uma conta?{" "}
          <Link
            href="/account/login"
            className="text-brand hover:text-brand font-semibold"
          >
            Entrar
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
