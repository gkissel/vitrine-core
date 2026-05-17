"use client";

import {
  addCustomerAddress,
  updateCustomerAddress,
  type ActionResult,
} from "lib/medusa/customer";
import type { HttpTypes } from "@medusajs/types";
import { useActionState, useEffect, useRef } from "react";
import { useNotification } from "components/notifications";

type AddressFormProps = {
  address?: HttpTypes.StoreCustomerAddress;
  onClose: () => void;
};

export function AddressForm({ address, onClose }: AddressFormProps) {
  const isEditing = Boolean(address);
  const action = isEditing ? updateCustomerAddress : addCustomerAddress;
  const submitLabel = isEditing ? "Atualizar endereço" : "Adicionar endereço";
  const { showNotification } = useNotification();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [result, formAction, isPending] = useActionState<
    ActionResult,
    FormData
  >(action, null);

  const prevResultRef = useRef(result);

  useEffect(() => {
    if (result !== prevResultRef.current) {
      if (result?.success) {
        showNotification(
          "success",
          isEditing ? "Address updated" : "Address added",
        );
        onCloseRef.current();
      }
      prevResultRef.current = result;
    }
  }, [result, showNotification, isEditing]);

  return (
    <form action={formAction} className="space-y-6">
      {result?.error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{result.error}</p>
        </div>
      )}

      {address && <input type="hidden" name="address_id" value={address.id} />}

      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label
            htmlFor="first_name"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Nome
          </label>
          <div className="mt-2">
            <input
              id="first_name"
              type="text"
              name="first_name"
              required
              defaultValue={address?.first_name || ""}
              autoComplete="given-name"
              className="focus:outline-brand block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor="last_name"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Sobrenome
          </label>
          <div className="mt-2">
            <input
              id="last_name"
              type="text"
              name="last_name"
              required
              defaultValue={address?.last_name || ""}
              autoComplete="family-name"
              className="focus:outline-brand block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
            />
          </div>
        </div>

        <div className="col-span-full">
          <label
            htmlFor="company"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Empresa <span className="text-gray-400">(opcional)</span>
          </label>
          <div className="mt-2">
            <input
              id="company"
              type="text"
              name="company"
              defaultValue={address?.company || ""}
              autoComplete="organization"
              className="focus:outline-brand block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
            />
          </div>
        </div>

        <div className="col-span-full">
          <label
            htmlFor="address_1"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Endereço
          </label>
          <div className="mt-2">
            <input
              id="address_1"
              type="text"
              name="address_1"
              required
              defaultValue={address?.address_1 || ""}
              autoComplete="address-line1"
              className="focus:outline-brand block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
            />
          </div>
        </div>

        <div className="col-span-full">
          <label
            htmlFor="address_2"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Endereço 2 <span className="text-gray-400">(opcional)</span>
          </label>
          <div className="mt-2">
            <input
              id="address_2"
              type="text"
              name="address_2"
              defaultValue={address?.address_2 || ""}
              autoComplete="address-line2"
              className="focus:outline-brand block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
            />
          </div>
        </div>

        <div className="sm:col-span-2 sm:col-start-1">
          <label
            htmlFor="city"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Cidade
          </label>
          <div className="mt-2">
            <input
              id="city"
              type="text"
              name="city"
              required
              defaultValue={address?.city || ""}
              autoComplete="address-level2"
              className="focus:outline-brand block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="province"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Estado
          </label>
          <div className="mt-2">
            <input
              id="province"
              type="text"
              name="province"
              defaultValue={address?.province || ""}
              autoComplete="address-level1"
              className="focus:outline-brand block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="postal_code"
            className="block text-sm/6 font-medium text-gray-900"
          >
            CEP
          </label>
          <div className="mt-2">
            <input
              id="postal_code"
              type="text"
              name="postal_code"
              required
              defaultValue={address?.postal_code || ""}
              autoComplete="postal-code"
              className="focus:outline-brand block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor="country_code"
            className="block text-sm/6 font-medium text-gray-900"
          >
            País
          </label>
          <div className="mt-2">
            <select
              id="country_code"
              name="country_code"
              required
              defaultValue={address?.country_code || "us"}
              autoComplete="country"
              className="focus:outline-brand block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 sm:max-w-xs sm:text-sm/6"
            >
              <option value="br">Brasil</option>
              <option value="us">Estados Unidos</option>
              <option value="ca">Canadá</option>
              <option value="gb">Reino Unido</option>
              <option value="au">Austrália</option>
              <option value="de">Alemanha</option>
              <option value="fr">França</option>
              <option value="it">Itália</option>
              <option value="es">Espanha</option>
              <option value="nl">Países Baixos</option>
              <option value="jp">Japão</option>
              <option value="mx">México</option>
            </select>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor="phone"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Telefone <span className="text-gray-400">(optional)</span>
          </label>
          <div className="mt-2">
            <input
              id="phone"
              type="tel"
              name="phone"
              defaultValue={address?.phone || ""}
              autoComplete="tel"
              className="focus:outline-brand block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 sm:max-w-xs sm:text-sm/6"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer text-sm/6 font-semibold text-gray-900"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="bg-brand hover:bg-brand-500 focus-visible:outline-brand cursor-pointer rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
