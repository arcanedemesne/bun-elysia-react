import React, { ChangeEventHandler, useEffect, useRef, useState } from "react";

import { ErrorMessage, TextInput } from "@/lib/components";

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
  onFocus?: () => void;
  onSelect: (value: string) => void;
  errors?: string[] | undefined;
};

export const TypeAheadSearchInput = ({
  label,
  name,
  placeholder,
  options,
  onChange,
  onFocus,
  onSelect,
  errors,
}: TypeAheadSearchInputProps) => {
  const error = errors?.map((e) => <p key={e}>{e}</p>);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<TypeAheadSearchOption[]>(options);
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
      setShowOptions(true);
    } else {
      setFilteredOptions(options);
      setShowOptions(false);
    }
  }, [debouncedSearchTerm, options, onChange]);

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleOptionSelect = (value: string) => {
    const selectedOption = options.find((option) => option.value === value);
    if (selectedOption) {
      setSearchTerm(selectedOption.label);
    }
    onSelect(value);
    setShowOptions(false);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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
        onFocus={onFocus}
        onClear={() => {
          setSearchTerm("");
        }}
        errors={errors}
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
            <div className="px-4 py-2 text-gray-500">No results found</div>
          )}
        </div>
      )}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
};
