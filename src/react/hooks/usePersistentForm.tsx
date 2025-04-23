import { RefObject, useEffect } from "react";

export const usePersistentForm = (ref: RefObject<HTMLFormElement | null>) => {
  if (ref === null) return;

  useEffect(() => {
    if (!ref.current) {
      throw new Error("Form ref is not defined.");
    }

    const form = ref.current;

    const handleReset = (e: Event) => {
      e.preventDefault();
    };

    form.addEventListener("reset", handleReset);
    return () => {
      form.removeEventListener("reset", handleReset);
    };
  }, []);
};
