# Build Instructions

## Prerequisites
- Node.js v16 or higher
- npm or bun package manager

## Install Dependencies

```bash
npm install
```

## Build Commands

### Development Build
Creates a build with source maps for debugging:
```bash
npm run build:dev
```

### Production Build
Creates an optimized, minified build:
```bash
npm run build
```

**Output:** `dist/` directory

## Build Process
1. Vite bundles all source files
2. SWC compiler transpiles TypeScript to JavaScript
3. Tree-shaking removes unused code
4. Tailwind CSS purges unused styles
5. Assets are optimized and hashed
6. Output is written to `dist/`

## Preview Production Build
```bash
npm run build
npm run preview
```

## Deployment
Deploy the contents of the `dist/` directory to any static hosting service (Netlify, Vercel, AWS S3, etc.).
