import { useState, useEffect } from 'react';

function getStorageValue(key, defaultValue) {
  if (typeof window !== "undefined") {
    // For security/UX: ignore persisted auth values on cold start so the app
    // always begins in a logged-out state. This ensures the frontend does
    // not auto-login from leftover localStorage tokens/users.
    if (key === 'token' || key === 'user') {
      return defaultValue;
    }

    const saved = localStorage.getItem(key);
    try {
      const initial = saved ? JSON.parse(saved) : defaultValue;
      return initial;
    } catch (error) {
      console.error("Error parsing JSON from localStorage", error);
      return defaultValue;
    }
  }
  return defaultValue;
}

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
  // Treat `null` and `undefined` as absence -> remove from storage
  if (value === undefined || value === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
  }, [key, value]);

  return [value, setValue];
};

export default useLocalStorage;