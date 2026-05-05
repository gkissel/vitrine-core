import type {
  CreateInventoryLevelInput,
  ExecArgs,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  createRefundReasonsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import type { ApiKey } from "../../.medusa/types/query-entry-points";

const BATCH_SIZE = 10;

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            },
          ),
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

const refundReasonsPtBR = [
  {
    code: "produto_danificado",
    label: "Produto danificado",
    description: "O produto chegou danificado ao cliente.",
  },
  {
    code: "item_incorreto",
    label: "Item incorreto",
    description: "O cliente recebeu um item diferente do pedido.",
  },
  {
    code: "cliente_mudou_de_ideia",
    label: "Cliente mudou de ideia",
    description: "O cliente desistiu da compra antes da conclusão.",
  },
  {
    code: "experiencia_de_compra_ruim",
    label: "Experiência de compra ruim",
    description: "O cliente teve uma experiência ruim ao comprar.",
  },
] as const;

type GraphQuery = {
  graph: (args: {
    entity: string;
    fields?: string[];
    filters?: Record<string, unknown>;
  }) => Promise<{ data?: Array<{ code?: string | null }> }>;
};

async function seedRefundReasons(
  container: ExecArgs["container"],
  query: GraphQuery,
) {
  const existingRefundReasons = await query.graph({
    entity: "refund_reason",
    fields: ["code"],
  });

  const existingCodes = new Set(
    (existingRefundReasons.data ?? [])
      .map((reason) => reason?.code)
      .filter((code): code is string => typeof code === "string"),
  );

  const data = refundReasonsPtBR.filter(
    (reason) => !existingCodes.has(reason.code),
  );

  if (!data.length) {
    return;
  }

  await createRefundReasonsWorkflow(container).run({
    input: {
      data: data.map((reason) => ({
        code: reason.code,
        label: reason.label,
        description: reason.description,
      })),
    },
  });
}

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);

  const countries = ["br"];

  // ---------------------------------------------------------------------------
  // Store & Sales Channel
  // ---------------------------------------------------------------------------
  logger.info("Configurando loja Aurea RS...");
  const [store] = await storeModuleService.listStores();
  const currentStore = assertExists(
    store,
    "Nenhuma loja encontrada para executar o seed.",
  );

  let salesChannels = await salesChannelModuleService.listSalesChannels({
    name: "Canal de Vendas Aurea RS",
  });

  if (!salesChannels.length) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          {
            name: "Canal de Vendas Aurea RS",
          },
        ],
      },
    });

    salesChannels = result;
  }

  const salesChannel = assertExists(
    salesChannels[0],
    "Canal de vendas não encontrado.",
  );

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
        name: "Aurea RS - Erva Mate",
      },
    },
  });

  logger.info("Configurando motivos de reembolso...");
  await seedRefundReasons(container, query);
  logger.info("Motivos de reembolso configurados.");

  // ---------------------------------------------------------------------------
  // Region — Brasil (BRL)
  // ---------------------------------------------------------------------------
  logger.info("Configurando região Brasil...");
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
  logger.info("Região configurada.");

  // ---------------------------------------------------------------------------
  // Tax Regions
  // ---------------------------------------------------------------------------
  logger.info("Configurando regiões fiscais...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Regiões fiscais configuradas.");

  // ---------------------------------------------------------------------------
  // Stock Location — Aurea RS
  // ---------------------------------------------------------------------------
  logger.info("Configurando local de estoque...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container,
  ).run({
    input: {
      locations: [
        {
          name: "Centro de Distribuição Aurea",
          address: {
            city: "Aurea",
            country_code: "BR",
            address_1: "Rua Principal, 100",
            province: "RS",
            postal_code: "99840-000",
          },
        },
      ],
    },
  });

  const stockLocation = assertExists(
    stockLocationResult[0],
    "Local de estoque não foi criado.",
  );

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

  // ---------------------------------------------------------------------------
  // Fulfillment — Brasil
  // ---------------------------------------------------------------------------
  logger.info("Configurando dados de envio...");
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

    shippingProfile = assertExists(
      result[0],
      "Perfil de frete não foi criado.",
    );
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

  const serviceZone = assertExists(
    fulfillmentSet.service_zones[0],
    "Zona de serviço não encontrada.",
  );

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
  logger.info("Dados de envio configurados.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [salesChannel.id],
    },
  });
  logger.info("Local de estoque vinculado ao canal de vendas.");

  // ---------------------------------------------------------------------------
  // Publishable API Key
  // ---------------------------------------------------------------------------
  logger.info("Configurando chave de API publicável...");
  let publishableApiKey: ApiKey | null = null;

  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id"],
    filters: {
      type: "publishable",
    },
  });

  publishableApiKey = data?.[0];

  if (!publishableApiKey) {
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Aurea RS - Loja de Erva Mate",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });

    const { data } = await query.graph({
      entity: "api_key",
      filters: {
        id: result[0]?.id,
      },
      fields: ["*"],
    });

    publishableApiKey = assertExists(
      data[0],
      "API key publicável não foi criada.",
    );
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [salesChannel.id],
    },
  });
  logger.info("Chave de API configurada.");

  // ---------------------------------------------------------------------------
  // Product Categories
  // ---------------------------------------------------------------------------
  logger.info("Criando categorias de produtos...");
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container,
  ).run({
    input: {
      product_categories: [
        {
          name: "Chimarrão Tradicional",
          is_active: true,
        },
        {
          name: "Chimarrão Premium",
          is_active: true,
        },
        {
          name: "Compostos e Aromáticas",
          is_active: true,
        },
        {
          name: "Tereré",
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

  // ---------------------------------------------------------------------------
  // Collections — Marcas
  // ---------------------------------------------------------------------------
  logger.info("Criando coleções das marcas...");
  const { result: collectionResult } = await createCollectionsWorkflow(
    container,
  ).run({
    input: {
      collections: [
        {
          title: "Seiva Verde",
          handle: "seiva-verde",
          metadata: {
            description:
              "Marca tradicional gaúcha com mais de 30 anos de história. Erva-mate de qualidade superior, cultivada nas terras do Rio Grande do Sul.",
            origin: "Aurea, RS",
          },
        },
        {
          title: "Luxo Gaúcho",
          handle: "luxo-gaucho",
          metadata: {
            description:
              "Erva-mate premium de seleção especial. Sabor marcante e tradição gaúcha em cada cuia.",
            origin: "Aurea, RS",
          },
        },
        {
          title: "Goma Verde",
          handle: "goma-verde",
          metadata: {
            description:
              "Erva-mate nativa com moagem média, sabor intenso e aroma marcante. Produto 100% natural sem adição de açúcar.",
            origin: "Aurea, RS",
          },
        },
      ],
    },
  });

  const getCollectionId = (title: string) => {
    const collection = collectionResult.find((item) => item.title === title);

    return assertExists(collection, `Coleção "${title}" não encontrada.`).id;
  };

  // ---------------------------------------------------------------------------
  // Products — Erva Mate
  // ---------------------------------------------------------------------------
  logger.info("Criando produtos de erva-mate...");

  const productsData = [
    // Seiva Verde
    {
      title: "Erva-Mate Seiva Verde Nativa Tradicional",
      collection: "Seiva Verde",
      category: "Chimarrão Tradicional",
      description:
        "Erva-mate nativa tradicional da marca Seiva Verde. Sabor autêntico gaúcho, moagem equilibrada e cor verde viva. Produto cultivado nas terras de Aurea, RS.",
      handle: "seiva-verde-nativa-tradicional",
      weight: 1000,
      options: [{ title: "Peso", values: ["500g", "1kg"] }],
      variants: [
        {
          title: "500g",
          sku: "SEIVA-NAT-500G",
          options: { Peso: "500g" },
          prices: [{ amount: 1290, currency_code: "brl" }],
        },
        {
          title: "1kg",
          sku: "SEIVA-NAT-1KG",
          options: { Peso: "1kg" },
          prices: [{ amount: 2190, currency_code: "brl" }],
        },
      ],
      metadata: buildProductMetadata({
        ptBR: {
          title: "Erva-Mate Seiva Verde Nativa Tradicional",
          description:
            "Erva-mate nativa tradicional da marca Seiva Verde. Sabor autêntico gaúcho, moagem equilibrada e cor verde viva.",
        },
        en: {
          title: "Seiva Verde Native Traditional Yerba Mate",
          description:
            "Traditional native yerba mate from Seiva Verde brand. Authentic gaucho flavor, balanced grind and vivid green color.",
        },
        es: {
          title: "Yerba Mate Nativa Tradicional Seiva Verde",
          description:
            "Yerba mate nativa tradicional de la marca Seiva Verde. Sabor auténtico gaucho, molienda equilibrada y color verde vivo.",
        },
      }),
    },
    {
      title: "Erva-Mate Seiva Verde Suave com Açúcar",
      collection: "Seiva Verde",
      category: "Chimarrão Tradicional",
      description:
        "Erva-mate Seiva Verde com adição de açúcar para um sabor mais suave. Ideal para quem prefere um chimarrão menos amargo.",
      handle: "seiva-verde-suave-acucar",
      weight: 1000,
      options: [{ title: "Peso", values: ["500g", "1kg"] }],
      variants: [
        {
          title: "500g",
          sku: "SEIVA-SUA-500G",
          options: { Peso: "500g" },
          prices: [{ amount: 1390, currency_code: "brl" }],
        },
        {
          title: "1kg",
          sku: "SEIVA-SUA-1KG",
          options: { Peso: "1kg" },
          prices: [{ amount: 2390, currency_code: "brl" }],
        },
      ],
      metadata: buildProductMetadata({
        ptBR: {
          title: "Erva-Mate Seiva Verde Suave com Açúcar",
          description:
            "Erva-mate Seiva Verde com adição de açúcar para um sabor mais suave. Ideal para quem prefere um chimarrão menos amargo.",
        },
        en: {
          title: "Seiva Verde Smooth Yerba Mate with Sugar",
          description:
            "Seiva Verde yerba mate with added sugar for a smoother taste. Ideal for those who prefer a less bitter chimarrão.",
        },
        es: {
          title: "Yerba Mate Suave con Azúcar Seiva Verde",
          description:
            "Yerba mate Seiva Verde con adición de azúcar para un sabor más suave. Ideal para quien prefiere un chimarrón menos amargo.",
        },
      }),
    },
    {
      title: "Erva-Mate Seiva Verde à Vácuo",
      collection: "Seiva Verde",
      category: "Chimarrão Premium",
      description:
        "Erva-mate Seiva Verde em embalagem à vácuo para maior conservação. Mantém o sabor e a cor verde por mais tempo.",
      handle: "seiva-verde-vacuo",
      weight: 1000,
      options: [{ title: "Peso", values: ["1kg"] }],
      variants: [
        {
          title: "1kg",
          sku: "SEIVA-VAC-1KG",
          options: { Peso: "1kg" },
          prices: [{ amount: 2490, currency_code: "brl" }],
        },
      ],
      metadata: buildProductMetadata({
        ptBR: {
          title: "Erva-Mate Seiva Verde à Vácuo",
          description:
            "Erva-mate Seiva Verde em embalagem à vácuo para maior conservação. Mantém o sabor e a cor verde por mais tempo.",
        },
        en: {
          title: "Seiva Verde Vacuum Packed Yerba Mate",
          description:
            "Seiva Verde yerba mate in vacuum packaging for better preservation. Keeps the flavor and green color longer.",
        },
        es: {
          title: "Yerba Mate al Vacío Seiva Verde",
          description:
            "Yerba mate Seiva Verde en envase al vacío para mayor conservación. Mantiene el sabor y el color verde por más tiempo.",
        },
      }),
    },
    // Luxo Gaúcho
    {
      title: "Erva-Mate Luxo Gaúcho Premium",
      collection: "Luxo Gaúcho",
      category: "Chimarrão Premium",
      description:
        "Erva-mate premium de seleção especial Luxo Gaúcho. Sabor marcante no começo e suave ao final. Para quem valoriza a qualidade no chimarrão.",
      handle: "luxo-gaucho-premium",
      weight: 1000,
      options: [{ title: "Peso", values: ["500g", "1kg"] }],
      variants: [
        {
          title: "500g",
          sku: "LUXO-PRE-500G",
          options: { Peso: "500g" },
          prices: [{ amount: 1590, currency_code: "brl" }],
        },
        {
          title: "1kg",
          sku: "LUXO-PRE-1KG",
          options: { Peso: "1kg" },
          prices: [{ amount: 2790, currency_code: "brl" }],
        },
      ],
      metadata: buildProductMetadata({
        ptBR: {
          title: "Erva-Mate Luxo Gaúcho Premium",
          description:
            "Erva-mate premium de seleção especial Luxo Gaúcho. Sabor marcante no começo e suave ao final.",
        },
        en: {
          title: "Luxo Gaúcho Premium Yerba Mate",
          description:
            "Premium selected yerba mate Luxo Gaúcho. Strong flavor at first and smooth at the end.",
        },
        es: {
          title: "Yerba Mate Premium Luxo Gaúcho",
          description:
            "Yerba mate premium de selección especial Luxo Gaúcho. Sabor marcante al principio y suave al final.",
        },
      }),
    },
    {
      title: "Erva-Mate Luxo Gaúcho Tradicional",
      collection: "Luxo Gaúcho",
      category: "Chimarrão Tradicional",
      description:
        "Erva-mate Luxo Gaúcho Tradicional com sabor suave do início ao final. Cor sempre verde e excelente espuma na cuia.",
      handle: "luxo-gaucho-tradicional",
      weight: 1000,
      options: [{ title: "Peso", values: ["500g", "1kg"] }],
      variants: [
        {
          title: "500g",
          sku: "LUXO-TRA-500G",
          options: { Peso: "500g" },
          prices: [{ amount: 1390, currency_code: "brl" }],
        },
        {
          title: "1kg",
          sku: "LUXO-TRA-1KG",
          options: { Peso: "1kg" },
          prices: [{ amount: 2390, currency_code: "brl" }],
        },
      ],
      metadata: buildProductMetadata({
        ptBR: {
          title: "Erva-Mate Luxo Gaúcho Tradicional",
          description:
            "Erva-mate Luxo Gaúcho Tradicional com sabor suave do início ao final. Cor sempre verde e excelente espuma.",
        },
        en: {
          title: "Luxo Gaúcho Traditional Yerba Mate",
          description:
            "Luxo Gaúcho Traditional yerba mate with smooth flavor from start to finish. Always green color and excellent foam.",
        },
        es: {
          title: "Yerba Mate Tradicional Luxo Gaúcho",
          description:
            "Yerba mate Tradicional Luxo Gaúcho con sabor suave de principio a fin. Color siempre verde y excelente espuma.",
        },
      }),
    },
    // Goma Verde
    {
      title: "Erva-Mate Goma Verde Nativa",
      collection: "Goma Verde",
      category: "Chimarrão Tradicional",
      description:
        "Erva-mate Goma Verde Nativa, produzida com folhas selecionadas. Moagem média, sabor intenso e aroma marcante. Sem adição de açúcar.",
      handle: "goma-verde-nativa",
      weight: 1000,
      options: [{ title: "Peso", values: ["500g", "1kg"] }],
      variants: [
        {
          title: "500g",
          sku: "GOMA-NAT-500G",
          options: { Peso: "500g" },
          prices: [{ amount: 1490, currency_code: "brl" }],
        },
        {
          title: "1kg",
          sku: "GOMA-NAT-1KG",
          options: { Peso: "1kg" },
          prices: [{ amount: 2590, currency_code: "brl" }],
        },
      ],
      metadata: buildProductMetadata({
        ptBR: {
          title: "Erva-Mate Goma Verde Nativa",
          description:
            "Erva-mate Goma Verde Nativa, produzida com folhas selecionadas. Moagem média, sabor intenso e aroma marcante.",
        },
        en: {
          title: "Goma Verde Native Yerba Mate",
          description:
            "Goma Verde Native yerba mate, produced with selected leaves. Medium grind, intense flavor and striking aroma.",
        },
        es: {
          title: "Yerba Mate Nativa Goma Verde",
          description:
            "Yerba mate Nativa Goma Verde, producida con hojas seleccionadas. Molienda media, sabor intenso y aroma marcante.",
        },
      }),
    },
    {
      title: "Erva-Mate Goma Verde Premium",
      collection: "Goma Verde",
      category: "Chimarrão Premium",
      description:
        "Erva-mate Goma Verde Premium, a escolha perfeita para uma experiência autêntica. Folhas selecionadas, sabor puro da erva.",
      handle: "goma-verde-premium",
      weight: 1000,
      options: [{ title: "Peso", values: ["1kg"] }],
      variants: [
        {
          title: "1kg",
          sku: "GOMA-PRE-1KG",
          options: { Peso: "1kg" },
          prices: [{ amount: 2990, currency_code: "brl" }],
        },
      ],
      metadata: buildProductMetadata({
        ptBR: {
          title: "Erva-Mate Goma Verde Premium",
          description:
            "Erva-mate Goma Verde Premium, a escolha perfeita para uma experiência autêntica. Folhas selecionadas, sabor puro.",
        },
        en: {
          title: "Goma Verde Premium Yerba Mate",
          description:
            "Goma Verde Premium yerba mate, the perfect choice for an authentic experience. Selected leaves, pure flavor.",
        },
        es: {
          title: "Yerba Mate Premium Goma Verde",
          description:
            "Yerba mate Premium Goma Verde, la elección perfecta para una experiencia auténtica. Hojas seleccionadas, sabor puro.",
        },
      }),
    },
    // Compostos
    {
      title: "Erva-Mate Composta com Menta",
      collection: "Seiva Verde",
      category: "Compostos e Aromáticas",
      description:
        "Blend de erva-mate com menta, refrescante e aromático. Ideal para consumo diário e momentos de relaxamento.",
      handle: "erva-composta-menta",
      weight: 1000,
      options: [{ title: "Peso", values: ["500g", "1kg"] }],
      variants: [
        {
          title: "500g",
          sku: "COMP-MEN-500G",
          options: { Peso: "500g" },
          prices: [{ amount: 1590, currency_code: "brl" }],
        },
        {
          title: "1kg",
          sku: "COMP-MEN-1KG",
          options: { Peso: "1kg" },
          prices: [{ amount: 2790, currency_code: "brl" }],
        },
      ],
      metadata: buildProductMetadata({
        ptBR: {
          title: "Erva-Mate Composta com Menta",
          description:
            "Blend de erva-mate com menta, refrescante e aromático. Ideal para consumo diário.",
        },
        en: {
          title: "Yerba Mate Blend with Mint",
          description:
            "Refreshing and aromatic yerba mate blend with mint. Ideal for daily consumption.",
        },
        es: {
          title: "Yerba Mate Compuesta con Menta",
          description:
            "Mezcla de yerba mate con menta, refrescante y aromática. Ideal para el consumo diario.",
        },
      }),
    },
    // Tereré
    {
      title: "Erva-Mate para Tereré Natural",
      collection: "Goma Verde",
      category: "Tereré",
      description:
        "Erva-mate especial para tereré. Sabor natural refrescante, perfeita para dias quentes. Moagem fina ideal para água gelada.",
      handle: "terere-natural",
      weight: 500,
      options: [{ title: "Peso", values: ["500g"] }],
      variants: [
        {
          title: "500g",
          sku: "TERE-NAT-500G",
          options: { Peso: "500g" },
          prices: [{ amount: 1290, currency_code: "brl" }],
        },
      ],
      metadata: buildProductMetadata({
        ptBR: {
          title: "Erva-Mate para Tereré Natural",
          description:
            "Erva-mate especial para tereré. Sabor natural refrescante, perfeita para dias quentes.",
        },
        en: {
          title: "Natural Tereré Yerba Mate",
          description:
            "Special yerba mate for tereré. Refreshing natural flavor, perfect for hot days.",
        },
        es: {
          title: "Yerba Mate para Tereré Natural",
          description:
            "Yerba mate especial para tereré. Sabor natural refrescante, perfecta para días calurosos.",
        },
      }),
    },
    // Acessórios
    {
      title: "Kit Chimarrão Iniciante",
      collection: "Luxo Gaúcho",
      category: "Acessórios",
      description:
        "Kit completo para iniciar no chimarrão com cuia, bomba e erva-mate Luxo Gaúcho 500g. Tudo o que você precisa para começar.",
      handle: "kit-chimarrao-iniciante",
      weight: 1500,
      options: [{ title: "Modelo", values: ["Básico", "Completo"] }],
      variants: [
        {
          title: "Básico",
          sku: "KIT-CHIM-BASIC",
          options: { Modelo: "Básico" },
          prices: [{ amount: 5990, currency_code: "brl" }],
        },
        {
          title: "Completo",
          sku: "KIT-CHIM-COMP",
          options: { Modelo: "Completo" },
          prices: [{ amount: 9990, currency_code: "brl" }],
        },
      ],
      metadata: buildProductMetadata({
        ptBR: {
          title: "Kit Chimarrão Iniciante",
          description:
            "Kit completo para iniciar no chimarrão com cuia, bomba e erva-mate.",
        },
        en: {
          title: "Beginner Chimarrão Kit",
          description:
            "Complete starter kit for chimarrão with gourd, straw and yerba mate.",
        },
        es: {
          title: "Kit Inicial de Chimarrão",
          description:
            "Kit completo para empezar con el chimarrão con mate, bombilla y yerba mate.",
        },
      }),
    },
  ];

  for (let i = 0; i < productsData.length; i += BATCH_SIZE) {
    const batch = productsData.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(productsData.length / BATCH_SIZE);

    logger.info(
      `  Criando lote de produtos ${batchNum}/${totalBatches} (${batch.length} produtos)...`,
    );

    const products = batch.map((product) => {
      const collectionId = getCollectionId(product.collection);
      const categoryId = getCategoryId(product.category);

      const variants = product.variants.map((variant) => ({
        title: variant.title,
        sku: variant.sku,
        options: variant.options,
        prices: variant.prices.map((p) => ({
          currency_code: p.currency_code,
          amount: p.amount,
        })),
        manage_inventory: true,
      }));

      return {
        title: product.title,
        handle: product.handle,
        description: product.description,
        status: ProductStatus.PUBLISHED,
        weight: product.weight,
        variants,
        collection_id: collectionId,
        category_ids: [categoryId],
        shipping_profile_id: shippingProfile.id,
        sales_channels: [{ id: salesChannel.id }],
        options: product.options,
        metadata: product.metadata,
      };
    });

    await createProductsWorkflow(container).run({
      input: {
        products: products,
      },
    });
  }
  logger.info("Produtos criados com sucesso.");

  // ---------------------------------------------------------------------------
  // Inventory Levels
  // ---------------------------------------------------------------------------
  logger.info("Configurando níveis de estoque...");

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

  logger.info("Níveis de estoque configurados.");
  logger.info("Seed da Aurea RS finalizado com sucesso!");
}
