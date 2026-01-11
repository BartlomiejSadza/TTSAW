# SmartOffice UI/UX Complete Redesign Brief

## Mission Statement

Transform SmartOffice from a generic, emoji-laden booking system into a **premium, distinctive, dark-themed application** that feels like a polished SaaS product. The design must be immediately recognizable, avoiding the "AI slop" aesthetic of default Tailwind colors and system fonts.

---

## Part 1: Design System Specification

### 1.1 Color Palette — "Nordic Tech Dark"

This palette combines deep, comfortable dark backgrounds with vibrant accent colors that pop without being harsh.

```css
/* === CORE BACKGROUNDS === */
--color-bg-base: #0c0c0f; /* Deepest background - body */
--color-bg-surface: #141417; /* Cards, sidebar background */
--color-bg-elevated: #1c1c21; /* Modals, dropdowns, hover states */
--color-bg-hover: #242429; /* Interactive element hover */

/* === BORDERS & DIVIDERS === */
--color-border-subtle: #232328; /* Default borders */
--color-border-default: #2e2e35; /* More visible borders */
--color-border-strong: #3d3d47; /* Emphasized borders */

/* === TEXT HIERARCHY === */
--color-text-primary: #f4f4f6; /* Headlines, important text */
--color-text-secondary: #a1a1aa; /* Body text, descriptions */
--color-text-tertiary: #71717a; /* Muted text, placeholders */
--color-text-inverse: #0c0c0f; /* Text on light backgrounds */

/* === ACCENT COLORS — PRIMARY (Indigo-Violet) === */
--color-accent-primary: #8b5cf6; /* Main accent - buttons, links */
--color-accent-primary-hover: #a78bfa; /* Hover state */
--color-accent-primary-muted: #8b5cf620; /* Backgrounds, badges */
--color-accent-primary-glow: #8b5cf640; /* Glow effects */

/* === ACCENT COLORS — SECONDARY (Cyan-Teal) === */
--color-accent-secondary: #22d3ee; /* Secondary actions, highlights */
--color-accent-secondary-hover: #67e8f9; /* Hover state */
--color-accent-secondary-muted: #22d3ee20; /* Backgrounds */

/* === SEMANTIC COLORS === */
--color-success: #22c55e; /* Confirmed, success states */
--color-success-muted: #22c55e20; /* Success backgrounds */
--color-warning: #fbbf24; /* Pending, warnings */
--color-warning-muted: #fbbf2420; /* Warning backgrounds */
--color-error: #ef4444; /* Cancelled, errors, danger */
--color-error-muted: #ef444420; /* Error backgrounds */
--color-info: #3b82f6; /* Informational */
--color-info-muted: #3b82f620; /* Info backgrounds */

/* === FLOOR PLAN SPECIFIC === */
--color-room-available: #22c55e30; /* Available room fill */
--color-room-selected: #8b5cf650; /* Selected room fill */
--color-room-booked: #71717a30; /* Booked/unavailable room */
--color-room-border: #3d3d47; /* Room border default */
--color-courtyard: #1c1c21; /* Central courtyard area */
```

### 1.2 Typography — "Outfit + Inter"

**Install Google Fonts:**

```html
<link
  href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

```css
/* === FONT FAMILIES === */
--font-heading: "Outfit", sans-serif; /* Headlines, titles, logo */
--font-body: "Inter", sans-serif; /* Body text, UI elements */
--font-mono: "JetBrains Mono", monospace; /* Code, numbers (optional) */

/* === FONT SIZES (rem) === */
--text-xs: 0.75rem; /* 12px - badges, captions */
--text-sm: 0.875rem; /* 14px - small UI text */
--text-base: 1rem; /* 16px - body text */
--text-lg: 1.125rem; /* 18px - large body */
--text-xl: 1.25rem; /* 20px - section headers */
--text-2xl: 1.5rem; /* 24px - card titles */
--text-3xl: 1.875rem; /* 30px - page titles */
--text-4xl: 2.25rem; /* 36px - hero text */
--text-5xl: 3rem; /* 48px - splash text */

/* === FONT WEIGHTS === */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* === LINE HEIGHTS === */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### 1.3 Spacing System

```css
/* === SPACING SCALE === */
--space-0: 0;
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */

/* === COMPONENT SPECIFIC === */
--sidebar-width: 260px;
--sidebar-collapsed: 72px;
--navbar-height: 64px;
--card-padding: var(--space-6);
--input-padding-x: var(--space-4);
--input-padding-y: var(--space-3);
--button-padding-x: var(--space-5);
--button-padding-y: var(--space-3);
```

### 1.4 Border Radius

```css
--radius-sm: 0.375rem; /* 6px - small elements */
--radius-md: 0.5rem; /* 8px - inputs, buttons */
--radius-lg: 0.75rem; /* 12px - cards */
--radius-xl: 1rem; /* 16px - modals, large cards */
--radius-2xl: 1.5rem; /* 24px - hero sections */
--radius-full: 9999px; /* Pills, avatars */
```

### 1.5 Shadows (Dark Mode Optimized)

```css
/* Dark mode shadows use lighter colors with low opacity */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.4), 0 10px 10px rgba(0, 0, 0, 0.3);

/* Glow effects for accent elements */
--glow-primary: 0 0 20px var(--color-accent-primary-glow);
--glow-secondary: 0 0 20px rgba(34, 211, 238, 0.3);
--glow-success: 0 0 15px rgba(34, 197, 94, 0.3);
```

### 1.6 Animations & Transitions

```css
/* === DURATIONS === */
--duration-fast: 100ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;

/* === EASINGS === */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* === COMMON TRANSITIONS === */
--transition-colors: color var(--duration-normal) var(--ease-default), background-color
    var(--duration-normal) var(--ease-default),
  border-color var(--duration-normal) var(--ease-default);
--transition-transform: transform var(--duration-normal) var(--ease-default);
--transition-all: all var(--duration-normal) var(--ease-default);
```

---

## Part 2: Icon System — Lucide React

**Install:** `npm install lucide-react`

### Icon Mapping (Replace ALL Emoji)

| Location               | Old (Emoji) | New (Lucide)      | Import                                           |
| ---------------------- | ----------- | ----------------- | ------------------------------------------------ |
| Sidebar - Dashboard    | 📊          | `LayoutDashboard` | `import { LayoutDashboard } from 'lucide-react'` |
| Sidebar - Rooms        | 🏫          | `Building2`       | `import { Building2 } from 'lucide-react'`       |
| Sidebar - Floor Plan   | 🏢          | `Map`             | `import { Map } from 'lucide-react'`             |
| Sidebar - Reservations | 📅          | `CalendarCheck`   | `import { CalendarCheck } from 'lucide-react'`   |
| Sidebar - Calendar     | 📆          | `Calendar`        | `import { Calendar } from 'lucide-react'`        |
| Sidebar - Admin        | ⚙️          | `Settings`        | `import { Settings } from 'lucide-react'`        |
| Room - Floor           | 📍          | `MapPin`          | `import { MapPin } from 'lucide-react'`          |
| Room - Capacity        | 👥          | `Users`           | `import { Users } from 'lucide-react'`           |
| Room - Equipment       | 🔧          | `Wrench`          | `import { Wrench } from 'lucide-react'`          |
| Room - Description     | 📝          | `FileText`        | `import { FileText } from 'lucide-react'`        |
| Actions - Logout       | -           | `LogOut`          | `import { LogOut } from 'lucide-react'`          |
| Actions - Close        | -           | `X`               | `import { X } from 'lucide-react'`               |
| Actions - Add          | -           | `Plus`            | `import { Plus } from 'lucide-react'`            |
| Actions - Edit         | -           | `Pencil`          | `import { Pencil } from 'lucide-react'`          |
| Actions - Delete       | -           | `Trash2`          | `import { Trash2 } from 'lucide-react'`          |
| Actions - Check        | -           | `Check`           | `import { Check } from 'lucide-react'`           |
| Actions - Cancel       | -           | `XCircle`         | `import { XCircle } from 'lucide-react'`         |
| Navigation - Back      | -           | `ArrowLeft`       | `import { ArrowLeft } from 'lucide-react'`       |
| Navigation - Next      | -           | `ChevronRight`    | `import { ChevronRight } from 'lucide-react'`    |
| Navigation - Prev      | -           | `ChevronLeft`     | `import { ChevronLeft } from 'lucide-react'`     |
| Status - Success       | -           | `CheckCircle`     | `import { CheckCircle } from 'lucide-react'`     |
| Status - Warning       | -           | `AlertCircle`     | `import { AlertCircle } from 'lucide-react'`     |
| Status - Error         | -           | `XCircle`         | `import { XCircle } from 'lucide-react'`         |
| Time - Clock           | -           | `Clock`           | `import { Clock } from 'lucide-react'`           |
| User - Avatar          | -           | `User`            | `import { User } from 'lucide-react'`            |
| Search                 | -           | `Search`          | `import { Search } from 'lucide-react'`          |
| Filter                 | -           | `Filter`          | `import { Filter } from 'lucide-react'`          |

### Icon Styling Guidelines

```tsx
// Standard size: 20px with 1.5 stroke
<LayoutDashboard size={20} strokeWidth={1.5} />

// Sidebar icons: 22px
<LayoutDashboard size={22} strokeWidth={1.5} className="text-[--color-text-secondary]" />

// Button icons: 18px, match text color
<Plus size={18} strokeWidth={2} className="mr-2" />

// Large feature icons: 24-32px
<Map size={32} strokeWidth={1.5} className="text-[--color-accent-primary]" />
```

---

## Part 3: Component Specifications

### 3.1 Button Component

**Variants:**

1. **Primary** — Main actions (submit, confirm)
2. **Secondary** — Secondary actions
3. **Ghost** — Tertiary actions, navigation
4. **Danger** — Destructive actions
5. **Outline** — Alternative to ghost with border

**States:** Default, Hover, Active, Disabled, Loading

```tsx
// Button.tsx Structure
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/* === STYLES === */

/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, var(--color-accent-primary) 0%, #7C3AED 100%);
  color: white;
  border: none;
  box-shadow: var(--shadow-md), var(--glow-primary);
}
.btn-primary:hover {
  background: linear-gradient(135deg, var(--color-accent-primary-hover) 0%, #8B5CF6 100%);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg), var(--glow-primary);
}
.btn-primary:active {
  transform: translateY(0);
}

/* Secondary Button */
.btn-secondary {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-default);
}
.btn-secondary:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-strong);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: none;
}
.btn-ghost:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

/* Danger Button */
.btn-danger {
  background: var(--color-error);
  color: white;
  border: none;
}
.btn-danger:hover {
  background: #DC2626;
  box-shadow: var(--glow-success);
}

/* Outline Button */
.btn-outline {
  background: transparent;
  color: var(--color-accent-primary);
  border: 1px solid var(--color-accent-primary);
}
.btn-outline:hover {
  background: var(--color-accent-primary-muted);
}

/* Sizes */
.btn-sm { padding: 0.5rem 1rem; font-size: var(--text-sm); }
.btn-md { padding: 0.75rem 1.25rem; font-size: var(--text-base); }
.btn-lg { padding: 1rem 1.5rem; font-size: var(--text-lg); }

/* All buttons */
.btn {
  font-family: var(--font-body);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  transition: var(--transition-all);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}
```

### 3.2 Card Component

**Variants:**

1. **Default** — Standard card
2. **Interactive** — Clickable cards with hover effect
3. **Glass** — Glassmorphism effect for featured content
4. **Bordered** — Stronger border emphasis

```css
/* Default Card */
.card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--card-padding);
}

/* Interactive Card */
.card-interactive {
  cursor: pointer;
  transition: var(--transition-all);
}
.card-interactive:hover {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-default);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Glass Card (for modals, featured content) */
.card-glass {
  background: rgba(28, 28, 33, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
}

/* Bordered Card */
.card-bordered {
  border: 1px solid var(--color-border-default);
}
```

### 3.3 Input Component

**Features:**

- Floating label animation
- Icon support (left/right)
- Error state
- Focus ring with accent glow

```css
/* Input Container */
.input-container {
  position: relative;
  width: 100%;
}

/* Base Input */
.input {
  width: 100%;
  padding: var(--input-padding-y) var(--input-padding-x);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--text-base);
  transition: var(--transition-all);
}

.input::placeholder {
  color: var(--color-text-tertiary);
}

.input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 3px var(--color-accent-primary-muted);
}

/* Error State */
.input-error {
  border-color: var(--color-error);
}
.input-error:focus {
  box-shadow: 0 0 0 3px var(--color-error-muted);
}

/* With Left Icon */
.input-with-icon-left {
  padding-left: 2.75rem;
}
.input-icon-left {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  pointer-events: none;
}

/* Label */
.input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
}

/* Error Message */
.input-error-message {
  margin-top: 0.5rem;
  font-size: var(--text-sm);
  color: var(--color-error);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
```

### 3.4 Modal Component

**Features:**

- Backdrop blur
- Slide-up animation
- Close on backdrop click
- Focus trap

```css
/* Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

/* Modal Container */
.modal {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp var(--duration-slow) var(--ease-out);
}

/* Modal Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-border-subtle);
}

.modal-title {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

/* Modal Body */
.modal-body {
  padding: var(--space-6);
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-6);
  border-top: 1px solid var(--color-border-subtle);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

### 3.5 Badge Component

**Variants:** Default, Success, Warning, Error, Info, Primary

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge-default {
  background: var(--color-bg-elevated);
  color: var(--color-text-secondary);
}

.badge-primary {
  background: var(--color-accent-primary-muted);
  color: var(--color-accent-primary);
}

.badge-success {
  background: var(--color-success-muted);
  color: var(--color-success);
}

.badge-warning {
  background: var(--color-warning-muted);
  color: var(--color-warning);
}

.badge-error {
  background: var(--color-error-muted);
  color: var(--color-error);
}

.badge-info {
  background: var(--color-info-muted);
  color: var(--color-info);
}
```

---

## Part 4: Layout Specifications

### 4.1 Sidebar

**Features:**

- Fixed position
- Collapsible (future feature)
- Section grouping
- Active state indicator
- Smooth hover transitions

```css
/* Sidebar Container */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--color-bg-surface);
  border-right: 1px solid var(--color-border-subtle);
  display: flex;
  flex-direction: column;
  z-index: 40;
}

/* Logo Area */
.sidebar-logo {
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  padding: 0 var(--space-6);
  border-bottom: 1px solid var(--color-border-subtle);
}

.sidebar-logo-text {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  background: linear-gradient(
    135deg,
    var(--color-accent-primary) 0%,
    var(--color-accent-secondary) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
}

/* Section Label */
.sidebar-section-label {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--space-4) var(--space-3);
  margin-top: var(--space-4);
}

/* Nav Item */
.sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: var(--transition-all);
  cursor: pointer;
  margin-bottom: var(--space-1);
  position: relative;
}

.sidebar-item:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

/* Active State */
.sidebar-item-active {
  background: var(--color-accent-primary-muted);
  color: var(--color-accent-primary);
}

.sidebar-item-active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: var(--color-accent-primary);
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
}

/* Admin Section */
.sidebar-item-admin {
  color: var(--color-warning);
}

.sidebar-item-admin.sidebar-item-active {
  background: var(--color-warning-muted);
  color: var(--color-warning);
}

.sidebar-item-admin.sidebar-item-active::before {
  background: var(--color-warning);
}
```

### 4.2 Navbar

**Features:**

- Sticky top position
- User info with avatar
- Role badge
- Logout button

```css
/* Navbar Container */
.navbar {
  position: sticky;
  top: 0;
  height: var(--navbar-height);
  background: rgba(12, 12, 15, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 var(--space-6);
  gap: var(--space-4);
  z-index: 30;
}

/* User Info */
.navbar-user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.navbar-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-accent-primary-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent-primary);
}

.navbar-username {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
}
```

### 4.3 App Layout

```css
/* Main Layout */
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg-base);
}

/* Main Content Area */
.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
}

/* Page Container */
.page-container {
  flex: 1;
  padding: var(--space-8);
  max-width: 1400px;
}

/* Page Header */
.page-header {
  margin-bottom: var(--space-8);
}

.page-title {
  font-family: var(--font-heading);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.page-description {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
}
```

---

## Part 5: Page-Specific Designs

### 5.1 Login Page

**Layout:** Full-screen with two columns on desktop

- Left: Decorative side with branding, gradient background, floating shapes
- Right: Login form card

**Design Features:**

- Dark gradient background (#0C0C0F to #141417)
- Animated gradient orbs (subtle, slow-moving)
- Glassmorphic login card
- Floating labels or clean labels above inputs
- "Remember me" checkbox (optional)
- Social login buttons (optional, for future)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │                     │  │                             │   │
│  │    [Gradient BG]    │  │   ┌─────────────────────┐   │   │
│  │                     │  │   │                     │   │   │
│  │   ◉ SmartOffice     │  │   │   SmartOffice       │   │   │
│  │                     │  │   │   Sign in to your   │   │   │
│  │   Book smarter.     │  │   │   account           │   │   │
│  │   Work better.      │  │   │                     │   │   │
│  │                     │  │   │   [Email input]     │   │   │
│  │   [Floating orbs]   │  │   │   [Password input]  │   │   │
│  │                     │  │   │                     │   │   │
│  │                     │  │   │   [Sign In Button]  │   │   │
│  │                     │  │   │                     │   │   │
│  │                     │  │   │   Don't have acc?   │   │   │
│  │                     │  │   │   Register here     │   │   │
│  │                     │  │   │                     │   │   │
│  │                     │  │   └─────────────────────┘   │   │
│  │                     │  │                             │   │
│  └─────────────────────┘  └─────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Dashboard

**Layout:** Bento grid with statistics and quick actions

**Sections:**

1. Welcome header with user name
2. Quick Stats (4 cards in row)
3. Quick Actions (3 cards)
4. Upcoming Reservations (list)
5. Popular Rooms (list)

```
┌─────────────────────────────────────────────────────────────────┐
│  Welcome back, Jan! 👋                                          │
│  Here's what's happening with your reservations today.          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Upcoming │ │ Rooms    │ │ Pending  │ │ This     │           │
│  │    3     │ │   40     │ │    2     │ │ Month 12 │           │
│  │ ───────  │ │ ───────  │ │ ───────  │ │ ───────  │           │
│  │ +2 this  │ │ 38 avail │ │ Awaiting │ │ Total    │           │
│  │ week     │ │          │ │ approval │ │ booked   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                 │
│  Quick Actions                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ [Icon]          │ │ [Icon]          │ │ [Icon]          │   │
│  │ Browse Rooms    │ │ My Reservations │ │ Floor Plan      │   │
│  │ Find & book     │ │ View upcoming   │ │ Interactive     │   │
│  │ →               │ │ →               │ │ →               │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────┐ ┌─────────────────────────┐   │
│  │ Upcoming Reservations       │ │ Popular Rooms           │   │
│  │ ─────────────────────────   │ │ ───────────────────     │   │
│  │ Team Meeting                │ │ 1. Room A-401  (42)     │   │
│  │ Room A-302 • Tomorrow 10:00 │ │ 2. Room B-201  (38)     │   │
│  │ [CONFIRMED]                 │ │ 3. Room A-105  (35)     │   │
│  │ ─────────────────────────   │ │                         │   │
│  │ Project Review              │ │                         │   │
│  │ Room B-105 • Friday 14:00   │ │                         │   │
│  │ [PENDING]                   │ │                         │   │
│  └─────────────────────────────┘ └─────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Stats Card Design:**

- Icon in top-left with accent color
- Large number (font-heading, text-3xl)
- Label below (text-sm, text-secondary)
- Subtle trend indicator or secondary info

### 5.3 Floor Plan (KEY FEATURE)

**Layout:** Floor selector + Interactive visualization + Detail panel

**Design Requirements:**

- Floor selector as segmented control / pill buttons
- Horseshoe (podkowa) layout clearly visible
- Rooms as rounded rectangles with:
  - Room number/name
  - Capacity icon + number
  - Color-coded availability
- Hover: Glow effect + slight scale
- Selected: Strong accent border + glow
- Central "Courtyard" area styled
- Legend showing room states
- Side panel for selected room details

```
┌──────────────────────────────────────────────────────────────────┐
│  Floor Plan                                                      │
│  Select a floor and room to view details and make reservations.  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Floor: [1] [2] [3] [4]                    Legend:               │
│         ─── active                         ◻ Available           │
│                                            ◼ Selected            │
│  ┌──────────────────────────────────┐     ▨ Booked              │
│  │                                  │                            │
│  │        ┌────┐ ┌────┐ ┌────┐ ┌────┐                           │
│  │        │ 04 │ │ 05 │ │ 06 │ │ 07 │                           │
│  │        │ 30 │ │ 25 │ │ 20 │ │ 35 │                           │
│  │        └────┘ └────┘ └────┘ └────┘                           │
│  │   ┌────┐                      ┌────┐                         │
│  │   │ 03 │                      │ 08 │                         │
│  │   │ 20 │     ╭──────────╮     │ 40 │                         │
│  │   └────┘     │          │     └────┘                         │
│  │   ┌────┐     │ Courtyard│     ┌────┐                         │
│  │   │ 02 │     │          │     │ 09 │                         │
│  │   │ 15 │     ╰──────────╯     │ 25 │                         │
│  │   └────┘                      └────┘                         │
│  │   ┌────┐                      ┌────┐                         │
│  │   │ 01 │                      │ 10 │   ← Selected (glow)     │
│  │   │ 50 │                      │ 30 │                         │
│  │   └────┘                      └────┘                         │
│  │                                  │                            │
│  └──────────────────────────────────┘                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Room A-110                                      [Book Now] │ │
│  │ Building A • Floor 1                                       │ │
│  │ ───────────────────────────────────────────────────────    │ │
│  │ 👥 30 people  •  🔧 Projector, Whiteboard, AC              │ │
│  │ Conference room with modern equipment for team meetings.   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Room Tile Design:**

```css
.floor-room {
  width: 80px;
  height: 80px;
  background: var(--color-bg-elevated);
  border: 2px solid var(--color-room-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-all);
  position: relative;
}

.floor-room:hover {
  background: var(--color-accent-primary-muted);
  border-color: var(--color-accent-primary);
  transform: scale(1.05);
  box-shadow: var(--glow-primary);
}

.floor-room-selected {
  background: var(--color-accent-primary-muted);
  border-color: var(--color-accent-primary);
  box-shadow: var(--glow-primary);
}

.floor-room-available {
  background: var(--color-room-available);
}

.floor-room-booked {
  background: var(--color-room-booked);
  cursor: not-allowed;
  opacity: 0.6;
}

.floor-room-name {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.floor-room-capacity {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 2px;
}
```

### 5.4 Calendar View

**Layout:** Week navigation + Time grid + Events overlay

**Design Features:**

- Clean week navigation with Today button
- Time column (8:00-19:00)
- 7-day columns with date headers
- Current day column highlighted
- Events as colored blocks with room/title
- Click event to open detail modal

```
┌────────────────────────────────────────────────────────────────┐
│  Calendar                                                      │
│  View your reservations in a weekly calendar format.           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ← Prev    [Today]    Next →           January 2026            │
│                                                                │
│  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐    │
│  │ Time │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ Sat  │ Sun  │    │
│  │      │ 13   │ 14   │ 15*  │ 16   │ 17   │ 18   │ 19   │    │
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤    │
│  │ 8:00 │      │      │      │      │      │      │      │    │
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤    │
│  │ 9:00 │      │ ████ │      │      │      │      │      │    │
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤    │
│  │10:00 │ ████ │ ████ │      │      │ ████ │      │      │    │
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤    │
│  │11:00 │ ████ │      │      │      │ ████ │      │      │    │
│  │ ...  │      │      │      │      │      │      │      │    │
│  └──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘    │
│                                                                │
│  * Today is highlighted                                        │
│  ████ = Event blocks (colored by status)                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 5.5 Reservations List

**Layout:** Filter tabs + Reservation cards

**Card Design:**

- Status badge prominent (top-right)
- Room name as title
- Date/time with icon
- Building info
- Cancel button (ghost/danger)

### 5.6 Admin Panel

**Layout:** Tab navigation + Content area

**Tabs:** Rooms | Reservations | Users

**Features:**

- Data tables with hover rows
- Action buttons in last column
- Status badges
- Add button in header
- Search/filter bar

```
┌────────────────────────────────────────────────────────────────┐
│  Admin Panel                                                   │
│  Manage rooms, reservations, and users.                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [Rooms]  [Reservations]  [Users]                 [+ Add Room] │
│  ═══════                                                       │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Name       │ Location    │ Capacity │ Equipment │ Actions│ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ Room A-101 │ A / Floor 1 │    30    │ Proj, WB  │ ✏️ 🗑️ │ │
│  │ Room A-102 │ A / Floor 1 │    25    │ Proj      │ ✏️ 🗑️ │ │
│  │ Room B-201 │ B / Floor 2 │    40    │ Proj, AC  │ ✏️ 🗑️ │ │
│  │ ...        │             │          │           │        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Part 6: Micro-interactions Checklist

### Buttons

- [ ] Hover: slight lift (translateY -1px) + shadow increase
- [ ] Active: press down (translateY 0 or +1px)
- [ ] Loading: spinner icon + disabled state
- [ ] Focus: visible ring (accessibility)

### Cards

- [ ] Hover: elevation increase + border color change
- [ ] Interactive cards: subtle scale (1.01-1.02)

### Inputs

- [ ] Focus: border glow + label color change
- [ ] Error: shake animation (optional) + red border
- [ ] Valid: green border (optional)

### Sidebar

- [ ] Item hover: background slide
- [ ] Active indicator: animate in from left

### Modals

- [ ] Open: fade backdrop + slide up content
- [ ] Close: reverse animation

### Floor Plan Rooms

- [ ] Hover: scale (1.05) + glow + cursor change
- [ ] Selected: persistent glow + accent border
- [ ] Click: pulse effect (optional)

### Notifications (Toast)

- [ ] Enter: slide in from top-right
- [ ] Exit: slide out + fade

### Page Transitions

- [ ] Content fade in on navigation

### Loading States

- [ ] Skeleton loading for lists and cards
- [ ] Pulse animation for skeletons

---

## Part 7: Accessibility Requirements

### Color Contrast

- [ ] All text meets WCAG 2.1 AA (4.5:1 for normal, 3:1 for large)
- [ ] Interactive elements distinguishable

### Focus Management

- [ ] All interactive elements have visible focus state
- [ ] Focus ring uses accent color
- [ ] Tab order is logical

### Screen Readers

- [ ] All icons have aria-labels or sr-only text
- [ ] Form inputs have associated labels
- [ ] Status badges have aria-label

### Motion

- [ ] Respect `prefers-reduced-motion`
- [ ] Provide alternative for animated content

### Keyboard Navigation

- [ ] All actions accessible via keyboard
- [ ] Modal traps focus
- [ ] Escape closes modals

---

## Part 8: Files to Modify (Priority Order)

### Phase 1: Design System Foundation

1. `app/globals.css` — Add all CSS variables, base styles, animations
2. `components/ui/Button.tsx` — New button with all variants
3. `components/ui/Card.tsx` — New card variants
4. `components/ui/Input.tsx` — New input with icons, states
5. `components/layout/Sidebar.tsx` — New sidebar design
6. `components/layout/Navbar.tsx` — New navbar design
7. `components/layout/AppLayout.tsx` — Layout structure updates

### Phase 2: Core Pages

8. `app/login/page.tsx` — Two-column login design
9. `app/register/page.tsx` — Match login style
10. `app/dashboard/page.tsx` — Bento grid layout
11. `components/ui/FloorPlan.tsx` — Complete redesign

### Phase 3: Feature Pages

12. `app/rooms/page.tsx` — Room list with new cards
13. `app/rooms/[id]/page.tsx` — Room detail + modal
14. `app/reservations/page.tsx` — Reservation cards
15. `app/calendar/page.tsx` — Calendar grid
16. `app/floor-plan/page.tsx` — Floor plan page wrapper

### Phase 4: Admin & Polish

17. `app/admin/page.tsx` — Admin panel tabs and tables

---

## Part 9: Technical Implementation Notes

### Tailwind CSS 4 Considerations

- Use CSS-first configuration with `@theme` block
- Define variables directly in CSS
- Use `@layer` for component styles
- Leverage new `@starting-style` for entrance animations

### Google Fonts Loading

```tsx
// app/layout.tsx
import { Outfit, Inter } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

// Apply to body
<body className={`${outfit.variable} ${inter.variable}`}>
```

### Lucide Icons Import Pattern

```tsx
// Import individually to enable tree-shaking
import { LayoutDashboard, Building2, Calendar } from "lucide-react";

// Use with consistent props
<LayoutDashboard size={20} strokeWidth={1.5} />;
```

### Animation Best Practices

- Use `transform` and `opacity` only (GPU accelerated)
- Add `will-change` for complex animations (use sparingly)
- Respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Part 10: Quality Checklist

Before marking complete, verify:

### Visual

- [ ] Consistent color usage throughout
- [ ] Typography hierarchy clear
- [ ] Spacing consistent
- [ ] All emoji replaced with Lucide icons
- [ ] Dark theme looks polished, not "grayish"
- [ ] Accent colors pop appropriately

### Functional

- [ ] All existing functionality preserved
- [ ] All buttons work
- [ ] All forms submit correctly
- [ ] All modals open/close
- [ ] All navigation works
- [ ] Floor plan interactive

### Performance

- [ ] No layout shift on load
- [ ] Animations smooth (60fps)
- [ ] Fonts load properly

### Accessibility

- [ ] Focus states visible
- [ ] Contrast ratios pass
- [ ] Screen reader friendly

---

## Summary

This brief provides everything needed to transform SmartOffice into a premium, distinctive dark-themed application. The "Nordic Tech" color palette with indigo/violet primary and cyan secondary accents creates a modern, professional look that stands out from generic designs.

Key differentiators:

- **Custom dark palette** (not default Tailwind gray)
- **Outfit + Inter fonts** (not system fonts)
- **Lucide icons** (not emoji)
- **Glassmorphism touches** (modals, special cards)
- **Micro-interactions** (hover, active, transitions)
- **Floor Plan as hero feature** with glow effects

Execute this brief systematically, starting with globals.css and core components before moving to pages. Test each component in isolation before integrating.

---

**GO BUILD SOMETHING BEAUTIFUL!**
