import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const RippleButton = ({
  type = "button",
  capitalize = true,
  disabled = false,
  children,
  onClick,
  className,
}: {
  type?: "submit" | "reset" | "button";
  capitalize?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}) => {
  const [ripples, setRipples] = useState<
    { id: number; x: number; y: number }[]
  >([]);
  const nextRippleId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the container

  const handleRipple = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const rect = containerRef.current?.getBoundingClientRect(); // Use containerRef
      if (!rect) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      setRipples((prevRipples) => [
        ...prevRipples,
        { id: nextRippleId.current, x, y },
      ]);
      nextRippleId.current += 1;
      onClick?.(event); // Call the original onClick if provided
    },
    [onClick],
  );

  const removeRipple = (id: number) => {
    setRipples((prevRipples) =>
      prevRipples.filter((ripple) => ripple.id !== id),
    );
  };

  // Use useEffect to ensure the button has the correct size.
  useEffect(() => {
    if (containerRef.current) {
      const button = containerRef.current.querySelector("button");
      if (button) {
        button.style.width = "100%";
        button.style.height = "100%";
      }
    }
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-md ${className}`}
      ref={containerRef}
    >
      <button
        type={type}
        disabled={disabled}
        onClick={handleRipple}
        className={`relative z-10 h-full w-full ${!disabled && "cursor-pointer"} border-none bg-transparent px-4 py-2`}
      >
        {typeof children === "string" && capitalize
          ? children.toString().toUpperCase()
          : children}
      </button>
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            onAnimationComplete={() => removeRipple(ripple.id)}
            style={{
              position: "absolute",
              top: ripple.y,
              left: ripple.x,
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(255, 255, 255, 1)", // Ripple color
              borderRadius: "50%",
              width: "10px", // Initial size
              height: "10px",
              pointerEvents: "none", // Important: Allows clicks to pass through
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
