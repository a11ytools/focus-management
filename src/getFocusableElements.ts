import { isFocusable, isTabbable } from './isFocusable';

/**
 * A list of HTML selectors that typically represent potentially focusable elements.
 * This is a performance optimization to avoid checking every element in the DOM.
 * 
 * @internal
 */
const POTENTIALLY_FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  '[tabindex]',
  '[contenteditable="true"]',
  'audio[controls]',
  'video[controls]',
  'details[open]'
].join(',');

/**
 * Options for retrieving focusable elements
 */
export interface GetFocusableElementsOptions {
  /**
   * Whether to only include tabbable elements (those that can be reached via keyboard tab navigation)
   * When true, excludes elements with tabindex="-1"
   * @default false
   */
  onlyTabbable?: boolean;
  
  /**
   * Whether to include elements inside shadow DOM
   * @default true
   */
  includeShadowDOM?: boolean;
}

/**
 * Gets all focusable elements within a container element.
 * 
 * @param container - The container element to search within
 * @param options - Configuration options for the search
 * @returns Array of focusable DOM elements
 * 
 * @example
 * ```ts
 * // Get all focusable elements
 * const elements = getFocusableElements(document.getElementById('modal'));
 * 
 * // Get only keyboard-tabbable elements (excludes tabindex="-1")
 * const tabbableElements = getFocusableElements(modalRef.current, { onlyTabbable: true });
 * ```
 */
export function getFocusableElements(
  container: Element | Document | ShadowRoot | null,
  options: GetFocusableElementsOptions = {}
): Element[] {
  // Handle null or missing container
  if (!container) {
    return [];
  }

  // Default options
  const { onlyTabbable = false, includeShadowDOM = true } = options;

  // Safety check for SSR environments
  if (typeof document === 'undefined') {
    return [];
  }

  // Use the appropriate function based on the onlyTabbable option
  const isElementFocusable = onlyTabbable ? isTabbable : isFocusable;

  try {
    // Query for potential focusable elements as an optimization
    const potentiallyFocusableElements = Array.from(
      container.querySelectorAll(POTENTIALLY_FOCUSABLE_SELECTORS)
    );

    // If we need to check shadow DOM, find all elements with shadow roots
    if (includeShadowDOM) {
      const elementsWithShadowRoots = Array.from(
        container.querySelectorAll('*')
      ).filter(
        (el) => el.shadowRoot?.mode === 'open'
      );

      // For each shadow root, recursively get focusable elements
      for (const elementWithShadow of elementsWithShadowRoots) {
        if (elementWithShadow.shadowRoot) {
          const shadowFocusableElements = getFocusableElements(
            elementWithShadow.shadowRoot,
            options
          );
          potentiallyFocusableElements.push(...shadowFocusableElements);
        }
      }
    }

    // Filter out elements that are not actually focusable
    const focusableElements = potentiallyFocusableElements.filter(isElementFocusable);

    // Sort by tabindex (elements with positive tabindex first, in order)
    return focusableElements.sort((a, b) => {
      const aTabIndex = Number(a.getAttribute('tabindex') || '0');
      const bTabIndex = Number(b.getAttribute('tabindex') || '0');
      
      // Positive indices come first, in ascending order
      if (aTabIndex > 0 && bTabIndex > 0) {
        return aTabIndex - bTabIndex;
      }
      
      // Positive indices come before zero and negative
      if (aTabIndex > 0) return -1;
      if (bTabIndex > 0) return 1;
      
      // Maintain DOM order for elements with tabindex="0" or no tabindex
      return 0;
    });
  } catch (error) {
    // Safely handle errors in browser environments
    console.error('Error in getFocusableElements:', error);
    return [];
  }
} 