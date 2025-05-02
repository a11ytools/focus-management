/**
 * Vanilla JavaScript example of implementing a focus trap for a modal
 * using @a11ytools/focus-management
 */

// Import the core utilities (this would be from '@a11ytools/focus-management' in a real app)
// const { getFocusableElements, saveFocus, returnFocus } = require('@a11ytools/focus-management');

// Mock implementation for the example
const mockFocusManagement = {
  // Get all focusable elements within a container
  getFocusableElements: (container, options = {}) => {
    // In a real app, this would be the actual implementation
    return Array.from(container.querySelectorAll('button, input, select, textarea, a[href]'));
  },
  
  // Save current focus to restore later
  saveFocus: () => {
    window._savedFocusElement = document.activeElement;
  },
  
  // Return to previously saved focus
  returnFocus: () => {
    if (window._savedFocusElement) {
      window._savedFocusElement.focus();
      window._savedFocusElement = null;
    }
  }
};

// Use these in place of actual imports for the example
const { getFocusableElements, saveFocus, returnFocus } = mockFocusManagement;

// DOM elements we'll need
let modal = null;
let openButton = null;
let closeButton = null;
let firstInput = null;
let tabKeyHandler = null;

// Create and set up the modal
function setupModal() {
  // Create elements
  const container = document.createElement('div');
  container.innerHTML = `
    <div class="demo-container">
      <h1>Vanilla JS Modal Example</h1>
      <p>This demonstrates using @a11ytools/focus-management in vanilla JavaScript.</p>
      
      <button id="open-modal">Open Modal</button>
      
      <div id="modal" class="modal" aria-modal="true" role="dialog" aria-labelledby="modal-title" hidden>
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="modal-title">Accessible Modal</h2>
            <button id="close-modal" aria-label="Close modal">×</button>
          </div>
          
          <div class="modal-body">
            <p>Try tabbing through this modal. Focus is trapped within it.</p>
            <p>Press ESC or click the close button to close.</p>
            
            <form>
              <div>
                <label for="name-input">Name:</label>
                <input id="name-input" type="text" />
              </div>
              <div>
                <label for="email-input">Email:</label>
                <input id="email-input" type="email" />
              </div>
              <div>
                <button type="submit">Submit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(container);
  
  // Get references to elements
  modal = document.getElementById('modal');
  openButton = document.getElementById('open-modal');
  closeButton = document.getElementById('close-modal');
  firstInput = document.getElementById('name-input');
  
  // Set up event listeners
  openButton.addEventListener('click', openModal);
  closeButton.addEventListener('click', closeModal);
  
  // Close on escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });
}

// Open the modal and trap focus
function openModal() {
  // Save the currently focused element (usually the open button)
  saveFocus();
  
  // Show the modal
  modal.hidden = false;
  
  // Focus the first input
  firstInput.focus();
  
  // Set up focus trap
  tabKeyHandler = handleTabKey;
  document.addEventListener('keydown', tabKeyHandler);
}

// Close the modal and restore focus
function closeModal() {
  // Hide the modal
  modal.hidden = true;
  
  // Remove the focus trap
  document.removeEventListener('keydown', tabKeyHandler);
  
  // Restore focus to the element that had focus before opening
  returnFocus();
}

// Handle tab key to cycle through focusable elements
function handleTabKey(event) {
  // Only handle Tab key
  if (event.key !== 'Tab') return;
  
  // Get all focusable elements in the modal
  const focusableElements = getFocusableElements(modal);
  
  // If no focusable elements, do nothing
  if (focusableElements.length === 0) return;
  
  // Get first and last elements
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  // Handle wrapping with Shift+Tab from first element
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } 
  // Handle wrapping with Tab from last element
  else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

// Initialize when the DOM is loaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupModal);
  } else {
    setupModal();
  }
}

// For module exports
if (typeof module !== 'undefined') {
  module.exports = {
    openModal,
    closeModal
  };
} 