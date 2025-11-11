import type { DesignTokens, DiffResult, DiffOptions } from './types';
import fs from 'fs';

export class FigmaDiff {
  static compare(figmaTokens: DesignTokens, codeTokens: DesignTokens, options: DiffOptions = {}): DiffResult {
    const tolerance = options.tolerance ?? 0;
    const ignorePaths = options.ignorePaths ?? [];

    const getAllPaths = (tokens: DesignTokens, prefix: string = ''): Set<string> => {
      const paths = new Set<string>();
      
      const traverse = (obj: any, path: string): void => {
        if (ignorePaths.some(ignored => path.startsWith(ignored))) {
          return;
        }

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
          paths.add(path);
        } else {
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              const newPath = path ? `${path}.${key}` : key;
              traverse(obj[key], newPath);
            }
          }
        }
      };

      traverse(tokens, prefix);
      return paths;
    };

    const getValue = (tokens: DesignTokens, path: string): any => {
      const parts = path.split('.');
      let current: any = tokens;
      
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return undefined;
        }
      }
      
      return current?.value ?? current;
    };

    const figmaPaths = getAllPaths(figmaTokens);
    const codePaths = getAllPaths(codeTokens);

    const added: string[] = [];
    const removed: string[] = [];
    const changed: Array<{ path: string; oldValue: any; newValue: any }> = [];
    const matches: string[] = [];

    // Find added paths
    figmaPaths.forEach((path) => {
      if (!codePaths.has(path)) {
        added.push(path);
      }
    });

    // Find removed paths
    codePaths.forEach((path) => {
      if (!figmaPaths.has(path)) {
        removed.push(path);
      }
    });

    // Find changed and matching paths
    figmaPaths.forEach((path) => {
      if (codePaths.has(path)) {
        const figmaValue = getValue(figmaTokens, path);
        const codeValue = getValue(codeTokens, path);
        
        if (this.valuesMatch(figmaValue, codeValue, tolerance)) {
          matches.push(path);
        } else {
          changed.push({
            path,
            oldValue: codeValue,
            newValue: figmaValue,
          });
        }
      }
    });

    return {
      added,
      removed,
      changed,
      matches,
    };
  }

  static generateReport(diff: DiffResult): string {
    const lines: string[] = [];
    
    lines.push('Figma Token Diff Report');
    lines.push('='.repeat(50));
    lines.push('');

    if (diff.added.length > 0) {
      lines.push(`Added (${diff.added.length}):`);
      diff.added.forEach((path) => {
        lines.push(`  + ${path}`);
      });
      lines.push('');
    }

    if (diff.removed.length > 0) {
      lines.push(`Removed (${diff.removed.length}):`);
      diff.removed.forEach((path) => {
        lines.push(`  - ${path}`);
      });
      lines.push('');
    }

    if (diff.changed.length > 0) {
      lines.push(`Changed (${diff.changed.length}):`);
      diff.changed.forEach((change) => {
        lines.push(`  ~ ${change.path}`);
        lines.push(`    Old: ${JSON.stringify(change.oldValue)}`);
        lines.push(`    New: ${JSON.stringify(change.newValue)}`);
      });
      lines.push('');
    }

    if (diff.matches.length > 0) {
      lines.push(`Matches (${diff.matches.length}):`);
      lines.push(`  All matching tokens are in sync.`);
      lines.push('');
    }

    return lines.join('\n');
  }

  static hasMismatches(diff: DiffResult): boolean {
    return diff.added.length > 0 || diff.removed.length > 0 || diff.changed.length > 0;
  }

  static valuesMatch(value1: any, value2: any, tolerance: number = 0): boolean {
    if (value1 === value2) {
      return true;
    }

    if (typeof value1 === 'number' && typeof value2 === 'number') {
      return Math.abs(value1 - value2) <= tolerance;
    }

    if (typeof value1 === 'string' && typeof value2 === 'string') {
      // Try to extract numbers from strings (e.g., "10px" -> 10)
      const num1 = parseFloat(value1);
      const num2 = parseFloat(value2);
      if (!isNaN(num1) && !isNaN(num2)) {
        return Math.abs(num1 - num2) <= tolerance;
      }
      return value1 === value2;
    }

    return false;
  }

  static exportJSON(diff: DiffResult, outputPath: string): void {
    fs.writeFileSync(outputPath, JSON.stringify(diff, null, 2));
  }
}

