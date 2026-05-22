"use client";

import type { HttpTypes } from "@medusajs/types";
import type { Stripe, StripeElements } from "@stripe/stripe-js";
import { useState } from "react";

import type { CheckoutStep } from "lib/types";

type CheckoutReviewProps = {
  cart: HttpTypes.StoreCart;
  stripe: Stripe | null;
  elements: StripeElements | null;
  onEditStep: (step: CheckoutStep) => void;
};

function hasRequiredCheckoutInfo(cart: HttpTypes.StoreCart): boolean {
  const shippingAddress = cart.shipping_address;

  return Boolean(
    cart.email &&
    shippingAddress?.address_1 &&
    shippingAddress?.city &&
    shippingAddress?.country_code,
  );
}

export function CheckoutReview({ cart }: CheckoutReviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  async function handlePlaceOrder() {
    setError(null);
    setIsSubmitting(true);

    try {
      if (!hasRequiredCheckoutInfo(cart)) {
        setError(
          "Preencha o email e o endereço de entrega antes de finalizar.",
        );
        return;
      }

      setIsOrderPlaced(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isOrderPlaced) {
    return (
      <p className="mt-6 text-sm font-medium text-green-700">Pedido Feito</p>
    );
  }

  return (
    <div className="">
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="">
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
          className="bg-brand hover:bg-brand focus:ring-brand w-full cursor-pointer rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        >
          {isSubmitting ? "Fazendo pedido..." : "Fazer pedido"}
        </button>
      </div>
    </div>
  );
}
