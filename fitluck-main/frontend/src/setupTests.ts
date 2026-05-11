/// <reference types="node" />
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Polyfill for TextEncoder/TextDecoder
if (typeof (globalThis as any).TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  (globalThis as any).TextEncoder = TextEncoder;
  (globalThis as any).TextDecoder = TextDecoder;
}

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});