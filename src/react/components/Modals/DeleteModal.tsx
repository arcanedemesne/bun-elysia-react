import React, { MouseEvent } from "react";
import { Modal, ModalProps } from ".";
import { Button, ButtonModes } from "..";

interface DeleteModalProps extends ModalProps {
  itemName?: string;
  onCancel: (event: MouseEvent<HTMLButtonElement>) => void;
  onDelete: (event: MouseEvent<HTMLButtonElement>) => void;
}

export const DeleteModal = ({
  isOpen,
  onClose,
  onCancel,
  onDelete,
  title,
  itemName,
  children,
}: DeleteModalProps) => {
  return (
    <Modal title={title} isOpen={isOpen} onClose={onClose}>
      <div className="p2 mb-4">
        <div className="text-gray-800">
          <p className="mb-4">This will delete an item</p>
          {itemName && (
            <div className="mb-2 rounded-md border border-red-800 bg-gray-100 p-2 text-lg font-bold text-red-800">
              {itemName}
            </div>
          )}
          <p className="mb-4">
            This cannot be undone, do you wish to continue?
          </p>
        </div>
        {children}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex w-full justify-start"></div>
        <div className="flex items-center space-x-4">
          <Button mode={ButtonModes.SECONDARY} onClick={onCancel}>
            Cancel
          </Button>
          <Button mode={ButtonModes.DELETE} onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
