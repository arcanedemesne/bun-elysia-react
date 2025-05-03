import React, { useCallback, useEffect, useRef, useState } from "react";

import { ErrorMessage, InputProps, Label, ValidationError } from "@/components";

interface DropDownOption {
  label: string;
  value: string;
}

interface DropDownInputProps extends InputProps {
  options: DropDownOption[];
  error?: ValidationError | undefined;
  onChange?: (value: string) => void;
}

export const DropDownInput: React.FC<DropDownInputProps> = ({
  label,
  name,
  options,
  value,
  error,
  onChange,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const controlledValue = value ?? "";

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(null); // Reset highlighted index
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = useCallback(
    (optionValue: string) => {
      onChange?.(optionValue);
      setIsOpen(false);
      setHighlightedIndex(null);
    },
    [onChange],
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prevIndex) => {
        if (prevIndex === null || prevIndex >= options.length - 1) {
          return 0;
        }
        return prevIndex + 1;
      });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prevIndex) => {
        if (prevIndex === null || prevIndex <= 0) {
          return options.length - 1;
        }
        return prevIndex - 1;
      });
    } else if (event.key === "Enter" && highlightedIndex !== null) {
      event.preventDefault();
      handleOptionClick(options[highlightedIndex].value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(null);
    }
  };

  return (
    <div ref={selectRef} className="relative w-full">
      {label && (
        <Label
          htmlFor={name}
          hasError={error?.message && error?.message.length > 0}
        >
          {label}
        </Label>
      )}
      <div className="relative w-full">
        <button
          type="button"
          className={`flex w-full items-center justify-between rounded-md border px-4 py-2 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-800 ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 hover:border-gray-500"
          }`}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          id={`dropdown-button-${name}`} // Add an ID for accessibility
        >
          <span className="truncate">
            {options.find((opt) => opt.value === controlledValue)?.label ||
              placeholder ||
              "Select an option"}
          </span>
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-gray-400"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-gray-400"
            >
              <path
                fillRule="evenodd"
                d="M14.77 7.79a.75.75 0 01-1.06-.02L10 3.832 6.35 7.77a.75.75 0 01-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01.02 1.06z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {isOpen && (
          <ul
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
            role="listbox"
            aria-labelledby={`dropdown-button-${name}`}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${index === highlightedIndex && "bg-blue-100"}`}
                onClick={() => handleOptionClick(option.value)}
                role="option"
                aria-selected={controlledValue === option.value}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </div>
  );
};
