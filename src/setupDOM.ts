// DOM setup for Vitest

// Use a declaration merging approach instead of interface creation
declare global {
  interface Element {
    focus(options?: FocusOptions): void;
  }
}

// Define the focus method on Element prototype if not exists
if (typeof Element !== 'undefined') {
  // Check if focus exists without using hasOwnProperty directly
  const hasFocus = 'focus' in Element.prototype;

  if (!hasFocus) {
    Object.defineProperty(Element.prototype, 'focus', {
      value: function (/* options?: FocusOptions */) {
        // Mock implementation
      },
      configurable: true, // Allow tests to override
      writable: true, // Allow tests to modify
    });
  }
}

// Define activeElement on document if not exists
if (typeof document !== 'undefined' && !('activeElement' in document)) {
  Object.defineProperty(document, 'activeElement', {
    get: function () {
      return null;
    },
    configurable: true,
  });
}

// Export a dummy value to make this a module
export const isDOMSetup = true;
