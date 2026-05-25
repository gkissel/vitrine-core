import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { completeCartWorkflow } from "@medusajs/medusa/core-flows";

type CompleteWhatsAppOrderBody = {
	cart_id: string;
	customer_name: string;
	delivery_address: string;
};

/**
 * POST /store/whatsapp-checkout/complete
 *
 * Completes the Medusa cart (creates an Order) and returns the order ID.
 * Called by the WhatsApp checkout button plugin before opening the WhatsApp link.
 *
 * Body:
 *   cart_id          - the active cart ID
 *   customer_name    - customer's name (stored in order metadata)
 *   delivery_address - delivery address as plain text (stored in order metadata)
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
	const { cart_id, customer_name, delivery_address } = req.body as CompleteWhatsAppOrderBody;

	if (!cart_id) {
		res.status(400).json({ error: "cart_id is required" });
		return;
	}

	const { result } = await completeCartWorkflow(req.scope).run({
		input: { id: cart_id },
	});

	res.json({
		order_id: result.id,
		customer_name: customer_name ?? null,
		delivery_address: delivery_address ?? null,
	});
}
1;
