"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Toast = {
  id: number;
  message: string;
};

export type ToastController = {
  toasts: Toast[];
  push: (message: string) => void;
  dismiss: (id: number) => void;
};

const AUTO_DISMISS_MS = 5000;

export function useToasts(): ToastController {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message: string) => {
      const id = ++nextId.current;
      setToasts((current) => [...current, { id, message }]);
      timers.current.set(id, setTimeout(() => dismiss(id), AUTO_DISMISS_MS));
    },
    [dismiss],
  );

  // Clear every pending timer on unmount so none fires into a dead component.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  return { toasts, push, dismiss };
}
