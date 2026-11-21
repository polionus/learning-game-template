# Learning Game Template

A reusable static web game template for interactive, curriculum-driven learning games — built with swappable content discs, progression, spaced review, and customizable light/dark themes.

Extracted from [Inhabit](https://github.com/polionus/inhabit). Ships out of the box with **Patterncraft**, an 8-level regular expression starter disc demonstrating built-in and custom levels with zero heavy dependencies.

## Use this template

Click **Use this template** on GitHub (or clone locally) to create your own repository:

```sh
git clone https://github.com/polionus/learning-game-template.git my-game
cd my-game
npm install
npm run dev
```

## Commands

```sh
npm run dev          # run the dev server (defaults to the starter disc)
npm test             # run Vitest unit and boundary tests
npm run typecheck    # run TypeScript type checking
npm run build        # build production bundle into dist/
npm run preview      # preview the built dist/ locally
```

To run or build a specific disc registered in `src/games/registry.ts`:

```sh
VITE_GAME=<your-id> npm run dev
VITE_GAME=<your-id> npm run build
```

## Architecture

```text
src/
  template/        Subject-agnostic shell, routing, store, progression, theme engine, built-in levels
  games/
    registry.ts    Build-time registry mapping VITE_GAME ids to discs
    starter/       Patterncraft — example starter disc (8 levels, regex sandbox, terracotta theme)
```

- `src/template/` has zero domain-specific imports and contains the full game shell: board-game world map, lesson reader, chapter explainers, guide, codex, spaced repetition review (Leitner boxes), badges, daily quests, streaks, JSON save import/export, and confetti/sound feedback.
- Each game lives in `src/games/<id>/` and exports a `GameDisc` object (`disc.tsx`) plus lightweight Node-safe `meta.ts` for HTML title/description/splash injection at build time.

## Creating a new game disc

1. Add `src/games/<your-id>/meta.ts` and `src/games/<your-id>/disc.tsx` implementing `GameDisc` from `../../template/index.ts`.
2. Register `<your-id>` in `src/games/registry.ts` (and optionally set it as the default in `vite.config.ts`).
3. Use any mix of the three built-in subject-agnostic level kinds (`choice`, `order`, `text`) or define custom interactive `levelKinds` on your disc.

See [docs/TEMPLATE.md](docs/TEMPLATE.md) for the complete authoring guide.

## Theme customization

The template includes **6 light + dark presets** (`indigo`, `botanical`, `terracotta`, `ocean`, `rose`, `editorial`) configured on `disc.theme`:

- `preset`: Choose a built-in palette or supply your own custom `ThemePreset[]`.
- `defaultMode`: `'system' | 'light' | 'dark'`.
- `allowPalettePicker`: Let players switch color palettes in **Profile**.
- `overrides`: Partially override light/dark color tokens, typography (`--font-ui`, `--font-read`, `--mono`), border radii, or layout dimensions.

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` runs `typecheck`, `test`, and `build` on every push and pull request, and deploys `dist/` on pushes to `main`. In your repository settings on GitHub, set **Settings → Pages → Source** to **GitHub Actions**.

## License

MIT — originated from [Inhabit](https://github.com/polionus/inhabit).
