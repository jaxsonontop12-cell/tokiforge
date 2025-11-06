# Angular Guide

Complete guide to using TokiForge with Angular 17+.

## Installation

```bash
npm install @tokiforge/angular @tokiforge/core
```

## Requirements

- Angular 17+ (minimum)
- **Angular 19+ recommended** for full Signals support
- Uses modern `@angular/ssr` (Angular Universal has been deprecated since v17)

> **Note:** This package uses Angular Signals (`signal()`, `computed()`). While Signals are stable in Angular 17+, Angular 19+ provides full Signals support and is recommended for production use.

## Setup

### 1. Initialize Theme Service

Initialize the `ThemeService` in your root component or app initialization:

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { ThemeService } from '@tokiforge/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private themeService = inject(ThemeService);

  ngOnInit() {
    const themeConfig = {
      themes: [
        { name: 'light', tokens: lightTokens },
        { name: 'dark', tokens: darkTokens },
      ],
      defaultTheme: 'light',
    };

    this.themeService.init(themeConfig);
  }
}
```

### 2. Use Theme in Components

Access theme data using the `ThemeService`:

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from '@tokiforge/angular';

@Component({
  selector: 'app-theme-switcher',
  template: `
    <select [value]="themeService.theme()" (change)="onThemeChange($event)">
      @for (themeName of themeService.availableThemes(); track themeName) {
        <option [value]="themeName">{{ themeName }}</option>
      }
    </select>
  `
})
export class ThemeSwitcherComponent {
  themeService = inject(ThemeService);

  onThemeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.themeService.setTheme(select.value);
  }
}
```

## API Reference

### `ThemeService`

Injectable service that manages theme state and operations.

#### Methods

**`init(config, selector?, prefix?, defaultTheme?)`**

Initialize the theme service.

- `config: ThemeConfig` - Theme configuration object
- `selector?: string` - CSS selector for theme injection (default: `:root`)
- `prefix?: string` - CSS variable prefix (default: `hf`)
- `defaultTheme?: string` - Override default theme name

**`setTheme(themeName, selector?, prefix?)`**

Switch to a specific theme.

- `themeName: string` - Name of the theme to apply
- `selector?: string` - CSS selector (default: `:root`)
- `prefix?: string` - CSS variable prefix (default: `hf`)

**`nextTheme()`**

Cycle to the next available theme.

**`getContext()`**

Get the complete theme context object.

**`getRuntime()`**

Get the underlying `ThemeRuntime` instance.

#### Properties (Signals)

- `theme: Signal<string>` - Current theme name
- `tokens: Signal<DesignTokens>` - Current theme tokens
- `availableThemes: Signal<string[]>` - All available theme names

## Examples

### Basic Theme Switching

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from '@tokiforge/angular';

@Component({
  selector: 'app-theme-switcher',
  template: `
    <button (click)="toggleTheme()">
      Switch to {{ themeService.theme() === 'light' ? 'Dark' : 'Light' }}
    </button>
  `
})
export class ThemeSwitcherComponent {
  themeService = inject(ThemeService);

  toggleTheme() {
    const current = this.themeService.theme();
    this.themeService.setTheme(current === 'light' ? 'dark' : 'light');
  }
}
```

### Using Tokens in Templates

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from '@tokiforge/angular';

@Component({
  selector: 'app-button',
  template: `
    <button
      [style.backgroundColor]="themeService.tokens().color?.primary?.value"
      [style.color]="themeService.tokens().color?.text?.primary?.value"
      [style.borderRadius]="themeService.tokens().radius?.lg?.value"
    >
      Click me
    </button>
  `
})
export class ButtonComponent {
  themeService = inject(ThemeService);
}
```

### Using CSS Variables

CSS variables are automatically injected. Use them directly in your styles:

```typescript
@Component({
  selector: 'app-card',
  template: `<div class="card">Content</div>`,
  styles: [`
    .card {
      background-color: var(--hf-color-background-default);
      color: var(--hf-color-text-primary);
      border-radius: var(--hf-radius-md);
      padding: var(--hf-spacing-lg);
    }
  `]
})
export class CardComponent {}
```

### With Component Styles

```typescript
@Component({
  selector: 'app-card',
  template: `<div class="card">Content</div>`,
  styleUrls: ['./card.component.css']
})
export class CardComponent {}
```

```css
/* card.component.css */
.card {
  background-color: var(--hf-color-background-default);
  color: var(--hf-color-text-primary);
  border-radius: var(--hf-radius-md);
  padding: var(--hf-spacing-lg);
}
```


## Server-Side Rendering (SSR)

TokiForge works seamlessly with Angular 17+ SSR using `@angular/ssr`. The service automatically handles server environments:

```typescript
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '@tokiforge/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private themeService = inject(ThemeService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    // Service automatically handles SSR - init() is safe to call
    this.themeService.init(themeConfig);
    
    // Runtime initialization only happens in browser
    // CSS variables are applied on client-side hydration
  }
}
```

The `ThemeService` uses `isPlatformBrowser()` internally to ensure SSR compatibility. No additional configuration needed!

## TypeScript

Full TypeScript support is included:

```typescript
import { ThemeService } from '@tokiforge/angular';
import type { ThemeConfig, DesignTokens } from '@tokiforge/core';

const themeConfig: ThemeConfig = {
  themes: [
    { name: 'light', tokens: lightTokens },
  ],
};

// themeService.tokens() is fully typed!
const tokens: DesignTokens = this.themeService.tokens();
const primary: string = tokens.color?.primary?.value as string;
```

## Best Practices

1. **Initialize early** - Call `init()` in your root component's `ngOnInit()`
2. **Use CSS variables** - Prefer CSS variables for better performance
3. **Type your tokens** - Use TypeScript to ensure type safety
4. **Lazy load themes** - Load theme data as needed for large apps
5. **Use signals** - Access theme data using signals for reactivity

## Standalone Components

The package is fully compatible with Angular standalone components:

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from '@tokiforge/angular';

@Component({
  selector: 'app-standalone',
  standalone: true,
  template: `<div>Content</div>`
})
export class StandaloneComponent {
  themeService = inject(ThemeService);
}
```

## Next Steps

- See [Angular Example](/examples/angular) for a complete example
- Learn about [Advanced Theming](/guide/theming)
- Check the [API Reference](/api/angular)

