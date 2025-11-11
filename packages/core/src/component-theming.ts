import type { ComponentTheme, DesignTokens } from './types';
import { TokenExporter } from './token-exporter';

export class ComponentTheming {
  private themes: Map<string, ComponentTheme> = new Map();

  registerComponentTheme(theme: ComponentTheme): void {
    this.themes.set(theme.name, theme);
  }

  getScopedTokens(componentName: string, globalTokens: DesignTokens): DesignTokens {
    const theme = this.themes.get(componentName);
    if (!theme) {
      return {};
    }

    // Merge component tokens with global tokens, scoping component tokens
    const scoped: DesignTokens = { ...globalTokens };
    
    const scopePath = theme.scope.split('.');
    let current: any = scoped;
    for (let i = 0; i < scopePath.length - 1; i++) {
      if (!current[scopePath[i]]) {
        current[scopePath[i]] = {};
      }
      current = current[scopePath[i]];
    }
    current[scopePath[scopePath.length - 1]] = theme.tokens;

    return scoped;
  }

  applyComponentTheme(componentName: string, selector: string, prefix: string = 'hf'): string {
    const theme = this.themes.get(componentName);
    if (!theme) {
      return '';
    }

    return TokenExporter.exportCSS(theme.tokens, { selector, prefix });
  }
}

