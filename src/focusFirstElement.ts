import { getFocusableElements } from './getFocusableElements';

/**
 * Options for focusing the first element
 */
export interface FocusFirstElementOptions {
  /**
   * Whether to only consider tabbable elements (those that can be reached via keyboard)
   * @default true
   */
  onlyTabbable?: boolean;
  
  /**
   * Whether to include elements inside shadow DOM
   * @default true
   */
  includeShadowDOM?: boolean;
  
  /**
   * Whether to prevent scrolling when focusing
   * @default true
   */
  preventScroll?: boolean;
}

/**
 * Focus the first focusable element within a container.
 * 
 * @param container - The container element to find the first focusable element within
 * @param options - Configuration options for focusing
 * @returns The element that was focused, or null if no focusable element was found
 * 
 * @example
 * ```ts
 * // Focus the first element in a modal
 * const modalElement = document.getElementById('modal');
 * focusFirstElement(modalElement);
 * 
 * // Focus the first element, including those with tabindex="-1"
 * focusFirstElement(dialogRef.current, { onlyTabbable: false });
 * ```
 */
export function focusFirstElement(
  container: Element | Document | null,
  options: FocusFirstElementOptions = {}
): Element | null {
  if (!container) {
    return null;
  }

  // Default options
  const { 
    onlyTabbable = true,
    includeShadowDOM = true,
    preventScroll = true
  } = options;

  // Safety check for SSR environments
  if (typeof document === 'undefined') {
    return null;
  }

  // Get all focusable elements
  const elements = getFocusableElements(container, {
    onlyTabbable,
    includeShadowDOM
  });

  // Focus the first element if it exists
  if (elements.length > 0) {
    try {
      // Use HTMLElement focus method with preventScroll option
      (elements[0] as HTMLElement).focus({ preventScroll });
      return elements[0];
    } catch (error) {
      console.error('Error focusing element:', error);
    }
  }

  return null;
}

/**
 * Focus the first element that matches a specific selector within a container.
 * Useful when you need to focus a specific element type or with a specific attribute.
 * 
 * @param container - The container element to search within
 * @param selector - CSS selector to match against focusable elements
 * @param options - Configuration options for focusing
 * @returns The element that was focused, or null if no matching element was found
 * 
 * @example
 * ```ts
 * // Focus the first button in a dialog
 * const dialog = document.querySelector('[role="dialog"]');
 * focusFirstElementBySelector(dialog, 'button[type="submit"]');
 * ```
 */
export function focusFirstElementBySelector(
  container: Element | Document | null,
  selector: string,
  options: FocusFirstElementOptions = {}
): Element | null {
  if (!container || !selector) {
    return null;
  }

  // Default options
  const { preventScroll = true } = options;

  // Safety check for SSR environments
  if (typeof document === 'undefined') {
    return null;
  }

  try {
    // Find all elements matching the selector
    const elements = Array.from(container.querySelectorAll(selector));
    
    // Find first element that's focusable among the matches
    for (const element of elements) {
      // Focus the element
      try {
        (element as HTMLElement).focus({ preventScroll });
        
        // Check if focus was successful
        if (document.activeElement === element) {
          return element;
        }
      } catch (e) {
        // Continue to the next element if focusing fails
        continue;
      }
    }
  } catch (error) {
    console.error('Error in focusFirstElementBySelector:', error);
  }

  return null;
} 