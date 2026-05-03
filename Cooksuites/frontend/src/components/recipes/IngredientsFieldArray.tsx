'use client';
import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { ShoppingCart, Plus, X } from 'lucide-react';

interface IngredientsFieldArrayProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
}

export function IngredientsFieldArray({ control, register, errors }: IngredientsFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients"
  });

  const ingredientErrors = (errors.ingredients as unknown) as Array<Record<string, { message?: string }>> | undefined;

  const units = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'pcs'];

  return (
    <div className="flex flex-col gap-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-sm">
          <ShoppingCart className="text-primary h-6 w-6" />
          <h2 className="font-headline-md text-headline-md">Ingredients</h2>
        </div>
        <button
          type="button"
          onClick={() => append({ name: '', quantity: 1, unit: 'g' })}
          className="text-primary font-label-sm uppercase flex items-center gap-1 hover:bg-primary-container/10 px-3 py-1 rounded-full transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Ingredient
        </button>
      </div>

      <div className="space-y-sm">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-sm items-start bg-surface-container-low p-sm rounded-lg border border-outline-variant group">
            <div className="flex-grow grid grid-cols-12 gap-sm">
              {/* Ingredient Name */}
              <div className="col-span-12 md:col-span-6 flex flex-col gap-1">
                <input
                  {...register(`ingredients.${index}.name` as const)}
                  placeholder="Ingredient name (e.g. Flour)"
                  className={`w-full bg-white rounded-md border px-md py-2 text-body-md focus:ring-1 focus:ring-primary outline-none transition-all ${
                    ingredientErrors?.[index]?.name ? 'border-error' : 'border-outline-variant'
                  }`}
                />
              </div>

              {/* Quantity */}
              <div className="col-span-6 md:col-span-3 flex flex-col gap-1">
                <input
                  {...register(`ingredients.${index}.quantity` as const)}
                  type="number"
                  step="0.1"
                  placeholder="Qty"
                  className={`w-full bg-white rounded-md border px-md py-2 text-body-md focus:ring-1 focus:ring-primary outline-none transition-all ${
                    ingredientErrors?.[index]?.quantity ? 'border-error' : 'border-outline-variant'
                  }`}
                />
              </div>

              {/* Unit */}
              <div className="col-span-6 md:col-span-3 flex flex-col gap-1">
                <select
                  {...register(`ingredients.${index}.unit` as const)}
                  className="w-full bg-white rounded-md border border-outline-variant px-md py-2 text-body-md focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => remove(index)}
              className="p-2 text-on-surface-variant hover:text-error rounded-md hover:bg-error-container/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant font-body-md">
            No ingredients added yet.
          </div>
        )}
      </div>
    </div>
  );
}
