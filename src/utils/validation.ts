import { useCallback, useEffect, useState } from "react";
import { shallowEqual } from "react-redux";

export type FieldError = {
  error: boolean;
  helpText: string;
}
export type ErrorState = {
  [field: string]: FieldError;
}

//--
// Handles the validation of input components
export function useInputValidation(touched: any, validateFn: () => ErrorState | null) {
  const [inputErrors, setInputErrors] = useState<ErrorState>({});
  const clearInputErrors = useCallback(() => setInputErrors({}), [setInputErrors]);

  // Watch the touched fields, and clear any errors that need clearing
  useEffect(() => {
    if (!inputErrors || Object.keys(inputErrors).length === 0) return;
    const nextErrors = { ...inputErrors };

    //Enumerate the touched fields and create a list of fields that were touched
    Object.keys(touched).forEach((key: string) => {
      if ((touched as any)[key] === true && nextErrors[key]) {
        delete nextErrors[key];
      }
    }, []);

    if (!shallowEqual(inputErrors, nextErrors)) {
      setInputErrors(nextErrors);
    }
  }, [touched]);

  const validateInputs = (): ErrorState | null => {
    const validationResult = validateFn();
    setInputErrors(validationResult ?? {});
    return validationResult;
  };

  return {
    inputErrors,
    validateInputs,
    clearInputErrors,
  }
}