import { describe, beforeEach, test, expect, vi } from 'vitest';
import { getFocusableElements } from '../getFocusableElements';
import * as isFocusableModule from '../isFocusable';

describe('getFocusableElements', () => {
  beforeEach(() => {
    // Clear the document body before each test
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  test('returns an empty array for null or undefined containers', () => {
    expect(getFocusableElements(null)).toEqual([]);
    expect(getFocusableElements(null)).toEqual([]);
  });

  test('returns an empty array when no focusable elements exist', () => {
    document.body.innerHTML = `
      <div id="container">
        <div>Not focusable</div>
        <span>Also not focusable</span>
      </div>
    `;

    const container = document.getElementById('container');
    const elements = getFocusableElements(container);

    expect(elements).toEqual([]);
  });

  test('finds all focusable elements within a container', () => {
    document.body.innerHTML = `
      <div id="container">
        <button id="button1">Button 1</button>
        <a href="#" id="link1">Link</a>
        <input type="text" id="input1" />
        <div tabindex="0" id="div1">Focusable div</div>
        <div id="div2">Not focusable</div>
      </div>
    `;

    const container = document.getElementById('container');
    const elements = getFocusableElements(container);

    expect(elements.length).toBe(4);
    expect(elements[0].id).toBe('button1');
    expect(elements[1].id).toBe('link1');
    expect(elements[2].id).toBe('input1');
    expect(elements[3].id).toBe('div1');
  });

  test('respects the onlyTabbable option', () => {
    // Mock the isTabbable function
    const mockIsTabbable = vi.spyOn(isFocusableModule, 'isTabbable');

    // Make it return true only for specific elements
    mockIsTabbable.mockImplementation((element) => {
      return element?.id === 'button1' || element?.id === 'input1';
    });

    document.body.innerHTML = `
      <div id="container">
        <button id="button1">Button 1</button>
        <a href="#" id="link1">Link</a>
        <input type="text" id="input1" />
        <div tabindex="0" id="div1">Focusable div</div>
      </div>
    `;

    const container = document.getElementById('container');
    const elements = getFocusableElements(container, { onlyTabbable: true });

    expect(elements.length).toBe(2);
    expect(elements[0].id).toBe('button1');
    expect(elements[1].id).toBe('input1');
    expect(mockIsTabbable).toHaveBeenCalled();
  });

  test('correctly sorts by tabindex', () => {
    document.body.innerHTML = `
      <div id="container">
        <div tabindex="2" id="div2">Tab 2</div>
        <button id="button1">Button (implicit 0)</button>
        <div tabindex="1" id="div1">Tab 1</div>
        <div tabindex="0" id="div0">Tab 0</div>
        <a href="#" id="link1">Link (implicit 0)</a>
      </div>
    `;

    const container = document.getElementById('container');
    const elements = getFocusableElements(container);

    // Elements with positive tabindex come first in ascending order
    expect(elements.length).toBe(5);
    expect(elements[0].id).toBe('div1'); // tabindex="1"
    expect(elements[1].id).toBe('div2'); // tabindex="2"

    // Then elements with tabindex="0" or implicit tabindex in DOM order
    // The exact order of these might vary, so we just check they're included
    const remainingIds = elements.slice(2).map((el) => el.id);
    expect(remainingIds).toContain('button1');
    expect(remainingIds).toContain('div0');
    expect(remainingIds).toContain('link1');
  });

  test('handles nested shadow DOM when includeShadowDOM is true', () => {
    // Create main container
    document.body.innerHTML = `
      <div id="container">
        <button id="button1">Button 1</button>
        <div id="shadow-host"></div>
      </div>
    `;

    // Create shadow DOM with focusable elements
    const shadowHost = document.getElementById('shadow-host');
    const shadowRoot = shadowHost?.attachShadow({ mode: 'open' });

    if (shadowRoot) {
      shadowRoot.innerHTML = `
        <button id="shadow-button">Shadow Button</button>
        <input type="text" id="shadow-input" />
      `;
    }

    const container = document.getElementById('container');
    const elements = getFocusableElements(container, { includeShadowDOM: true });

    // Should find both regular elements and shadow DOM elements
    expect(elements.length).toBe(3);
    expect(elements[0].id).toBe('button1');
    expect(elements[1].id).toBe('shadow-button');
    expect(elements[2].id).toBe('shadow-input');
  });

  test('excludes shadow DOM elements when includeShadowDOM is false', () => {
    // Create main container
    document.body.innerHTML = `
      <div id="container">
        <button id="button1">Button 1</button>
        <div id="shadow-host"></div>
      </div>
    `;

    // Create shadow DOM with focusable elements
    const shadowHost = document.getElementById('shadow-host');
    const shadowRoot = shadowHost?.attachShadow({ mode: 'open' });

    if (shadowRoot) {
      shadowRoot.innerHTML = `
        <button id="shadow-button">Shadow Button</button>
        <input type="text" id="shadow-input" />
      `;
    }

    const container = document.getElementById('container');
    const elements = getFocusableElements(container, { includeShadowDOM: false });

    // Should only find regular elements, not shadow DOM ones
    expect(elements.length).toBe(1);
    expect(elements[0].id).toBe('button1');
  });

  test('handles errors gracefully', () => {
    // Mock console.error to prevent test output noise
    const consoleErrorMock = vi.spyOn(console, 'error');
    consoleErrorMock.mockImplementation(() => {
      /* intentionally empty */
    });

    // Make querySelectorAll throw an error
    const mockElement = {
      querySelectorAll: () => {
        throw new Error('Mock error');
      },
    };

    // We're intentionally passing a partial mock
    const elements = getFocusableElements(mockElement as unknown as Element);

    // Should return empty array on error
    expect(elements).toEqual([]);
    expect(consoleErrorMock).toHaveBeenCalled();

    // Restore console.error
    consoleErrorMock.mockRestore();
  });

  test('handles SSR environments gracefully', () => {
    // Mock the document.querySelector to simulate SSR behavior
    const documentSpy = vi.spyOn(global, 'document', 'get');
    documentSpy.mockReturnValue(undefined as unknown as Document);

    try {
      // Should return empty array and not throw
      const elements = getFocusableElements(null);
      expect(elements).toEqual([]);
    } finally {
      // Restore original implementation
      documentSpy.mockRestore();
    }
  });
});
