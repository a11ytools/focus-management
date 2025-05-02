/**
 * Checks if an element is focusable according to WCAG and browser standards.
 * Considers visibility, disabled state, tabindex, and ARIA attributes.
 * 
 * @param element - The DOM element to check for focusability
 * @returns `true` if the element is focusable, `false` otherwise
 * 
 * @example
 * ```ts
 * const button = document.querySelector('button');
 * if (isFocusable(button)) {
 *   // The button can receive focus
 * }
 * ```
 */
export function isFocusable(element: Element | null): boolean {
  // Handle null or undefined elements
  if (!element) {
    return false;
  }

  // Check if element exists in the DOM
  if (!element.isConnected) {
    return false;
  }

  // Handle elements explicitly marked as not focusable
  if (element.getAttribute('tabindex') === '-1') {
    return false;
  }

  // Skip hidden elements (display: none, visibility: hidden, hidden attribute)
  if (
    element.hasAttribute('hidden') ||
    (element as HTMLElement).style?.display === 'none' ||
    (element as HTMLElement).style?.visibility === 'hidden'
  ) {
    return false;
  }

  // Skip elements with aria-hidden="true"
  if (element.getAttribute('aria-hidden') === 'true') {
    return false;
  }

  // Check if element is disabled
  if ((element as HTMLButtonElement).disabled) {
    return false;
  }

  // Check if any ancestor has aria-hidden="true" (inherit hidden state)
  let parent = element.parentElement;
  while (parent) {
    if (
      parent.getAttribute('aria-hidden') === 'true' ||
      parent.hasAttribute('hidden') ||
      (parent as HTMLElement).style?.display === 'none' ||
      (parent as HTMLElement).style?.visibility === 'hidden'
    ) {
      return false;
    }
    parent = parent.parentElement;
  }

  // Get element tag name for easier comparison
  const tagName = element.tagName.toLowerCase();

  // Handle positive tabindex (these are always focusable)
  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex !== null && tabIndex !== '-1') {
    const parsed = parseInt(tabIndex, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      return true;
    }
  }

  // Check for focusable elements by tag/type
  switch (tagName) {
    case 'a':
    case 'area':
      return !!element.hasAttribute('href');
    
    case 'input':
      // Special handling for hidden inputs
      return (element as HTMLInputElement).type !== 'hidden';
    
    case 'textarea':
    case 'select':
    case 'summary':
    case 'button':
      return true;
    
    case 'audio':
    case 'video':
      return element.hasAttribute('controls');
    
    case 'details':
      return element.hasAttribute('open');
    
    default:
      // Check for contenteditable
      if (element.getAttribute('contenteditable') === 'true') {
        return true;
      }
      
      // Other elements are not focusable by default
      return false;
  }
}

/**
 * Checks if an element is both focusable and can be reached using the Tab key
 * (excluding elements that can only be focused programmatically).
 * 
 * @param element - The DOM element to check for tabbability
 * @returns `true` if the element is keyboard tabbable, `false` otherwise
 * 
 * @example
 * ```ts
 * const element = document.querySelector('.my-element');
 * if (isTabbable(element)) {
 *   // The element is part of the tab order
 * }
 * ```
 */
export function isTabbable(element: Element | null): boolean {
  if (!isFocusable(element)) {
    return false;
  }

  // Elements with tabindex="-1" are focusable but not tabbable
  const tabIndex = element?.getAttribute('tabindex');
  if (tabIndex === '-1') {
    return false;
  }

  // Check for elements that might be focusable but not tabbable
  const tagName = element?.tagName.toLowerCase();
  
  // Ensure links have href (focusable) and no tabindex=-1 (tabbable)
  if (tagName === 'a' || tagName === 'area') {
    return !!element?.hasAttribute('href');
  }

  // Ensure inputs are not disabled or hidden
  if (tagName === 'input') {
    const input = element as HTMLInputElement;
    return !input.disabled && input.type !== 'hidden';
  }

  // Check if buttons, selects, and textareas are not disabled
  if (tagName === 'button' || tagName === 'select' || tagName === 'textarea') {
    return !(element as HTMLButtonElement).disabled;
  }

  // All other focusable elements should be tabbable
  return true;
} 