import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "@medusajs/framework/zod";
import { completeCartWorkflow } from "@medusajs/medusa/core-flows";

export const completeWhatsAppOrderRequestSchema = z.object({
	cart_id: z.string(),
	customer_name: z.string().optional(),
	delivery_address: z.string().optional(),
});

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
	const parseResult = completeWhatsAppOrderRequestSchema.safeParse(req.body);

	if (!parseResult.success) {
		res.status(400).json({ error: parseResult.error.errors });
		return;
	}

	const { cart_id } = parseResult.data;

	if (!cart_id) {
		res.status(400).json({ error: "cart_id is required" });
		return;
	}

	const { result } = await completeCartWorkflow(req.scope).run({
		input: { id: cart_id },
	});

	res.json({
		order_id: result.id,
	});
}
