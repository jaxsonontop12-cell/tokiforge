import { Injectable, signal, computed } from '@angular/core';
import { ThemeRuntime } from '@tokiforge/core';
import type { DesignTokens, ThemeConfig } from '@tokiforge/core';

export interface ThemeContext {
  theme: string;
  tokens: DesignTokens;
  setTheme: (themeName: string) => void;
  nextTheme: () => void;
  availableThemes: string[];
  runtime: ThemeRuntime;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private runtime: ThemeRuntime | null = null;
  private themeSignal = signal<string>('default');
  private tokensSignal = signal<DesignTokens>({});
  private isBrowser = typeof window !== 'undefined';

  readonly theme = computed(() => this.themeSignal());
  readonly tokens = computed(() => this.tokensSignal());
  readonly availableThemes = computed(() => this.runtime?.getAvailableThemes() || []);

  constructor() {
    if (this.isBrowser) {
      const handleThemeChange = (e: Event) => {
        const customEvent = e as CustomEvent;
        this.themeSignal.set(customEvent.detail.theme);
        this.tokensSignal.set(customEvent.detail.tokens);
      };
      window.addEventListener('tokiforge:theme-change', handleThemeChange);
    }
  }

  init(
    config: ThemeConfig,
    selector: string = ':root',
    prefix: string = 'hf',
    defaultTheme?: string
  ): void {
    this.runtime = new ThemeRuntime(config);
    const initialTheme = defaultTheme || config.defaultTheme || config.themes[0]?.name || 'default';
    this.themeSignal.set(initialTheme);
    this.tokensSignal.set(this.runtime.getThemeTokens(initialTheme));
    if (this.isBrowser) {
      this.runtime.init(selector, prefix);
    }
  }

  setTheme(themeName: string, selector: string = ':root', prefix: string = 'hf'): void {
    if (!this.runtime) {
      throw new Error('ThemeService not initialized. Call init() first.');
    }
    if (this.isBrowser) {
      this.runtime.applyTheme(themeName, selector, prefix);
    }
    this.themeSignal.set(themeName);
    this.tokensSignal.set(this.runtime.getThemeTokens(themeName));
  }

  nextTheme(): void {
    if (!this.runtime) {
      throw new Error('ThemeService not initialized. Call init() first.');
    }
    const newTheme = this.runtime.nextTheme();
    this.setTheme(newTheme);
  }

  getRuntime(): ThemeRuntime | null {
    return this.runtime;
  }

  getContext(): ThemeContext {
    if (!this.runtime) {
      throw new Error('ThemeService not initialized. Call init() first.');
    }
    return {
      theme: this.themeSignal(),
      tokens: this.tokensSignal(),
      setTheme: (name: string) => this.setTheme(name),
      nextTheme: () => this.nextTheme(),
      availableThemes: this.runtime.getAvailableThemes(),
      runtime: this.runtime,
    };
  }
}


