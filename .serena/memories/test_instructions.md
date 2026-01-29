# Test Instructions

## Testing Framework
- **Vitest** - Fast unit testing framework compatible with Vite
- **@testing-library/react** - React component testing utilities
- **jsdom** - DOM environment for running tests in Node.js

## Run Tests

### Run All Tests Once
```bash
npm run test
```

### Run Tests in Watch Mode (Recommended for Development)
```bash
npm run test:watch
```

## Test Configuration
- **Config file:** `vitest.config.ts`
- **Environment:** jsdom
- **Setup file:** `src/test/setup.ts`
- **Test pattern:** `src/**/*.{test,spec}.{ts,tsx}`

## Test File Location
Place test files alongside the code they test or in the `src/test/` directory:
- `src/components/Navbar.test.tsx`
- `src/hooks/use-mobile.test.ts`
- `src/test/example.test.ts`

## Writing Tests
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

## Test Setup
The setup file (`src/test/setup.ts`) configures:
- matchMedia mock for jsdom compatibility
- Any global test utilities
