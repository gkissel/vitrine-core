import { Modules } from "@medusajs/framework/utils";
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk";

type WorkflowInput = {
	cart_id: string;
	customer_id?: string;
};

type CartItemInput = {
	id?: string;
	title?: string;
	quantity?: number;
	unit_price?: number | string;
	total?: number | string;
	variant_id?: string;
	product_id?: string;
	metadata?: Record<string, unknown>;
};

type ShippingMethodInput = {
	name?: string;
	amount?: number | string;
	shipping_option_id?: string;
	data?: Record<string, unknown>;
};

type CartInput = {
	id: string;
	currency_code?: string;
	email?: string | null;
	customer_id?: string | null;
	region?: {
		currency_code?: string;
	};
	shipping_address?: Record<string, unknown> | null;
	billing_address?: Record<string, unknown> | null;
	items?: CartItemInput[];
	shipping_methods?: ShippingMethodInput[];
};

type CartModuleService = {
	retrieveCart: (cartId: string, options: Record<string, unknown>) => Promise<CartInput | null>;
	updateCarts: (input: { id: string; completed_at: string }) => Promise<unknown>;
};

type OrderModuleService = {
	createOrders: (input: Record<string, unknown>) => Promise<{ id: string }>;
	deleteOrders: (orderIds: string[]) => Promise<unknown>;
};

const createOrderFromCartStep = createStep(
	"create-order-from-cart-step",
	async (input: WorkflowInput, { container }) => {
		const cartModuleService = container.resolve(Modules.CART) as CartModuleService;
		const orderModuleService = container.resolve(Modules.ORDER) as OrderModuleService;

		// Retrieve the cart with relations requ1ired to calculate totals
		const cart = await cartModuleService.retrieveCart(input.cart_id, {
			relations: ["items", "shipping_address", "billing_address", "shipping_methods"],
			select: [
				"currency_code",
				"region_id",
				"sales_channel_id",
				"total",
				"item_subtotal",
				"items.id",
				"items.title",
				"items.quantity",
				"items.unit_price",
				"items.total",
				"items.variant_id",
				"items.product_id",
				"items.metadata",
			],
		});

		if (!cart) {
			throw new Error(`Cart ${input.cart_id} não encontrado`);
		}

		const shippingAddress = cart.shipping_address
			? {
					first_name: cart.shipping_address.first_name || "",
					last_name: cart.shipping_address.last_name || "",
					address_1: cart.shipping_address.address_1 || "",
					address_2: cart.shipping_address.address_2 || "",
					city: cart.shipping_address.city || "",
					country_code: cart.shipping_address.country_code || "",
					province: cart.shipping_address.province || "",
					postal_code: cart.shipping_address.postal_code || "",
					phone: cart.shipping_address.phone || "",
				}
			: {
					first_name: "",
					last_name: "",
					address_1: "",
					address_2: "",
					city: "",
					country_code: "",
					province: "",
					postal_code: "",
					phone: "",
				};

		const billingAddress = cart.billing_address
			? {
					first_name: cart.billing_address.first_name || "",
					last_name: cart.billing_address.last_name || "",
					address_1: cart.billing_address.address_1 || "",
					address_2: cart.billing_address.address_2 || "",
					city: cart.billing_address.city || "",
					country_code: cart.billing_address.country_code || "",
					province: cart.billing_address.province || "",
					postal_code: cart.billing_address.postal_code || "",
					phone: cart.billing_address.phone || "",
				}
			: shippingAddress;

		const items = (cart.items ?? []).map((item) => {
			const quantity = Number(item.quantity ?? 0) || 0;
			// Prefer explicit unit_price, fallback to total/quantity when available
			const rawUnit = item.unit_price ?? item.total ?? 0;
			const unitPrice = Number(rawUnit) || 0;
			const fallbackUnit = quantity > 0 ? Number(item.total ?? 0) / quantity : 0;
			return {
				title: item.title ?? "",
				quantity,
				variant_id: item.variant_id ?? "",
				unit_price: unitPrice || fallbackUnit,
				product_id: item.product_id ?? "",
				metadata: item.metadata ?? undefined,
			};
		});

		const shipping_methods = (cart.shipping_methods ?? []).map((sm) => ({
			name: sm?.name ?? "",
			amount: Number(sm?.amount ?? 0) || 0,
			shipping_option_id: sm?.shipping_option_id ?? "",
			data: sm?.data ?? {},
		}));

		const order = await orderModuleService.createOrders({
			currency_code: cart.currency_code || cart.region?.currency_code || "brl",
			email: cart.email || undefined,
			customer_id: cart.customer_id || input.customer_id || undefined,
			region_id: (cart as unknown as Record<string, unknown>).region_id as string | undefined,
			sales_channel_id: (cart as unknown as Record<string, unknown>).sales_channel_id as string | undefined,
			status: "pending",
			shipping_address: shippingAddress,
			billing_address: billingAddress,
			items,
			shipping_methods,
		});

		// Mark the source cart as completed so it won't be reused
		try {
			await cartModuleService.updateCarts({ id: cart.id, completed_at: new Date().toISOString() });
		} catch (err) {
			const logger = container.resolve("logger") as { warn?: (payload: unknown, message: string) => void };
			if (logger && typeof logger.warn === "function") {
				logger.warn({ err }, "Failed to mark cart as completed after creating order");
			}
		}

		return new StepResponse({ order }, order.id);
	},
	async (orderId, { container }) => {
		if (!orderId) return;
		const orderModuleService = container.resolve(Modules.ORDER) as OrderModuleService;
		await orderModuleService.deleteOrders([orderId]);
	},
);

export const createOrderFromCartWorkflow = createWorkflow("create-order-from-cart", (input: WorkflowInput) => {
	const { order } = createOrderFromCartStep(input);
	return new WorkflowResponse({ order });
});
