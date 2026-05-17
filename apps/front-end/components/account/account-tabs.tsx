"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { name: "Perfil", href: "/account" },
  { name: "Pedidos", href: "/account/orders" },
  { name: "Endereços", href: "/account/addresses" },
];

export function AccountTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Account">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={clsx(
                "border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap",
                isActive
                  ? "border-brand text-brand"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
