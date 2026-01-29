# Project Structure

```
kindergarten-canvas/
├── src/
│   ├── pages/                    # Route pages
│   │   ├── Index.tsx            # Home page
│   │   ├── Groups.tsx           # Groups/classes information
│   │   ├── Admission.tsx        # Admission process
│   │   ├── Careers.tsx          # Job opportunities
│   │   ├── DailySchedule.tsx    # Daily schedule
│   │   ├── News.tsx             # News/updates
│   │   ├── WeeklyMenu.tsx       # Weekly menu
│   │   ├── Documents.tsx        # Documents page
│   │   └── NotFound.tsx         # 404 page
│   │
│   ├── components/              # Reusable components
│   │   ├── ui/                  # shadcn-ui primitives (30+ components)
│   │   ├── animations/          # Animation components
│   │   │   ├── ScrollReveal.tsx
│   │   │   └── StaggerChildren.tsx
│   │   ├── careers/
│   │   │   └── JobApplicationForm.tsx
│   │   ├── Navbar.tsx           # Main navigation
│   │   ├── Hero.tsx             # Hero section
│   │   ├── Programs.tsx         # Programs section
│   │   ├── About.tsx            # About section
│   │   ├── Gallery.tsx          # Photo gallery
│   │   ├── Teachers.tsx         # Teachers section
│   │   ├── Contact.tsx          # Contact form
│   │   ├── Footer.tsx           # Footer
│   │   └── NavLink.tsx          # Navigation link
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-mobile.tsx       # Mobile detection
│   │   └── use-toast.ts         # Toast notifications
│   │
│   ├── lib/
│   │   └── utils.ts             # Utility functions (cn())
│   │
│   ├── assets/                  # Static assets
│   │   ├── logo.png
│   │   ├── hero-illustration.jpg
│   │   ├── gallery/
│   │   └── teachers/
│   │
│   ├── test/                    # Test configuration
│   │   ├── setup.ts
│   │   └── example.test.ts
│   │
│   ├── App.tsx                  # Main app with routing
│   ├── main.tsx                 # Entry point
│   ├── index.css                # Global styles
│   └── App.css                  # App styles
│
├── public/                      # Static public files
│   ├── favicon.ico
│   ├── robots.txt
│   └── placeholder.svg
│
├── Configuration Files
│   ├── package.json             # Dependencies & scripts
│   ├── tsconfig.json            # TypeScript config
│   ├── vite.config.ts           # Vite config
│   ├── vitest.config.ts         # Test config
│   ├── tailwind.config.ts       # Tailwind config
│   ├── postcss.config.js        # PostCSS config
│   ├── eslint.config.js         # ESLint config
│   └── components.json          # shadcn-ui config
│
└── index.html                   # HTML entry point
```

## Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Index.tsx | Home page |
| `/groups` | Groups.tsx | Class groups |
| `/admission` | Admission.tsx | Admission info |
| `/daily-schedule` | DailySchedule.tsx | Daily schedule |
| `/careers` | Careers.tsx | Job opportunities |
| `/news` | News.tsx | News & updates |
| `/menu` | WeeklyMenu.tsx | Weekly menu |
| `/documents` | Documents.tsx | Documents |
| `*` | NotFound.tsx | 404 page |

## Key Files

- **Routing:** `src/App.tsx`
- **Global Styles:** `src/index.css`
- **Tailwind Theme:** `tailwind.config.ts`
- **Path Aliases:** `tsconfig.json` (`@/` → `src/`)
