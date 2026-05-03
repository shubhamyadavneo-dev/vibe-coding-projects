'use client';
import Image from 'next/image';
import React, { useRef } from 'react';
import { UseFieldArrayRemove } from 'react-hook-form';
import { Trash2, Edit2, Camera } from 'lucide-react';

interface StepItemProps {
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  remove: UseFieldArrayRemove;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  onImageChange: (index: number, file: File | null) => void;
  previewUrl?: string;
}

export function StepItem({ index, register, remove, errors, onImageChange, previewUrl }: StepItemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex gap-lg group bg-surface-container-low p-md rounded-xl border border-outline-variant transition-all hover:border-primary-container">
      <div className="flex flex-col items-center gap-sm">
        <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold font-sans shadow-md">
          {index + 1}
        </div>
        <div className="w-px flex-1 bg-surface-container-highest"></div>
      </div>

      <div className="flex-1 flex flex-col gap-md">
        <div className="flex justify-between items-start gap-md">
          <div className="flex-1">
            <textarea
              {...register(`instructions.${index}.description` as const)}
              className={`w-full rounded-lg border px-md py-sm focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary transition-all outline-none bg-white ${errors.instructions?.[index]?.description ? 'border-error' : 'border-outline-variant'
                }`}
              placeholder="Describe this preparation step..."
              rows={3}
            />
            {errors.instructions?.[index]?.description && (
              <p className="text-error text-xs mt-1">Description is required</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => remove(index)}
            className="text-on-surface-variant hover:text-error p-2 rounded-full hover:bg-error-container/10 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-md">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-32 h-20 rounded-lg bg-surface-container border border-dashed border-outline-variant overflow-hidden flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-surface-container-high transition-colors group/img"
          >
            {previewUrl ? (
              <>
                <Image src={previewUrl} alt="Step preview" className="absolute inset-0 w-full h-full object-cover" width={128} height={80} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                  <Edit2 className="text-white h-5 w-5" />
                </div>
              </>
            ) : (
              <>
                <Camera className="text-on-surface-variant h-5 w-5" />
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Add Photo</span>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => onImageChange(index, e.target.files?.[0] || null)}
            />
          </div>
          <p className="text-xs text-on-surface-variant italic">Optional photo for this step</p>
        </div>
      </div>
    </div>
  );
}
