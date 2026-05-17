"use client";

// biome-ignore assist/source/organizeImports: import order is intentionally grouped here
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
  Bars3Icon,
  ChevronDownIcon,
  XMarkIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { AccountDropdown } from "components/account/account-dropdown";
import { Cart } from "components/cart";
import { trackClient } from "lib/analytics";
import type { Navigation } from "lib/types";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { NavbarDesktop } from "./navbar-desktop";
import Logo from "components/logo";
import Name from "components/name";

const mobileNavigationLinks = [
  { name: "Produtos", href: "/products" },
  { name: "Sobre", href: "/about" },
];

type CustomerData = {
  firstName: string | null;
  lastName: string | null;
};

type NavbarClientProps = {
  navigation: Navigation;
  customer: CustomerData | null;
};

export function NavbarClient({ navigation, customer }: NavbarClientProps) {
  const [open, setOpen] = useState(false);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Auto-close menu on navigation
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname and search params should reset the menu on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname, searchParams]);

  // Auto-close menu on resize to desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024) {
        setOpen(false);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleClose(value: boolean) {
    setOpen(value);
    if (!value) {
      setTimeout(() => {
        hamburgerButtonRef.current?.focus();
      }, 100);
    }
  }

  const brandLinks = Array.from(
    new Map(
      navigation.categories
        .flatMap((category) => category.brands)
        .map((item) => [item.href, item]),
    ).values(),
  );

  return (
    <div className="bg-white">
      {/* Mobile menu - inlined from navbar-mobile */}
      <Dialog
        open={open}
        onClose={handleClose}
        className="relative z-50 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-transparent transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />
        <div className="fixed inset-0 z-50 flex items-start justify-end p-2 sm:p-4">
          <DialogPanel
            id="mobile-menu"
            transition
            className="relative flex w-72 max-w-[calc(100vw-1rem)] transform flex-col overflow-hidden rounded-[1.75rem] bg-white px-5 py-4 shadow-[0_30px_80px_rgba(15,23,42,0.22)] transition duration-300 ease-in-out data-closed:translate-y-2 data-closed:opacity-0 sm:w-80"
          >
            <div className="flex items-center justify-between gap-4">
              <Link
                prefetch={true}
                href="/"
                className="flex items-center gap-2"
                onClick={() => handleClose(false)}
              >
                <Logo width={40} height={40} className="h-10 w-auto" />
              </Link>

              <button
                type="button"
                onClick={() => handleClose(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-900 transition-colors hover:bg-slate-50"
                aria-label="Close menu"
                data-testid="close-mobile-menu"
              >
                <XMarkIcon aria-hidden="true" className="size-5" />
              </button>
            </div>

            <div className="mt-8 flex min-h-0 flex-1 flex-col">
              <nav className="space-y-6">
                {mobileNavigationLinks.map((item) => (
                  <Link
                    key={item.name}
                    prefetch={true}
                    href={item.href}
                    onClick={() => handleClose(false)}
                    className="block text-[1.05rem] font-semibold tracking-tight text-[#4d7340] transition-colors hover:text-[#3f5f33]"
                  >
                    {item.name}
                  </Link>
                ))}

                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-2 text-[1.05rem] font-semibold tracking-tight text-[#4d7340] outline-none [&::-webkit-details-marker]:hidden">
                    Marcas
                    <ChevronDownIcon className="size-4 transition-transform duration-200 group-open:rotate-180" />
                  </summary>

                  <ul className="mt-3 space-y-3 pl-1">
                    {brandLinks.map((item) => (
                      <li key={item.name}>
                        <Link
                          prefetch={true}
                          href={item.href}
                          onClick={() => handleClose(false)}
                          className="block text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </nav>

              <div className="mt-auto pt-8">
                <Link
                  href="/contact"
                  onClick={() => handleClose(false)}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-[#4d7340] px-5 py-4 text-base font-medium text-white transition-colors hover:bg-[#3f5f33]"
                >
                  Contato
                </Link>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <header className="relative bg-white">
        <nav aria-label="Top" className="max-w-7xl mx-2">
          <div className="border rounded-md my-2 border-gray-200 px-2">
            <div className="flex h-16 items-center justify-between">
              {/* Flyout menus */}
              <NavbarDesktop navigation={navigation} />
              {/* Logo */}
              <Link
                prefetch={true}
                href="/"
                className="flex items-center gap-3"
              >
                <Logo width={40} height={40} className="h-10 w-auto" />
                <Name width={85} height={29} className="h-10 w-auto" />
              </Link>

              <div className="flex items-center justify-end">
                {/* Account */}
                <div className="lg:ml-4">
                  {customer ? (
                    <AccountDropdown
                      firstName={customer.firstName}
                      lastName={customer.lastName}
                    />
                  ) : null}
                </div>

                {/* Cart */}
                {customer ? (
                  <div className="ml-4 flow-root lg:ml-6">
                    <Suspense fallback={null}>
                      <Cart />
                    </Suspense>
                  </div>
                ) : (
                  <Link
                    href="/account/login"
                    aria-label="Access cart by logging in"
                    className="group focus-visible:outline-primary-600 ml-4 flex items-center rounded-md p-2 text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <ShoppingCartIcon
                      aria-hidden="true"
                      className="size-6 shrink-0"
                    />
                    <span className="sr-only">Login to access cart</span>
                  </Link>
                )}
                <div className="relative z-0 ml-4 flex items-center lg:hidden">
                  <button
                    ref={hamburgerButtonRef}
                    type="button"
                    onClick={() => {
                      setOpen(true);
                      trackClient("mobile_menu_opened", {});
                    }}
                    className="border border-gray-200 rounded-md focus-visible:outline-primary-600 relative -ml-2 min-h-11 min-w-11 cursor-pointer touch-manipulation bg-white p-2 text-gray-400 hover:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 active:bg-gray-100"
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    aria-label="Open main menu"
                    data-testid="hamburger"
                    style={{
                      WebkitTapHighlightColor: "transparent",
                      touchAction: "manipulation",
                    }}
                  >
                    <span className="sr-only">Open menu</span>
                    <Bars3Icon aria-hidden="true" className="size-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
