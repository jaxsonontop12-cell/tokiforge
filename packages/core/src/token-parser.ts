import fs from 'fs';
import path from 'path';
import { parse as parseYAML } from 'yaml';
import type {
  DesignTokens,
  TokenParserOptions,
  TokenValue,
} from './types';
import { ParseError, ValidationError } from './types';

export class TokenParser {
  static parse(filePath: string, options: TokenParserOptions = {}): DesignTokens {
    const {
      validate = true,
      expandReferences = true,
    } = options;

    try {
      if (!fs.existsSync(filePath)) {
        throw new ParseError(`Token file not found: ${filePath}`, filePath);
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const ext = path.extname(filePath).toLowerCase();
      
      let tokens: DesignTokens;
      
      if (ext === '.yaml' || ext === '.yml') {
        tokens = parseYAML(content);
      } else {
        tokens = JSON.parse(content);
      }

      if (validate) {
        this.validate(tokens);
      }

      if (expandReferences) {
        tokens = this.expandReferences(tokens);
      }

      return tokens;
    } catch (error) {
      if (error instanceof ParseError || error instanceof ValidationError) {
        throw error;
      }
      throw new ParseError(
        `Failed to parse token file: ${error instanceof Error ? error.message : String(error)}`,
        filePath
      );
    }
  }

  static validate(tokens: DesignTokens): void {
    const validateToken = (obj: any, path: string = ''): void => {
      if (typeof obj !== 'object' || obj === null) {
        return;
      }

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          validateToken(item, `${path}[${index}]`);
        });
        return;
      }

      // Check if this is a token value object
      if ('value' in obj) {
        const token = obj as TokenValue;
        if (token.value === undefined || token.value === null) {
          throw new ValidationError(
            `Token value is required at path: ${path}`,
            path
          );
        }
      } else {
        // Recursively validate nested objects
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newPath = path ? `${path}.${key}` : key;
            validateToken(obj[key], newPath);
          }
        }
      }
    };

    try {
      validateToken(tokens);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(
        `Token validation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  static expandReferences(tokens: DesignTokens): DesignTokens {
    const expanded = JSON.parse(JSON.stringify(tokens));
    
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
      return current?.value ?? current;
    };

    const expandValue = (value: any): any => {
      if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
        const refPath = value.slice(1, -1);
        const refValue = getValue(expanded, refPath);
        if (refValue !== undefined) {
          return refValue;
        }
      }
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          return value.map(expandValue);
        }
        const expandedObj: any = {};
        for (const key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            expandedObj[key] = expandValue(value[key]);
          }
        }
        return expandedObj;
      }
      return value;
    };

    const expandTokens = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(expandTokens);
      }

      if ('value' in obj) {
        return {
          ...obj,
          value: expandValue(obj.value),
        };
      }

      const expanded: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          expanded[key] = expandTokens(obj[key]);
        }
      }
      return expanded;
    };

    return expandTokens(expanded);
  }
}

