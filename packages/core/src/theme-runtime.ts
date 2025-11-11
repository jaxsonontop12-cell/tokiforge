import type { ThemeConfig, DesignTokens } from './types';
import { ThemeError } from './types';
import { TokenExporter } from './token-exporter';

export class ThemeRuntime {
  private themes: Map<string, DesignTokens>;
  private currentTheme: string | null = null;
  private defaultTheme: string;
  private systemThemeWatcher: (() => void) | null = null;

  constructor(config: ThemeConfig) {
    if (!config.themes || config.themes.length === 0) {
      throw new ThemeError('At least one theme is required');
    }

    this.themes = new Map();
    config.themes.forEach((theme) => {
      if (!theme.name || !theme.tokens) {
        throw new ThemeError('Theme must have a name and tokens');
      }
      this.themes.set(theme.name, theme.tokens);
    });

    this.defaultTheme = config.defaultTheme || config.themes[0].name;
    if (!this.themes.has(this.defaultTheme)) {
      throw new ThemeError(`Default theme "${this.defaultTheme}" not found`);
    }
  }

  init(selector: string = ':root', prefix: string = 'hf'): void {
    this.applyTheme(this.defaultTheme, selector, prefix);
  }

  applyTheme(themeName: string, selector: string = ':root', prefix: string = 'hf'): void {
    const theme = this.themes.get(themeName);
    if (!theme) {
      throw new ThemeError(`Theme "${themeName}" not found`);
    }

    this.currentTheme = themeName;
    this.injectCSS(theme, selector, prefix);
    
    // Dispatch custom event for theme change
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('tokiforge:theme-change', {
          detail: { theme: themeName, tokens: theme },
        })
      );
    }
  }

  getCurrentTheme(): string | null {
    return this.currentTheme;
  }

  getThemeTokens(themeName: string): DesignTokens {
    const theme = this.themes.get(themeName);
    if (!theme) {
      throw new ThemeError(`Theme "${themeName}" not found`);
    }
    return theme;
  }

  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  nextTheme(): string {
    const themes = this.getAvailableThemes();
    if (themes.length === 0) {
      throw new ThemeError('No themes available');
    }
    
    const currentIndex = this.currentTheme 
      ? themes.indexOf(this.currentTheme) 
      : -1;
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    return nextTheme;
  }

  destroy(): void {
    // Clean up system theme watcher if active
    if (this.systemThemeWatcher) {
      this.systemThemeWatcher();
      this.systemThemeWatcher = null;
    }

    // Remove style element if in browser environment
    if (typeof document !== 'undefined') {
      const styleElement = document.getElementById('tokiforge-theme');
      if (styleElement) {
        styleElement.remove();
      }
    }
  }

  watchSystemTheme(callback: (systemTheme: string) => void): () => void {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      // Return no-op function in non-browser environments
      return () => {};
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const systemTheme = e.matches ? 'dark' : 'light';
      callback(systemTheme);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      this.systemThemeWatcher = () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleChange);
      this.systemThemeWatcher = () => {
        mediaQuery.removeListener(handleChange);
      };
    }

    // Initial call
    handleChange(mediaQuery);

    return this.systemThemeWatcher;
  }

  static detectSystemTheme(): string {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return 'light';
    }

    try {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }

  private injectCSS(tokens: DesignTokens, selector: string, prefix: string): void {
    // Only inject CSS in browser environments
    if (typeof document === 'undefined') {
      return;
    }

    const css = this.generateCSS(tokens, selector, prefix);
    const styleId = 'tokiforge-theme';
    
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = css;
  }

  private generateCSS(tokens: DesignTokens, selector: string, prefix: string): string {
    return TokenExporter.exportCSS(tokens, { selector, prefix });
  }
}

