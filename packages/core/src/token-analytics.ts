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

  generateReport(tokens: DesignTokens): string {
    const report = this.getUsageReport(tokens);
    const lines: string[] = [];
    
    lines.push('Token Analytics Report');
    lines.push('='.repeat(50));
    lines.push('');
    lines.push(`Total Tokens: ${report.total}`);
    lines.push(`Used Tokens: ${report.used.length}`);
    lines.push(`Unused Tokens: ${report.unused.length}`);
    lines.push(`Coverage: ${report.coverage.toFixed(2)}%`);
    lines.push('');
    
    if (report.unused.length > 0) {
      lines.push(`Unused Tokens (${report.unused.length}):`);
      report.unused.forEach((path) => {
        lines.push(`  - ${path}`);
      });
      lines.push('');
    }
    
    return lines.join('\n');
  }
}

