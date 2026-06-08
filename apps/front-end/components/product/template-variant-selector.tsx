"use client";

import clsx from "clsx";
import { useProduct, useUpdateURL } from "components/product/product-context";

type Combination = {
  id: string;
  availableForSale: boolean;
  [key: string]: string | boolean;
};

type VariantOption = {
  id: string;
  name: string;
  values: string[];
};

type VariantSelection = {
  id: string;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
};

export function VariantSelector({
  options,
  variants,
}: {
  options: VariantOption[];
  variants: VariantSelection[];
}) {
  const { state, updateOption } = useProduct();
  const updateURL = useUpdateURL();
  const hasNoOptionsOrJustOneOption =
    !options.length ||
    (options.length === 1 && options[0]?.values.length === 1);

  if (hasNoOptionsOrJustOneOption) {
    return null;
  }

  const combinations: Combination[] = variants.map((variant) => ({
    id: variant.id,
    availableForSale: variant.availableForSale,
    ...variant.selectedOptions.reduce<Record<string, string>>(
      (accumulator, option) => {
        accumulator[option.name.toLowerCase()] = option.value;
        return accumulator;
      },
      {},
    ),
  }));

  return options.map((option) => {
    const optionNameLowerCase = option.name.toLowerCase();

    return (
      <div key={option.id} className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">
          {option.name}
        </h2>

        <div className="flex flex-wrap gap-3">
          {option.values.map((value) => {
            // Base option params on current selectedOptions so we can preserve any other param state.
            const optionParams = { ...state, [optionNameLowerCase]: value };

            // Filter out invalid options and check if the option combination is available for sale.
            const filtered = Object.entries(optionParams).filter(
              ([key, value]) =>
                options.find(
                  (option) =>
                    option.name.toLowerCase() === key &&
                    option.values.includes(value),
                ),
            );
            const isAvailableForSale = combinations.find((combination) =>
              filtered.every(
                ([key, value]) =>
                  combination[key] === value && combination.availableForSale,
              ),
            );

            // The option is active if it's in the selected options.
            const isActive = state[optionNameLowerCase] === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  const newState = updateOption(optionNameLowerCase, value);
                  updateURL(newState);
                }}
                aria-pressed={isActive}
                aria-disabled={!isAvailableForSale}
                disabled={!isAvailableForSale}
                title={`${option.name} ${value}${!isAvailableForSale ? " (Out of Stock)" : ""}`}
                className={clsx(
                  "min-w-20 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 ",
                  {
                    "border-brand bg-brand text-white shadow-sm": isActive,
                    "border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50":
                      !isActive && isAvailableForSale,
                    "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 line-through opacity-70":
                      !isAvailableForSale,
                  },
                )}
              >
                {value}
              </button>
            );
          })}
        </div>
      </div>
    );
  });
}
