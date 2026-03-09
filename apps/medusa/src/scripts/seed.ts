import type { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils";
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import {
	createApiKeysWorkflow,
	createInventoryLevelsWorkflow,
	createProductCategoriesWorkflow,
	createProductsWorkflow,
	createRegionsWorkflow,
	createSalesChannelsWorkflow,
	createShippingOptionsWorkflow,
	createShippingProfilesWorkflow,
	createStockLocationsWorkflow,
	createTaxRegionsWorkflow,
	linkSalesChannelsToApiKeyWorkflow,
	linkSalesChannelsToStockLocationWorkflow,
	updateStoresStep,
	updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import type { ApiKey } from "../../.medusa/types/query-entry-points";

const updateStoreCurrencies = createWorkflow(
	"update-store-currencies",
	(input: { supported_currencies: { currency_code: string; is_default?: boolean }[]; store_id: string }) => {
		const normalizedInput = transform({ input }, (data) => {
			return {
				selector: { id: data.input.store_id },
				update: {
					supported_currencies: data.input.supported_currencies.map((currency) => ({
						currency_code: currency.currency_code,
						is_default: currency.is_default ?? false,
					})),
				},
			};
		});

		const stores = updateStoresStep(normalizedInput);

		return new WorkflowResponse(stores);
	},
);

function assertExists<T>(value: T | null | undefined, message: string): T {
	if (value == null) {
		throw new Error(message);
	}

	return value;
}

function buildProductMetadata(input: {
	ptBR: { title: string; description: string };
	en: { title: string; description: string };
	es: { title: string; description: string };
}) {
	return {
		market: "BR",
		segment: "erva-mate",
		languages: ["pt-BR", "en", "es"],
		translations: {
			"pt-BR": input.ptBR,
			en: input.en,
			es: input.es,
		},
	};
}

export default async function seedDemoData({ container }: ExecArgs) {
	const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
	const link = container.resolve(ContainerRegistrationKeys.LINK);
	const query = container.resolve(ContainerRegistrationKeys.QUERY);
	const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
	const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
	const storeModuleService = container.resolve(Modules.STORE);

	const countries = ["br"];

	logger.info("Seeding dados da loja Brasil...");
	const [store] = await storeModuleService.listStores();
	const currentStore = assertExists(store, "Nenhuma loja encontrada para executar o seed.");

	let salesChannels = await salesChannelModuleService.listSalesChannels({
		name: "Canal de Vendas Brasil",
	});

	if (!salesChannels.length) {
		const { result } = await createSalesChannelsWorkflow(container).run({
			input: {
				salesChannelsData: [
					{
						name: "Canal de Vendas Brasil",
					},
				],
			},
		});

		salesChannels = result;
	}

	const salesChannel = assertExists(salesChannels[0], "Canal de vendas padrão não encontrado.");

	await updateStoreCurrencies(container).run({
		input: {
			store_id: currentStore.id,
			supported_currencies: [
				{
					currency_code: "brl",
					is_default: true,
				},
			],
		},
	});

	await updateStoresWorkflow(container).run({
		input: {
			selector: { id: currentStore.id },
			update: {
				default_sales_channel_id: salesChannel.id,
			},
		},
	});

	logger.info("Seeding região Brasil...");
	const { result: regionResult } = await createRegionsWorkflow(container).run({
		input: {
			regions: [
				{
					name: "Brasil",
					currency_code: "brl",
					countries,
					payment_providers: ["pp_system_default"],
				},
			],
		},
	});

	const region = assertExists(regionResult[0], "Região Brasil não foi criada.");

	logger.info("Finished seeding region.");

	logger.info("Seeding tax regions...");
	await createTaxRegionsWorkflow(container).run({
		input: countries.map((country_code) => ({
			country_code,
			provider_id: "tp_system",
		})),
	});
	logger.info("Finished seeding tax regions.");

	logger.info("Seeding stock location data...");
	const { result: stockLocationResult } = await createStockLocationsWorkflow(container).run({
		input: {
			locations: [
				{
					name: "Centro de Distribuição Curitiba",
					address: {
						city: "Curitiba",
						country_code: "BR",
						address_1: "Rua do Mate, 100",
					},
				},
			],
		},
	});

	const stockLocation = assertExists(stockLocationResult[0], "Local de estoque não foi criado.");

	await updateStoresWorkflow(container).run({
		input: {
			selector: { id: currentStore.id },
			update: {
				default_location_id: stockLocation.id,
			},
		},
	});

	await link.create({
		[Modules.STOCK_LOCATION]: {
			stock_location_id: stockLocation.id,
		},
		[Modules.FULFILLMENT]: {
			fulfillment_provider_id: "manual_manual",
		},
	});

	logger.info("Seeding fulfillment data...");
	const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
		type: "default",
	});

	let shippingProfile = shippingProfiles[0] ?? null;

	if (!shippingProfile) {
		const { result } = await createShippingProfilesWorkflow(container).run({
			input: {
				data: [
					{
						name: "Perfil de Frete Padrão Brasil",
						type: "default",
					},
				],
			},
		});

		shippingProfile = assertExists(result[0], "Perfil de frete não foi criado.");
	}

	const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
		name: "Entrega Nacional Brasil",
		type: "shipping",
		service_zones: [
			{
				name: "Cobertura Brasil",
				geo_zones: [
					{
						country_code: "br",
						type: "country",
					},
				],
			},
		],
	});

	const serviceZone = assertExists(fulfillmentSet.service_zones[0], "Zona de serviço não encontrada.");

	await link.create({
		[Modules.STOCK_LOCATION]: {
			stock_location_id: stockLocation.id,
		},
		[Modules.FULFILLMENT]: {
			fulfillment_set_id: fulfillmentSet.id,
		},
	});

	await createShippingOptionsWorkflow(container).run({
		input: [
			{
				name: "Entrega Padrão",
				price_type: "flat",
				provider_id: "manual_manual",
				service_zone_id: serviceZone.id,
				shipping_profile_id: shippingProfile.id,
				type: {
					label: "Padrão",
					description: "Entrega em 3 a 7 dias úteis.",
					code: "entrega-padrao",
				},
				prices: [
					{
						currency_code: "brl",
						amount: 1990,
					},
					{
						region_id: region.id,
						amount: 1990,
					},
				],
				rules: [
					{
						attribute: "enabled_in_store",
						value: "true",
						operator: "eq",
					},
					{
						attribute: "is_return",
						value: "false",
						operator: "eq",
					},
				],
			},
			{
				name: "Entrega Expressa",
				price_type: "flat",
				provider_id: "manual_manual",
				service_zone_id: serviceZone.id,
				shipping_profile_id: shippingProfile.id,
				type: {
					label: "Expressa",
					description: "Entrega em até 2 dias úteis.",
					code: "entrega-expressa",
				},
				prices: [
					{
						currency_code: "brl",
						amount: 3990,
					},
					{
						region_id: region.id,
						amount: 3990,
					},
				],
				rules: [
					{
						attribute: "enabled_in_store",
						value: "true",
						operator: "eq",
					},
					{
						attribute: "is_return",
						value: "false",
						operator: "eq",
					},
				],
			},
		],
	});

	logger.info("Finished seeding fulfillment data.");

	await linkSalesChannelsToStockLocationWorkflow(container).run({
		input: {
			id: stockLocation.id,
			add: [salesChannel.id],
		},
	});

	logger.info("Finished seeding stock location data.");

	logger.info("Seeding publishable API key data...");
	let publishableApiKey: ApiKey | null = null;

	const { data } = await query.graph({
		entity: "api_key",
		fields: ["id"],
		filters: {
			type: "publishable",
		},
	});

	publishableApiKey = (data?.[0] as ApiKey | undefined) ?? null;

	if (!publishableApiKey) {
		const { result } = await createApiKeysWorkflow(container).run({
			input: {
				api_keys: [
					{
						title: "Loja Erva Mate Brasil",
						type: "publishable",
						created_by: "",
					},
				],
			},
		});

		publishableApiKey = assertExists(result[0] as ApiKey | undefined, "API key publishable não foi criada.");
	}

	await linkSalesChannelsToApiKeyWorkflow(container).run({
		input: {
			id: publishableApiKey.id,
			add: [salesChannel.id],
		},
	});

	logger.info("Finished seeding publishable API key data.");

	logger.info("Seeding product data...");

	const { result: categoryResult } = await createProductCategoriesWorkflow(container).run({
		input: {
			product_categories: [
				{
					name: "Tradicional",
					is_active: true,
				},
				{
					name: "Compostas",
					is_active: true,
				},
				{
					name: "Orgânica",
					is_active: true,
				},
				{
					name: "Acessórios",
					is_active: true,
				},
			],
		},
	});

	const getCategoryId = (name: string) => {
		const category = categoryResult.find((item) => item.name === name);

		return assertExists(category, `Categoria "${name}" não encontrada.`).id;
	};

	await createProductsWorkflow(container).run({
		input: {
			products: [
				{
					title: "Erva-Mate Tradicional Chimarrão",
					category_ids: [getCategoryId("Tradicional")],
					description:
						"Erva-mate tradicional brasileira, ideal para chimarrão, com sabor intenso e moagem equilibrada.",
					handle: "erva-mate-tradicional-chimarrao",
					weight: 1000,
					status: ProductStatus.PUBLISHED,
					shipping_profile_id: shippingProfile.id,
					metadata: buildProductMetadata({
						ptBR: {
							title: "Erva-Mate Tradicional Chimarrão",
							description:
								"Erva-mate tradicional brasileira, ideal para chimarrão, com sabor intenso e moagem equilibrada.",
						},
						en: {
							title: "Traditional Yerba Mate for Chimarrão",
							description:
								"Traditional Brazilian yerba mate, ideal for chimarrão, with a rich flavor and balanced grind.",
						},
						es: {
							title: "Yerba Mate Tradicional para Chimarrão",
							description:
								"Yerba mate brasileña tradicional, ideal para chimarrão, con sabor intenso y molienda equilibrada.",
						},
					}),
					options: [
						{
							title: "Peso",
							values: ["500g", "1kg"],
						},
					],
					variants: [
						{
							title: "500g",
							sku: "ERVA-TRAD-500G",
							options: {
								Peso: "500g",
							},
							prices: [
								{
									amount: 1890,
									currency_code: "brl",
								},
							],
						},
						{
							title: "1kg",
							sku: "ERVA-TRAD-1KG",
							options: {
								Peso: "1kg",
							},
							prices: [
								{
									amount: 3290,
									currency_code: "brl",
								},
							],
						},
					],
					sales_channels: [
						{
							id: salesChannel.id,
						},
					],
				},
				{
					title: "Erva-Mate Composta com Menta",
					category_ids: [getCategoryId("Compostas")],
					description: "Blend de erva-mate com menta, refrescante e aromático, ideal para consumo diário.",
					handle: "erva-mate-composta-menta",
					weight: 1000,
					status: ProductStatus.PUBLISHED,
					shipping_profile_id: shippingProfile.id,
					metadata: buildProductMetadata({
						ptBR: {
							title: "Erva-Mate Composta com Menta",
							description: "Blend de erva-mate com menta, refrescante e aromático, ideal para consumo diário.",
						},
						en: {
							title: "Yerba Mate Blend with Mint",
							description: "A refreshing and aromatic yerba mate blend with mint, ideal for everyday consumption.",
						},
						es: {
							title: "Yerba Mate Compuesta con Menta",
							description: "Mezcla de yerba mate con menta, refrescante y aromática, ideal para el consumo diario.",
						},
					}),
					options: [
						{
							title: "Peso",
							values: ["500g", "1kg"],
						},
					],
					variants: [
						{
							title: "500g",
							sku: "ERVA-MENTA-500G",
							options: {
								Peso: "500g",
							},
							prices: [
								{
									amount: 2190,
									currency_code: "brl",
								},
							],
						},
						{
							title: "1kg",
							sku: "ERVA-MENTA-1KG",
							options: {
								Peso: "1kg",
							},
							prices: [
								{
									amount: 3790,
									currency_code: "brl",
								},
							],
						},
					],
					sales_channels: [
						{
							id: salesChannel.id,
						},
					],
				},
				{
					title: "Erva-Mate Orgânica Premium",
					category_ids: [getCategoryId("Orgânica")],
					description: "Erva-mate orgânica selecionada, de alta qualidade, com perfil suave e fresco.",
					handle: "erva-mate-organica-premium",
					weight: 1000,
					status: ProductStatus.PUBLISHED,
					shipping_profile_id: shippingProfile.id,
					metadata: buildProductMetadata({
						ptBR: {
							title: "Erva-Mate Orgânica Premium",
							description: "Erva-mate orgânica selecionada, de alta qualidade, com perfil suave e fresco.",
						},
						en: {
							title: "Premium Organic Yerba Mate",
							description: "Selected organic yerba mate of high quality, with a smooth and fresh profile.",
						},
						es: {
							title: "Yerba Mate Orgánica Premium",
							description: "Yerba mate orgánica seleccionada, de alta calidad, con un perfil suave y fresco.",
						},
					}),
					options: [
						{
							title: "Peso",
							values: ["500g", "1kg"],
						},
					],
					variants: [
						{
							title: "500g",
							sku: "ERVA-ORG-500G",
							options: {
								Peso: "500g",
							},
							prices: [
								{
									amount: 2490,
									currency_code: "brl",
								},
							],
						},
						{
							title: "1kg",
							sku: "ERVA-ORG-1KG",
							options: {
								Peso: "1kg",
							},
							prices: [
								{
									amount: 4290,
									currency_code: "brl",
								},
							],
						},
					],
					sales_channels: [
						{
							id: salesChannel.id,
						},
					],
				},
				{
					title: "Kit Chimarrão Iniciante",
					category_ids: [getCategoryId("Acessórios")],
					description: "Kit para iniciar no chimarrão com cuia, bomba e acessórios essenciais.",
					handle: "kit-chimarrao-iniciante",
					weight: 1500,
					status: ProductStatus.PUBLISHED,
					shipping_profile_id: shippingProfile.id,
					metadata: buildProductMetadata({
						ptBR: {
							title: "Kit Chimarrão Iniciante",
							description: "Kit para iniciar no chimarrão com cuia, bomba e acessórios essenciais.",
						},
						en: {
							title: "Beginner Chimarrão Kit",
							description: "Starter kit for chimarrão with gourd, straw, and essential accessories.",
						},
						es: {
							title: "Kit Inicial de Chimarrão",
							description: "Kit para empezar con el chimarrão con mate, bombilla y accesorios esenciales.",
						},
					}),
					options: [
						{
							title: "Modelo",
							values: ["Cuia + Bomba", "Kit Completo"],
						},
					],
					variants: [
						{
							title: "Cuia + Bomba",
							sku: "KIT-CHIMARRAO-BASIC",
							options: {
								Modelo: "Cuia + Bomba",
							},
							prices: [
								{
									amount: 6990,
									currency_code: "brl",
								},
							],
						},
						{
							title: "Kit Completo",
							sku: "KIT-CHIMARRAO-COMPLETE",
							options: {
								Modelo: "Kit Completo",
							},
							prices: [
								{
									amount: 12990,
									currency_code: "brl",
								},
							],
						},
					],
					sales_channels: [
						{
							id: salesChannel.id,
						},
					],
				},
			],
		},
	});

	logger.info("Finished seeding product data.");

	logger.info("Seeding inventory levels...");

	const { data: inventoryItems } = await query.graph({
		entity: "inventory_item",
		fields: ["id"],
	});

	const inventoryLevels: CreateInventoryLevelInput[] = [];

	for (const inventoryItem of inventoryItems) {
		inventoryLevels.push({
			location_id: stockLocation.id,
			stocked_quantity: 1000000,
			inventory_item_id: inventoryItem.id,
		});
	}

	await createInventoryLevelsWorkflow(container).run({
		input: {
			inventory_levels: inventoryLevels,
		},
	});

	logger.info("Finished seeding inventory levels data.");
}
