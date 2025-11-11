import type { TokenValue, DesignTokens, Breakpoint } from './types';
import { TokenExporter } from './token-exporter';

export class ResponsiveTokens {
  static getResponsiveValue(token: TokenValue, breakpoint: string): string | number | undefined {
    if (!token.responsive) {
      return typeof token.value === 'object' ? undefined : token.value;
    }

    const responsive = token.responsive;
    return responsive[breakpoint] ?? responsive.default;
  }

  static getStateValue(token: TokenValue, state: string): string | number | undefined {
    if (!token.states) {
      return typeof token.value === 'object' ? undefined : token.value;
    }

    const states = token.states;
    return states[state] ?? states.default;
  }

  static generateResponsiveCSS(
    tokens: DesignTokens,
    breakpoints: Breakpoint[] = [],
    prefix: string = 'hf'
  ): string {
    const defaultBreakpoints: Breakpoint[] = [
      { name: 'sm', min: 640 },
      { name: 'md', min: 768 },
      { name: 'lg', min: 1024 },
      { name: 'xl', min: 1280 },
    ];

    const breakpointsToUse = breakpoints.length > 0 ? breakpoints : defaultBreakpoints;
    const cssParts: string[] = [];

    // Generate base CSS
    cssParts.push(TokenExporter.exportCSS(tokens, { selector: ':root', prefix }));

    // Generate responsive CSS
    breakpointsToUse.forEach((bp) => {
      const mediaQuery = `@media (min-width: ${bp.min}px)`;
      const responsiveTokens: DesignTokens = {};

      // Filter tokens with responsive values for this breakpoint
      const processTokens = (obj: any, target: any): void => {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (obj[key] && typeof obj[key] === 'object' && 'value' in obj[key]) {
              const token = obj[key] as TokenValue;
              if (token.responsive && token.responsive[bp.name]) {
                if (!target[key]) {
                  target[key] = { ...token };
                }
                target[key].value = token.responsive[bp.name];
              }
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              if (!target[key]) {
                target[key] = {};
              }
              processTokens(obj[key], target[key]);
            }
          }
        }
      };

      processTokens(tokens, responsiveTokens);

      if (Object.keys(responsiveTokens).length > 0) {
        const responsiveCSS = TokenExporter.exportCSS(responsiveTokens, {
          selector: ':root',
          prefix,
        });
        cssParts.push(`${mediaQuery} {\n${responsiveCSS}\n}`);
      }
    });

    return cssParts.join('\n\n');
  }

  static generateStateCSS(tokens: DesignTokens, prefix: string = 'hf'): string {
    const cssParts: string[] = [];
    
    const processTokens = (obj: any, basePath: string = ''): void => {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const path = basePath ? `${basePath}-${key}` : key;
          
          if (obj[key] && typeof obj[key] === 'object' && 'value' in obj[key]) {
            const token = obj[key] as TokenValue;
            if (token.states) {
              const states = token.states;
              const cssVar = `--${prefix}-${path}`.toLowerCase().replace(/\./g, '-');
              
              Object.entries(states).forEach(([state, value]) => {
                if (state !== 'default' && value !== undefined) {
                  cssParts.push(`.${state} { ${cssVar}: ${value}; }`);
                }
              });
            }
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            processTokens(obj[key], path);
          }
        }
      }
    };

    processTokens(tokens);
    return cssParts.join('\n');
  }
}

