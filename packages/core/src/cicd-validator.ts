import type {
  DesignTokens,
  CICDValidationOptions,
  CICDValidationResult,
} from './types';
import { TokenParser } from './token-parser';
import { AccessibilityUtils } from './accessibility-utils';
import fs from 'fs';

export class CICDValidator {
  static validate(tokens: DesignTokens, options: CICDValidationOptions = {}): CICDValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic validation
      TokenParser.validate(tokens);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }

    // Check deprecated tokens
    if (options.checkDeprecated) {
      const deprecated = this.getDeprecatedTokens(tokens);
      if (deprecated.length > 0) {
        if (options.strict) {
          errors.push(`Deprecated tokens found: ${deprecated.join(', ')}`);
        } else {
          warnings.push(`Deprecated tokens: ${deprecated.join(', ')}`);
        }
      }
    }

    // Check accessibility
    if (options.checkAccessibility) {
      const report = AccessibilityUtils.generateAccessibilityReport(tokens);
      if (report.failing > 0) {
        if (options.strict) {
          errors.push(`${report.failing} accessibility issues found`);
        } else {
          warnings.push(`${report.failing} accessibility issues found`);
        }
      }
    }

    // Custom rules
    if (options.customRules) {
      options.customRules.forEach((rule) => {
        const result = rule(tokens);
        if (typeof result === 'boolean') {
          if (!result) {
            errors.push('Custom validation rule failed');
          }
        } else {
          if (!result.valid) {
            errors.push(result.error);
          }
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateFile(filePath: string, options: CICDValidationOptions = {}): CICDValidationResult {
    if (!fs.existsSync(filePath)) {
      return {
        valid: false,
        errors: [`File not found: ${filePath}`],
        warnings: [],
      };
    }

    try {
      const tokens = TokenParser.parse(filePath, {
        validate: true,
        expandReferences: true,
      });
      return this.validate(tokens, options);
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: [],
      };
    }
  }

  static exitCode(result: CICDValidationResult): number {
    return result.valid ? 0 : 1;
  }

  private static getDeprecatedTokens(tokens: DesignTokens): string[] {
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

      if ('value' in obj && obj.deprecated === true) {
        deprecated.push(path || 'root');
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
}

