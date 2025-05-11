# @a11y-tools/focus-management

![npm](https://img.shields.io/npm/v/@a11y-tools/focus-management)
![License](https://img.shields.io/npm/l/@a11y-tools/focus-management)
![Bundle Size](https://img.shields.io/bundlephobia/minzip/@a11y-tools/focus-management)

> Part of the @a11y-tools suite of open-source accessibility libraries

A lightweight, accessibility-focused utility library for managing keyboard focus in web applications. This package helps developers build accessible interfaces by simplifying focus management in modals, dialogs, popovers, and other UI components.

## Features

- 🧠 **Accessibility-First**: Built to meet WCAG 2.2 standards and ARIA Authoring Practices
- 🌐 **Framework-Agnostic**: Core utilities work in any JavaScript environment
- ⚛️ **React Integration**: React-specific hooks available but not required
- 📦 **Lightweight**: Minimal bundle size with zero dependencies
- 🔍 **Edge Case Coverage**: Handles complex scenarios like nested focus traps and portals
- 📱 **Modern Support**: Works in all modern browsers
- 🔒 **TypeScript**: Fully typed for a great developer experience

## Installation

```bash
# npm
npm install @a11y-tools/focus-management

# yarn
yarn add @a11y-tools/focus-management

# pnpm
pnpm add @a11y-tools/focus-management
```

**Important:** React is a peer dependency but is **optional** - the core utilities work without it in any JavaScript environment.

## Quick Start

### React Usage

```tsx
import { useState } from 'react';
import { useFocusTrap } from '@a11y-tools/focus-management';

function Modal({ isOpen, onClose, children }) {
  const modalRef = useFocusTrap({
    active: isOpen,
    onEscapeKey: onClose
  });
  
  if (!isOpen) return null;
  
  return (
    <div className="overlay">
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="modal"
      >
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    </div>
  );
}
```

### Vanilla JavaScript Usage

```js
import { 
  getFocusableElements, 
  saveFocus, 
  returnFocus 
} from '@a11y-tools/focus-management';

// When opening a modal
function openModal() {
  const modal = document.getElementById('my-modal');
  
  // Save the current focus to restore later
  saveFocus();
  
  // Show the modal
  modal.style.display = 'block';
  
  // Focus the first focusable element
  const elements = getFocusableElements(modal);
  if (elements.length > 0) {
    elements[0].focus();
  }
  
  // Set up trap
  document.addEventListener('keydown', handleTabKey);
}

// Handle Tab key to trap focus
function handleTabKey(event) {
  if (event.key !== 'Tab') return;
  
  const modal = document.getElementById('my-modal');
  const focusableElements = getFocusableElements(modal, { onlyTabbable: true });
  
  if (focusableElements.length === 0) return;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  // If shift+tab on first element, move to last element
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  }
  // If tab on last element, move to first element
  else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

// When closing a modal
function closeModal() {
  const modal = document.getElementById('my-modal');
  
  // Hide the modal
  modal.style.display = 'none';
  
  // Remove event listener
  document.removeEventListener('keydown', handleTabKey);
  
  // Return focus to the previously focused element
  returnFocus();
}
```

## API Reference

### Core Utilities

#### `isFocusable(element)`

Determines if an element is focusable.

```ts
import { isFocusable } from '@a11y-tools/focus-management';

const button = document.querySelector('button');
if (isFocusable(button)) {
  // Element can receive focus
}
```

#### `isTabbable(element)`

Determines if an element is keyboard-tabbable (can be reached with Tab key).

```ts
import { isTabbable } from '@a11y-tools/focus-management';

const element = document.querySelector('.my-element');
if (isTabbable(element)) {
  // Element is part of the tab order
}
```

#### `getFocusableElements(container, options?)`

Gets all focusable elements within a container.

```ts
import { getFocusableElements } from '@a11y-tools/focus-management';

// Get all focusable elements
const elements = getFocusableElements(document.getElementById('modal'));

// Get only keyboard-tabbable elements (excludes tabindex="-1")
const tabbableElements = getFocusableElements(modal, { onlyTabbable: true });
```

Options:
- `onlyTabbable`: Boolean (default: `false`) - Only include elements reachable via keyboard Tab
- `includeShadowDOM`: Boolean (default: `true`) - Include elements within shadow DOM

#### `focusFirstElement(container, options?)`

Focus the first focusable element within a container.

```ts
import { focusFirstElement } from '@a11y-tools/focus-management';

// Focus the first element in a modal
focusFirstElement(document.getElementById('modal'));

// Focus first element, including those with tabindex="-1"
focusFirstElement(dialogElement, { onlyTabbable: false });
```

Options:
- `onlyTabbable`: Boolean (default: `true`) - Only focus elements reachable via keyboard Tab
- `includeShadowDOM`: Boolean (default: `true`) - Include elements within shadow DOM
- `preventScroll`: Boolean (default: `true`) - Prevent scrolling when focusing

#### `focusFirstElementBySelector(container, selector, options?)`

Focus the first element matching a selector within a container.

```ts
import { focusFirstElementBySelector } from '@-/focus-management';

// Focus the first button with 'submit' type
focusFirstElementBySelector(dialog, 'button[type="submit"]');
```

#### `saveFocus()`

Saves the currently focused element to return to later.

```ts
import { saveFocus } from '@a11y-tools/focus-management';

// Save focus before opening a modal
function openMyModal() {
  saveFocus();
  showMyModal();
}
```

#### `returnFocus(options?)`

Returns focus to the previously saved element.

```ts
import { returnFocus } from '@a11y-tools/focus-management';

// Return focus when closing a modal
function closeMyModal() {
  hideMyModal();
  returnFocus();
}
```

Options:
- `preventScroll`: Boolean (default: `true`) - Prevent scrolling when returning focus
- `fallbackElement`: HTMLElement (default: `document.body`) - Element to focus if original is gone

#### `createFocusManager()`

Creates a scoped focus manager for nested contexts, such as when you have multiple dialogs or modals that can be opened in sequence.

```ts
import { createFocusManager } from '@a11y-tools/focus-management';

// Create separate focus managers for different UI components
const dialogFocusManager = createFocusManager();
const tooltipFocusManager = createFocusManager();

// Example: Handling nested dialogs
function openNestedDialog() {
  // Save focus state from the parent dialog
  dialogFocusManager.saveFocus();
  
  // Show the nested dialog
  showNestedDialog();
  
  // Later, when closing nested dialog
  closeNestedDialog();
  
  // Return focus to the element in the parent dialog
  dialogFocusManager.returnFocus();
}
```

This approach allows you to manage focus independently in different components, supporting UI patterns like nested modals without focus conflicts.

### React Hooks

#### `useFocusTrap(options?)`

React hook that creates a focus trap within a container element. This hook implements WCAG 2.1.2 (No Keyboard Trap) by ensuring that keyboard focus can be moved to and from the component when appropriate, while still containing focus within the component when needed for modals, dialogs, and other overlay patterns.

```tsx
import { useFocusTrap } from '@a11y-tools/focus-management';

function Modal({ isOpen, onClose }) {
  const trapRef = useFocusTrap({
    active: isOpen,       // Only trap focus when the modal is open
    onEscapeKey: onClose  // Allow escape key to dismiss (WCAG 2.1.2 compliance)
  });
  
  return (
    <div ref={trapRef} role="dialog" aria-modal="true">
      <button onClick={onClose}>Close</button>
      <input />
    </div>
  );
}
```

Options:
- `active`: Boolean (default: `true`) - Whether the focus trap is active
- `autoFocus`: Boolean (default: `true`) - Auto-focus first element when activated
- `restoreFocus`: Boolean (default: `true`) - Restore focus when deactivated
- `lockFocus`: Boolean (default: `true`) - Lock focus even if DOM changes
- `returnFocusOnDeactivate`: Boolean (default: `true`) - Return focus when trap is deactivated
- `onEscapeKey`: Function - Callback when Escape key is pressed

## WCAG Compliance

This library helps satisfy the following WCAG 2.2 success criteria:

- **2.1.1 Keyboard** (Level A): All functionality is operable through a keyboard interface
- **2.1.2 No Keyboard Trap** (Level A): Focus can be moved away from components using keyboard
- **2.4.3 Focus Order** (Level A): Components receive focus in an order that preserves meaning
- **2.4.7 Focus Visible** (Level AA): Keyboard focus indicator is visible (when used with proper CSS)
- **3.2.1 On Focus** (Level A): Elements do not change context when receiving focus

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 10.1+
- Edge 79+

## Accessibility Testing

We recommend using this library in conjunction with testing tools:

- [axe-core](https://github.com/dequelabs/axe-core) for automated testing
- [Testing Library](https://testing-library.com/) for user-centric tests

## License

MIT