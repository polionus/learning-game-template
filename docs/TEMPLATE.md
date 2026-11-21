# Game Template & Disc Authoring Guide

The application is split cleanly between the reusable template core and swappable content discs so the entire game engine, progression loop, UI shell, and theme system can be reused for completely different subjects (“discs”):

```text
src/
  template/        Subject-agnostic shell, state, progression, theme engine, built-in levels
  games/
    registry.ts    Build-time registry mapping VITE_GAME ids to discs
    starter/       Patterncraft starter disc (example regex learning game)
```

---

## Selecting a disc

Select which disc is compiled into the bundle with the `VITE_GAME` environment variable (defaults to `starter` in `vite.config.ts`):

```sh
npm run dev                  # runs the default disc (starter)
npm run build                # builds the default disc into dist/
VITE_GAME=<your-id> npm run dev
VITE_GAME=<your-id> npm run build
```

`vite.config.ts` resolves `'virtual:game-disc'` to the selected disc module and injects the disc’s `<title>`, description, storage key, and splash colors from `src/games/<id>/meta.ts` into `index.html`.

---

## Creating a new game disc

1. **Create `src/games/<your-id>/meta.ts`** (Node-safe: no React/DOM imports):
   Export `meta` with `id`, `name`, `homeTitle`, `description`, `storageKey`, and light/dark splash hex colors.

2. **Author content & implement `GameDisc` in `src/games/<your-id>/disc.tsx`**:
   Import types and helpers from `../../template/index.ts`. Key fields of `GameDisc`:
   - `brand`: App identity, optional `mark` (just the 32×32 icon beside the name) or a full custom `<logo />`, storage key, footer links.
   - `theme`: Built-in palette preset + optional light/dark/typography/radius/layout overrides + `worldVisuals` + optional player palette picker toggle.
   - `worlds`, `allCodex`, `codexKinds`, `findLevel`: Curriculum DAG and reference codex.
   - `lessons`, `chapters`, `guide`, `gallery`: Optional learning prose and interactive exhibits.
   - `levelKinds`: Custom `LevelKindDef` renderers merged on top of the template’s built-in level kinds.
   - `extraScreens`: Optional domain-specific routes mounted at `#/<name>` and optionally surfaced in navigation. `navOrder` (a list of nav item names) sets the sidebar order when the default (core items, then extras) isn't what you want.
   - Keep the disc file light: it loads with the app shell. Import screen-only components lazily with `React.lazy`, and wrap heavy custom level views or editors with `React.lazy` inside your `levelKinds` renderers so they only load when a level is opened.
   - `progression`: Custom rank ladders, achievement badges/groups, daily quest configuration, lesson auto-open heuristics.
   - `hooks`: Optional slots for domain banners, dashboard widgets, PlayerCard/Profile stats, custom settings toggles, hint filters, inventory drawers, and custom stuck-help panels.

3. **Register the disc** in `src/games/registry.ts` so `VITE_GAME=<your-id>` works cleanly (and update the default in `vite.config.ts` if you replace `starter`).

---

## Built-in vs. custom level kinds

Every disc automatically supports three built-in subject-agnostic level types (`src/template/levels/builtins.ts`):

| Kind     | Purpose                                                    |
| -------- | ---------------------------------------------------------- |
| `choice` | Concept check / multiple choice with per-option feedback   |
| `order`  | Reorder tokens or steps from a shuffled pool (+ distractors) |
| `text`   | Text/expression input with custom normalizer & mistake hints |

To add a specialized interactive task (like Patterncraft’s live regex matcher), register a `LevelKindDef` under `disc.levelKinds[<kind>]`:

```tsx
levelKinds: {
  pattern: {
    label: 'Pattern Match',
    icon: 'sparkle',
    baseXp: 25,
    solutionText: (l) => (l as PatternLevel).solutions[0] ?? null,
    renderSolution: (solution) => <CodeBlock code={`/${solution}/`} lang="regex" />,
    render: PatternLevelView, // receives LevelRenderProps
  },
}
```

---

## Customizing the theme & color palette

The theme system (`src/template/theme/`) ships with **6 built-in light + dark presets**:

| Preset ID    | Character                                              |
| ------------ | ------------------------------------------------------ |
| `indigo`     | Deep twilight slate with electric violet & gold        |
| `botanical`  | Forest greens with emerald accent & honey              |
| `terracotta` | Warm charcoal/espresso with coral-orange & amber       |
| `ocean`      | Midnight navy with luminous cerulean & amber           |
| `rose`       | Deep plum slate with vivid rose & gold                 |
| `editorial`  | Warm paper & charcoal ink with crisp vermilion accents |

Configure theming on `disc.theme`:

```tsx
theme: {
  preset: 'terracotta',      // any built-in or custom preset id
  defaultMode: 'dark',       // 'system' | 'light' | 'dark'
  allowPalettePicker: true,  // lets players switch palettes in Profile -> Settings
  worldVisuals: {
    literals: { glyph: '^$', hue: 18 },
    custom: { glyph: null, hue: 4, renderEmblem: MySvgIcon },
  },
  overrides: {
    light: { primary: '#...' },
    dark: { primary: '#...' },
    radii: { lg: '18px' },
  },
}
```

Every CSS token (`--bg`, `--surface-1..3`, `--primary*`, `--gold*`, `--ok*`, `--err*`, `--warn*`, `--hl-*`, `--font-ui`, `--r-*`, etc.) is emitted dynamically into `<style id="game-theme-vars">` at runtime, and the resolved splash colors are cached in `localStorage` so subsequent page loads paint immediately without flash.
