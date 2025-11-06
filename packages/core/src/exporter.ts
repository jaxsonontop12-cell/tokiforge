import type { DesignTokens, TokenValue, TokenExportOptions } from './types';

export class TokenExporter {
  private static flattenTokens(
    tokens: DesignTokens,
    prefix: string = '',
    result: Record<string, TokenValue> = {}
  ): Record<string, TokenValue> {
    for (const key in tokens) {
      const value = tokens[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && 'value' in value) {
        result[newKey] = value as TokenValue;
      } else if (value && typeof value === 'object') {
        this.flattenTokens(value as DesignTokens, newKey, result);
      }
    }

    return result;
  }

  private static toCSSVariable(key: string, prefix: string = ''): string {
    const parts = prefix ? [prefix, ...key.split('.')] : key.split('.');
    return `--${parts.map(p => p.replace(/([A-Z])/g, '-$1').toLowerCase()).join('-')}`;
  }

  static exportCSS(tokens: DesignTokens, options: TokenExportOptions = {}): string {
    const { selector = ':root', prefix = 'hf' } = options;
    const flat = this.flattenTokens(tokens);
    const lines: string[] = [`${selector} {`];

    for (const key in flat) {
      const token = flat[key];
      const cssVar = this.toCSSVariable(key, prefix);
      lines.push(`  ${cssVar}: ${token.value};`);
    }

    lines.push('}');
    return lines.join('\n');
  }

  static exportSCSS(tokens: DesignTokens, options: TokenExportOptions = {}): string {
    const { prefix = 'hf' } = options;
    const flat = this.flattenTokens(tokens);
    const lines: string[] = [];

    for (const key in flat) {
      const token = flat[key];
      const scssVar = this.toSCSSVariable(key, prefix);
      lines.push(`${scssVar}: ${token.value};`);
    }

    return lines.join('\n');
  }

  private static toSCSSVariable(key: string, prefix: string = ''): string {
    const parts = prefix ? [prefix, ...key.split('.')] : key.split('.');
    return `$${parts.map(p => p.replace(/([A-Z])/g, '-$1').toLowerCase()).join('-')}`;
  }

  static exportJS(tokens: DesignTokens, options: TokenExportOptions = {}): string {
    const { variables = false } = options;
    const flat = this.flattenTokens(tokens);
    const obj: Record<string, any> = {};

    for (const key in flat) {
      const token = flat[key];
      const keys = key.split('.');
      let current = obj;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = variables
        ? `var(${this.toCSSVariable(key, options.prefix)})`
        : token.value;
    }

    return `export default ${JSON.stringify(obj, null, 2)};`;
  }

  static exportTS(tokens: DesignTokens, options: TokenExportOptions = {}): string {
    const jsOutput = this.exportJS(tokens, options);
    const typeDef = this.generateTypeDef(tokens);
    return `${typeDef}\n\n${jsOutput}`;
  }

  private static generateTypeDef(tokens: DesignTokens): string {
    const generateType = (obj: any, indent: number = 0): string => {
      const spaces = '  '.repeat(indent);
      const lines: string[] = ['{'];

      for (const key in obj) {
        const value = obj[key];
        if (value && typeof value === 'object' && 'value' in value) {
          lines.push(`${spaces}  ${key}: ${typeof value.value === 'string' ? 'string' : 'number'};`);
        } else if (value && typeof value === 'object') {
          lines.push(`${spaces}  ${key}: ${generateType(value, indent + 1)}`);
        }
      }

      lines.push(`${spaces}}`);
      return lines.join('\n');
    };

    return `export type DesignTokens = ${generateType(tokens)};`;
  }

  static exportJSON(tokens: DesignTokens): string {
    return JSON.stringify(tokens, null, 2);
  }

  static export(tokens: DesignTokens, options: TokenExportOptions): string {
    const format = options.format || 'css';
    switch (format) {
      case 'css':
        return this.exportCSS(tokens, options);
      case 'scss':
        return this.exportSCSS(tokens, options);
      case 'js':
        return this.exportJS(tokens, options);
      case 'ts':
        return this.exportTS(tokens, options);
      case 'json':
        return this.exportJSON(tokens);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}

