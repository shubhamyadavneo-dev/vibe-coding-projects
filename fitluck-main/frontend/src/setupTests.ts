import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Polyfill for TextEncoder/TextDecoder
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});