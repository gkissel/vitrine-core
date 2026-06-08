import { retrieveCustomer } from "lib/medusa/customer";
import { redirect } from "next/navigation";
import { LoginForm } from "components/account/login-form";
import { AuthLayout } from "components/account/auth-layout";
import Link from "next/link";

export const metadata = {
  title: "Entrar",
};

export default async function LoginPage() {
  const customer = await retrieveCustomer();
  if (customer) redirect("/account");

  return (
    <AuthLayout
      heading="Entre na sua conta"
      subtext={
        <>
          Ainda não tem uma conta?{" "}
          <Link
            href="/account/register"
            className="text-brand hover:text-brand font-semibold"
          >
            Criar conta
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
