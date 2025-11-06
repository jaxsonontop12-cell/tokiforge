import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="card">
      <h2>Card Component</h2>
      <p>This card uses CSS variables for theming. The background and text colors automatically adapt to the current theme.</p>
      <p>Try switching themes to see the colors change instantly!</p>
    </div>
  `,
  styles: [`
    .card {
      background-color: var(--hf-color-background-muted);
      color: var(--hf-color-text-primary);
      border-radius: var(--hf-radius-lg);
      padding: var(--hf-spacing-lg);
      margin-bottom: var(--hf-spacing-md);
      transition: background-color 0.3s, color 0.3s;
    }

    h2 {
      margin-top: 0;
      margin-bottom: var(--hf-spacing-md);
      color: var(--hf-color-text-primary);
    }

    p {
      margin-bottom: var(--hf-spacing-sm);
      color: var(--hf-color-text-secondary);
    }

    p:last-child {
      margin-bottom: 0;
    }
  `]
})
export class CardComponent {}

