import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeRuntime, TokenExporter } from '@tokiforge/core';
import type { ThemeConfig, DesignTokens } from '@tokiforge/core';

export interface ThemeInitOptions {
  selector?: string;
  prefix?: string;
  defaultTheme?: string;
  mode?: 'dynamic' | 'static';
  persist?: boolean;
  watchSystemTheme?: boolean;
  bodyClassPrefix?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private runtime: ThemeRuntime | null = null;
  private isBrowser = isPlatformBrowser(this.platformId);
  
  private _theme = signal<string>('default');
  private _initialized = signal<boolean>(false);
  
  theme = this._theme.asReadonly();
  initialized = this._initialized.asReadonly();
  
  tokens = computed<DesignTokens>(() => {
    if (!this.runtime || !this._initialized()) {
      return {};
    }
    try {
      return this.runtime.getThemeTokens(this._theme());
    } catch {
      return {};
    }
  });
  
  availableThemes = computed<string[]>(() => {
    if (!this.runtime || !this._initialized()) {
      return [];
    }
    return this.runtime.getAvailableThemes();
  });

  private options: ThemeInitOptions = {};
  private unwatchSystemTheme: (() => void) | null = null;

  constructor() {
    // Effect to handle theme changes
    effect(() => {
      if (this._initialized() && this.isBrowser) {
        const currentTheme = this._theme();
        if (this.options.mode === 'static') {
          this.updateBodyClass(currentTheme);
        }
        
        // Persist to localStorage if enabled
        if (this.options.persist && this.isBrowser && typeof window !== 'undefined' && window.localStorage) {
          try {
            window.localStorage.setItem('tokiforge-theme', currentTheme);
          } catch (e) {
            // Ignore localStorage errors
          }
        }
      }
    });
  }

  init(config: ThemeConfig, options: ThemeInitOptions = {}): void {
    if (this._initialized()) {
      console.warn('ThemeService already initialized');
      return;
    }

    this.options = {
      selector: ':root',
      prefix: 'hf',
      mode: 'dynamic',
      persist: true,
      watchSystemTheme: false,
      bodyClassPrefix: 'theme',
      ...options,
    };

    this.runtime = new ThemeRuntime(config);
    const availableThemes = this.runtime.getAvailableThemes();
    
    let initialTheme = this.options.defaultTheme || config.defaultTheme || availableThemes[0] || 'default';

    // Load from localStorage if persist is enabled
    if (this.options.persist && this.isBrowser && typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem('tokiforge-theme');
        if (saved && availableThemes.includes(saved)) {
          initialTheme = saved;
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    }

    // Detect system theme if enabled
    if (this.options.watchSystemTheme && !this.options.persist && this.isBrowser) {
      const systemTheme = ThemeRuntime.detectSystemTheme();
      if (availableThemes.includes(systemTheme)) {
        initialTheme = systemTheme;
      }
    }

    this._theme.set(initialTheme);
    this._initialized.set(true);

    // Initialize runtime
    if (this.isBrowser) {
      if (this.options.mode === 'static') {
        this.updateBodyClass(initialTheme);
      } else {
        this.runtime.init(this.options.selector!, this.options.prefix!);
        this.runtime.applyTheme(initialTheme, this.options.selector!, this.options.prefix!);
      }

      // Watch system theme if enabled
      if (this.options.watchSystemTheme) {
        this.unwatchSystemTheme = this.runtime.watchSystemTheme((systemTheme: string) => {
          if (availableThemes.includes(systemTheme)) {
            this.setTheme(systemTheme);
          }
        });

        // Cleanup on beforeunload
        if (typeof window !== 'undefined') {
          window.addEventListener('beforeunload', () => {
            if (this.unwatchSystemTheme) {
              this.unwatchSystemTheme();
            }
          });
        }
      }

      // Listen for theme change events
      if (this.options.mode === 'dynamic' && typeof window !== 'undefined') {
        window.addEventListener('tokiforge:theme-change', (e: Event) => {
          const customEvent = e as CustomEvent;
          if (customEvent.detail?.theme) {
            this._theme.set(customEvent.detail.theme);
          }
        });
      }
    }
  }

  setTheme(themeName: string): void {
    if (!this.runtime || !this._initialized()) {
      throw new Error('ThemeService not initialized. Call init() first.');
    }

    const availableThemes = this.runtime.getAvailableThemes();
    if (!availableThemes.includes(themeName)) {
      throw new Error(`Theme "${themeName}" not found. Available themes: ${availableThemes.join(', ')}`);
    }

    if (this.options.mode === 'static' && this.isBrowser) {
      this.updateBodyClass(themeName);
    } else if (this.runtime && this.isBrowser) {
      this.runtime.applyTheme(themeName, this.options.selector!, this.options.prefix!);
    }

    this._theme.set(themeName);
  }

  nextTheme(): void {
    if (!this.runtime || !this._initialized()) {
      throw new Error('ThemeService not initialized. Call init() first.');
    }

    const nextThemeName = this.runtime.nextTheme();
    this.setTheme(nextThemeName);
  }

  generateCSS(themeName?: string): string {
    if (!this.runtime || !this._initialized()) {
      throw new Error('ThemeService not initialized. Call init() first.');
    }

    const targetTheme = themeName || this._theme();
    const themeTokens = this.runtime.getThemeTokens(targetTheme);
    const bodySelector = this.options.mode === 'static' 
      ? `body.${this.options.bodyClassPrefix}-${targetTheme}`
      : this.options.selector;
    
    return TokenExporter.exportCSS(themeTokens, {
      selector: bodySelector || ':root',
      prefix: this.options.prefix || 'hf',
    });
  }

  private updateBodyClass(themeName: string): void {
    if (!this.isBrowser || typeof document === 'undefined') {
      return;
    }

    const availableThemes = this.runtime?.getAvailableThemes() || [];
    availableThemes.forEach((t: string) => {
      document.body.classList.remove(`${this.options.bodyClassPrefix}-${t}`);
    });
    document.body.classList.add(`${this.options.bodyClassPrefix}-${themeName}`);
  }

  destroy(): void {
    if (this.unwatchSystemTheme) {
      this.unwatchSystemTheme();
      this.unwatchSystemTheme = null;
    }

    if (this.runtime) {
      this.runtime.destroy();
      this.runtime = null;
    }

    this._initialized.set(false);
  }
}

