import { describe, beforeEach, test, expect } from 'vitest';
import { isFocusable, isTabbable } from '../isFocusable';

describe('isFocusable', () => {
  beforeEach(() => {
    // Clear the document body before each test
    document.body.innerHTML = '';
  });

  test('returns false for null or undefined elements', () => {
    expect(isFocusable(null)).toBe(false);
    expect(isFocusable(undefined as unknown as Element)).toBe(false);
  });

  test('identifies standard focusable elements correctly', () => {
    // Create various elements to test
    document.body.innerHTML = `
      <button id="button1">Button</button>
      <a id="link1" href="#">Link</a>
      <a id="link2">Link without href</a>
      <input id="input1" type="text" />
      <input id="input2" type="hidden" />
      <input id="input3" type="text" disabled />
      <div id="div1">Regular div</div>
      <div id="div2" tabindex="0">Div with tabindex 0</div>
      <div id="div3" tabindex="-1">Div with negative tabindex</div>
      <span id="span1" contenteditable="true">Editable span</span>
    `;

    // Test each element
    expect(isFocusable(document.getElementById('button1'))).toBe(true);
    expect(isFocusable(document.getElementById('link1'))).toBe(true);
    expect(isFocusable(document.getElementById('link2'))).toBe(false);
    expect(isFocusable(document.getElementById('input1'))).toBe(true);
    expect(isFocusable(document.getElementById('input2'))).toBe(false);
    expect(isFocusable(document.getElementById('input3'))).toBe(false);
    expect(isFocusable(document.getElementById('div1'))).toBe(false);
    expect(isFocusable(document.getElementById('div2'))).toBe(true);
    expect(isFocusable(document.getElementById('div3'))).toBe(false);
    expect(isFocusable(document.getElementById('span1'))).toBe(true);
  });

  test('respects hidden elements', () => {
    document.body.innerHTML = `
      <button id="button1" hidden>Hidden button</button>
      <div id="div1" style="display: none;">
        <button id="button2">Button in hidden div</button>
      </div>
      <div id="div2" style="visibility: hidden;">
        <a id="link1" href="#">Link in hidden div</a>
      </div>
    `;

    expect(isFocusable(document.getElementById('button1'))).toBe(false);
    expect(isFocusable(document.getElementById('button2'))).toBe(false);
    expect(isFocusable(document.getElementById('link1'))).toBe(false);
  });

  test('respects aria-hidden', () => {
    document.body.innerHTML = `
      <button id="button1" aria-hidden="true">Hidden button</button>
      <div id="div1" aria-hidden="true">
        <button id="button2">Button in hidden container</button>
      </div>
    `;

    expect(isFocusable(document.getElementById('button1'))).toBe(false);
    expect(isFocusable(document.getElementById('button2'))).toBe(false);
  });
});

describe('isTabbable', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('returns false for null or undefined elements', () => {
    expect(isTabbable(null)).toBe(false);
    expect(isTabbable(undefined as unknown as Element)).toBe(false);
  });

  test('identifies tabbable elements correctly', () => {
    document.body.innerHTML = `
      <button id="button1">Button</button>
      <button id="button2" tabindex="-1">Button with tabindex -1</button>
      <a id="link1" href="#">Link</a>
      <a id="link2">Link without href</a>
      <input id="input1" type="text" />
      <div id="div1">Regular div</div>
      <div id="div2" tabindex="0">Div with tabindex 0</div>
      <div id="div3" tabindex="-1">Div with negative tabindex</div>
    `;

    expect(isTabbable(document.getElementById('button1'))).toBe(true);
    expect(isTabbable(document.getElementById('button2'))).toBe(false);
    expect(isTabbable(document.getElementById('link1'))).toBe(true);
    expect(isTabbable(document.getElementById('link2'))).toBe(false);
    expect(isTabbable(document.getElementById('input1'))).toBe(true);
    expect(isTabbable(document.getElementById('div1'))).toBe(false);
    expect(isTabbable(document.getElementById('div2'))).toBe(true);
    expect(isTabbable(document.getElementById('div3'))).toBe(false);
  });

  test('disabled elements are not tabbable', () => {
    document.body.innerHTML = `
      <button id="button1" disabled>Disabled button</button>
      <input id="input1" type="text" disabled />
    `;

    expect(isTabbable(document.getElementById('button1'))).toBe(false);
    expect(isTabbable(document.getElementById('input1'))).toBe(false);
  });
}); 