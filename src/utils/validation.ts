import { useEffect, useState } from "react";

export type FieldError = {
  error: boolean;
  helpText: string;
}
export type ErrorState = {
  [field: string]: FieldError;
}

//--
// Will monitor the touched object (from useCustomForm), and the errors object (from a slice)
// and callback with which fields should have their errors cleared.
export function useErrorTracking(
  touchedFields: any,
  errors: ErrorState,
  clearError: (fieldNames: string[]) => void
) {
  const [errCount, setErrCount] = useState<number>(0);

  // Watch the touched fields, and clear any errors that need clearing
  useEffect(() => {
    if (!errors || Object.keys(errors).length === 0) return;

    const fields = Object.keys(touchedFields).reduce((output: string[], key: string) => {
      return (touchedFields as any)[key] === true ? [...output, key] : output;
    }, []);

    if (fields.length > 0 && fields.length !== errCount) {
      clearError(fields)
      setErrCount(fields.length);
    }
    else setErrCount(0);

  }, [touchedFields]);

  //Return the number of current errors
  return errCount;
}