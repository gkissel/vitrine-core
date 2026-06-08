"use client";

import { removeItem } from "components/cart/actions";
import { useActionState } from "react";

export function RemoveItemButton({ lineItemId }: { lineItemId: string }) {
  const [message, formAction, isPending] = useActionState(removeItem, null);

  return (
    <form action={() => formAction(lineItemId)}>
      <button
        type="submit"
        disabled={isPending}
        className="text-brand hover:text-brand cursor-pointer font-medium"
      >
        {isPending ? "Removendo..." : "Remover"}
      </button>
      {message && (
        <p
          role="status"
          aria-live="polite"
          className="mt-1 text-xs text-red-600"
        >
          {message}
        </p>
      )}
    </form>
  );
}
