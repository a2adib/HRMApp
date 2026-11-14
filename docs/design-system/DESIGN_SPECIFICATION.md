# Enterprise HR Platform — UI/UX Design System & Architectural Specification

**Version:** 1.0.0-PROD  
**Author:** Principal Product Designer & UI/UX Architect  
**Status:** Approved for Implementation (Phase 1 Baseline)  
**Target Environments:** Web Admin Dashboard (React + Vite + Tailwind CSS + shadcn/ui) & Mobile Employee Application (React Native + Expo)

---

## 1. Executive Summary & Design Philosophy

The Enterprise HR Management Platform is designed as a mission-critical, high-velocity SaaS application benchmarked against the design rigor, visual poise, and ergonomic precision of **Linear, Stripe, and Notion**. 

### 1.1 Core Principles

1. **Quiet Sophistication over Visual Noise:**
   - Avoid aggressive drop shadows, vibrant gradient cards, and gratuitous rounded corners that distract from enterprise data.
   - Use high-contrast, neutral surfaces (`#090A0F` to `#181B26` in dark mode; `#FFFFFF` to `#F8FAFC` in light mode) paired with a surgical Indigo/Slate-Blue primary accent (`#4F46E5`).
   - Elevate content via 1px crisp borders (`border-slate-200 / border-slate-800`) and subtle ambient elevation (`shadow-[0_1px_2px_rgba(0,0,0,0.04)]`).

2. **High Information Density with Breathable Typography:**
   - Modern enterprise operators need maximum context per viewport without horizontal scrolling chaos.
   - Employ strict vertical rhythm based on an 8px grid (with 4px micro-increments).
   - Use tabular numbers (`font-feature-settings: 'tnum' 1, 'cv02' 1, 'cv04' 1`) for all timestamps, employee IDs, durations, and metrics to eliminate layout jitter.

3. **Dual-Channel Semantic Status Encoding:**
   - Color is never the sole communicator of state (complying with WCAG 2.1 AA & AAA standards).
   - Every semantic badge couples a distinctive background/border hue with an SVG status icon and an explicit text label (e.g., Green + Checkmark + "Present", Amber + Clock + "Late (18m)", Rose + Alert + "Absent").

4. **Bi-Directional Ergonomic Symmetry:**
   - Desktop Web: Optimized for mouse precision, keyboard shortcuts (`⌘K` Command Palette, `J`/`K` list navigation, `/` search, `Esc` dismiss), and rich data grids with multi-attribute filtering.
   - Mobile App: Engineered for single-thumb ergonomics, tactile haptic feedback, 44×44pt minimum tap targets, Safe Area compliance, and instant Wi-Fi/Geofence punch verification.

---

## 2. Design System Tokens & Foundations

### 2.1 Color Palette & Semantic Mapping

```css
:root {
  /* Primary Brand (Indigo / Electric Slate) */
  --primary-50:  #EEF2FF;
  --primary-100: #E0E7FF;
  --primary-200: #C7D2FE;
  --primary-500: #6366F1;
  --primary-600: #4F46E5; /* Main Brand Accent */
  --primary-700: #4338CA;
  --primary-900: #312E81;

  /* Neutral Slate (Light Mode Baseline) */
  --neutral-bg:         #F8FAFC; /* Page Canvas */
  --neutral-surface:    #FFFFFF; /* Card / Modal Surface */
  --neutral-subtle:     #F1F5F9; /* Table header, inactive tab */
  --neutral-border:     #E2E8F0; /* 1px hairline separators */
  --neutral-border-subtle: #F1F5F9;
  --neutral-text-main:  #0F172A; /* Highest contrast headings */
  --neutral-text-body:  #334155; /* Readable paragraphs & labels */
  --neutral-text-muted: #64748B; /* Captions, secondary timestamps */

  /* Semantic Status: Present / Approved / Active */
  --status-success-bg:     #ECFDF5;
  --status-success-border: #A7F3D0;
  --status-success-text:   #065F46;
  --status-success-solid:  #10B981;

  /* Semantic Status: Late / Pending / Warning */
  --status-warning-bg:     #FFFBEB;
  --status-warning-border: #FDE68A;
  --status-warning-text:   #92400E;
  --status-warning-solid:  #F59E0B;

  /* Semantic Status: Absent / Rejected / Danger */
  --status-danger-bg:      #FEF2F2;
  --status-danger-border:  #FECACA;
  --status-danger-text:    #991B1B;
  --status-danger-solid:   #EF4444;

  /* Semantic Status: Half-Day / Info */
  --status-info-bg:        #F0F9FF;
  --status-info-border:    #BAE6FD;
  --status-info-text:      #075985;
  --status-info-solid:     #0284C7;

  /* Semantic Status: Holiday / Special Leave */
  --status-special-bg:     #F5F3FF;
  --status-special-border: #DDD6FE;
  --status-special-text:   #5B21B6;
  --status-special-solid:  #8B5CF6;
}

/* Dark Mode Tokens (Linear/Stripe-Inspired Pitch & Slate) */
.dark {
  --neutral-bg:         #090A0F; /* Ultra-deep canvas */
  --neutral-surface:    #11131B; /* Layer 1 cards */
  --neutral-subtle:     #181B26; /* Hover states, table headers */
  --neutral-border:     #232738; /* Hairline borders */
  --neutral-text-main:  #F8FAFC;
  --neutral-text-body:  #CBD5E1;
  --neutral-text-muted: #64748B;

  --status-success-bg:     rgba(16, 185, 129, 0.12);
  --status-success-border: rgba(16, 185, 129, 0.3);
  --status-success-text:   #34D399;

  --status-warning-bg:     rgba(245, 158, 11, 0.12);
  --status-warning-border: rgba(245, 158, 11, 0.3);
  --status-warning-text:   #FBBF24;

  --status-danger-bg:      rgba(239, 68, 68, 0.12);
  --status-danger-border:  rgba(239, 68, 68, 0.3);
  --status-danger-text:    #F87171;

  --status-info-bg:        rgba(14, 165, 233, 0.12);
  --status-info-border:    rgba(14, 165, 233, 0.3);
  --status-info-text:      #38BDF8;

  --status-special-bg:     rgba(139, 92, 246, 0.12);
  --status-special-border: rgba(139, 92, 246, 0.3);
  --status-special-text:   #A78BFA;
}
```

### 2.2 Typography Scale

The type scale uses **Inter** with precise optical weight pairings and letter-spacing tracking:

| Role | Font Size | Line Height | Weight | Letter Spacing | CSS Equivalent |
|---|---|---|---|---|---|
| **Display / Hero Metric** | 32px (2rem) | 38px (1.2) | 700 Bold | `-0.03em` | `text-3xl font-bold tracking-tight` |
| **Page Heading** | 22px (1.375rem) | 28px (1.27) | 600 SemiBold | `-0.02em` | `text-xl font-semibold tracking-tight` |
| **Section Heading** | 16px (1.0rem) | 22px (1.37) | 600 SemiBold | `-0.015em` | `text-base font-semibold` |
| **Card / Widget Title** | 14px (0.875rem) | 20px (1.43) | 600 SemiBold | `-0.01em` | `text-sm font-semibold` |
| **Body Primary** | 14px (0.875rem) | 20px (1.43) | 400 Regular | `0em` | `text-sm font-normal text-slate-700` |
| **Body Secondary / Muted** | 13px (0.8125rem) | 18px (1.38) | 400 Regular | `0em` | `text-[13px] text-slate-500` |
| **Table Head / Caption** | 12px (0.75rem) | 16px (1.33) | 600 SemiBold | `+0.04em` | `text-xs font-semibold uppercase tracking-wider text-slate-500` |
| **Monospace / Metric Data** | 13px / 24px | Monospace | 500 Medium | `0em` | `font-mono tabular-nums` |

### 2.3 Spatial Scale & Radii

- **Base Rhythm:** 4px micro-grid / 8px component grid.
  - `space-1`: 4px | `space-2`: 8px | `space-3`: 12px | `space-4`: 16px
  - `space-5`: 20px | `space-6`: 24px | `space-8`: 32px | `space-12`: 48px
- **Corner Radii:**
  - `radius-xs` (3px): Micro badges, status dots.
  - `radius-sm` (6px): Form inputs, select dropdown triggers, small buttons, tags.
  - `radius-md` (8px): Standard buttons, table cell selections, popover menus.
  - `radius-lg` (12px): Standard cards, dashboard widgets, table containers.
  - `radius-xl` (16px): Slide-over drawers, dialog modals, mobile sheet containers.
  - `radius-full` (9999px): Avatars, pill badges.
- **Shadow Scale (Minimal Elevation):**
  - `shadow-subtle`: `0 1px 2px 0 rgba(0, 0, 0, 0.04)`
  - `shadow-card`: `0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)`
  - `shadow-dropdown`: `0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)`
  - `shadow-modal`: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08)`

---

## 3. Web Application Shell Architecture

```
+-----------------------------------------------------------------------------------------------+
| TOPBAR (h-14 / 56px, border-b, backdrop-blur-md)                                              |
| [Sidebar Toggle] [Breadcrumb: Organization > Employees > Attendance]  [⌘K Search] [Bell] [User] |
+-----------------------+-----------------------------------------------------------------------+
| SIDEBAR               | MAIN CONTENT AREA (max-w-[1600px], mx-auto, px-6 py-6)                |
| (w-60 / 240px, or     |                                                                       |
|  w-16 / 64px collaps.)| [Page Header: Title, Description, Date Filter, Refresh, Quick Action] |
|                       +-----------------------------------------------------------------------+
| • Logo & Org Switcher | 5 KPI CARDS (Total Emp, Present, Absent, Late, On Leave)              |
|                       +-----------------------------------------------------------------------+
| Main Navigation:      | CHARTS ROW: [Weekly Attendance Trend Area] [Dept Breakdown Bars]      |
|  - Overview (Home)    +-----------------------------------------------------------------------+
|  - Employees          | DATA TABLE WITH FILTER TOOLBAR: Recent Attendance Live Stream         |
|  - Attendance         | [Search] [Dept Filter] [Shift Filter] [Status Pills] [Export CSV]     |
|  - Leave Requests     |                                                                       |
|  - Shifts & Rosters   | Employee | ID | Dept | Shift | In | Out | Hours | AP Name | Status    |
|  - Departments        +-----------------------------------------------------------------------+
|  - Reports & Audit    | SLIDE-OVER DRAWER / ACTION PANEL:                                     |
|                       | Pending Leave Approvals (3) & Geo/Wi-Fi Discrepancies (2)             |
| Settings & Help       |                                                                       |
+-----------------------+-----------------------------------------------------------------------+
```

### 3.1 Sidebar Specifications
- **States:** Fully expanded (`w-60` / 240px) or Collapsed icon-mode (`w-16` / 64px) with floating tooltips.
- **Header:** Organization logo mark with team switcher dropdown ("Acme Corp HQ", "Singapore Hub").
- **Navigation Groups:**
  1. *Core Operations:* Overview (Dashboard), Employees, Attendance, Leave Management.
  2. *Workforce Planning:* Shifts & Rosters, Departments & Hierarchy, Holiday Calendar.
  3. *Intelligence:* Analytics & Reports, Audit Logs.
  4. *Administration:* Wi-Fi AP Gateways, Leave Policies, Roles & Permissions, Settings.
- **Active State Indicator:** Left 2.5px vertical indigo bar (`bg-indigo-600`), soft background highlight (`bg-indigo-50/60` in light; `bg-indigo-500/10` in dark), semi-bold text, and bold icon.

### 3.2 Topbar Specifications
- **Omni-Search (`⌘K` / `Ctrl+K`):** Invokes modal command palette searching across employees, departments, quick actions ("Approve Leave for Sarah", "Export Daily Timesheet"), and settings.
- **Live Sync Heartbeat:** Pulsing status dot ("Live Wi-Fi Sync • Updated 12s ago").
- **Notification Popover:** Unread badge with categorized alerts (Attendance Exception, New Leave Request, Policy Flag).
- **User Profile Pill:** Avatar with presence ring, employee role badge ("HR Admin"), and direct links to profile, security, and sign-out.

---

## 4. HR Dashboard Layout & Data Visualization

### 4.1 Executive Metric Cards
Each card provides a high-density summary:
1. **Total Workforce:** `1,248` (+14 hired this month, +1.1% MoM). Sparkline: 12-month staffing curve.
2. **Present Today:** `1,180` (94.5% of scheduled staff). Status: Emerald dot. Micro comparison: +1.2% vs yesterday.
3. **Late Arrivals:** `38` (3.0% rate, threshold: >15m). Status: Amber dot. Micro trend: -6 vs last Monday.
4. **Absent Unplanned:** `12` (0.9% rate). Status: Rose dot. Critical alert flag if > 2.0%.
5. **On Approved Leave:** `18` (1.4% rate, 12 Annual, 4 Sick, 2 Casual). Status: Violet dot.

### 4.2 Chart Architectures
- **Weekly Attendance Trend (Composite SVG Area Chart):**
  - X-Axis: Mon, Tue, Wed, Thu, Fri, Sat, Sun.
  - Y-Axis: Percentage (80% - 100%).
  - Layers: Target Baseline (dotted 95%), Actual Attendance (Smooth cubic bezier curve with gradient fill), and Late Arrivals (amber accent bar).
- **Department Attendance Distribution (Stacked Bar & Heat Index):**
  - Departments: Engineering, Product, Marketing, Sales, Operations, Finance, Human Resources.
  - Visual metrics: Present rate %, average arrival time (e.g. 09:08 AM), on-time score.

### 4.3 Actionable Triage Panel (Right Column or Tabbed Drawer)
- **Pending Leave Requests:** Displays employee avatar, leave type, date range, requested reason, and immediate action buttons (`Approve` / `Decline` with inline reason input).
- **Attendance Anomalies:** Highlights employees connected to unauthorized external Wi-Fi SSIDs, missing check-outs from previous shift, or punches outside geofenced coordinates.

---

## 5. Employee Management Experience

### 5.1 Data Grid Features
- **Facet Filters:** Multi-select department pills, employment status (Active, Onboarding, Notice Period, Terminated), shift type (Morning, Evening, Flex).
- **Quick Search:** Instant debounced filter across Name, Email, Employee ID (`EMP-XXXX`), and Job Title.
- **Bulk Actions:** Floating bottom selection bar upon row selection (Bulk Shift Assignment, Send Reminder, Export Selected, Status Update).

### 5.2 Deep-Dive Employee Profile Drawer / Page
Comprises 5 integrated tabs:
1. **Overview Tab:** Contact matrix, direct manager hierarchy, emergency contact, active department, assigned shift, work location.
2. **Attendance Tab:** Monthly punch calendar heatmap, total hours logged, overtime hours, punctuality score (98.4%), late minutes breakdown.
3. **Leave Tab:** Entitlement balances (Annual: 18 left / 21 total; Sick: 8 left / 10 total; Casual: 4 left / 7 total), history log with approval trail.
4. **Employment Tab:** Contract type, joining date, tenure duration, compensation tier, designated Wi-Fi access permissions.
5. **Documents Tab:** Employment contract, ID proof, signed NDA, tax declarations with download links.

---

## 6. Attendance Experience & Hardware Gateway Verification

Attendance tracking integrates **Wi-Fi Access Point (AP) BSSID and SSID verification**:
- **Source Verification Badges:**
  - `Wi-Fi Verified (Office-5G-North)`: Green shield icon. Punch authenticated via corporate router MAC address.
  - `Mobile Geofence`: Blue compass icon. Punch authenticated within 50m radius of corporate coordinates.
  - `Manual Correction (Admin)`: Violet edit icon. Timesheet corrected by manager with audit trail.
  - `Unverified / Remote`: Amber warning icon. Punch occurred from cellular or home network.
- **Punch Timeline Component:**
  - Interactive vertical timeline showing:
    - `08:58 AM`: Check-in via `Office-5G-East` (BSSID: `00:14:22:01:23:45`).
    - `01:05 PM - 01:50 PM`: Lunch Break (Auto-paused duration).
    - `06:12 PM`: Check-out via `Office-5G-North`.
    - Computed Duration: `8h 29m` Net Active Time (`On-Time`, `0m late`).
- **Interactive Monthly Calendar:**
  - 35-day grid displaying daily badges: Present (Green), Late (Amber with late minutes), Absent (Red), Holiday (Purple), Weekend (Muted).

---

## 7. Leave Management System & Workflows

### 7.1 Leave Balances & Policy Dashboard
- Dynamic cards calculating real-time accrued balance based on joining date and fiscal year policy.
- Accrual rate indicator (e.g. "+1.75 days per month").

### 7.2 Multi-Tier Approval Workflow
- Status Life Cycle: `Draft` → `Submitted` → `Manager Review` → `HR Sanction` → `Approved / Rejected`.
- Audit Log: Every status change logs the actor timestamp, IP, and optional manager remarks.
- Integrated Collision Detection: Shows "2 other team members on leave on overlapping dates" before approval.

---

## 8. Mobile Application Experience (React Native + Expo)

### 8.1 Mobile Architecture & Bottom Navigation
- Designed specifically for iOS (Human Interface Guidelines) and Android (Material You touches), prioritizing high contrast, tactile feedback, and one-tap daily punch.
- **Tabs:**
  1. **Home:** Daily punch card, current shift progress, quick balance widgets, notice board.
  2. **Attendance:** Punch history, monthly calendar, Wi-Fi verification status.
  3. **Leave:** Instant leave application form, remaining balances, status tracker.
  4. **Notifications:** Shift updates, approval notifications, company announcements.
  5. **Profile:** Personal badge, work credentials, emergency SOS, app preferences.

### 8.2 The "One-Tap" Smart Punch Card (Home Screen)
- Prominent dynamic widget showing:
  - Current connection: `Corporate-Office-5G` (Green signal icon).
  - Status: Currently Checked In (since 09:02 AM).
  - Elapsed Live Counter: `07:24:18` (active timer).
  - Action Button: Large accessible tap target `[ Tap to Check Out ]` with biometric prompt (Face ID / Fingerprint).

---

## 9. Reusable Component Library Taxonomy

A comprehensive catalog of 32+ modular components built with TypeScript and Tailwind CSS:
1. `Button` (Variants: `primary`, `secondary`, `outline`, `ghost`, `destructive`; Sizes: `xs`, `sm`, `md`, `lg`)
2. `IconButton` (With tooltip wrapper)
3. `Input` / `SearchInput` (With prefix icon, clear button, shortcut badge `⌘K`)
4. `Select` / `FilterDropdown` (With search, checkbox multi-select, badge counter)
5. `DatePicker` & `DateRangePicker` (Quick presets: Today, Yesterday, This Week, Last 30 Days)
6. `Badge` / `AttendanceStatusBadge` / `LeaveStatusBadge` (Dual-channel color + icon)
7. `Avatar` & `AvatarGroup` (With online/present indicator dot)
8. `Card` & `StatisticCard` (With trend delta, sparkline slot, status accent pill)
9. `DataTable` (Sortable headers, sticky column, row hover, checkbox selection, pagination)
10. `Modal` & `SlideOverDrawer` (Keyboard accessible `Esc`, focus trapping, smooth transition)
11. `Tabs` (Underline or segmented pill styles)
12. `AttendanceCalendar` (Interactive monthly heat-cell grid)
13. `AttendanceTimeline` (Vertical step-by-step punch log)
14. `Skeleton` / `EmptyState` / `ErrorState` (With actionable recovery buttons)

---

## 10. Execution Roadmap & Verification Milestones

- **Phase 1 (Current):** UI/UX Design System Specification & Interactive Rendered Dashboard Preview.
- **Phase 2:** Design Tokens & Core React/TypeScript Component Library.
- **Phase 3:** Production Web HR Dashboard with live interactive charts and tables.
- **Phase 4:** Employee Management Module (Directory, Search, Add/Edit Modal, Detailed Profile Drawer).
- **Phase 5:** Attendance Experience & Wi-Fi Gateway verification screens.
- **Phase 6:** Leave Management & Multi-tier approval flows.
- **Phase 7:** React Native / Expo Mobile Application screens.
- **Phase 8:** Comprehensive responsive polish, micro-animations, tests, and documentation.
