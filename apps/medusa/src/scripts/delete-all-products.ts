import type { ExecArgs } from "@medusajs/framework/types";

const BATCH_SIZE = 100;

type ProductListItem = {
	id: string;
};

type ProductService = {
	listAndCountProducts: (
		filters?: Record<string, unknown>,
		config?: { take?: number; skip?: number },
	) => Promise<[ProductListItem[], number]>;
	softDeleteProducts: (ids: string[]) => Promise<void>;
};

export default async function deleteAllProducts({ container }: ExecArgs) {
	const logger = container.resolve("logger");
	const productService = container.resolve("product") as ProductService;

	let deletedCount = 0;

	while (true) {
		const [products, totalCount] = await productService.listAndCountProducts(
			{},
			{ take: BATCH_SIZE, skip: 0 },
		);

		if (!products.length) {
			logger.info("Nenhum produto encontrado para remover.");
			break;
		}

		const ids = products.map((product) => product.id);
		await productService.softDeleteProducts(ids);
		deletedCount += ids.length;

		logger.info(
			`Removidos ${deletedCount}/${totalCount} produtos até agora...`,
		);
	}

	logger.info(`Exclusão concluída. Total removido: ${deletedCount} produto(s).`);
}