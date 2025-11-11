import type { DesignTokens, RegistryEntry, RegistryConfig, TokenValue } from './types';

export class TokenRegistry {
  private entries: RegistryEntry[] = [];
  private config: RegistryConfig;

  constructor(config: RegistryConfig = {}) {
    this.config = config;
  }

  importFromTokens(tokens: DesignTokens, team?: string, version?: string): void {
    const processTokens = (obj: any, path: string = ''): void => {
      if (typeof obj !== 'object' || obj === null) {
        return;
      }

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          processTokens(item, `${path}[${index}]`);
        });
        return;
      }

      if ('value' in obj) {
        const entry: RegistryEntry = {
          path: path || 'root',
          value: obj as TokenValue,
          team: team || this.config.teams?.[0],
          version: version || this.config.defaultVersion || '1.0.0',
        };
        this.entries.push(entry);
      } else {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newPath = path ? `${path}.${key}` : key;
            processTokens(obj[key], newPath);
          }
        }
      }
    };

    processTokens(tokens);
  }

  getAll(team?: string): DesignTokens {
    const filtered = team
      ? this.entries.filter((entry) => entry.team === team)
      : this.entries;

    const tokens: DesignTokens = {};
    
    filtered.forEach((entry) => {
      this.setNestedValue(tokens, entry.path, entry.value);
    });

    return tokens;
  }

  exportTokens(team?: string, version?: string): DesignTokens {
    const filtered = this.entries.filter((entry) => {
      if (team && entry.team !== team) {
        return false;
      }
      if (version && entry.version !== version) {
        return false;
      }
      return true;
    });

    const tokens: DesignTokens = {};
    
    filtered.forEach((entry) => {
      this.setNestedValue(tokens, entry.path, entry.value);
    });

    return tokens;
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current: any = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }
}

