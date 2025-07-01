import React, { ReactNode, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

type positions = "top" | "right" | "bottom" | "left";
type TooltipProps = {
  text: ReactNode | string;
  position?: positions;
  children: ReactNode;
};

export const Tooltip = ({ children, text, position = "top" }: TooltipProps) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const triggerRef = useRef<HTMLDivElement>(null);

  const calculateTooltipPosition = () => {
    if (triggerRef.current && isTooltipVisible) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;

      let newLeft, newTop;
      const tooltipOffset = 8;

      switch (position) {
        case "top":
          newLeft = triggerRect.left + triggerRect.width / 2;
          newTop = triggerRect.top - tooltipOffset;
          break;
        case "bottom":
          newLeft = triggerRect.left + triggerRect.width / 2;
          newTop = triggerRect.bottom + tooltipOffset;
          break;
        case "left":
          newLeft = triggerRect.left - tooltipOffset;
          newTop = triggerRect.top + triggerRect.height / 2;
          break;
        case "right":
          newLeft = triggerRect.right + tooltipOffset;
          newTop = triggerRect.top + triggerRect.height / 2;
          break;
        default:
          newLeft = triggerRect.left + triggerRect.width / 2;
          newTop = triggerRect.top - tooltipOffset;
      }

      setTooltipStyle({
        left: `${newLeft + scrollX}px`,
        top: `${newTop + scrollY}px`,
        transform:
          position === "top"
            ? "translateX(-50%) translateY(-100%)"
            : position === "bottom"
              ? "translateX(-50%)"
              : position === "left"
                ? "translateX(-100%) translateY(-50%)"
                : "translateY(-50%)",
      });
    }
  };

  useEffect(() => {
    if (isTooltipVisible) {
      calculateTooltipPosition();

      window.addEventListener("resize", calculateTooltipPosition);
      window.addEventListener("scroll", calculateTooltipPosition);
    }

    return () => {
      window.removeEventListener("resize", calculateTooltipPosition);
      window.removeEventListener("scroll", calculateTooltipPosition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTooltipVisible, position]);

  const tooltipContent = isTooltipVisible && (
    <div
      className={`border-1 pointer-events-none fixed z-50 max-w-xs rounded-md border-gray-300 bg-gray-100 px-4 py-2.5 text-xs text-gray-800 opacity-0 shadow-sm transition-opacity duration-300 ${isTooltipVisible ? "opacity-100" : "opacity-0"} `}
      style={{
        ...tooltipStyle,
        maxWidth: "calc(100vw - 1rem)",
      }}
    >
      {text}
    </div>
  );

  return (
    <div
      className="group relative inline-flex items-center font-sans"
      ref={triggerRef} // Attach ref to the trigger element's wrapper
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
      onFocus={() => setIsTooltipVisible(true)}
      onBlur={() => setIsTooltipVisible(false)}
    >
      {children}
      {ReactDOM.createPortal(tooltipContent, document.body)}
    </div>
  );
};
