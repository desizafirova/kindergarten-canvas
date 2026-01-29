# Development Workflow

## Start Development Server

```bash
npm run dev
```

**Server Configuration:**
- Host: `::` (all interfaces)
- Port: `8080`
- URL: http://localhost:8080
- Hot Module Replacement (HMR) enabled

## Development Features
- Fast refresh with SWC compiler
- Instant preview on file changes
- Source maps for debugging
- Path alias `@/` maps to `src/`

## Code Quality

### Linting
```bash
npm run lint
```

Uses ESLint with:
- TypeScript rules
- React Hooks rules
- React Refresh rules

## Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route in `src/App.tsx`:
```typescript
<Route path="/new-page" element={<NewPage />} />
```
3. Add navigation link in `src/components/Navbar.tsx`

## Adding New Components

1. For UI primitives, use existing shadcn-ui components from `src/components/ui/`
2. For custom components, create in `src/components/`
3. Use Tailwind CSS for styling
4. Use Framer Motion for animations

## Available npm Scripts
| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
