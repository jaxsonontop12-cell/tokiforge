import type {
  DesignTokens,
  MigrationResult,
  VersionValidationResult,
  TokenValue,
} from './types';
import { ValidationError } from './types';

export class TokenVersioning {
  static getDeprecatedTokens(tokens: DesignTokens): string[] {
    const deprecated: string[] = [];

    const checkTokens = (obj: any, path: string = ''): void => {
      if (typeof obj !== 'object' || obj === null) {
        return;
      }

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          checkTokens(item, `${path}[${index}]`);
        });
        return;
      }

      if ('value' in obj) {
        const token = obj as TokenValue;
        if (token.deprecated === true || token.version?.deprecated === true) {
          deprecated.push(path || 'root');
        }
      } else {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newPath = path ? `${path}.${key}` : key;
            checkTokens(obj[key], newPath);
          }
        }
      }
    };

    checkTokens(tokens);
    return deprecated;
  }

  static filterDeprecated(tokens: DesignTokens, includeDeprecated: boolean = false): DesignTokens {
    const filtered = JSON.parse(JSON.stringify(tokens));

    const filterTokens = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(filterTokens).filter((item) => item !== null);
      }

      if ('value' in obj) {
        const token = obj as TokenValue;
        if (token.deprecated === true || token.version?.deprecated === true) {
          return includeDeprecated ? obj : null;
        }
        return obj;
      }

      const filteredObj: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const filteredValue = filterTokens(obj[key]);
          if (filteredValue !== null) {
            filteredObj[key] = filteredValue;
          }
        }
      }
      return filteredObj;
    };

    return filterTokens(filtered);
  }

  static migrateToken(tokens: DesignTokens, oldPath: string, newPath: string): MigrationResult {
    const errors: string[] = [];
    let migrated = 0;

    try {
      const cloned = JSON.parse(JSON.stringify(tokens));
      
      // Get value at old path
      const getValue = (obj: any, path: string): any => {
        const parts = path.split('.');
        let current: any = obj;
        for (const part of parts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            return undefined;
          }
        }
        return current;
      };

      // Set value at new path
      const setValue = (obj: any, path: string, value: any): void => {
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
      };

      // Delete value at old path
      const deleteValue = (obj: any, path: string): void => {
        const parts = path.split('.');
        let current: any = obj;
        for (let i = 0; i < parts.length - 1; i++) {
          if (current && typeof current === 'object' && parts[i] in current) {
            current = current[parts[i]];
          } else {
            return;
          }
        }
        if (current && typeof current === 'object') {
          delete current[parts[parts.length - 1]];
        }
      };

      const oldValue = getValue(cloned, oldPath);
      if (oldValue === undefined) {
        errors.push(`Token not found at path: ${oldPath}`);
      } else {
        setValue(cloned, newPath, oldValue);
        deleteValue(cloned, oldPath);
        migrated = 1;
      }

      return {
        success: errors.length === 0,
        migrated,
        errors,
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      return {
        success: false,
        migrated: 0,
        errors,
      };
    }
  }

  static validateVersions(tokens: DesignTokens): VersionValidationResult {
    const deprecated = this.getDeprecatedTokens(tokens);
    const migrations: MigrationResult[] = [];

    // Check for migration paths
    const checkMigrations = (obj: any, path: string = ''): void => {
      if (typeof obj !== 'object' || obj === null) {
        return;
      }

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          checkMigrations(item, `${path}[${index}]`);
        });
        return;
      }

      if ('value' in obj) {
        const token = obj as TokenValue;
        if (token.version?.migration) {
          migrations.push({
            success: false,
            migrated: 0,
            errors: [`Migration required for ${path}: ${token.version.migration}`],
          });
        }
      } else {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newPath = path ? `${path}.${key}` : key;
            checkMigrations(obj[key], newPath);
          }
        }
      }
    };

    checkMigrations(tokens);

    return {
      valid: deprecated.length === 0 && migrations.length === 0,
      deprecated,
      migrations,
    };
  }
}

