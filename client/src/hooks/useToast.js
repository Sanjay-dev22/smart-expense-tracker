import { useCallback, useState } from 'react';

export default function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, severity = 'success') => {
    setToast({ message, severity });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, closeToast };
}
