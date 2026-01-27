
# Implementation Plan: Missing Website Sections

## Overview
This plan adds five key sections identified from the reference kindergarten website: Weekly Menu, Documents & Policies, Nursery Group, Switchable Daily Schedules, and About Location/Community content.

---

## 1. Weekly Menu Page

**Purpose**: Display the weekly meal plan for children.

**New File**: `src/pages/WeeklyMenu.tsx`

**Features**:
- Hero section with playful food-themed design
- 5-day menu grid (Monday - Friday)
- Each day shows: Breakfast, Snack, Lunch, Afternoon Snack
- Responsive cards with food icons (Apple, Coffee, Utensils from lucide-react)
- Color-coded meal types (using existing theme colors: primary, secondary, accent, mint)
- "Important Notes" section for allergy information and dietary accommodations

**Structure**:
```text
+--------------------------------------------------+
|                   Hero Section                    |
|        "Weekly Menu - Healthy & Delicious"        |
+--------------------------------------------------+
|  Mon  |  Tue  |  Wed  |  Thu  |  Fri  |
|-------|-------|-------|-------|-------|
|  Card |  Card |  Card |  Card |  Card |
| Meals | Meals | Meals | Meals | Meals |
+--------------------------------------------------+
|         Dietary Notes & Allergy Info              |
+--------------------------------------------------+
```

**Routing**: Add `/menu` route to `App.tsx`
**Navigation**: Add "Menu" link to Navbar

---

## 2. Documents & Policies Page

**Purpose**: Provide access to institutional documents, rules, and regulatory information.

**New File**: `src/pages/Documents.tsx`

**Features**:
- Hero section with "Institutional Documents" theme
- Categorized document sections:
  - **Program System**: Educational program overview
  - **Internal Rules**: Kindergarten rules and policies
  - **Regulations**: GDPR, safety protocols, parent rights
  - **Forms**: Enrollment forms, permission slips
- Accordion or card-based layout for each document category
- Each document item shows: title, brief description, and a "View" button
- Icons for different document types (FileText, ScrollText, ClipboardList from lucide-react)

**Routing**: Add `/documents` route to `App.tsx`
**Navigation**: Add "Documents" link to Navbar

---

## 3. Nursery Group Section

**Purpose**: Add information about the nursery group (children under 3 years).

**File to Modify**: `src/pages/Groups.tsx`

**Changes**:
- Add a new group entry at the beginning of the `groups` array:
  ```text
  Name: "Tiny Tots Nursery"
  Age Range: "1-2 years"
  Capacity: "8 children"
  Schedule: "8:00 AM - 12:00 PM"
  Description: Specialized care for our youngest with focus on sensory development, attachment, and gentle routines.
  Activities: Tummy time, sensory bins, lullabies & songs, soft play, feeding & diapering
  ```
- Use a new icon (e.g., `Baby` icon) and a distinct color (e.g., `bg-pink` or existing `bg-purple`)

---

## 4. Switchable Daily Schedules

**Purpose**: Allow users to switch between 5 different schedule variants for different age groups.

**File to Modify**: `src/pages/DailySchedule.tsx`

**Changes**:

**4.1 Add Schedule Variants Data**:
- Create 5 schedule arrays for different groups:
  1. Nursery (1-2 years) - Shorter day, more rest time
  2. Little Seedlings (2-3 years) - Half-day focus
  3. Bright Butterflies (3-4 years) - Standard schedule
  4. Curious Cubs (4-5 years) - More structured learning
  5. Rising Stars (5-6 years) - Pre-K intensive schedule

**4.2 Add Toggle Buttons UI**:
- Position: Below the hero section, above the timeline
- Implementation: Use a horizontal button group (ToggleGroup from existing UI components)
- Each button shows the group name
- Active button is highlighted with the primary color
- Smooth transition when switching schedules

**4.3 Add State Management**:
- Use `useState` to track the selected schedule variant
- Timeline dynamically renders based on selected variant
- Add framer-motion `AnimatePresence` for smooth transitions between schedules

**UI Mockup**:
```text
+----------------------------------------------------------+
|                      Hero Section                         |
+----------------------------------------------------------+
|  [ Nursery ] [ Seedlings ] [ Butterflies ] [ Cubs ] [ Stars ] |
+----------------------------------------------------------+
|                   Timeline (changes based on selection)   |
+----------------------------------------------------------+
```

---

## 5. About Location/Community

**Purpose**: Add content about the kindergarten's location and community context.

**File to Modify**: `src/components/About.tsx`

**Changes**:
- Add a new section below the existing About content
- Include:
  - Neighborhood/location description
  - Community involvement highlights
  - Nearby facilities (parks, schools, public transport)
  - A small embedded map placeholder or address card
- Use existing ScrollReveal animation pattern

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/WeeklyMenu.tsx` | Create | New Weekly Menu page |
| `src/pages/Documents.tsx` | Create | New Documents & Policies page |
| `src/pages/Groups.tsx` | Modify | Add Nursery group (1-2 years) |
| `src/pages/DailySchedule.tsx` | Modify | Add 5 schedule variants with toggle buttons |
| `src/components/About.tsx` | Modify | Add location/community section |
| `src/App.tsx` | Modify | Add routes for `/menu` and `/documents` |
| `src/components/Navbar.tsx` | Modify | Add "Menu" and "Documents" nav links |

---

## Technical Details

### Dependencies Used (already installed)
- `framer-motion` - Animations
- `lucide-react` - Icons (FileText, ScrollText, Utensils, MapPin, etc.)
- `@radix-ui/react-toggle-group` - For schedule variant switcher
- Tailwind CSS - Styling

### Component Patterns
All new pages will follow the established patterns:
- Navbar + main content + Footer structure
- ScrollReveal and StaggerChildren for animations
- Card-based layouts with hover effects
- Consistent color scheme (primary, secondary, accent, mint, sky, purple)
- Responsive grid layouts

### Navigation Update
The Navbar `navLinks` array will be updated to include:
```typescript
{ name: "Menu", href: "/menu", isRoute: true },
{ name: "Documents", href: "/documents", isRoute: true },
```

---

## Estimated Implementation Order
1. Create Weekly Menu page (new file + routing + nav)
2. Create Documents page (new file + routing + nav)
3. Update Groups page with Nursery group
4. Update Daily Schedule with toggle functionality
5. Enhance About section with location content
