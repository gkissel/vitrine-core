"use client";

import { updateCustomer, type ActionResult } from "lib/medusa/customer";
import type { HttpTypes } from "@medusajs/types";
import { useActionState, useEffect, useRef } from "react";
import { useNotification } from "components/notifications";

type ProfileFormProps = {
  customer: HttpTypes.StoreCustomer;
};

export function ProfileForm({ customer }: ProfileFormProps) {
  const [result, formAction, isPending] = useActionState<
    ActionResult,
    FormData
  >(updateCustomer, null);
  const { showNotification } = useNotification();
  const prevResultRef = useRef(result);

  useEffect(() => {
    if (result !== prevResultRef.current) {
      if (result?.success) {
        showNotification("success", "Perfil atualizado");
      }
      prevResultRef.current = result;
    }
  }, [result, showNotification]);

  return (
    <form action={formAction}>
      <div className="space-y-8 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:border-t-gray-900/10">
        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
          <label
            htmlFor="first_name"
            className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5"
          >
            Nome
          </label>
          <div className="mt-2 sm:col-span-2 sm:mt-0">
            <input
              id="first_name"
              type="text"
              name="first_name"
              defaultValue={customer.first_name || ""}
              autoComplete="given-name"
              className="focus:outline-brand block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 sm:max-w-xs sm:text-sm/6"
            />
          </div>
        </div>

        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
          <label
            htmlFor="last_name"
            className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5"
          >
            Sobrenome
          </label>
          <div className="mt-2 sm:col-span-2 sm:mt-0">
            <input
              id="last_name"
              type="text"
              name="last_name"
              defaultValue={customer.last_name || ""}
              autoComplete="family-name"
              className="focus:outline-brand block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 sm:max-w-xs sm:text-sm/6"
            />
          </div>
        </div>

        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
          {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
          <label className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5">
            Email
          </label>
          <div className="mt-2 sm:col-span-2 sm:mt-0">
            <p className="py-1.5 text-sm/6 text-gray-500">{customer.email}</p>
          </div>
        </div>

        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
          <label
            htmlFor="phone"
            className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5"
          >
            Telefone
          </label>
          <div className="mt-2 sm:col-span-2 sm:mt-0">
            <input
              id="phone"
              type="tel"
              name="phone"
              defaultValue={customer.phone || ""}
              autoComplete="tel"
              className="focus:outline-brand block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 sm:max-w-xs sm:text-sm/6"
            />
          </div>
        </div>
      </div>

      {result?.error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{result.error}</p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          disabled={isPending}
          className="bg-brand hover:bg-brand-500 focus-visible:outline-brand cursor-pointer rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
