import { describe, beforeEach, test, expect, vi } from 'vitest';
import { focusFirstElement, focusFirstElementBySelector } from '../focusFirstElement';
import * as getFocusableElementsModule from '../getFocusableElements';

describe('focusFirstElement', () => {
  beforeEach(() => {
    // Clear the document body before each test
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  test('returns null for null or undefined containers', () => {
    expect(focusFirstElement(null)).toBeNull();
    expect(focusFirstElement(undefined as unknown as Element)).toBeNull();
  });

  test('returns null in SSR environments', () => {
    // Mock the document to simulate SSR behavior
    const documentSpy = vi.spyOn(global, 'document', 'get');
    documentSpy.mockReturnValue(undefined as any);
    
    try {
      // Should return null and not throw
      const result = focusFirstElement(null);
      expect(result).toBeNull();
    } finally {
      // Restore document
      documentSpy.mockRestore();
    }
  });

  test('focuses the first focusable element', () => {
    document.body.innerHTML = `
      <div id="container">
        <button id="button1">Button 1</button>
        <input type="text" id="input1" />
        <a href="#" id="link1">Link</a>
      </div>
    `;

    const container = document.getElementById('container');
    const button = document.getElementById('button1');
    
    // Mock focus function directly on the button element
    const mockFocus = vi.fn();
    button!.focus = mockFocus;
    
    // Mock the getFocusableElements function
    const mockGetFocusable = vi.spyOn(getFocusableElementsModule, 'getFocusableElements');
    mockGetFocusable.mockImplementation(() => {
      return [
        button as HTMLElement,
        document.getElementById('input1') as HTMLElement,
        document.getElementById('link1') as HTMLElement
      ];
    });

    // Set document.activeElement
    Object.defineProperty(document, 'activeElement', {
      get: () => button,
      configurable: true
    });

    const result = focusFirstElement(container);
    
    // Check that the first element was focused
    expect(mockFocus).toHaveBeenCalledWith({ preventScroll: true });
    expect(mockGetFocusable).toHaveBeenCalledWith(container, {
      onlyTabbable: true,
      includeShadowDOM: true
    });
    expect(result).toBe(button);
  });

  test('respects options for onlyTabbable and includeShadowDOM', () => {
    document.body.innerHTML = `
      <div id="container">
        <button id="button1">Button 1</button>
      </div>
    `;

    const container = document.getElementById('container');
    
    // Mock the getFocusableElements function
    const mockGetFocusable = vi.spyOn(getFocusableElementsModule, 'getFocusableElements');
    
    focusFirstElement(container, { 
      onlyTabbable: false, 
      includeShadowDOM: false
    });
    
    // Check that the options were passed correctly
    expect(mockGetFocusable).toHaveBeenCalledWith(container, {
      onlyTabbable: false,
      includeShadowDOM: false
    });
  });

  test('returns null when no focusable elements are found', () => {
    document.body.innerHTML = `
      <div id="container">
        <div>Not focusable</div>
      </div>
    `;

    const container = document.getElementById('container');
    
    // Mock the getFocusableElements function to return empty array
    vi.spyOn(getFocusableElementsModule, 'getFocusableElements').mockReturnValue([]);
    
    const result = focusFirstElement(container);
    
    // Check that no element was focused and null was returned
    expect(result).toBeNull();
  });

  test('handles focus errors gracefully', () => {
    document.body.innerHTML = `
      <div id="container">
        <button id="button1">Button 1</button>
      </div>
    `;

    const container = document.getElementById('container');
    const button = document.getElementById('button1');
    
    // Mock the getFocusableElements function
    vi.spyOn(getFocusableElementsModule, 'getFocusableElements').mockReturnValue([button as HTMLElement]);
    
    // Mock focus to throw an error
    const mockFocus = vi.fn().mockImplementation(() => {
      throw new Error('Mock focus error');
    });
    button!.focus = mockFocus;
    
    // Mock console.error to prevent test output noise
    const consoleErrorMock = vi.spyOn(console, 'error');
    consoleErrorMock.mockImplementation(() => {});
    
    const result = focusFirstElement(container);
    
    // Should return null and log error
    expect(result).toBeNull();
    expect(consoleErrorMock).toHaveBeenCalled();
    
    // Restore console.error
    consoleErrorMock.mockRestore();
  });
});

describe('focusFirstElementBySelector', () => {
  beforeEach(() => {
    // Clear the document body before each test
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  test('returns null for null or undefined containers or selectors', () => {
    expect(focusFirstElementBySelector(null, 'button')).toBeNull();
    expect(focusFirstElementBySelector(document.body, '')).toBeNull();
    expect(focusFirstElementBySelector(document.body, null as unknown as string)).toBeNull();
  });

  test('returns null in SSR environments', () => {
    // Mock the document to simulate SSR behavior
    const documentSpy = vi.spyOn(global, 'document', 'get');
    documentSpy.mockReturnValue(undefined as any);
    
    try {
      // Should return null and not throw
      const result = focusFirstElementBySelector(null, 'button');
      expect(result).toBeNull();
    } finally {
      // Restore document
      documentSpy.mockRestore();
    }
  });

  test('focuses the first element matching the selector', () => {
    document.body.innerHTML = `
      <div id="container">
        <button id="button1" class="primary">Primary Button</button>
        <button id="button2" class="secondary">Secondary Button</button>
      </div>
    `;

    const container = document.getElementById('container');
    const button1 = document.getElementById('button1');
    
    // Mock focus function directly on the button element
    const mockFocus = vi.fn();
    button1!.focus = mockFocus;

    // Set document.activeElement
    Object.defineProperty(document, 'activeElement', {
      get: () => button1,
      configurable: true
    });

    const result = focusFirstElementBySelector(container, '.primary');
    
    // Check that the first matching element was focused
    expect(mockFocus).toHaveBeenCalledWith({ preventScroll: true });
    expect(result).toBe(button1);
  });

  test('tries to focus each matching element until successful', () => {
    document.body.innerHTML = `
      <div id="container">
        <button id="button1">Button 1</button>
        <button id="button2">Button 2</button>
      </div>
    `;

    const container = document.getElementById('container');
    const button1 = document.getElementById('button1');
    const button2 = document.getElementById('button2');
    
    // Mock focus for the first button to throw an error
    const mockFocus1 = vi.fn().mockImplementation(() => {
      throw new Error('Mock focus error');
    });
    
    // Mock focus for the second button to succeed
    const mockFocus2 = vi.fn();
    
    // Apply mock focus methods to elements
    button1!.focus = mockFocus1;
    button2!.focus = mockFocus2;
    
    // Set up document.activeElement to return different values
    let activeElement: Element | null = null;
    Object.defineProperty(document, 'activeElement', {
      get: () => activeElement,
      configurable: true
    });
    
    // When second button is focused, make it the active element
    mockFocus2.mockImplementation(() => {
      activeElement = button2;
    });
    
    // Mock console.error to prevent test output noise
    const consoleErrorMock = vi.spyOn(console, 'error');
    consoleErrorMock.mockImplementation(() => {});
    
    const result = focusFirstElementBySelector(container, 'button');
    
    // Check that both elements were tried, but only the second one succeeded
    expect(mockFocus1).toHaveBeenCalled();
    expect(mockFocus2).toHaveBeenCalled();
    expect(result).toBe(button2);
    
    // Restore console.error
    consoleErrorMock.mockRestore();
  });

  test('returns null when no matching elements are found', () => {
    document.body.innerHTML = `
      <div id="container">
        <button id="button1">Button 1</button>
      </div>
    `;

    const container = document.getElementById('container');
    
    const result = focusFirstElementBySelector(container, '.non-existent');
    
    // Check that no element was focused and null was returned
    expect(result).toBeNull();
  });

  test('handles errors from querySelectorAll gracefully', () => {
    // Mock console.error to prevent test output noise
    const consoleErrorMock = vi.spyOn(console, 'error');
    consoleErrorMock.mockImplementation(() => {});

    // Create mock container with querySelectorAll that throws
    const mockContainer = {
      querySelectorAll: () => {
        throw new Error('Mock error');
      }
    };

    // @ts-ignore - We're intentionally passing a partial mock
    const result = focusFirstElementBySelector(mockContainer, 'button');
    
    // Should return null and log error
    expect(result).toBeNull();
    expect(consoleErrorMock).toHaveBeenCalled();
    
    // Restore console.error
    consoleErrorMock.mockRestore();
  });
}); 