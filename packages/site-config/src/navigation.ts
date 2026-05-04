export type SiteNavigationLink = {
	href: string;
	name: string;
};

export type SiteNavigationConfig = {
	pages: SiteNavigationLink[];
	utility: SiteNavigationLink[];
};

export const siteNavigation: SiteNavigationConfig = {
	pages: [
		// Template placeholders; downstream sites can replace these with real routes.
		{ href: "/search", name: "Empresa" },
		{ href: "/search", name: "Lojas" },
	],
	utility: [
		{ href: "/account", name: "Conta" },
		{ href: "/support", name: "Suporte" },
	],
};
