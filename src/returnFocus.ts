/**
 * Options for saving and restoring focus
 */
export interface ReturnFocusOptions {
  /**
   * Whether to prevent scrolling when returning focus
   * @default true
   */
  preventScroll?: boolean;
  
  /**
   * Fallback element to focus if the original element is no longer focusable
   * @default document.body
   */
  fallbackElement?: HTMLElement | null;
}

/**
 * Saved focus element from when save was called
 * @internal
 */
let savedFocusElement: Element | null = null;

/**
 * Saves the currently focused element to return to later.
 * Should be called before changing focus away from the current element
 * (e.g., when opening a modal).
 * 
 * @returns The element that was saved, or null if no element was focused
 * 
 * @example
 * ```ts
 * // Save focus before opening a modal
 * const openModal = () => {
 *   saveFocus();
 *   showModal();
 * };
 * ```
 */
export function saveFocus(): Element | null {
  // Safety check for SSR environments
  if (typeof document === 'undefined') {
    return null;
  }
  
  savedFocusElement = document.activeElement;
  return savedFocusElement;
}

/**
 * Returns focus to the previously saved element.
 * Should be called when focus needs to be restored
 * (e.g., when closing a modal).
 * 
 * @param options - Configuration options for returning focus
 * @returns The element that was focused, or null if no element was focused
 * 
 * @example
 * ```ts
 * // Return focus when closing a modal
 * const closeModal = () => {
 *   hideModal();
 *   returnFocus();
 * };
 * ```
 */
export function returnFocus(options: ReturnFocusOptions = {}): Element | null {
  // Safety check for SSR environments
  if (typeof document === 'undefined') {
    return null;
  }
  
  const { 
    preventScroll = true,
    fallbackElement = document.body 
  } = options;
  
  // If no element was saved, focus the fallback
  if (!savedFocusElement) {
    fallbackElement?.focus({ preventScroll });
    return fallbackElement;
  }
  
  try {
    // Try to focus the saved element
    (savedFocusElement as HTMLElement).focus({ preventScroll });
    
    // If focus was successful, clear the saved element and return it
    if (document.activeElement === savedFocusElement) {
      const returnedElement = savedFocusElement;
      savedFocusElement = null;
      return returnedElement;
    }
    
    // If focus was unsuccessful, try the fallback
    if (fallbackElement) {
      fallbackElement.focus({ preventScroll });
      return fallbackElement;
    }
  } catch (error) {
    console.error('Error returning focus:', error);
    
    // Try fallback on error
    if (fallbackElement) {
      try {
        fallbackElement.focus({ preventScroll });
        return fallbackElement;
      } catch (fallbackError) {
        console.error('Error focusing fallback element:', fallbackError);
      }
    }
  }
  
  // Clear saved element
  savedFocusElement = null;
  return null;
}

/**
 * Creates a scoped focus manager that remembers focus within a specific context.
 * Useful for nested focus management contexts like modals within modals.
 * 
 * @returns An object with saveFocus and returnFocus methods scoped to this instance
 * 
 * @example
 * ```ts
 * // Create a scoped focus manager for a specific dialog
 * const dialogFocusManager = createFocusManager();
 * 
 * // When opening the dialog
 * dialogFocusManager.saveFocus();
 * 
 * // When closing the dialog
 * dialogFocusManager.returnFocus();
 * ```
 */
export function createFocusManager() {
  let savedElement: Element | null = null;
  
  return {
    /**
     * Saves the currently focused element for this specific focus manager
     */
    saveFocus: (): Element | null => {
      if (typeof document === 'undefined') {
        return null;
      }
      
      savedElement = document.activeElement;
      return savedElement;
    },
    
    /**
     * Returns focus to the element saved by this specific focus manager
     */
    returnFocus: (options: ReturnFocusOptions = {}): Element | null => {
      if (typeof document === 'undefined') {
        return null;
      }
      
      const { 
        preventScroll = true,
        fallbackElement = document.body 
      } = options;
      
      if (!savedElement) {
        fallbackElement?.focus({ preventScroll });
        return fallbackElement;
      }
      
      try {
        (savedElement as HTMLElement).focus({ preventScroll });
        
        if (document.activeElement === savedElement) {
          const returnedElement = savedElement;
          savedElement = null;
          return returnedElement;
        }
        
        if (fallbackElement) {
          fallbackElement.focus({ preventScroll });
          return fallbackElement;
        }
      } catch (error) {
        console.error('Error returning focus in focus manager:', error);
        
        if (fallbackElement) {
          try {
            fallbackElement.focus({ preventScroll });
            return fallbackElement;
          } catch (fallbackError) {
            console.error('Error focusing fallback element:', fallbackError);
          }
        }
      }
      
      savedElement = null;
      return null;
    }
  };
} 