"use server";

import * as Sentry from "@sentry/nextjs";
import { sdk } from "lib/medusa";
import { getAuthHeaders, removeCartId } from "lib/medusa/cookies";

export type CompleteWhatsAppCheckoutResult = {
	order_id: string;
	whatsapp_number: string;
	message: string;
};

export type WhatsAppCheckoutError = {
	error: string;
};

/**
 * Completes the cart via WhatsApp checkout and returns the order info
 * along with the pre-formatted WhatsApp message and store number.
 */
export async function completeWhatsAppCheckout(
	cartId: string,
	customerName: string,
	deliveryAddress: string,
): Promise<CompleteWhatsAppCheckoutResult | WhatsAppCheckoutError> {
	const headers = await getAuthHeaders();

	try {
		const data = await sdk.client.fetch<CompleteWhatsAppCheckoutResult>("/store/whatsapp-checkout/complete", {
			method: "POST",
			headers,
			body: {
				cart_id: cartId,
				customer_name: customerName,
				delivery_address: deliveryAddress,
			},
		});

		// Clear the cart cookie so the storefront picks up that the cart is concluded
		try {
			await removeCartId();
		} catch {}

		return data;
	} catch (error) {
		Sentry.captureException(error, {
			tags: { action: "complete_whatsapp_checkout" },
		});

		const message =
			error instanceof Error
				? error.message
				: "Não foi possível registrar o pedido. Tente novamente ou entre em contato.";

		return { error: message };
	}
}
