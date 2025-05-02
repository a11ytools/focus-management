/**
 * @a11ytools/focus-management
 * A collection of utilities for managing focus in web applications.
 * @packageDocumentation
 */

// Core utilities
export { isFocusable, isTabbable } from './isFocusable';
export { getFocusableElements } from './getFocusableElements';
export type { GetFocusableElementsOptions } from './getFocusableElements';
export { focusFirstElement, focusFirstElementBySelector } from './focusFirstElement';
export type { FocusFirstElementOptions } from './focusFirstElement';
export { saveFocus, returnFocus, createFocusManager } from './returnFocus';
export type { ReturnFocusOptions } from './returnFocus';

// React specific
export { useFocusTrap } from './useFocusTrap';
export type { UseFocusTrapOptions } from './useFocusTrap'; 