/**
 * Navigation Constants
 *
 * Single source of truth for all navigation items used across
 * desktop and mobile menus. These serve as fallback values when
 * no Medusa collections are available.
 */

import { siteNavigation } from "@repo/site-config";
import type { Navigation, NavigationLink } from "lib/types";

/**
 * Default navigation structure
 * Used as fallback when no Medusa collections are available
 */
export const DEFAULT_NAVIGATION: Navigation = {
  categories: [
    {
      name: "Feminino",
      featured: [
        { name: "Pijamas", href: "/products" },
        { name: "Moda praia", href: "/products" },
        { name: "Moda íntima", href: "/products" },
      ],
      categories: [
        { name: "Camisetas básicas", href: "/products" },
        { name: "Camisetas estampadas", href: "/products" },
        { name: "Partes de baixo", href: "/products" },
        { name: "Moda íntima", href: "/products" },
        { name: "Acessórios", href: "/products" },
      ],
      collection: [
        { name: "Everything", href: "/products" },
        { name: "Core", href: "/products" },
        { name: "New Arrivals", href: "/products" },
        { name: "Sale", href: "/products" },
      ],
      brands: [
        { name: "Full Nelson", href: "/products" },
        { name: "My Way", href: "/products" },
        { name: "Re-Arranged", href: "/products" },
        { name: "Counterfeit", href: "/products" },
        { name: "Significant Other", href: "/products" },
      ],
    },
    {
      name: "Men",
      featured: [
        { name: "Casual", href: "/products" },
        { name: "Boxers", href: "/products" },
        { name: "Outdoor", href: "/products" },
      ],
      categories: [
        { name: "Artwork Tees", href: "/products" },
        { name: "Pants", href: "/products" },
        { name: "Accessories", href: "/products" },
        { name: "Boxers", href: "/products" },
        { name: "Basic Tees", href: "/products" },
      ],
      collection: [
        { name: "Everything", href: "/products" },
        { name: "Core", href: "/products" },
        { name: "New Arrivals", href: "/products" },
        { name: "Sale", href: "/products" },
      ],
      brands: [
        { name: "Full Nelson", href: "/products" },
        { name: "My Way", href: "/products" },
        { name: "Re-Arranged", href: "/products" },
        { name: "Counterfeit", href: "/products" },
        { name: "Significant Other", href: "/products" },
      ],
    },
  ],
  pages: [...siteNavigation.pages],
};

/**
 * Utility navigation items
 * Used for account, support, etc.
 */
export const UTILITY_NAV: NavigationLink[] = [...siteNavigation.utility];
