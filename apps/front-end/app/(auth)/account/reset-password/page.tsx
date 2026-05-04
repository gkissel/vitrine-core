import { AuthLayout } from "components/account/auth-layout";
import { ResetPasswordForm } from "components/account/reset-password-form";

export const metadata = { title: "Redefinir senha" };

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string; email?: string }>;
};

// No retrieveCustomer() guard — logged-in users clicking a reset link from email
// should still be able to reset their password (unlike login/register/forgot-password).
export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token, email } = await searchParams;
  if (!token || !email) {
    return (
      <AuthLayout
        heading="Link de redefinição inválido"
        subtext="O link para redefinir a senha é inválido ou expirou."
      >
        <div />
      </AuthLayout>
    );
  }
  return (
    <AuthLayout
      heading="Defina uma nova senha"
      subtext={
        <>
          Informe sua nova senha para{" "}
          <span className="font-medium text-gray-900">{email}</span>
        </>
      }
    >
      <ResetPasswordForm token={token} email={email} />
    </AuthLayout>
  );
}
