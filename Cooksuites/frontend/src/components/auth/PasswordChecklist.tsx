import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, Circle } from 'lucide-react';
import { usePasswordValidation } from './usePasswordValidation';

interface PasswordChecklistProps {
  validations: ReturnType<typeof usePasswordValidation>;
}

export function PasswordChecklist({ validations }: PasswordChecklistProps) {
  const requirements = [
    {
      label: 'At least 8 characters',
      isValid: validations.hasMinLength,
    },
    {
      label: 'Includes a number or symbol',
      isValid: validations.hasNumberOrSymbol,
    },
    {
      label: 'One uppercase letter',
      isValid: validations.hasUpperCase,
    },
  ];

  return (
    <div className="p-md bg-surface-container-low rounded-lg space-y-xs transition-colors duration-300">
      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm">
        Requirements
      </p>
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center gap-sm">
          {req.isValid ? (
            <CheckCircle2 className="h-4 w-4 text-primary fill-primary/20" />
          ) : (
            <Circle className="h-4 w-4 text-outline-variant" />
          )}
          <span
            className={clsx(
              "font-label-sm text-label-sm transition-colors duration-300",
              req.isValid ? "text-on-surface" : "text-on-surface-variant"
            )}
          >
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
}
