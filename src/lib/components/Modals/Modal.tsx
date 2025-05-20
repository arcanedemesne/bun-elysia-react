import React, { useCallback, useEffect, useRef } from "react";

import { CloseButton } from "@/lib/components";

export type ModalProps = {
  isOpen: boolean;
  allowClose?: boolean;
  onClose?: () => void;
  title?: string;
  children?: React.ReactNode;
};

export const Modal = ({
  isOpen,
  allowClose = true,
  onClose,
  title,
  children,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    allowClose && onClose && onClose();
  }, [allowClose, onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    const currentRef = modalRef.current;
    if (isOpen) {
      currentRef?.addEventListener("keydown", handleKeyDown);

      // --- Focus Management ---
      const focusableElement = currentRef?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) as HTMLElement;

      if (focusableElement) {
        focusableElement.focus();
      }
      // --- End Focus Management ---
    }

    return () => {
      currentRef?.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, allowClose, onClose, handleClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/50"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl"
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="border-b px-5 py-3">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          </div>
        )}
        <div className="p-5">{children}</div>
        {allowClose && (
          <CloseButton className="absolute pr-2 pt-2" onClick={handleClose} />
        )}
      </div>
    </div>
  );
};
