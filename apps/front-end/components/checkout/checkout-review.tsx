"use client";

import type { HttpTypes } from "@medusajs/types";
import type { Stripe, StripeElements } from "@stripe/stripe-js";

import { WhatsAppCheckoutButton } from "components/checkout/whatsapp-checkout-button";
import type { CheckoutStep } from "lib/types";

type CheckoutReviewProps = {
	cart: HttpTypes.StoreCart;
	customer?: HttpTypes.StoreCustomer | null;
	stripe: Stripe | null;
	elements: StripeElements | null;
	onEditStep: (step: CheckoutStep) => void;
};

export function CheckoutReview({ cart, customer }: CheckoutReviewProps) {
	return (
		<div className="">
			<WhatsAppCheckoutButton
				cart={cart}
				customer={customer}
				onOrderCreated={(orderId) => {
					console.log("Order created:", orderId);
				}}
			/>
		</div>
	);
}
