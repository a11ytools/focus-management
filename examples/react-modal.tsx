import React, { useState } from 'react';
import { useFocusTrap } from '../src';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * Accessible modal component that traps focus using @a11y-tools/focus-management
 */
export function AccessibleModal({ isOpen, onClose, title, children }: ModalProps) {
  // Use the focus trap hook, which handles:
  // - Trapping focus inside the modal when active
  // - Auto-focusing the first focusable element
  // - Restoring focus when the modal closes
  // - Handling Escape key to close
  const modalRef = useFocusTrap({
    active: isOpen,
    onEscapeKey: onClose
  });
  
  if (!isOpen) {
    return null;
  }
  
  // Click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
      aria-hidden="true"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal-content"
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button 
            onClick={onClose}
            aria-label="Close modal"
            className="close-button"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose}>
            Cancel
          </button>
          <button 
            onClick={() => {
              // Submit logic here
              onClose();
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Example usage of the AccessibleModal component
 */
export function ModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  return (
    <div>
      <h1>Modal Example</h1>
      <p>Click the button below to open an accessible modal:</p>

      <button onClick={openModal}>Open Modal</button>

      <AccessibleModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Accessible Modal Example"
      >
        <p>
          This modal demonstrates focus trapping with
          a11y-tools/focus-management.
        </p>
        <p>
          Try using Tab and Shift+Tab to navigate - focus will stay within the
          modal.
        </p>
        <p>You can also press Escape to close.</p>

        <form>
          <div>
            <label htmlFor="name">Name:</label>
            <input id="name" type="text" />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input id="email" type="email" />
          </div>
        </form>
      </AccessibleModal>
    </div>
  );
} 