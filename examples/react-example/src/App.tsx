import { ThemeProvider, useTheme } from '@tokiforge/react';
import { TokenParser } from '@tokiforge/core';
import tokens from '../tokens.json';

// Create theme config
const themeConfig = {
  themes: [
    {
      name: 'light',
      tokens: tokens,
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
      },
    },
  ],
  defaultTheme: 'light',
};

function Button() {
  const { tokens, setTheme, theme } = useTheme();
  
  return (
    <button
      style={{
        backgroundColor: tokens.color.primary as string,
        color: tokens.color.text.primary as string,
        borderRadius: tokens.radius.lg as string,
        padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 600,
        transition: 'all 0.2s',
      }}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
    </button>
  );
}

function App() {
  return (
    <ThemeProvider config={themeConfig}>
      <div
        style={{
          minHeight: '100vh',
          padding: '2rem',
          backgroundColor: 'var(--hf-color-background-default)',
          color: 'var(--hf-color-text-primary)',
          transition: 'background-color 0.3s, color 0.3s',
        }}
      >
        <h1>🌈 TokiForge React Example</h1>
        <p>This demonstrates the TokiForge theming system with React.</p>
        <Button />
        
        <div style={{ marginTop: '2rem' }}>
          <h2>Theme Tokens</h2>
          <pre style={{ 
            backgroundColor: 'var(--hf-color-background-muted)', 
            padding: '1rem',
            borderRadius: 'var(--hf-radius-md)',
            overflow: 'auto'
          }}>
            {JSON.stringify(themeConfig.themes.find(t => t.name === 'light')?.tokens, null, 2)}
          </pre>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;

