import { siteBrand } from "@repo/site-config";
import Link from "next/link";
import { Suspense } from "react";
import FooterCopyright from "./footer-copyright";
import { FooterNavigation } from "./footer-navigation";
import { FooterSocialLinks } from "./footer-social-links";
import { FooterNewsletter } from "./footer-newsletter";
import { retrieveCustomer } from "lib/medusa/customer";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import Logo from "components/logo";
import Name from "@/components/name";
import { FaFacebook, FaInstagram } from "react-icons/fa";

const companyName = process.env.COMPANY_NAME?.trim() || siteBrand.companyName;
const companyEmail =
  process.env.SITE_COMPANY_EMAIL?.trim() || "ervamate@ervinha.com.br";
const companyPhone = process.env.SITE_COMPANY_PHONE?.trim() || "(54) 3254-1132";
const facebookHref =
  process.env.SOCIAL_FACEBOOK?.trim() ||
  "https://www.facebook.com/?locale=pt_BR";
const instagramHref =
  process.env.SOCIAL_INSTAGRAM?.trim() || "https://www.instagram.com/";
const mobileNavigationLinks = [
  { name: "Início", href: "/#top" },
  { name: "Sobre nós", href: "/about" },
  { name: "Eventos", href: "/faq" },
  { name: "Nossos GT's", href: "/products" },
];

// Loading skeleton for navigation sections
const NavigationSkeleton = () => (
  <div className="col-span-6 mt-10 grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8 md:col-start-3 md:row-start-1 md:mt-0 lg:col-span-6 lg:col-start-2">
    <div className="grid grid-cols-1 gap-y-12 sm:col-span-2 sm:grid-cols-2 sm:gap-x-8">
      <div className="space-y-6">
        <div className="h-4 w-20 animate-pulse rounded-sm bg-gray-200" />
        <div className="space-y-4">
          <div className="h-3 w-24 animate-pulse rounded-sm bg-gray-200" />
          <div className="h-3 w-24 animate-pulse rounded-sm bg-gray-200" />
          <div className="h-3 w-24 animate-pulse rounded-sm bg-gray-200" />
          <div className="h-3 w-24 animate-pulse rounded-sm bg-gray-200" />
          <div className="h-3 w-24 animate-pulse rounded-sm bg-gray-200" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="h-4 w-20 animate-pulse rounded-sm bg-gray-200" />
        <div className="space-y-4">
          <div className="h-3 w-24 animate-pulse rounded-sm bg-gray-200" />
          <div className="h-3 w-24 animate-pulse rounded-sm bg-gray-200" />
          <div className="h-3 w-24 animate-pulse rounded-sm bg-gray-200" />
        </div>
      </div>
    </div>
    <div className="space-y-6">
      <div className="h-4 w-12 animate-pulse rounded-sm bg-gray-200" />
      <div className="space-y-4">
        <div className="h-3 w-24 animate-pulse rounded-sm bg-gray-200" />
        <div className="h-3 w-24 animate-pulse rounded-sm bg-gray-200" />
        <div className="h-3 w-24 animate-pulse rounded-sm bg-gray-200" />
        <div className="h-3 w-24 animate-pulse rounded-sm bg-gray-200" />
        <div className="h-3 w-24 animate-pulse rounded-sm bg-gray-200" />
      </div>
    </div>
  </div>
);

async function NewsletterWithCustomer() {
  const customer = await retrieveCustomer().catch(() => null);
  return <FooterNewsletter customerEmail={customer?.email} />;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-200 py-8 md:py-20">
          <div className="md:hidden">
            <div className="space-y-10 text-left">
              <div className="flex items-center gap-3 pb-2">
                <Logo width={40} height={40} className="h-10 w-auto" />
                <Name width={85} height={29} className="h-10 w-auto" />
              </div>

              <section>
                <h3 className="text-[15px] font-bold text-gray-900">Navegar</h3>
                <ul className="mt-5 space-y-4 text-[17px] leading-6 text-gray-900">
                  {mobileNavigationLinks.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="transition-colors hover:text-gray-700"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-[15px] font-bold text-gray-900">
                  Redes Sociais
                </h3>
                <div className="mt-5">
                  <div className="flex items-center gap-5">
                    {facebookHref ? (
                      <a
                        href={facebookHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                        className="inline-flex text-black transition-colors hover:text-black"
                      >
                        <FaFacebook className="size-5" />
                      </a>
                    ) : (
                      <span className="inline-flex text-black" title="Facebook">
                        <FaFacebook className="size-5" />
                      </span>
                    )}
                    {instagramHref ? (
                      <a
                        href={instagramHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="inline-flex text-black transition-colors hover:text-black"
                      >
                        <FaInstagram className="size-5" />
                      </a>
                    ) : (
                      <span
                        className="inline-flex text-black"
                        title="Instagram"
                      >
                        <FaInstagram className="size-5" />
                      </span>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[15px] font-bold text-gray-900">Contato</h3>
                <address className="mt-5 not-italic text-[15px] leading-7 text-gray-900">
                  <div className="flex items-start gap-3">
                    <MailIcon className="mt-1 size-5 shrink-0 text-gray-900" />
                    <a
                      href={`mailto:${companyEmail}`}
                      className="transition-colors hover:text-gray-700"
                    >
                      {companyEmail}
                    </a>
                  </div>
                  <div className="mt-3 flex items-start gap-3">
                    <PhoneIcon className="mt-1 size-5 shrink-0 text-gray-900" />
                    <a
                      href={`tel:${companyPhone.replace(/[^\d+]/g, "")}`}
                      className="transition-colors hover:text-gray-700"
                    >
                      {companyPhone}
                    </a>
                  </div>
                  <div className="mt-3 flex items-start gap-3">
                    <MapPinIcon className="mt-1 size-5 shrink-0 text-gray-900" />
                    <span>
                      Rodovia PR 412, 2152 - Balneário Canoas
                      <br />
                      CEP 83255-000 - Pontal do Paraná - PR - Brasil
                    </span>
                  </div>
                </address>
              </section>

              <p className="pt-2 text-[13px] leading-5 text-gray-500">
                © {currentYear} {companyName} | Todos os direitos reservados
              </p>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="grid grid-cols-1 md:grid-flow-col md:auto-rows-min md:grid-cols-12 md:gap-x-8 md:gap-y-16">
              {/* Image section */}
              <div className="flex h-16 items-center gap-2">
                {/* Desktop brand lockup */}
                <Logo width={40} height={40} className="h-10 w-auto" />
                <Name width={85} height={29} className="h-10 w-auto" />
              </div>

              {/* Sitemap sections with Suspense */}
              <Suspense fallback={<NavigationSkeleton />}>
                <FooterNavigation />
              </Suspense>

              {/* Newsletter section */}
              <Suspense fallback={<FooterNewsletter />}>
                <NewsletterWithCustomer />
              </Suspense>
            </div>
          </div>
        </div>

        <div className="hidden border-t border-gray-100 py-10 text-center md:block">
          <FooterSocialLinks className="justify-center" />
          <Suspense
            fallback={
              <div className="h-4 w-20 animate-pulse rounded-sm bg-gray-200" />
            }
          >
            <FooterCopyright companyName={companyName} />
          </Suspense>
        </div>
      </div>
    </footer>
  );
}
