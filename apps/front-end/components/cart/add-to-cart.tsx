"use client";

import { PlusIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { addItem } from "components/cart/actions";
import { useCart } from "components/cart/cart-context";
import { useProduct } from "components/product/product-context";
import type { Product, ProductVariant } from "lib/types";
import { useActionState } from "react";

function SubmitButton({
  availableForSale,
  selectedVariantId,
  className,
  label = "Adicionar ao carrinho",
}: {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
  className?: string;
  label?: string;
}) {
  const defaultClasses =
    "relative flex w-full items-center justify-center rounded-full bg-brand p-4 tracking-wide text-white";
  const buttonClasses = className || defaultClasses;
  const disabledClasses = "cursor-not-allowed opacity-60 hover:opacity-60";

  if (!availableForSale) {
    return (
      <button
        type="submit"
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        <div className="flex items-center gap-2">
          <ShoppingCartIcon className="h-5 w-5" />
          Fora de estoque
        </div>
      </button>
    );
  }

  if (!selectedVariantId) {
    return (
      <button
        type="submit"
        aria-label="Por favor selecione uma opção"
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        {!className && (
          <div className="absolute left-0 ml-4">
            <PlusIcon className="h-5" />
          </div>
        )}
        <div className="flex items-center gap-2">
          <ShoppingCartIcon className="h-5 w-5" />
          {label}
        </div>
      </button>
    );
  }

  return (
    <button
      type="submit"
      aria-label="Adicionar ao carrinho"
      className={clsx(buttonClasses, {
        "cursor-pointer hover:opacity-90": !className,
      })}
    >
      {!className && (
        <div className="absolute left-0 ml-4">
          <PlusIcon className="h-5" />
        </div>
      )}
      <div className="flex items-left gap-2">
        {label}
        <ShoppingCartIcon className="h-5 w-5" />
      </div>
    </button>
  );
}

export function AddToCart({
  product,
  className,
  formClassName,
  label,
}: {
  product: Product;
  className?: string;
  formClassName?: string;
  label?: string;
}) {
  const { variants, availableForSale } = product;
  const { addCartItem } = useCart();
  const { state: productState } = useProduct();
  const [message, formAction] = useActionState(addItem, null);

  const optionKeys = new Set(
    product.options.map((option) => option.name.toLowerCase()),
  );
  const selectedOptionState = Object.fromEntries(
    Object.entries(productState).filter(([key]) => optionKeys.has(key)),
  );

  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) =>
        option.value === selectedOptionState[option.name.toLowerCase()],
    ),
  );
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const addItemAction = formAction.bind(null, selectedVariantId);
  const finalVariant = selectedVariantId
    ? variants.find((variant) => variant.id === selectedVariantId)
    : undefined;

  return (
    <form
      className={formClassName || "w-full"}
      action={async () => {
        if (!finalVariant) return;
        addCartItem(finalVariant, product);
        addItemAction();
      }}
    >
      <SubmitButton
        availableForSale={availableForSale}
        selectedVariantId={selectedVariantId}
        className={className}
        label={label}
      />
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
}
