"use client";

import { deleteCustomerAddress } from "lib/medusa/customer";
import type { HttpTypes } from "@medusajs/types";
import { useNotification } from "components/notifications";

type AddressCardProps = {
  address: HttpTypes.StoreCustomerAddress;
  onEdit: () => void;
};

export function AddressCard({ address, onEdit }: AddressCardProps) {
  const { showNotification } = useNotification();

  async function handleDelete() {
    if (!confirm("Tem certeza de que deseja excluir este endereço?")) return;
    const error = await deleteCustomerAddress(address.id);
    if (error) {
      showNotification("error", "Erro ao deletar endereço", error);
    } else {
      showNotification("success", "Endereço deletado");
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 p-6 mb-4">
      <p className="font-medium text-gray-900">
        {address.first_name} {address.last_name}
      </p>
      {address.company && (
        <p className="mt-1 text-sm text-gray-500">{address.company}</p>
      )}
      <p className="mt-1 text-sm text-gray-500">{address.address_1}</p>
      {address.address_2 && (
        <p className="text-sm text-gray-500">{address.address_2}</p>
      )}
      <p className="text-sm text-gray-500">
        {address.city}
        {address.province ? `, ${address.province}` : ""} {address.postal_code}
      </p>
      <p className="text-sm text-gray-500 uppercase">{address.country_code}</p>
      {address.phone && (
        <p className="mt-1 text-sm text-gray-500">{address.phone}</p>
      )}

      <div className="mt-4 flex gap-4 text-sm font-medium">
        <button
          type="button"
          onClick={onEdit}
          className="text-brand hover:text-brand cursor-pointer"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="cursor-pointer text-red-600 hover:text-red-500"
        >
          Deletar
        </button>
      </div>
    </div>
  );
}
