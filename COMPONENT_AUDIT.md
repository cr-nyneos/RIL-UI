# Component Duplication Audit

Read-only investigation. No application file was modified. Every recommendation below is a proposal, not an applied change.

Scope: `RIL-Dashboard/src/**` (55 source files), `RIL-Dashboard/src/index.css`, `RIL-Dashboard/package.json`.

---

## 1. Summary

**Files reviewed:** 56 — 22 in `src/components/ui/`, 7 top-level `src/components/`, 6 `src/components/dashboard/`, 4 `src/components/layout/`, 5 `src/pages/`, 7 `src/lib/`, 1 `src/data/`, `App.tsx`, `main.tsx`, `index.css`, `package.json`.

**Duplicate component groups found:** 9
**Inline duplications found:** 17
**Logic / type / data / token duplications found:** 24

**Assessment.** The dropdown incident that triggered this audit has already been cleaned up — `FilterSelect` no longer exists on disk, both `Orders.tsx` and `DashboardFilters.tsx` now import the same `ui/Select`, and the only trace left is a stale comment in `index.css:747` ("shared by SearchInput / FilterSelect") pointing at a component that is gone. But the *conditions* that produced it are entirely intact, and the same drift has already happened four more times in categories nobody has looked at yet. The worst is the badge/pill family: five separate components plus five inline hand-rolls all render "a small rounded label with a tone", with three unrelated colour maps and three different corner radii between them. The second worst is that there is **no Button component at all**, so every clickable action in the app — the Export button, pagination arrows, summary tiles, the login submit — is hand-built at its call site, which guarantees the next page adds a sixth variant. Underneath both sits a deeper problem: two complete design-token systems coexist in `index.css` (the `--color-text-0 / --color-card / --color-border` set used by the charts and `Demo.tsx`, and the `--color-ink-* / --color-glass-*` NyneOS set used by everything else), so "which grey is correct" currently has two right answers. Severity: **moderate now, high within two more pages** — nothing is broken, but the Orders page already carries three visually distinct chip shapes in one table row, and each new page compounds it.

Two structural notes that shape everything below:

- There is **no `CLAUDE.md` in this repository** (only a `.claude/` directory at the root). Several source comments reference `RIL.md` §Part 3/6 and `PLan.md` §9, neither of which exists on disk. So there is currently no written design-system rule for anything to be checked against — §8 drafts one.
- Seven components are **defined but imported nowhere**: `ui/Badge.tsx`, `ui/Pill.tsx`, `layout/Topbar.tsx` (imported only as a commented-out line in `AppShell.tsx:3`), and `pages/Demo.tsx` (reachable only via the `/demo` route). Dead code is a duplication risk: the next developer finds `Badge` by name, uses it, and now two badge systems are live.

---

## 2. Duplicate Component Groups

### Group: Label / Badge / Pill / Chip

| Implementation | Path | Lines | Used in | Built with | Notes |
|---|---|---|---|---|---|
| `Badge` | [ui/Badge.tsx](RIL-Dashboard/src/components/ui/Badge.tsx) | 27 | **nowhere** | Tailwind + `bg-*-soft` tokens | 5 tones, `rounded-full`, `text-xs font-medium` |
| `StatusBadge` | [ui/StatusBadge.tsx](RIL-Dashboard/src/components/ui/StatusBadge.tsx) | 67 | Orders table | inline `style` + raw hex | 4 tones, `rounded-full` + border, pulse dot for escalated |
| `TypeBadge` | [ui/TypeBadge.tsx](RIL-Dashboard/src/components/ui/TypeBadge.tsx) | 22 | Orders table | inline `style` + raw hex | 2 fixed tones, `rounded-md` — different radius from the badge beside it |
| `TrendChip` | [ui/TrendChip.tsx](RIL-Dashboard/src/components/ui/TrendChip.tsx) | 31 | `StatCard` | Tailwind + `bg-chip-*` tokens | 7 tones, `rounded-md`, forced arrow icon |
| `Pill` | [ui/Pill.tsx](RIL-Dashboard/src/components/ui/Pill.tsx) | 11 | **nowhere** | `glass-inset` | `rounded-full`, 11px |
| inline pill | [ui/CardHeader.tsx:24](RIL-Dashboard/src/components/ui/CardHeader.tsx#L24) | 1 | 3 dashboard cards | `glass-inset` | byte-for-byte the job of `Pill` |
| inline count chip | [ui/Tabs.tsx:64-75](RIL-Dashboard/src/components/ui/Tabs.tsx#L64-L75) | 12 | Orders tabs | inline `style` | `rounded-md`, active/inactive tone |
| inline "Soon" chip | [layout/SidebarItem.tsx:43](RIL-Dashboard/src/components/layout/SidebarItem.tsx#L43) | 3 | Sidebar | `bg-chip-neutral` | `rounded-md`, 10px |
| inline `DC_TREND` | [PieChart.tsx:19-21](RIL-Dashboard/src/components/PieChart.tsx#L19-L21) | 3 | PieChart centre | `border-border-hi` (legacy tokens) | `rounded-full` |
| inline `UNIT_PILL` | [pages/Demo.tsx:23-24](RIL-Dashboard/src/pages/Demo.tsx#L23-L24) | 2 | Demo page | legacy tokens | `rounded-full` |

**Behavioural differences:** `StatusBadge` is the only one that derives its tone from a string (`getStatusTone`) and the only one with an animated escalation dot. `TrendChip` forces a direction arrow. `Tabs`' chip is the only one that switches tone on an `isActive` prop. `Badge` is the only one accepting arbitrary `children` with a caller-chosen tone. None expose `title`/`aria-label`; none are keyboard-interactive (correct — they are all non-interactive).

**Visual differences:** three radii in play (`rounded-full`, `rounded-md`, and `glass-inset`'s 16px). Three type ramps: `text-xs font-medium` (Badge), `text-badge` = 12/700 (StatusBadge, TypeBadge, Tabs chip), `text-[12px] font-bold` (TrendChip), `text-[11px]`/`text-[10px]` (Pill, SidebarItem). Three colour sources: semantic Tailwind tokens (`bg-success-soft`), `--color-chip-*` tokens, and raw hex in inline styles.

**Recommendation:** keep **`Badge`** as the canonical primitive — it is the only one already driven by design tokens rather than raw hex, and its `tone` + `children` API is the superset shape. `StatusBadge` survives as a thin *wrapper* over `Badge` (it owns `getStatusTone`, which is genuinely valuable and correctly documented as the single source of truth). `TypeBadge`, `TrendChip`, `Pill` and all five inline chips collapse into `Badge` props.

**Props the canonical version must absorb:** `tone` (extend to `success|warning|danger|info|neutral|brand|violet|cyan`), `shape: 'pill' | 'square'` (covers `rounded-full` vs `rounded-md`), `size: 'xs' | 'sm' | 'md'`, `icon?: ReactNode` (TrendChip's arrow, StatusBadge's pulse dot), `variant: 'soft' | 'glass' | 'outline'` (covers `glass-inset` pills and StatusBadge's bordered look), `pulse?: boolean`.

**Migration effort:** **Medium** — 10 call sites (`Orders.tsx` ×2 via the two badges, `StatCard` ×1, `CardHeader` ×1, `Tabs` ×1, `SidebarItem` ×1, `PieChart` ×1, `Demo` ×3).

---

### Group: Card / Elevated Glass Surface

| Implementation | Path | Lines | Used in | Built with | Notes |
|---|---|---|---|---|---|
| `GlassCard` | [ui/GlassCard.tsx](RIL-Dashboard/src/components/ui/GlassCard.tsx) | 41 | 5 files (`StatCard`, 3 dashboard cards, `GreetingHero`) | `.glass-raised` + `--bloom` | bloom + interactive props |
| `.glass-raised` used directly | [ui/DataTable.tsx:85](RIL-Dashboard/src/components/ui/DataTable.tsx#L85), [ui/SummaryStrip.tsx:26](RIL-Dashboard/src/components/ui/SummaryStrip.tsx#L26), [ui/Toast.tsx:19](RIL-Dashboard/src/components/ui/Toast.tsx#L19) | 3 sites | Orders page | raw class + inline `--bloom` | bypasses `GlassCard` and re-declares the bloom by hand |
| `.glass-sidebar` | [index.css:366-379](RIL-Dashboard/src/index.css#L366-L379) | 14 | Sidebar | CSS | 95% identical recipe to `.glass-raised`, different blur/shadow constants |
| `GLASS_CARD` const | [pages/Demo.tsx:19](RIL-Dashboard/src/pages/Demo.tsx#L19) | 1 | Demo ×3 | Tailwind string, legacy tokens | `rounded-[28px]`, own shadow stack |
| inline card | [pages/RouteStub.tsx:14](RIL-Dashboard/src/pages/RouteStub.tsx#L14) | 1 | 5 routes | `bg-surface` legacy tokens | not glass at all — flat white, different design language |
| inline glass | [FloatingTooltip.tsx:73](RIL-Dashboard/src/components/FloatingTooltip.tsx#L73) | 1 | 3 charts | Tailwind arbitrary values | a fourth glass recipe |

**Behavioural differences:** only `GlassCard` supports the `--bloom` tint and the `glass-interactive` hover lift. `.glass-sidebar` has no `::before` specular highlight and no bloom. `Demo`'s version is the only one with `backdrop-saturate-150` expressed in Tailwind rather than CSS.

**Visual differences:** radius 24px (`.glass-raised`, `.glass-sidebar`) vs 28px (Demo) vs 16px (RouteStub `rounded-2xl`) vs 16px (FloatingTooltip). Blur 22px vs 26px vs 28px vs 18px. Border `rgba(255,255,255,0.92)` vs `--color-border` (`#0b0b0b1a`) — one is a white glass edge, the other a dark hairline.

**Recommendation:** keep **`GlassCard`**. It is the only one with the bloom system, it has the most call sites, and it matches the NyneOS token set rather than the legacy chart tokens. `.glass-sidebar` stays as a CSS rule (a sidebar genuinely needs a different radius profile) but should be re-expressed as a `GlassCard` variant. `Demo.tsx`'s `GLASS_CARD` and `RouteStub`'s card should both become `GlassCard`.

**Props the canonical version must absorb:** `as?: ElementType` (Demo uses `<section>`, Sidebar uses `<aside>`), `radius?: 'md' | 'lg' | 'xl'`, `padding?` or continue via `className`, `elevation?: 'raised' | 'inset' | 'flat'` (absorbs `.glass-inset` too), plus the existing `bloom` / `interactive`.

**Migration effort:** **Medium** — 12 call sites, but `DataTable`/`SummaryStrip`/`Toast` are trivial one-line swaps.

---

### Group: Nested Panel / Inset Surface

| Implementation | Path | Lines | Used in | Built with | Notes |
|---|---|---|---|---|---|
| `.glass-inset` | [index.css:258-266](RIL-Dashboard/src/index.css#L258-L266) | 9 | 11 files inline | CSS | no component wrapper exists at all |
| `.glass-tooltip` | [index.css:727-736](RIL-Dashboard/src/index.css#L727-L736) | 10 | `GateRail`, `ExceptionFlags` | CSS | same recipe, 10px radius instead of 16px, slightly more opaque |

**Behavioural differences:** none — both are pure surface recipes.
**Visual differences:** radius 16px vs 10px; fill `0.70→0.52` vs `0.96→0.88`; blur 12px vs 14px; `.glass-tooltip` adds a drop shadow.
**Recommendation:** keep `.glass-inset` as the CSS primitive, express `.glass-tooltip` as `.glass-inset` + a radius/opacity modifier, and surface both through `GlassCard`'s `elevation="inset"` so pages stop reaching for the raw class.
**Migration effort:** **Low** — CSS-only for the merge; 11 inline usages can migrate opportunistically.

---

### Group: Tab set / Segmented control / Toggle group

| Implementation | Path | Lines | Used in | Built with | Notes |
|---|---|---|---|---|---|
| `Tabs` | [ui/Tabs.tsx](RIL-Dashboard/src/components/ui/Tabs.tsx) | 81 | Orders | measured sliding pill, `role="tablist"` | supports counts |
| `SegmentedControl` | [ui/SegmentedControl.tsx](RIL-Dashboard/src/components/ui/SegmentedControl.tsx) | 38 | `DashboardFilters` | `glass-inset` + background swap | no counts, no roles |
| `SummaryStrip` (selectable mode) | [ui/SummaryStrip.tsx](RIL-Dashboard/src/components/ui/SummaryStrip.tsx) | 72 | Orders | `aria-pressed` buttons | third exclusive-choice control, on the *same page* as `Tabs` |

**Behavioural differences:** `Tabs` measures the active button and animates a pill via `useLayoutEffect` + resize listener, exposes `role="tablist"`/`role="tab"`/`aria-selected`. `SegmentedControl` has no ARIA roles and no animation. `SummaryStrip` uses `aria-pressed` (toggle semantics) and additionally renders a value — and on `Orders.tsx` it toggles the *same* `filter` state that `Tabs` sets, so the two controls can contradict each other visually (`Tabs` has no "delayed→all" toggle-off, `SummaryStrip` does — see `applyFilter` at [Orders.tsx:111-114](RIL-Dashboard/src/pages/Orders.tsx#L111-L114) vs the direct `setFilter` at [Orders.tsx:274-277](RIL-Dashboard/src/pages/Orders.tsx#L274-L277)). None implement arrow-key roving focus, which `role="tablist"` requires.

**Visual differences:** `Tabs` is a `rounded-full` glass rail with a white sliding pill; `SegmentedControl` is a `rounded-lg` inner-button rail with a `bg-brand-soft2` fill; `SummaryStrip` is a 72px tall raised card with a gradient underline.

**Recommendation:** keep **`Tabs`** as canonical for exclusive choice — it is more complete (ARIA, animation, counts, resize handling). `SegmentedControl` becomes `<Tabs size="sm" variant="segmented" />`. `SummaryStrip` is genuinely a different purpose (a KPI strip that *happens* to be clickable) and should stay, but its selection behaviour must be documented as "filter shortcut", not a second tab set.

**Props the canonical version must absorb:** `size: 'sm' | 'md'`, `variant: 'pill' | 'segmented'`, `toggleOff?: boolean` (clicking the active tab clears it — currently only `SummaryStrip` does this), and roving `onKeyDown` arrow-key support which neither has today.

**Migration effort:** **Low** — 2 call sites.

---

### Group: Tooltip / Hover hint

| Implementation | Path | Lines | Used in | Built with | Notes |
|---|---|---|---|---|---|
| `FloatingTooltip` | [FloatingTooltip.tsx](RIL-Dashboard/src/components/FloatingTooltip.tsx) | 84 | `LineChart`, `BarChart`, `PieChart` | framer-motion, self-measuring, viewport-clamped | also exports shared `TT_*` class constants |
| inline `.glass-tooltip` | [ui/GateRail.tsx:58-65](RIL-Dashboard/src/components/ui/GateRail.tsx#L58-L65), [ui/ExceptionFlags.tsx:67-74](RIL-Dashboard/src/components/ui/ExceptionFlags.tsx#L67-L74) | 8 each | Orders table | `useState` hover + absolute positioning | **will clip** — the ancestor `.glass-raised` sets `overflow: hidden` ([index.css:213](RIL-Dashboard/src/index.css#L213)) |
| inline hover label | [layout/SidebarItem.tsx:47-51](RIL-Dashboard/src/components/layout/SidebarItem.tsx#L47-L51) | 5 | collapsed sidebar | opacity transition on `group-hover` | dark `bg-ink-900` — a fourth visual language |

**Behavioural differences:** `FloatingTooltip` is the only one that measures itself and clamps to the viewport, and the only one with enter/exit animation. The two table tooltips duplicate identical `hovered` state machines. `SidebarItem`'s is CSS-only (no state), so it works on hover but never on keyboard focus. None of the three inline ones are announced to assistive tech.

**Visual differences:** light glass w/ 16px radius (FloatingTooltip) vs light glass w/ 10px radius (`.glass-tooltip`) vs solid dark `ink-900` w/ 8px radius (SidebarItem).

**Recommendation:** keep **`FloatingTooltip`**, generalise it out of `components/` into `components/ui/Tooltip.tsx`. It is the only implementation that cannot be clipped by an ancestor and the only one already used in 3 places. The two table tooltips have a latent clipping bug that the canonical component already solves.

**Props the canonical version must absorb:** a `trigger`-wrapping API (`<Tooltip content={…}><child/></Tooltip>`) so callers stop hand-rolling `hovered` state; `placement: 'top' | 'bottom' | 'cursor'`; `variant: 'glass' | 'dark'`; focus-visible triggering alongside hover.

**Migration effort:** **Medium** — 3 existing call sites keep working, 3 inline sites change, plus one API generalisation.

---

### Group: Text field / Search input

| Implementation | Path | Lines | Used in | Built with | Notes |
|---|---|---|---|---|---|
| `SearchInput` | [ui/SearchInput.tsx](RIL-Dashboard/src/components/ui/SearchInput.tsx) | 39 | Orders | `glass-inset` + `focus-bloom`, h-11 | leading icon, clear button |
| `.field` / `.field-input` / `.field-label` | [index.css:500-555](RIL-Dashboard/src/index.css#L500-L555) | 56 | `Login.tsx` ×2 | CSS classes, h-56px, solid white | label, `aria-invalid` state, trailing toggle slot |

**Behavioural differences:** `SearchInput` has a clear button and a leading icon but **no label, no error state, no id/`aria-describedby`**. The `.field` system has label + invalid state + a trailing-action slot but no clear button and no component wrapper at all — `Login.tsx` hand-writes the whole `<div class="field"><input class="field-input"/></div>` structure twice.

**Visual differences:** height 44px vs 56px. Radius 12px (`rounded-xl`) vs 14px. Fill translucent glass vs solid `#ffffff`. Border: none + `focus-bloom` indigo ring vs `1.5px #D6D8E0` + a **violet** `#7C3AED` focus ring — a colour that appears nowhere else in the token set (`--color-brand-600` is `#4F46E5`).

**Recommendation:** build one canonical **`TextField`** absorbing both. Neither existing one is a clean base — `SearchInput` has the better token hygiene, `.field` has the better a11y surface. `SearchInput` becomes `<TextField type="search" />`.

**Props the canonical version must absorb:** `label?`, `id`, `error?: string`, `size: 'md' | 'lg'`, `leadingIcon?`, `trailingAction?`, `clearable?`, `type`.

**Migration effort:** **Medium** — 3 call sites, but the Login page's visual identity would change unless the two sizes are preserved as variants.

---

### Group: Button

| Implementation | Path | Lines | Used in | Built with | Notes |
|---|---|---|---|---|---|
| `.btn-primary` | [index.css:595-637](RIL-Dashboard/src/index.css#L595-L637) | 43 | `Login.tsx` | CSS, gradient fill, sweep loading anim | the only one with a loading state |
| inline Export button | [pages/Orders.tsx:245-252](RIL-Dashboard/src/pages/Orders.tsx#L245-L252) | 8 | Orders | `glass-inset` h-11 | secondary/ghost style |
| `BUTTON` const | [ui/Pagination.tsx:11-12](RIL-Dashboard/src/components/ui/Pagination.tsx#L11-L12) | 2 | Pagination ×3 | `glass-inset` 34×34 | icon-button style |
| inline sidebar toggle | [layout/Sidebar.tsx:57-66, 70-77](RIL-Dashboard/src/components/layout/Sidebar.tsx#L57-L77) | 2× | Sidebar | plain `rounded-lg` hover | a fourth icon-button style |
| inline notification button | [layout/Topbar.tsx:21-28](RIL-Dashboard/src/components/layout/Topbar.tsx#L21-L28) | 8 | (dead) | `glass-inset` 36×36 | fifth icon-button style |
| inline link-button | [pages/RouteStub.tsx:18-23](RIL-Dashboard/src/pages/RouteStub.tsx#L18-L23) | 6 | 5 routes | legacy `border-border-subtle` | sixth style |

**Behavioural differences:** only `.btn-primary` has `:disabled` styling and a loading affordance. Only `Pagination`'s handles a disabled state (via opacity class, applied by the caller). None share a focus-visible treatment — `Login` applies `focus-visible:outline-*` inline, everything else has nothing.

**Visual differences:** heights 56 / 44 / 36 / 34 / 32px; radii 15 / 12 / 8px; fills gradient / glass / transparent / bordered-white.

**Recommendation:** **there is no canonical Button and one must be created.** This is the single highest-value item in this audit: six styles already exist across four pages with zero shared code, and every future page will add more.

**Props the canonical version must absorb:** `variant: 'primary' | 'secondary' | 'ghost' | 'icon'`, `size: 'sm' | 'md' | 'lg'`, `loading?`, `disabled`, `icon?`, `iconPosition`, `as?: 'button' | Link`, plus a shared `focus-visible` ring.

**Migration effort:** **Medium** — ~10 call sites, all mechanical.

---

### Group: Progress bar / Meter

| Implementation | Path | Lines | Used in | Built with | Notes |
|---|---|---|---|---|---|
| `ProgressMeter` | [ui/ProgressMeter.tsx](RIL-Dashboard/src/components/ui/ProgressMeter.tsx) | 68 | Orders table | animated width, `role="progressbar"` + aria values | 2 tones, optional % label |
| inline bar | [Loadingscreen.tsx:261-295](RIL-Dashboard/src/components/Loadingscreen.tsx#L261-L295) | 35 | app boot | inline `style`, `ls-shimmer` keyframes | no ARIA, 8px tall, own gradient |

**Behavioural differences:** `ProgressMeter` announces itself (`aria-valuenow/min/max`) and respects `prefers-reduced-motion` via `.progress-fill`; the loading-screen bar does neither and animates with a locally-injected `<style>` tag.
**Visual differences:** 6px vs 8px height; `rounded-full` both; indigo→violet gradient in both but written as two different hardcoded triples.
**Recommendation:** keep `ProgressMeter`; the loading screen should use it with `size="lg"` and a `shimmer` prop.
**Migration effort:** **Low** — 1 call site, though the loading screen is deliberately zero-dependency (it renders before the app CSS matters), which is a legitimate reason to leave it alone. Flagging, not urging.

---

### Group: Empty state / Placeholder

| Implementation | Path | Lines | Used in | Built with | Notes |
|---|---|---|---|---|---|
| `EmptyState` | [ui/EmptyState.tsx](RIL-Dashboard/src/components/ui/EmptyState.tsx) | 25 | Orders table | `glass-inset` icon tile | icon/title/description/action |
| `RouteStub` body | [pages/RouteStub.tsx:13-25](RIL-Dashboard/src/pages/RouteStub.tsx#L13-L25) | 13 | 5 routes | legacy tokens, flat white card | eyebrow/title/description/action — the same four slots |

**Behavioural differences:** none.
**Visual differences:** `RouteStub` is on the pre-NyneOS token set entirely (`bg-surface`, `text-ink-muted`, `border-border-subtle`, `.app-gradient-bg`) and does not use the app canvas or glass system. It is the most visually out-of-band screen in the app.
**Recommendation:** keep `EmptyState`; `RouteStub` should render `<AppShell><EmptyState …/></AppShell>`, which also fixes the missing sidebar on those five routes.
**Migration effort:** **Low** — 1 file, 5 routes benefit.

---

## 3. Inline Duplication

| File | ~Line | Hand-built | Should have used | Effort |
|---|---|---|---|---|
| [pages/Orders.tsx](RIL-Dashboard/src/pages/Orders.tsx#L245) | 245-252 | Export button (`glass-inset` h-11) | `Button variant="secondary"` (not yet built) | Low |
| [pages/Orders.tsx](RIL-Dashboard/src/pages/Orders.tsx#L184) | 184-189 | overdue text colour via raw `#BE123C` | `--color-kpi-danger-text` token | Low |
| [ui/DataTable.tsx](RIL-Dashboard/src/components/ui/DataTable.tsx#L85) | 85 | `.glass-raised` + inline `--bloom` | `GlassCard bloom=…` | Low |
| [ui/SummaryStrip.tsx](RIL-Dashboard/src/components/ui/SummaryStrip.tsx#L26) | 26 | `.glass-raised` + inline `--bloom` | `GlassCard` | Low |
| [ui/Toast.tsx](RIL-Dashboard/src/components/ui/Toast.tsx#L19) | 19 | `.glass-raised` + inline `--bloom` | `GlassCard` | Low |
| [ui/CardHeader.tsx](RIL-Dashboard/src/components/ui/CardHeader.tsx#L24) | 24 | glass pill | `Pill` (exists, unused) | Low |
| [ui/Tabs.tsx](RIL-Dashboard/src/components/ui/Tabs.tsx#L64) | 64-75 | count chip | `Badge size="xs"` | Low |
| [ui/GateRail.tsx](RIL-Dashboard/src/components/ui/GateRail.tsx#L58) | 58-65 | hover tooltip + hover state machine | `FloatingTooltip` | Medium |
| [ui/ExceptionFlags.tsx](RIL-Dashboard/src/components/ui/ExceptionFlags.tsx#L67) | 67-74 | hover tooltip + hover state machine (identical to above) | `FloatingTooltip` | Medium |
| [ui/ExceptionFlags.tsx](RIL-Dashboard/src/components/ui/ExceptionFlags.tsx#L78-L85) | 78-85 | "+N" overflow chip | `Badge` | Low |
| [ui/Pagination.tsx](RIL-Dashboard/src/components/ui/Pagination.tsx#L11) | 11-12, 22-25 | icon-button const; top border via inline `style` | `Button variant="icon"`; `--color-glass-hairline` | Low |
| [layout/SidebarItem.tsx](RIL-Dashboard/src/components/layout/SidebarItem.tsx#L43) | 43-51 | "Soon" chip + dark hover tooltip | `Badge`, `Tooltip` | Low |
| [layout/Sidebar.tsx](RIL-Dashboard/src/components/layout/Sidebar.tsx#L57) | 57-77 | two icon buttons, duplicated collapsed/expanded | `Button variant="icon"` | Low |
| [layout/Topbar.tsx](RIL-Dashboard/src/components/layout/Topbar.tsx#L21-L31) | 21-31 | icon button + avatar circle | `Button variant="icon"`, `Avatar` (not yet built) | Low |
| [pages/Login.tsx](RIL-Dashboard/src/pages/Login.tsx#L81-L122) | 81-122 | full labelled-field markup, twice | `TextField` (not yet built) | Medium |
| [pages/Login.tsx](RIL-Dashboard/src/pages/Login.tsx#L126-L138) | 126-138 | error banner (`glass-inset` + inline rose rgba) | `Alert`/`Badge tone="danger"` (not yet built) | Low |
| [pages/RouteStub.tsx](RIL-Dashboard/src/pages/RouteStub.tsx#L13-L25) | 13-25 | whole page shell + card + empty state + link button | `AppShell` + `EmptyState` + `Button` | Low |
| [pages/Demo.tsx](RIL-Dashboard/src/pages/Demo.tsx#L18-L24) | 18-24 | `GLASS_CARD`, `CARD_EYEBROW`, `CARD_TITLE`, `CARD_SUB`, `UNIT_PILL` consts — a parallel mini design system | `GlassCard` + `CardHeader` | Medium |
| [Loadingscreen.tsx](RIL-Dashboard/src/components/Loadingscreen.tsx#L86-L111) | 86-111 | 6 `@keyframes` injected via a `<style>` tag | `index.css` (`ls-shimmer` ≈ `btn-sweep`, `ls-status-fade` ≈ `fade-in`) | Low |

---

## 4. Library vs Hand-Rolled

| Dependency | Version | Where imported | Hand-built equivalent exists? | Recommendation |
|---|---|---|---|---|
| `@radix-ui/react-select` | ^2.3.7 | **1 file** — [ui/Select.tsx](RIL-Dashboard/src/components/ui/Select.tsx) | No (`FilterSelect` was removed; only a stale comment at [index.css:747](RIL-Dashboard/src/index.css#L747) remains) | **Keep.** This is the incident's canonical winner. Note the audit brief calls it "react-select" — the package is Radix's select, and plain `react-select` is *not* installed. |
| `framer-motion` | ^12.42.2 | 6 files — `FloatingTooltip`, `AnimatedNumber`, `LineChart`, `BarChart`, `PieChart`, `Demo` | Yes, partially — `index.css` has a parallel CSS-keyframe animation system (`.animate-rise`, `.animate-fade`, `.animate-slide-left`, `.tab-pill`, `.progress-fill`) used by every non-chart component | **Keep, but scope it.** Draw the line explicitly: framer-motion for charts + tooltips only; CSS keyframes for page/entrance/state transitions. Today the boundary is accidental, not stated. Note the CSS system honours `prefers-reduced-motion` ([index.css:759-784](RIL-Dashboard/src/index.css#L759-L784)); the framer-motion usages do **not**. |
| `lucide-react` | ^1.26.0 | 17 files | No other icon set installed | **Keep.** Only icon library; no drift here. One naming inconsistency: `WarehouseIcon` in `Loadingscreen.tsx:1` vs `Warehouse` elsewhere — same icon, two import aliases. |
| `react-router-dom` | ^7.18.2 | 8 files | No | **Keep.** |
| `tailwindcss` + `@tailwindcss/vite` | ^4.3.3 | build + `index.css` | n/a | **Keep.** Tailwind v4 with `@theme` / `@utility` — the `@utility text-*` semantic scale is good practice and should be extended, not bypassed. |
| `react` / `react-dom` | ^19.2.7 | — | — | **Keep.** |

**Not installed, and worth noting before the next page:** no date library (relative-time is hand-rolled in [orderFilters.ts:46-56](RIL-Dashboard/src/lib/orderFilters.ts#L46-L56)), no table library (`DataTable` is a hand-built CSS-grid table — a deliberate and reasonable choice given the glass styling), no modal/dialog library (nothing exists yet — `@radix-ui/react-dialog` would be the consistent choice given Radix is already a dependency), no toast library (`ui/Toast.tsx` is hand-built and has no stacking/queue). **No dependency is installed-but-unused.**

---

## 5. CSS Duplication

| Rules | Lines | Overlap | Recommendation |
|---|---|---|---|
| `.glass-raised` vs `.glass-sidebar` | [192-216](RIL-Dashboard/src/index.css#L192-L216) vs [366-379](RIL-Dashboard/src/index.css#L366-L379) | Same gradient-fill + backdrop-blur + white-border + 24px radius recipe; differ only in blur (22 vs 26), saturate (155 vs 150) and shadow constants | `.glass-sidebar` becomes `.glass-raised` + a modifier. **`.glass-raised` survives.** |
| `.glass-inset` vs `.glass-tooltip` | [258-266](RIL-Dashboard/src/index.css#L258-L266) vs [727-736](RIL-Dashboard/src/index.css#L727-L736) | Same recipe; differ in radius (16 vs 10) and fill opacity | Merge; **`.glass-inset` survives** with a radius modifier. |
| `.app-canvas` vs `.app-gradient-bg` | [165-187](RIL-Dashboard/src/index.css#L165-L187) vs [158-160](RIL-Dashboard/src/index.css#L158-L160) | Two whole-page backgrounds. `.app-gradient-bg` is used only by `RouteStub` and depends on the legacy `--color-brand-soft` | **`.app-canvas` survives**; delete `.app-gradient-bg` once `RouteStub` uses `AppShell`. |
| `@keyframes btn-sweep` vs `ls-shimmer` | [637](RIL-Dashboard/src/index.css#L637) vs [Loadingscreen.tsx:103-106](RIL-Dashboard/src/components/Loadingscreen.tsx#L103-L106) | Identical translateX sweep, different distances | One `@keyframes sweep` in `index.css`. |
| `@keyframes fade-in` vs `ls-status-fade` | [466-469](RIL-Dashboard/src/index.css#L466-L469) vs [Loadingscreen.tsx:107-110](RIL-Dashboard/src/components/Loadingscreen.tsx#L107-L110) | Fade + small translateY | `rise-in` already covers this. |
| `@keyframes ls-blob-1/2/3` | [Loadingscreen.tsx:87-98](RIL-Dashboard/src/components/Loadingscreen.tsx#L87-L98) | Three near-identical float animations differing only in translate deltas | One keyframe + per-element CSS vars. |
| `@keyframes gate-pulse` vs `gate-pulse-danger` | [716-725](RIL-Dashboard/src/index.css#L716-L725) | Identical, differ only by colour | One keyframe driven by `currentColor` or a `--pulse` var. |
| `@keyframes status-dot-pulse` vs `kpi-halo-pulse` | [648-652](RIL-Dashboard/src/index.css#L648-L652) vs [428-436](RIL-Dashboard/src/index.css#L428-L436) | Both scale-up + fade-out attention pulses | Could merge; low priority (different scale factors are meaningful). |
| `.focus-bloom` | [749-757](RIL-Dashboard/src/index.css#L749-L757) | Comment claims it is "shared by SearchInput / **FilterSelect**" — FilterSelect no longer exists, and `Select.tsx` hand-rolls its own focus ring at [Select.tsx:42-46](RIL-Dashboard/src/components/ui/Select.tsx#L42-L46) instead of using this class | Fix the comment; make `Select` use `.focus-bloom` so focus treatment is identical across form controls. **This is the residue of the original incident.** |
| Legacy token block vs NyneOS token block | [9-48](RIL-Dashboard/src/index.css#L9-L48) vs [50-142](RIL-Dashboard/src/index.css#L50-L142) | `--color-text-0/1/2` ≈ `--color-ink-900/600/400`; `--color-card` ≈ glass fill; `--color-border` ≈ `--color-glass-hairline`; `--color-good/critical` ≈ `--color-success/danger`; `--color-brand-primary/--color-surface/--color-ink*` used only by `RouteStub` | **NyneOS set survives.** The legacy set is only reachable from the three charts + `Demo` + `RouteStub`. Migrating the charts is the real work here. |

---

## 6. Logic, Type, Data, and Token Duplication

### 6a. Logic

| Duplicated | Paths | Single source of truth should live in |
|---|---|---|
| Catmull-Rom / cubic path smoothing — **three implementations** | [lib/liquidPath.ts:1-16](RIL-Dashboard/src/lib/liquidPath.ts#L1-L16) `smoothPath`, [LineChart.tsx:55-70](RIL-Dashboard/src/components/LineChart.tsx#L55) `smoothLine`, [LiquidSurface.tsx:55-68](RIL-Dashboard/src/components/LiquidSurface.tsx#L55-L68) | `lib/liquidPath.ts` — one function, accepting both point shapes |
| Status → colour/tone mapping — **seven maps** | `getStatusTone` [StatusBadge.tsx:16-24](RIL-Dashboard/src/components/ui/StatusBadge.tsx#L16-L24); `TONE_CLASSES` [Badge.tsx:11-17](RIL-Dashboard/src/components/ui/Badge.tsx#L11-L17); `TONE_CLASSES` [TrendChip.tsx:11-19](RIL-Dashboard/src/components/ui/TrendChip.tsx#L11-L19); `TONE` [ExceptionFlags.tsx:32-41](RIL-Dashboard/src/components/ui/ExceptionFlags.tsx#L32-L41); `TONE_COLOR` [SummaryStrip.tsx:17-21](RIL-Dashboard/src/components/ui/SummaryStrip.tsx#L17-L21); `TONE_DOT` [GreetingHero.tsx:12-16](RIL-Dashboard/src/components/dashboard/GreetingHero.tsx#L12-L16); `STYLE` [TypeBadge.tsx:7-10](RIL-Dashboard/src/components/ui/TypeBadge.tsx#L7-L10) | `lib/tone.ts` — one `Tone` union + one tone→token map; `getStatusTone` stays as the string→tone classifier |
| Currency formatting `₹x.x Cr` | [orderFilters.ts:58-60](RIL-Dashboard/src/lib/orderFilters.ts#L58-L60) `formatValue` vs inline template at [KpiRow.tsx:80](RIL-Dashboard/src/components/dashboard/KpiRow.tsx#L80) | `lib/format.ts` |
| Date formatting | `en-GB` day/month/year at [orderFilters.ts:48](RIL-Dashboard/src/lib/orderFilters.ts#L48) vs `en-IN` weekday/day/month/year at [GreetingHero.tsx:19-24](RIL-Dashboard/src/components/dashboard/GreetingHero.tsx#L19-L24) | `lib/format.ts` — two locales in one app is a visible inconsistency |
| Relative time ("in N days" / "N days overdue") | [orderFilters.ts:46-56](RIL-Dashboard/src/lib/orderFilters.ts#L46-L56) — single implementation, but hardwired to the `TODAY` constant imported from mock data | `lib/format.ts`, with the clock injected |
| Percent formatting `.toFixed(1)%` | [BarChart.tsx:371,379](RIL-Dashboard/src/components/BarChart.tsx#L371), [LineChart.tsx:537](RIL-Dashboard/src/components/LineChart.tsx#L537), [PieChart.tsx:277,286,339,360,368](RIL-Dashboard/src/components/PieChart.tsx#L277) | `lib/format.ts` |
| Sort comparators | [Orders.tsx:39-56](RIL-Dashboard/src/pages/Orders.tsx#L39-L56) `compare` — local to the page; `DataTable` owns sort *state* but not sort *logic*, so page 2 will rewrite this | `DataTable` should accept `comparator` per column |
| Deterministic pseudo-random / stagger seeding | [Sparkline.tsx:14-18](RIL-Dashboard/src/components/ui/Sparkline.tsx#L14-L18) `hashStagger` vs [BarChart.tsx:33-40](RIL-Dashboard/src/components/BarChart.tsx#L33) `seeded` | `lib/seed.ts` |
| Spotlight mouse-tracking handler | [StatCard.tsx:25-29](RIL-Dashboard/src/components/ui/StatCard.tsx#L25-L29) `handleSpotlight` — passed to `GlassCard`'s `onMouseMove` | Move into `GlassCard` behind a `spotlight` prop; today any new card must re-implement it |

### 6b. Types

| Duplicated | Paths | Single source of truth should live in |
|---|---|---|
| `ContractType = 'Manufactured' \| 'Material'` | [lib/types/order.ts:1](RIL-Dashboard/src/lib/types/order.ts#L1) **and** [lib/mockData/dashboard.ts:20](RIL-Dashboard/src/lib/mockData/dashboard.ts#L20) | `lib/types/order.ts` |
| `GateState` + gate shape | [lib/types/order.ts:5-11](RIL-Dashboard/src/lib/types/order.ts#L5-L11) (`Gate`) **and** [ui/GateRail.tsx:3-9](RIL-Dashboard/src/components/ui/GateRail.tsx#L3-L9) (`GateSegment`) — structurally identical, two names | `lib/types/order.ts`; `GateRail` imports it |
| Exception flag shape | [lib/types/order.ts:13-18](RIL-Dashboard/src/lib/types/order.ts#L13-L18) (`ExceptionFlagType`/`ExceptionFlag`) **and** [ui/ExceptionFlags.tsx:5-10](RIL-Dashboard/src/components/ui/ExceptionFlags.tsx#L5-L10) (`ExceptionType`/`ExceptionFlagItem`) | `lib/types/order.ts` |
| `Option<T> { value; label }` | [ui/Select.tsx:4-7](RIL-Dashboard/src/components/ui/Select.tsx#L4-L7) **and** [ui/SegmentedControl.tsx:1-4](RIL-Dashboard/src/components/ui/SegmentedControl.tsx#L1-L4) | `lib/types/ui.ts` |
| Plant identity — **three representations** | `Plant` name union [types/order.ts:3](RIL-Dashboard/src/lib/types/order.ts#L3); `PlantId` slug union [mockData/dashboard.ts:21](RIL-Dashboard/src/lib/mockData/dashboard.ts#L21); `ORDER_PLANTS` string tuple [mockData/orders.ts:347](RIL-Dashboard/src/lib/mockData/orders.ts#L347) | One `Plant` type + one id↔label map |
| Tone unions — **six overlapping** | `BadgeTone` (Badge), `TrendTone` (TrendChip), `StatusTone` (StatusBadge), `SummaryTone` (SummaryStrip), `ProgressTone` (ProgressMeter), `BloomTone` (GlassCard) | One `Tone` union in `lib/types/ui.ts`; components narrow it with `Extract<Tone, …>` |

### 6c. Data

| Duplicated | Paths | Single source of truth should live in |
|---|---|---|
| Plant list — **five declarations** | `PLANTS` [dashboard.ts:35-41](RIL-Dashboard/src/lib/mockData/dashboard.ts#L35-L41); `PLANT_BREAKDOWN` ids [dashboard.ts:46-52](RIL-Dashboard/src/lib/mockData/dashboard.ts#L46-L52); `PLANT_SEGMENTS` keys [dashboard.ts:74-80](RIL-Dashboard/src/lib/mockData/dashboard.ts#L74-L80); `ORDER_PLANTS` [orders.ts:347](RIL-Dashboard/src/lib/mockData/orders.ts#L347); `Plant` union [types/order.ts:3](RIL-Dashboard/src/lib/types/order.ts#L3) | One `PLANTS` registry that everything derives from |
| **Order counts that cannot agree** | Dashboard KPIs sum from `PLANT_BREAKDOWN` to 42 active orders ([dashboard.ts:43-52](RIL-Dashboard/src/lib/mockData/dashboard.ts#L43-L52)); the Orders page counts rows in `ORDERS` ([orders.ts:26+](RIL-Dashboard/src/lib/mockData/orders.ts#L26), ~24 rows). A user clicking the "Active Orders 42" KPI lands on a list that shows a different number. The comment at [orders.ts:1-2](RIL-Dashboard/src/lib/mockData/orders.ts#L1-L2) says the first eight rows "must stay byte-identical" to what the Dashboard reads — an invariant enforced only by a comment. | Derive `PLANT_BREAKDOWN` from `ORDERS` |
| Status vocabulary — three lists | `STATUS_SEGMENTS` keys/labels [dashboard.ts:64-71](RIL-Dashboard/src/lib/mockData/dashboard.ts#L64-L71); free-text `Order.status` strings throughout `orders.ts`; the keyword arrays in `getStatusTone` [StatusBadge.tsx:6-10](RIL-Dashboard/src/components/ui/StatusBadge.tsx#L6-L10) | One `OrderStatus` union; `getStatusTone` maps from it exhaustively instead of substring-matching free text |
| Route/nav registry — three declarations | `App.tsx` `<Route>` list [App.tsx:16-26](RIL-Dashboard/src/App.tsx#L16-L26); `PRIMARY_NAV` [Sidebar.tsx:23-29](RIL-Dashboard/src/components/layout/Sidebar.tsx#L23-L29); `PAGE_NAMES` [Topbar.tsx:4-10](RIL-Dashboard/src/components/layout/Topbar.tsx#L4-L10) | One `lib/routes.ts` |
| Segment palettes | `SEGMENTS` [data/segments.ts:24-30](RIL-Dashboard/src/data/segments.ts#L24-L30) (Demo only) vs `STATUS_SEGMENTS` / `PLANT_SEGMENTS` [dashboard.ts:64-80](RIL-Dashboard/src/lib/mockData/dashboard.ts#L64-L80) — three hardcoded `from/to/glow` triples per set, overlapping hues written as raw hex | A `dataHue(index)` helper over the `--color-data-*` tokens |
| KPI trend values | `trend`/`trendValue` are hardcoded per card in [KpiRow.tsx](RIL-Dashboard/src/components/dashboard/KpiRow.tsx) (`"6"`, `"2"`, `"1"`…) while `KPI_SPARKLINES` holds the actual series they should be computed from | Derive from `KPI_SPARKLINES` |

### 6d. Tokens

| Duplicated | Paths | Single source of truth should live in |
|---|---|---|
| `#4F46E5` / `#8B5CF6` (brand→violet gradient) | [ProgressMeter.tsx:14](RIL-Dashboard/src/components/ui/ProgressMeter.tsx#L14), [GateRail.tsx:23-24](RIL-Dashboard/src/components/ui/GateRail.tsx#L23-L24), [index.css:389](RIL-Dashboard/src/index.css#L389) (`.sidebar-item-indicator`), [index.css:675](RIL-Dashboard/src/index.css#L675) (`.dt-row::before`), [SummaryStrip.tsx:44](RIL-Dashboard/src/components/ui/SummaryStrip.tsx#L44), [Loadingscreen.tsx:216,277](RIL-Dashboard/src/components/Loadingscreen.tsx#L216) — while `--color-brand-600` / `--color-violet-500` already exist | A `--gradient-liquid` token |
| `#BE123C` (danger text) | [StatusBadge.tsx:34](RIL-Dashboard/src/components/ui/StatusBadge.tsx#L34), [ExceptionFlags.tsx:32](RIL-Dashboard/src/components/ui/ExceptionFlags.tsx#L32), [SummaryStrip.tsx:19](RIL-Dashboard/src/components/ui/SummaryStrip.tsx#L19), [ProgressMeter.tsx:15](RIL-Dashboard/src/components/ui/ProgressMeter.tsx#L15), [Orders.tsx:186](RIL-Dashboard/src/pages/Orders.tsx#L186) — `--color-kpi-danger-text` is exactly this value | `--color-kpi-danger-text` |
| `#B45309` (warning text) | [StatusBadge.tsx:33](RIL-Dashboard/src/components/ui/StatusBadge.tsx#L33), [ExceptionFlags.tsx:33](RIL-Dashboard/src/components/ui/ExceptionFlags.tsx#L33), [SummaryStrip.tsx:20](RIL-Dashboard/src/components/ui/SummaryStrip.tsx#L20) — `--color-kpi-warning-text` is exactly this value | `--color-kpi-warning-text` |
| `rgba(15,23,42,0.0x)` hairlines | [SummaryStrip.tsx:52](RIL-Dashboard/src/components/ui/SummaryStrip.tsx#L52), [Pagination.tsx:24](RIL-Dashboard/src/components/ui/Pagination.tsx#L24), [ProgressMeter.tsx:44](RIL-Dashboard/src/components/ui/ProgressMeter.tsx#L44), [GateRail.tsx:26](RIL-Dashboard/src/components/ui/GateRail.tsx#L26), [Select.tsx:31,69](RIL-Dashboard/src/components/ui/Select.tsx#L31), `index.css` ×5 — at four different alpha values | `--color-glass-hairline` (+ one deep variant) |
| `rgba(79,70,229,0.0x)` brand washes | [Select.tsx:40-46,98-102](RIL-Dashboard/src/components/ui/Select.tsx#L40-L46), [SummaryStrip.tsx:58](RIL-Dashboard/src/components/ui/SummaryStrip.tsx#L58), [Pagination.tsx:51](RIL-Dashboard/src/components/ui/Pagination.tsx#L51), [Tabs.tsx:69-70](RIL-Dashboard/src/components/ui/Tabs.tsx#L69-L70), `index.css` ×6 — six alpha values for the same hover/active wash | `--wash-brand-hover` / `--wash-brand-active` |
| `#7C3AED` focus ring | [index.css:537-540](RIL-Dashboard/src/index.css#L537-L540) — a violet that exists nowhere else; every other focus state is `rgba(79,70,229,…)` | `--color-brand-600` |
| Radius scale | 24px (`.glass-raised`), 16px (`.glass-inset`), 15px (`.btn-primary`), 14px (`.field-input`), 10px (`.glass-tooltip`), 28px (Demo), plus Tailwind `rounded-xl/2xl/lg/md/full` throughout | `--radius-sm/md/lg/xl` tokens |
| Duplicate greys | `--color-text-0/1/2` (#0b0b0b/#52514e/#898781) alongside `--color-ink-900/600/400` (#0A0E1A/#4A5468/#8A94A6); `--color-good/critical` alongside `--color-success/danger` | Collapse onto the NyneOS ink + semantic scales |

---

## 7. Proposed Canonical Registry

Exactly one component per purpose. "Status" marks what exists today.

| Purpose | Canonical component | Path | Variants via props | Replaces | Status |
|---|---|---|---|---|---|
| Dropdown / select | `Select` | `ui/Select.tsx` | `size`, `variant`, `searchable`, `multiple`, `disabled`, `placeholder`, `error` | `FilterSelect` (already removed) | **exists** |
| Card / elevated surface | `GlassCard` | `ui/GlassCard.tsx` | `bloom`, `interactive`, `spotlight`, `elevation: raised\|inset\|flat`, `radius`, `as` | `.glass-sidebar`, `Demo.GLASS_CARD`, `RouteStub` card, direct `.glass-raised` usage ×3 | **exists** |
| Card header | `CardHeader` | `ui/CardHeader.tsx` | `eyebrow`, `icon`, `subtitle`, `pill`, `actions` | `Demo` CARD_* consts | **exists** |
| Page header | `PageHeader` | `ui/PageHeader.tsx` | `title`, `subtitle`, `actions`, `breadcrumb` | — | **exists** |
| Button | `Button` | `ui/Button.tsx` | `variant: primary\|secondary\|ghost\|icon\|link`, `size`, `loading`, `disabled`, `icon`, `iconPosition`, `as` | `.btn-primary`, Orders Export, `Pagination.BUTTON`, Sidebar toggles, Topbar bell, RouteStub link | **not yet built** |
| Label / badge / chip | `Badge` | `ui/Badge.tsx` | `tone`, `shape: pill\|square`, `size`, `variant: soft\|glass\|outline`, `icon`, `pulse` | `Pill`, `TypeBadge`, `TrendChip`, Tabs count chip, CardHeader pill, SidebarItem "Soon", `DC_TREND`, `UNIT_PILL`, ExceptionFlags "+N" | **exists (unused)** |
| Status label | `StatusBadge` | `ui/StatusBadge.tsx` | `status`, `size` — thin wrapper over `Badge`, owns `getStatusTone` | — | **exists** |
| Text field / search | `TextField` | `ui/TextField.tsx` | `type`, `label`, `error`, `size`, `leadingIcon`, `trailingAction`, `clearable` | `SearchInput`, `.field`/`.field-input`/`.field-label` | **not yet built** (`SearchInput` becomes a preset) |
| Table | `DataTable` | `ui/DataTable.tsx` | `density`, `stagger`, `sort`, `comparator` per column, `maxHeight`, `minWidth`, `footer`, `emptyState`, `selectable`, `stickyColumn` | — | **exists** |
| Pagination | `Pagination` | `ui/Pagination.tsx` | `page`, `pageCount`, `pageSize`, `total`, `compact` | — | **exists** |
| Tab set / toggle group | `Tabs` | `ui/Tabs.tsx` | `size`, `variant: pill\|segmented`, `counts`, `toggleOff`, arrow-key roving focus | `SegmentedControl` | **exists** |
| KPI / summary strip | `SummaryStrip` | `ui/SummaryStrip.tsx` | `items`, `onSelect`, `tone`, `size` | — | **exists** |
| Stat card | `StatCard` | `ui/StatCard.tsx` | `bloom`, `trend`, `sparkline`, `href`, `delay` | — | **exists** |
| Progress bar / meter | `ProgressMeter` | `ui/ProgressMeter.tsx` | `tone`, `size`, `showLabel`, `shimmer`, `delay` | Loading-screen inline bar | **exists** |
| Stage / gate rail | `GateRail` | `ui/GateRail.tsx` | `compact`, `blocked`, `orientation` | — | **exists** |
| Exception flags | `ExceptionFlags` | `ui/ExceptionFlags.tsx` | `flags`, `max`, `size` | — | **exists** |
| Tooltip | `Tooltip` | `ui/Tooltip.tsx` (move `FloatingTooltip`) | `placement: top\|bottom\|cursor`, `variant: glass\|dark`, `gap` | GateRail inline, ExceptionFlags inline, SidebarItem inline | **exists, needs move + wrapping API** |
| Toast | `Toast` + `ToastProvider` | `ui/Toast.tsx` | `tone`, `duration`, `action`, queue/stacking | — | **exists (no queue)** |
| Empty state | `EmptyState` | `ui/EmptyState.tsx` | `icon`, `title`, `description`, `action`, `size` | `RouteStub` body | **exists** |
| Sparkline | `Sparkline` | `ui/Sparkline.tsx` | `data`, `fill`, `text`, `uid` | — | **exists** |
| Line chart | `LineChart` | `components/LineChart.tsx` | `secondaryData`, labels, `fillHeight` | — | **exists** |
| Bar chart | `BarChart` | `components/BarChart.tsx` | `data`, `unit`, `showTrend` | — | **exists** |
| Pie / donut chart | `PieChart` | `components/PieChart.tsx` | `data`, `showTrend`, centre labels | — | **exists** |
| Animated number | `AnimatedNumber` | `components/AnimatedNumber.tsx` | `decimals`, `prefix`, `suffix`, `duration` | — | **exists** |
| App shell | `AppShell` | `layout/AppShell.tsx` | `children`, `topbar?` | `RouteStub`'s own shell | **exists** |
| Sidebar / nav item | `Sidebar` + `SidebarItem` | `layout/` | `collapsed`, `soon`, `disabled` | — | **exists** |
| Loading screen | `LoadingScreen` | `components/Loadingscreen.tsx` | `onComplete` | — | **exists** |
| Modal / dialog | `Modal` | `ui/Modal.tsx` | `size`, `title`, `footer`, `dismissible` | — | **not yet built** — use `@radix-ui/react-dialog` |
| Drawer / sheet | `Drawer` | `ui/Drawer.tsx` | `side`, `size` | — | **not yet built** — same Radix dialog primitive |
| Popover / menu | `Popover` | `ui/Popover.tsx` | `placement`, `trigger` | — | **not yet built** — `@radix-ui/react-popover` |
| Avatar | `Avatar` | `ui/Avatar.tsx` | `size`, `src`, `initials`, `tone` | Topbar inline "RS" circle | **not yet built** |
| Skeleton / shimmer | `Skeleton` | `ui/Skeleton.tsx` | `variant: text\|rect\|circle`, `lines` | — | **not yet built** |
| Alert / inline message | `Alert` | `ui/Alert.tsx` | `tone`, `icon`, `dismissible` | Login error banner | **not yet built** |
| Checkbox / radio / switch | `Checkbox`, `Radio`, `Switch` | `ui/` | `size`, `label`, `disabled` | Login "remember" state exists with no UI ([Login.tsx:15](RIL-Dashboard/src/pages/Login.tsx#L15)) | **not yet built** |
| Date picker | `DatePicker` | `ui/DatePicker.tsx` | `range`, `min`, `max` | — | **not yet built** |
| Breadcrumb | `Breadcrumb` | `ui/Breadcrumb.tsx` | `items` | — | **not yet built** |

**Supporting single-sources-of-truth (non-component):**

| Purpose | Path | Status |
|---|---|---|
| Tone union + tone→token map | `lib/tone.ts` | not yet built |
| Formatters (currency, date, relative, percent) | `lib/format.ts` | not yet built |
| Shared UI types (`Option`, `Tone`, `Size`) | `lib/types/ui.ts` | not yet built |
| Domain types (`Order`, `Gate`, `ExceptionFlag`, `Plant`, `OrderStatus`) | `lib/types/order.ts` | exists, incomplete |
| Route + nav registry | `lib/routes.ts` | not yet built |
| Path smoothing | `lib/liquidPath.ts` | exists, duplicated ×3 |

---

## 8. Recommended Rule for CLAUDE.md

There is no `CLAUDE.md` in this repository today. Proposed wording to add (as a new `## Components` section):

> ## Components
>
> **One component per purpose. No exceptions.**
>
> Before creating any component, search `src/components/` for one that serves the same purpose. "Same purpose" means a user would describe them with the same sentence — "it's a dropdown", "it's a card", "it's a badge", "it's a button". A component that looks different but does the same job is the **same** component. Different styling is expressed with a prop, never with a second file.
>
> **Before writing any UI, do this in order:**
> 1. Check `COMPONENT_AUDIT.md` §7 (Canonical Registry). If a canonical component is listed for the purpose, use it.
> 2. If it exists but lacks what you need, **add a prop to it**. Do not fork it, wrap it, or copy it.
> 3. If it does not exist, create it in `src/components/ui/`, and add a row to the registry in the same change.
> 4. If the registry marks it "not yet built", build that one — do not build a page-local alternative.
>
> **Never do these:**
> - Never create a second component for an existing purpose, whatever it is named or wherever it lives. `FilterSelect` next to `Select` is the exact mistake this rule exists to prevent.
> - Never hand-roll markup in a page or feature file that an existing primitive already renders — no inline `glass-raised` divs, no bare `<select>`, no `rounded-full px-2` chips, no `<button className="…">` once `Button` exists.
> - Never hardcode a colour, radius, shadow, or gradient that is already a CSS variable in `index.css`. Raw hex belongs in `@theme` and nowhere else.
> - Never redeclare a type that already exists in `src/lib/types/`. Import it.
> - Never re-implement a helper that exists in `src/lib/` (formatting, tone mapping, path smoothing, sorting).
> - Never add a UI dependency when a hand-built equivalent already ships, or a hand-built equivalent when a dependency already ships. Radix is the chosen primitive library; lucide-react is the only icon set.
>
> **Naming:** a component's name states its purpose, not its context. `Select`, not `FilterSelect` or `PlantDropdown`. If you find yourself prefixing a name with the page or feature it appears on, you are about to create a duplicate.
>
> **When variation is genuinely needed**, add a prop with a small closed union — `variant`, `size`, `tone`, `density` — and give it a default that matches current usage so no existing call site changes.
>
> **When you touch a component, leave the registry true.** Adding, renaming, merging, or deleting a component means updating `COMPONENT_AUDIT.md` §7 in the same change.

---

*End of audit. No application file was modified.*
