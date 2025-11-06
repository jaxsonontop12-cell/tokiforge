import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '@tokiforge/angular';
import type { ThemeConfig } from '@tokiforge/core';
import tokens from '../../tokens.json';
import { ThemeSwitcherComponent } from './theme-switcher.component';
import { CardComponent } from './card.component';
import { ButtonComponent } from './button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ThemeSwitcherComponent, CardComponent, ButtonComponent],
  template: `
    <div class="app-container">
      <h1>🌈 TokiForge Angular Example</h1>
      <p>This demonstrates the TokiForge theming system with Angular 17+.</p>
      
      <app-theme-switcher></app-theme-switcher>
      <app-card></app-card>
      <app-button></app-button>
      
      <div class="tokens-section">
        <h2>Theme Tokens</h2>
        <pre>{{ tokensJson() }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      padding: 2rem;
      background-color: var(--hf-color-background-default);
      color: var(--hf-color-text-primary);
      transition: background-color 0.3s, color 0.3s;
    }

    h1 {
      margin-bottom: 1rem;
    }

    p {
      margin-bottom: 2rem;
      color: var(--hf-color-text-secondary);
    }

    .tokens-section {
      margin-top: 2rem;
    }

    .tokens-section h2 {
      margin-bottom: 1rem;
    }

    pre {
      background-color: var(--hf-color-background-muted);
      padding: 1rem;
      border-radius: var(--hf-radius-md);
      overflow: auto;
      color: var(--hf-color-text-primary);
    }
  `]
})
export class AppComponent implements OnInit {
  private themeService = inject(ThemeService);
  
  tokensJson = computed(() => {
    const currentTokens = this.themeService.tokens();
    return JSON.stringify(currentTokens, null, 2);
  });

  ngOnInit() {
    const themeConfig: ThemeConfig = {
      themes: [
        {
          name: 'light',
          tokens: {
            ...tokens,
            color: {
              ...tokens.color,
              text: {
                primary: { value: '#1E293B', type: 'color' },
                secondary: { value: '#64748B', type: 'color' },
              },
            },
          } as any,
        },
        {
          name: 'dark',
          tokens: {
            ...tokens,
            color: {
              ...tokens.color,
              text: {
                primary: { value: '#F8FAFC', type: 'color' },
                secondary: { value: '#CBD5E1', type: 'color' },
              },
              background: {
                default: { value: '#0F172A', type: 'color' },
                muted: { value: '#1E293B', type: 'color' },
              },
            },
          } as any,
        },
      ],
      defaultTheme: 'light',
    };

    this.themeService.init(themeConfig);
  }
}

