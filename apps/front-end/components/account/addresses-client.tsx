"use client";

import type { HttpTypes } from "@medusajs/types";
import { useState } from "react";
import { AddressCard } from "./address-card";
import { AddressForm } from "./address-form";

type AddressesClientProps = {
  addresses: HttpTypes.StoreCustomerAddress[];
};

export function AddressesClient({ addresses }: AddressesClientProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div>
      {showAddForm && (
        <div className="mb-4 rounded-lg border border-gray-200 p-6">
          <h3 className="mb-4 text-sm font-medium text-gray-900">
            Novo endereço
          </h3>
          <AddressForm onClose={() => setShowAddForm(false)} />
        </div>
      )}

      {addresses.length === 0 && !showAddForm ? (
        <div className="mb-10 text-center">
          <p className="text-sm text-gray-500">
            Você ainda não tem nenhum endereço salvo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) =>
            editingId === address.id ? (
              <div
                key={address.id}
                className="rounded-lg border border-gray-200 p-6"
              >
                <h3 className="mb-4 text-sm font-medium text-gray-900">
                  Editar endereço
                </h3>
                <AddressForm
                  address={address}
                  onClose={() => setEditingId(null)}
                />
              </div>
            ) : (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => {
                  setEditingId(address.id);
                  setShowAddForm(false);
                }}
              />
            ),
          )}
        </div>
      )}
      {!showAddForm && (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
            }}
            className="bg-brand cursor-pointer rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline-offset-2"
          >
            Adicionar novo endereço
          </button>
        </div>
      )}
    </div>
  );
}
