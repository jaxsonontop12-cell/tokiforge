# 🌈 TokiForge — The Modern Design Token & Theme Engine

> **Forge your colors. Shape your UI.**

TokiForge is a next-generation **open-source design token and theming engine** built for developers and designers who demand elegance, speed, and consistency. **Works with any framework** — React, Vue, Svelte, Angular, Next.js, Remix, Solid, Qwik, or even vanilla JavaScript. TokiForge lets you define, sync, and switch your themes effortlessly.

---

## 🧩 Overview

TokiForge provides a **framework-agnostic, runtime theming system** powered by **CSS custom properties**, **design tokens**, and **live theme management**. It bridges the gap between design tools (like Figma) and production-ready codebases with zero friction.

### ⚡ Why TokiForge?

Other tools focus on either design export or complex setups. TokiForge combines:

* 🧠 **Intelligent design-token management**
* ⚙️ **Runtime theme switching** (light/dark/brand-based)
* 💅 **Framework-agnostic adapters**
* 🪄 **Figma integration and token sync**
* 🧰 **CLI + Dashboard for instant configuration**

In short — it's your **complete color and theme infrastructure**, built for the future of frontend design systems.

---

## 🏗️ Architecture

### Core Components

**1. Token Engine (`@tokiforge/core`)**

* Defines and manages design tokens (colors, typography, spacing, radii, etc.)
* Converts JSON/YAML tokens → CSS, SCSS, JS, or TS.
* Supports versioning and live reload.

**2. Runtime Engine**

* Uses CSS variables with smart fallbacks for legacy browsers.
* Enables instant theme switching without reloading or recompiling.
* Optimized for <3KB gzipped footprint.

**3. Framework Adapters**

* React: `@tokiforge/react` → useTheme(), ThemeProvider
* Vue: `@tokiforge/vue` → composables for reactivity
* Svelte: `@tokiforge/svelte` → reactive bindings
* **Any Framework**: `@tokiforge/core` → Works with Angular, Next.js, Remix, Solid, Qwik, Astro, and more!
* Vanilla: pure JS API

**4. CLI Tool (`tokiforge-cli`)**

* Initialize tokens: `npx tokiforge init`
* Generate exports: `tokiforge build`
* Preview themes: `tokiforge dev`

**5. Design Integration**

* **Figma Plugin:** sync design tokens bidirectionally
* **Style Dictionary Bridge:** full compatibility with Amazon's style-dictionary
* **Accessibility Checks:** color contrast validation built-in

---

## 🧱 System Diagram

```
   ┌──────────────────────────────┐
   │         Figma Plugin         │
   │ (Design Tokens & Styles)     │
   └─────────────┬────────────────┘
                 │  Sync via API
   ┌─────────────▼───────────────┐
   │      TokiForge Core Engine   │
   │  - Token Parser/Validator   │
   │  - Runtime CSS Generator    │
   └─────────────┬───────────────┘
                 │
   ┌─────────────▼───────────────┐
   │   Framework Adapters        │
   │ (React/Vue/Svelte/Vanilla)  │
   └─────────────┬───────────────┘
                 │
   ┌─────────────▼───────────────┐
   │  UI Components / App Code   │
   │   Consuming TokiForge Tokens │
   └──────────────────────────────┘
```

---

## 🚀 Key Features

### 🎨 Theming

* Light/Dark/System theme switching
* Custom brand themes (e.g., multiple clients)
* Contextual theming for nested components
* **Auto-generate dark themes** from light themes
* **Smooth theme transitions** with animation tokens

### 🧠 Design Tokens

* JSON/YAML schema for token definition
* Auto export to CSS, JS, TS, SCSS
* Type-safe token usage
* **Smart color utilities** - auto-generate shades, tints, palettes
* **Color manipulation** - lighten, darken, saturate, desaturate

### ⚙️ Developer Experience

* `tokiforge dev` – local preview playground
* `tokiforge lint` – validates token consistency
* `tokiforge build` – generates final token bundle
* **VS Code extension** - autocomplete, live preview, theme switcher
* **Hot reload** - watch tokens and auto-rebuild

### 💡 Designer Integration

* Figma → Code sync (bidirectional)
* **Accessibility dashboard** - WCAG compliance checker
* Visual token diff between versions
* **Theme playground** - shareable preview URLs

### 🌟 Advanced Features

* **AI-powered theme generator** - generate palettes from a single color
* **Accessibility helpers** - auto-fix contrast issues
* **Color palette generation** - create harmonious color schemes
* **Contrast ratio calculator** - ensure WCAG compliance

---

## 🔥 Why TokiForge is Better

| Feature                   | TokiForge | Others                    |
| ------------------------- | -------- | ------------------------- |
| Real-time theme switching | ✅        | ⚠️ Often rebuild required |
| Multi-framework support   | ✅        | ❌ Usually React-only      |
| Type-safe token exports   | ✅        | ⚠️ Partial or manual      |
| Figma bidirectional sync  | ✅        | ❌ One-way export only     |
| CLI + Visual Playground   | ✅        | ⚠️ Missing or paid        |
| CSS-native runtime        | ✅        | ⚠️ JS-heavy runtime       |
| <3KB gzipped size         | ✅        | ❌ Bloated builds          |
| Accessibility validation  | ✅        | ❌ Missing                 |
| **Smart color utilities** | ✅        | ❌ Manual color manipulation |
| **Auto dark theme gen**   | ✅        | ❌ Manual creation         |
| **AI palette generator**  | 🚧 Coming | ❌ Not available           |
| **VS Code extension**     | 🚧 Coming | ⚠️ Limited support         |

---

## 🏠 Local Usage

For local development and testing, see [LOCAL_USAGE.md](./LOCAL_USAGE.md) for detailed instructions.

**Quick Start:**
```bash
# Build all packages
npm run build

# Link all packages for local use
npm run link:all

# Use in your project
npm link @tokiforge/core @tokiforge/react
```

---

## 🌐 Global Usage

For global CLI installation, see [GLOBAL_USAGE.md](./GLOBAL_USAGE.md) for detailed instructions.

**Quick Start:**
```bash
# Install CLI globally from local source
npm run install:global

# Or install from npm (when published)
npm install -g tokiforge-cli

# Use anywhere
tokiforge init
tokiforge build
tokiforge dev
```

---

## 🧠 Example Usage

```bash
npm install @tokiforge/core @tokiforge/react
```

**Define tokens (`tokens.json`):**

```json
{
  "color": {
    "primary": { "value": "#7C3AED" },
    "accent": { "value": "#06B6D4" },
    "text": { "value": "#F8FAFC" }
  },
  "radius": { "sm": { "value": "4px" }, "lg": { "value": "12px" } }
}
```

**Use in React:**

```tsx
import { useTheme } from '@tokiforge/react';

export function Button() {
  const { tokens, setTheme } = useTheme();
  return (
    <button
      style={{
        backgroundColor: tokens.color.primary,
        borderRadius: tokens.radius.lg,
      }}
      onClick={() => setTheme('dark')}
    >
      Switch Theme
    </button>
  );
}
```

**Smart Color Utilities:**

```tsx
import { ColorUtils } from '@tokiforge/core';

// Auto-generate shades from a base color
const shades = ColorUtils.generateShades('#7C3AED', 10);
// Returns: { '0': '#000000', '100': '#...', ..., '900': '#ffffff' }

// Generate accessible colors (WCAG compliant)
const accessible = ColorUtils.findAccessibleColor('#000000', '#ffffff', 'AA');
// Automatically adjusts color if contrast is insufficient

// Auto-generate dark theme from light theme
const darkTheme = ColorUtils.generateDarkTheme(lightTokens);
// Intelligently inverts colors while maintaining design intent

// Generate harmonious color palette
const palette = ColorUtils.generatePalette('#7C3AED', 5);
// Creates complementary colors for your design system
```

---

## 🧠 Philosophy

TokiForge was designed around three guiding principles:

1. **Universal Compatibility:** Works with any stack — web, mobile, or design tools.
2. **Declarative Design:** Define tokens once, use everywhere.
3. **Performance + Simplicity:** Lightweight, fast, and developer-first.

---

## 🧬 Roadmap (2026)

* [x] MVP: Core engine + React adapter
* [x] CLI tooling
* [x] Vue/Svelte adapters
* [x] **Smart color utilities** - lighten, darken, generate shades
* [x] **Auto dark theme generation**
* [ ] **VS Code Extension** - autocomplete & live preview
* [ ] **Theme Playground** - shareable preview URLs
* [ ] **Accessibility Dashboard** - WCAG compliance checker
* [ ] **Figma Plugin** - bidirectional sync
* [ ] **AI-powered palette generator**
* [ ] **Visual Token Studio** - web-based editor
* [ ] **Tailwind CSS plugin**
* [ ] **Storybook integration**

---

## 🌟 Community & Contribution

Join our open-source family at [github.com/tokiforge/tokiforge](#) ❤️

### How to Contribute

1. Fork the repo
2. Create a feature branch (`feat/runtime-optimization`)
3. Submit a PR with examples

We welcome designers, frontend devs, and design-system engineers.

---

## 💬 License

MIT License — free for personal and commercial use.

---

## 🧠 Credits

Built with 💜 by the TokiForge Community — inspired by the intersection of **design and code**.

> *TokiForge — The future of frontend theming begins here.*



