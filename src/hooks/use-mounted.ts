
'use client';

import { useState, useEffect } from 'react';

/**
 * A hook to check if the component has been mounted on the client.
 * This is useful for preventing hydration errors with components that
 * generate unique IDs or rely on browser-specific APIs.
 * @returns {boolean} - True if the component is mounted, false otherwise.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
