import { useCallback, useState } from 'react';

export function useNotification(durationMs = 3800) {
  const [message, setMessage] = useState<string | null>(null);

  const notify = useCallback(
    (msg: string) => {
      setMessage(msg);
      setTimeout(() => setMessage(null), durationMs);
    },
    [durationMs]
  );

  const dismiss = useCallback(() => setMessage(null), []);

  return { message, notify, dismiss };
}
