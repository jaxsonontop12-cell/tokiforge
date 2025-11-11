import type {
  DesignTokens,
  TokenExportOptions,
  TokenValue,
} from './types';
import { ExportError } from './types';

export class TokenExporter {
  static export(tokens: DesignTokens, options: TokenExportOptions): string {
    switch (options.format) {
      case 'css':
        return this.exportCSS(tokens, options);
      case 'scss':
        return this.exportSCSS(tokens, options);
      case 'js':
        return this.exportJS(tokens, options);
      case 'ts':
        return this.exportTS(tokens);
      case 'json':
        return this.exportJSON(tokens);
      default:
        throw new ExportError(`Unsupported format: ${options.format}`);
    }
  }

  static exportCSS(tokens: DesignTokens, options: {
    selector?: string;
    prefix?: string;
  } = {}): string {
    const selector = options.selector || ':root';
    const prefix = options.prefix || 'hf';
    const flatTokens = this.flattenTokens(tokens, prefix);

    const cssVars = Object.entries(flatTokens)
      .map(([key, value]) => {
        const cssVar = `--${key}`;
        return `  ${cssVar}: ${value};`;
      })
      .join('\n');

    return `${selector} {\n${cssVars}\n}`;
  }

  static exportSCSS(tokens: DesignTokens, options: {
    prefix?: string;
  } = {}): string {
    const prefix = options.prefix || 'hf';
    const flatTokens = this.flattenTokens(tokens, prefix);

    const scssVars = Object.entries(flatTokens)
      .map(([key, value]) => {
        const scssVar = `$${key.replace(/-/g, '-')}`;
        return `${scssVar}: ${value};`;
      })
      .join('\n');

    return scssVars;
  }

  static exportJS(tokens: DesignTokens, options: {
    variables?: boolean;
    prefix?: string;
  } = {}): string {
    const prefix = options.prefix || 'hf';
    const useVariables = options.variables ?? false;

    if (useVariables) {
      const flatTokens = this.flattenTokens(tokens, prefix);
      const jsVars = Object.entries(flatTokens)
        .map(([key]) => {
          const jsKey = key.replace(/-/g, '_');
          return `  ${jsKey}: 'var(--${key})'`;
        })
        .join(',\n');
      return `export const tokens = {\n${jsVars}\n};`;
    }

    return `export const tokens = ${JSON.stringify(tokens, null, 2)};`;
  }

  static exportTS(tokens: DesignTokens): string {
    return `export const tokens = ${JSON.stringify(tokens, null, 2)} as const;`;
  }

  static exportJSON(tokens: DesignTokens): string {
    return JSON.stringify(tokens, null, 2);
  }

  static flattenTokens(
    tokens: DesignTokens,
    prefix: string = 'hf',
    parentKey: string = ''
  ): Record<string, string> {
    const flat: Record<string, string> = {};

    const processValue = (key: string, value: any): void => {
      const fullKey = parentKey ? `${parentKey}-${key}` : key;
      const tokenKey = `${prefix}-${fullKey}`.toLowerCase().replace(/\./g, '-');

      if (value && typeof value === 'object' && 'value' in value) {
        const token = value as TokenValue;
        if (typeof token.value === 'string' || typeof token.value === 'number') {
          flat[tokenKey] = String(token.value);
        } else {
          // Handle TokenState or TokenResponsive
          if (token.value && typeof token.value === 'object') {
            if ('default' in token.value) {
              flat[tokenKey] = String(token.value.default);
            }
          }
        }
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively process nested objects
        for (const nestedKey in value) {
          if (Object.prototype.hasOwnProperty.call(value, nestedKey)) {
            processValue(nestedKey, value[nestedKey]);
          }
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          processValue(`${key}-${index}`, item);
        });
      }
    };

    for (const key in tokens) {
      if (Object.prototype.hasOwnProperty.call(tokens, key)) {
        processValue(key, tokens[key]);
      }
    }

    return flat;
  }
}

