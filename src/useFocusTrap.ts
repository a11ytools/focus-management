import { useEffect, useRef, RefObject } from 'react';
import { getFocusableElements } from './getFocusableElements';
import { focusFirstElement } from './focusFirstElement';
import { saveFocus, returnFocus } from './returnFocus';

/**
 * Configuration options for the useFocusTrap hook
 */
export interface UseFocusTrapOptions {
  /**
   * Whether the focus trap is active
   * @default true
   */
  active?: boolean;
  
  /**
   * Whether to auto-focus within the container when the trap is activated
   * @default true
   */
  autoFocus?: boolean;
  
  /**
   * Whether to restore focus when the trap is deactivated
   * @default true
   */
  restoreFocus?: boolean;
  
  /**
   * Whether to lock focus even if the DOM updates inside the container
   * @default true
   */
  lockFocus?: boolean;
  
  /**
   * Whether to return focus to the previously focused element when the trap is deactivated
   * @default true
   */
  returnFocusOnDeactivate?: boolean;
  
  /**
   * Callback fired when a Tab key is pressed that would exit the container
   */
  onEscapeKey?: (event: KeyboardEvent) => void;
  
  /**
   * Callback fired when focus is restored to the original element
   */
  onFocusRestore?: () => void;
}

/**
 * A React hook that traps focus within a container element.
 * Returns a ref that should be attached to the container element.
 * 
 * @param options - Configuration options for the focus trap
 * @returns A ref to be attached to the container element
 * 
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const trapRef = useFocusTrap({ active: isOpen });
 *   
 *   return (
 *     <div ref={trapRef} role="dialog" aria-modal="true">
 *       <button onClick={onClose}>Close</button>
 *       <input type="text" />
 *     </div>
 *   );
 * }
 * ```
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  options: UseFocusTrapOptions = {}
): RefObject<T> {
  const {
    active = true,
    autoFocus = true,
    restoreFocus = true,
    lockFocus = true,
    returnFocusOnDeactivate = true,
    onEscapeKey,
    onFocusRestore
  } = options;
  
  // Reference to the container element
  const containerRef = useRef<T>(null);
  
  // Track if we've saved focus already
  const hasSavedFocus = useRef(false);
  
  // Keydown event handler
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    
    if (!active || !containerRef.current) {
      return undefined;
    }
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if the focus trap is active
      if (!active || !containerRef.current) {
        return;
      }
      
      // Handle escape key press if callback provided
      if (event.key === 'Escape' && onEscapeKey) {
        onEscapeKey(event);
        return;
      }
      
      // Only handle tab key
      if (event.key !== 'Tab') {
        return;
      }
      
      // Get all tabbable elements in the container
      const tabbableElements = getFocusableElements(containerRef.current, {
        onlyTabbable: true
      });
      
      // If there are no tabbable elements, keep focus on the container itself
      if (tabbableElements.length === 0) {
        event.preventDefault();
        (containerRef.current as HTMLElement).focus();
        return;
      }
      
      // Get first and last tabbable element
      const firstElement = tabbableElements[0];
      const lastElement = tabbableElements[tabbableElements.length - 1];
      
      // Handle tab with shift key
      if (event.shiftKey) {
        // If shift+tab on first element, move to last element
        if (document.activeElement === firstElement) {
          event.preventDefault();
          (lastElement as HTMLElement).focus();
        }
      } 
      // Handle tab without shift key
      else {
        // If tab on last element, move to first element
        if (document.activeElement === lastElement) {
          event.preventDefault();
          (firstElement as HTMLElement).focus();
        }
      }
    };
    
    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, onEscapeKey]);
  
  // Auto-focus effect
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    
    // Skip if not active or container ref not available
    if (!active || !containerRef.current) {
      return undefined;
    }
    
    // Save current focus if we haven't already
    if (restoreFocus && !hasSavedFocus.current) {
      saveFocus();
      hasSavedFocus.current = true;
    }
    
    // Auto-focus the first tabbable element in the container
    if (autoFocus) {
      // Small delay to allow for DOM to settle
      const timeoutId = setTimeout(() => {
        if (containerRef.current) {
          const focused = focusFirstElement(containerRef.current);
          
          // If no focusable elements found, focus the container itself
          if (!focused && containerRef.current) {
            // Log a warning about missing tabbable elements
            console.warn('[a11ytools] No tabbable elements found inside container.');
            
            // Set tabindex to -1 if not already set to allow focus
            if (!containerRef.current.hasAttribute('tabindex')) {
              containerRef.current.setAttribute('tabindex', '-1');
            }
            
            // Focus the container
            (containerRef.current as HTMLElement).focus({
              preventScroll: true
            });
          }
        }
      }, 20);
      
      return () => clearTimeout(timeoutId);
    }
    
    return undefined;
  }, [active, autoFocus, restoreFocus]);
  
  // Observe DOM changes to ensure focus remains trapped
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    
    if (!active || !lockFocus || !containerRef.current) {
      return undefined;
    }
    
    // Create a function to handle focus events
    const handleFocusOut = (event: FocusEvent) => {
      if (
        active &&
        containerRef.current &&
        event.target &&
        !containerRef.current.contains(event.target as Node)
      ) {
        // Focus moved outside container, pull it back in
        event.preventDefault();
        focusFirstElement(containerRef.current);
      }
    };
    
    // Add focus event listener to document
    document.addEventListener('focusin', handleFocusOut as EventListener);
    
    // Clean up
    return () => {
      document.removeEventListener('focusin', handleFocusOut as EventListener);
    };
  }, [active, lockFocus]);
  
  // Return focus when deactivated
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    
    if (!returnFocusOnDeactivate) {
      return undefined;
    }
    
    return () => {
      if (hasSavedFocus.current) {
        // Use Promise to ensure proper timing for focus restoration
        Promise.resolve().then(() => {
          returnFocus();
          hasSavedFocus.current = false;
          
          // Call the focus restore callback if provided
          if (onFocusRestore) {
            onFocusRestore();
          }
        });
      }
    };
  }, [returnFocusOnDeactivate, onFocusRestore]);
  
  return containerRef;
} 