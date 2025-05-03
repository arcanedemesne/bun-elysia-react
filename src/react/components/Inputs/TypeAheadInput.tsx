import React, { ChangeEventHandler, useEffect, useRef, useState } from "react";

import { ErrorMessage, TextInput, ValidationError } from "@/components";
import { useDebounce } from "@/hooks";

export type TypeAheadSearchOption = {
  label: string;
  value: string;
};

type TypeAheadSearchInputProps = {
  label?: string;
  name: string;
  placeholder?: string;
  options: TypeAheadSearchOption[];
  onChange?: (value: string) => void;
  onSelect: (value: string) => void;
  error?: ValidationError;
};

export const TypeAheadSearchInput = ({
  label,
  name,
  placeholder,
  options,
  onChange,
  onSelect,
  error,
}: TypeAheadSearchInputProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] =
    useState<TypeAheadSearchOption[]>(options);
  const [showOptions, setShowOptions] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms debounce

  // Update filtered options based on debounced search term
  useEffect(() => {
    if (debouncedSearchTerm) {
      onChange && onChange(debouncedSearchTerm);
      const filtered = options.filter((option) =>
        option.label.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      );
      setFilteredOptions(filtered);
      setShowOptions(filtered.length > 0);
    } else {
      setFilteredOptions(options); // Show all options when search term is empty
      setShowOptions(false);
    }
  }, [debouncedSearchTerm, options, onChange]);

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleOptionSelect = (value: string) => {
    const selectedOption = options.find((option) => option.value === value);
    if (selectedOption) {
      setSearchTerm(selectedOption.label); // Display the label in the input
    }
    onSelect(value);
    setShowOptions(false); // Close dropdown after selection
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };
    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  return (
    <div className="relative" ref={containerRef}>
      <TextInput
        type="text"
        label={label}
        name={name}
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onClear={() => {
          setSearchTerm("");
        }}
        error={error}
      />
      {showOptions && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                onClick={() => handleOptionSelect(option.value)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No options found</div>
          )}
        </div>
      )}
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </div>
  );
};
