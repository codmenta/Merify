import { useState, useEffect } from 'react';

// ==========================================
// HOOK PERSONALIZADO: useDebounce
// ==========================================
// Retrasa la ejecución de una función para no hacer búsquedas
// en cada tecla presionada
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpia el timeout si el valor cambia antes del delay
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;