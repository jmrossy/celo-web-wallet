import { useCallback, useEffect, useState } from "react";
import { shallowEqual } from "react-redux";

export type FieldError = {
  error: boolean;
  helpText: string;
}
export type ErrorState = {
  [field: string]: FieldError | boolean;
  isValid: boolean;
}

//--
// Handles the validation of input components
export function useInputValidation(touched: any, validateFn: () => ErrorState) {
  const [inputErrors, setInputErrors] = useState<ErrorState>({isValid: true});
  const clearInputErrors = useCallback(() => setInputErrors({isValid: true}), [setInputErrors]);

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
      const isValid = (Object.keys(nextErrors).length === 0);
      setInputErrors({...nextErrors, isValid: isValid});
    }
  }, [touched]);

  const areInputsValid = (): boolean => {
    const validationResult = validateFn();    
    setInputErrors(validationResult);
    return validationResult.isValid;
  };

  return {
    inputErrors,
    areInputsValid,
    clearInputErrors,
  }
}