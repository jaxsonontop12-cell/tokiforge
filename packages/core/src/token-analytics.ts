import type { DesignTokens } from './types';

export class TokenAnalytics {
  private usage: Map<string, Set<string>> = new Map();

  trackUsage(path: string, format?: string): void {
    if (!this.usage.has(path)) {
      this.usage.set(path, new Set());
    }
    if (format) {
      this.usage.get(path)!.add(format);
    }
  }

  getUsageReport(tokens: DesignTokens): {
    coverage: number;
    unused: string[];
    used: string[];
    total: number;
  } {
    const allPaths: string[] = [];

    const getAllPaths = (obj: any, path: string = ''): void => {
      if (typeof obj !== 'object' || obj === null) {
        return;
      }

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          getAllPaths(item, `${path}[${index}]`);
        });
        return;
      }

      if ('value' in obj) {
        allPaths.push(path || 'root');
      } else {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newPath = path ? `${path}.${key}` : key;
            getAllPaths(obj[key], newPath);
          }
        }
      }
    };

    getAllPaths(tokens);

    const used = allPaths.filter((path) => this.usage.has(path));
    const unused = allPaths.filter((path) => !this.usage.has(path));
    const total = allPaths.length;
    const coverage = total > 0 ? (used.length / total) * 100 : 0;

    return {
      coverage: Math.round(coverage * 100) / 100,
      unused,
      used,
      total,
    };
  }

  reset(): void {
    this.usage.clear();
  }
}

