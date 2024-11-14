import { useState, useCallback } from 'react';

// ----------------------------------------------------------------------

interface ReturnType {
  onFalse: () => void;
  onToggle: () => void;
  onTrue: () => void;
  setValue: React.Dispatch<React.SetStateAction<boolean>>;
  value: boolean;
}

export function useBoolean(defaultValue?: boolean): ReturnType {
  const [value, setValue] = useState(!!defaultValue);

  const onTrue = useCallback(() => {
    setValue(true);
  }, []);

  const onFalse = useCallback(() => {
    setValue(false);
  }, []);

  const onToggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return {
    value,
    onTrue,
    onFalse,
    onToggle,
    setValue,
  };
}
