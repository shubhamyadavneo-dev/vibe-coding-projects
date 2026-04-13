# Prompt Playbook for JavaScript Developers

A collection of concise, copy-paste ready prompts for modern JavaScript development (React + Vite + Tailwind). Each prompt is optimized for AI assistants (≤120 tokens, positive framing, minimal filler).

## Guidelines
- **Stack**: React + Vite + Tailwind + TypeScript
- **Style**: Functional components, hooks, ES2022+
- **Placeholders**: Use `{{FEATURE}}`, `{{STACK}}`, `{{INPUT}}`, `{{CONSTRAINTS}}`
- **Token limit**: ≤120 tokens (cl100k_base)
- **Framing**: Positive instructions, no explanations

---

## Code Generation

### 1. React Component
**When to use**: Need a new React component with specific props and styling.
```prompt
Create a React functional component named {{COMPONENT_NAME}} that accepts {{PROPS}}. Use Tailwind CSS for styling. Implement {{FEATURE}} with proper TypeScript interfaces. Export as default.
```

### 2. Custom Hook
**When to use**: Need a reusable hook for state, effects, or side effects.
```prompt
Write a custom React hook `use{{HOOK_NAME}}` that manages {{STATE_OR_SIDE_EFFECT}}. Return `[value, setValue]` or `{data, loading, error}`. Include cleanup and dependency array.
```

### 3. Utility Function
**When to use**: Need a pure JavaScript utility for data transformation.
```prompt
Create a utility function `{{FUNCTION_NAME}}` that takes {{INPUT}} and returns {{OUTPUT}}. Handle edge cases {{EDGE_CASES}}. Write JSDoc with examples.
```

### 4. Form Handling
**When to use**: Building a form with validation and submission.
```prompt
Build a React form component with fields `{{FIELDS}}`. Use `react-hook-form` for validation. Show errors inline. On submit, call `{{API_ENDPOINT}}`. Disable button during submission.
```

---

## Debugging

### 5. Runtime Error
**When to use**: Encountered a runtime error in browser console.
```prompt
Debug this runtime error: `{{ERROR_MESSAGE}}`. Suggest possible causes in {{CONTEXT}}. Provide fix with code snippet. Check async/state issues.
```

### 6. Async Race Condition
**When to use**: Multiple async operations causing inconsistent state.
```prompt
Identify race conditions in this async flow: `{{DESCRIPTION}}`. Recommend using `Promise.all`, `AbortController`, or `useEffect` cleanup. Provide corrected code.
```

### 7. State Update Issue
**When to use**: State not updating correctly in React component.
```prompt
Fix React state update issue where `{{STATE_VAR}}` doesn't reflect changes. Check immutability, batching, dependency arrays. Provide corrected `setState` usage.
```

---

## Refactoring

### 8. Clean Code
**When to use**: Improve readability and maintainability of existing code.
```prompt
Refactor this code to follow clean code principles: single responsibility, descriptive names, DRY. Keep same functionality. Output only refactored code.
```

### 9. Performance Optimization
**When to use**: Component re‑renders too often or feels slow.
```prompt
Optimize `{{COMPONENT}}` for performance. Suggest `React.memo`, `useMemo`, `useCallback`, lazy loading. Remove unnecessary effects. Provide before/after.
```

### 10. TypeScript Migration
**When to use**: Converting JavaScript code to TypeScript.
```prompt
Convert this JavaScript code to TypeScript. Add appropriate interfaces, types, generics. Strict mode compliant. No `any`.
```

---

## Review & QA

### 11. Edge Cases
**When to use**: Before deploying, check for missing edge cases.
```prompt
List edge cases for `{{FEATURE}}` considering empty states, network failures, invalid inputs, race conditions. Provide handling for each.
```

### 12. Bug Hunt
**When to use**: Suspect bugs in a specific module.
```prompt
Review `{{MODULE}}` for potential bugs: undefined access, memory leaks, incorrect comparisons, side effects. Suggest fixes.
```

---

## Documentation

### 13. README Section
**When to use**: Adding a feature that needs documentation.
```prompt
Write a README section for `{{FEATURE}}` covering installation, usage, props, examples. Use markdown with code blocks. Keep it concise.
```

### 14. JSDoc Comments
**When to use**: Adding documentation to functions/components.
```prompt
Add JSDoc comments to `{{FUNCTION}}` describing params, return, examples. Use `@param`, `@returns`, `@example`. Follow TypeScript style.
```

---

## Architecture

### 15. Component Structure
**When to use**: Planning a new feature with multiple components.
```prompt
Design component architecture for `{{FEATURE}}`. Break into presentational/container components. Define props flow, state management, folder structure.
```

### 16. State Management
**When to use**: Deciding between local state, context, or external lib.
```prompt
Recommend state management approach for `{{SCENARIO}}`. Compare useState, Context, Zustand, Redux Toolkit. Provide implementation snippet.
```

---

## API Integration

### 17. Fetch Wrapper
**When to use**: Need a robust fetch/axios wrapper for API calls.
```prompt
Create an `apiClient` with interceptors for `{{BASE_URL}}`. Handle errors, timeouts, auth headers. Provide `get`, `post`, `put`, `delete` methods.
```

### 18. Error Handling
**When to use**: Implementing consistent API error handling.
```prompt
Implement error handling for `{{API_CALL}}`. Show user‑friendly messages, retry logic, fallback UI. Use try/catch and error boundaries.
```

---

## Performance

### 19. Memoization
**When to use**: Expensive computations causing jank.
```prompt
Apply memoization to `{{COMPUTATION}}` using `useMemo`/`useCallback`. Determine dependencies. Explain when to skip memoization.
```

### 20. Lazy Loading
**When to use**: Reducing initial bundle size.
```prompt
Implement lazy loading for `{{COMPONENT_OR_ROUTE}}` using `React.lazy` and `Suspense`. Show loading fallback. Update routing if needed.
```

---

## Testing

### 21. Unit Test
**When to use**: Writing Jest tests for a utility or hook.
```prompt
Write Jest + React Testing Library tests for `{{UNIT}}`. Cover happy path, edge cases, mocks. Use `describe`/`it` pattern. Include assertions.
```

### 22. Component Test
**When to use**: Testing a React component's interactions.
```prompt
Create component tests for `{{COMPONENT}}` simulating user events (click, type). Verify rendered output, state changes, props. Use `screen` and `fireEvent`.
```

---

## AI‑Native Patterns

### 23. Prompt‑Driven UI
**When to use**: Building UI that adapts based on AI prompts.
```prompt
Design a prompt‑driven UI component that takes `{{PROMPT}}` and renders `{{OUTPUT}}`. Use conditional rendering, streaming, skeleton states.
```

### 24. AI‑Generated Content
**When to use**: Integrating AI‑generated content into React.
```prompt
Implement `useAI` hook that fetches AI‑generated content for `{{INPUT}}`. Show loading, error, streaming updates. Cache responses.
```

---

## Usage Tips
1. Replace placeholders (`{{...}}`) with your specific values.
2. Copy the prompt template directly into your AI assistant.
3. Add extra constraints if needed (e.g., “No third‑party libraries”).
4. For longer prompts, split into multiple focused requests.

## Token Verification
Each prompt above is designed to be ≤120 tokens when placeholders are filled with typical values. Verify with [cl100k‑base tokenizer](https://platform.openai.com/tokenizer) if needed.

---
*Last updated: {{DATE}}*