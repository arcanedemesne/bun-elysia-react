import React from "react";

type AlertBarProps = {
  id: string;
  message: string;
  onRemove: (id: string) => void;
};

export const AlertBar = ({ id, message, onRemove }: AlertBarProps) => {
  return (
    <div className="left-0 top-0 z-50 flex w-full items-center justify-between bg-red-700 p-4 text-white">
      <p>{message}</p>
      <button
        className="text-white-600 hover:text-white-800 focus:outline-none cursor-pointer"
        onClick={() => onRemove(id)}
      >
        <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
    </div>
  );
};
