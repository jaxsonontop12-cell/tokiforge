import type { DesignTokens, HoverInfo, Completion, Definition, TokenValue } from './types';

export class IDESupport {
  private tokens: DesignTokens = {};

  loadTokens(tokens: DesignTokens): void {
    this.tokens = tokens;
  }

  getHoverInfo(tokenPath: string): HoverInfo | null {
    const token = this.getToken(tokenPath);
    if (!token) {
      return null;
    }

    const value = this.getTokenValue(token);
    return {
      path: tokenPath,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      type: token.type,
      description: token.description,
    };
  }

  getCompletions(prefix: string = ''): Completion[] {
    const paths = this.getAllTokenPaths();
    const matching = paths.filter((path) => path.startsWith(prefix));

    return matching.map((path) => {
      const token = this.getToken(path);
      const value = token ? this.getTokenValue(token) : undefined;
      
      return {
        label: path,
        detail: value !== undefined ? String(value) : undefined,
        documentation: token?.description,
      };
    });
  }

  getDefinition(tokenPath: string): Definition | null {
    const token = this.getToken(tokenPath);
    if (!token) {
      return null;
    }

    const value = this.getTokenValue(token);
    return {
      path: tokenPath,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      type: token.type,
    };
  }

  private getTokenValue(token: TokenValue): string | number {
    if (typeof token.value === 'string' || typeof token.value === 'number') {
      return token.value;
    }
    if (token.value && typeof token.value === 'object' && 'default' in token.value) {
      return token.value.default as string | number;
    }
    return '';
  }

  private getToken(path: string): TokenValue | null {
    const parts = path.split('.');
    let current: any = this.tokens;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }

    if (current && typeof current === 'object' && 'value' in current) {
      return current as TokenValue;
    }

    return null;
  }

  private getAllTokenPaths(): string[] {
    const paths: string[] = [];

    const traverse = (obj: any, path: string = ''): void => {
      if (typeof obj !== 'object' || obj === null) {
        return;
      }

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          traverse(item, `${path}[${index}]`);
        });
        return;
      }

      if ('value' in obj) {
        paths.push(path || 'root');
      } else {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newPath = path ? `${path}.${key}` : key;
            traverse(obj[key], newPath);
          }
        }
      }
    };

    traverse(this.tokens);
    return paths;
  }
}

