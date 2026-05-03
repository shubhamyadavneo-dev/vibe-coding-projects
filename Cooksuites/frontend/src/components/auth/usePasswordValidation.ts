import { useState, useEffect } from 'react';

export function usePasswordValidation(password: string) {
  const [validations, setValidations] = useState({
    hasMinLength: false,
    hasNumberOrSymbol: false,
    hasUpperCase: false,
    isValid: false,
  });

  useEffect(() => {
    const hasMinLength = password.length >= 8;
    const hasNumberOrSymbol = /[\d!@#$%^&*()_+\[\]{}|;:'",.<>?/~`\\]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const isValid = hasMinLength && hasNumberOrSymbol && hasUpperCase;

    setValidations({
      hasMinLength,
      hasNumberOrSymbol,
      hasUpperCase,
      isValid,
    });
  }, [password]);

  return validations;
}
