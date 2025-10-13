import { inject, provide, ref, computed, type Ref, type ComputedRef } from 'vue';
import type { DesignTokens, ThemeConfig } from '@tokiforge/core';
import { ThemeRuntime as ThemeRuntimeClass } from '@tokiforge/core';

const ThemeKey = Symbol('tokiforge-theme');

interface ThemeContext {
  theme: Ref<string>;
  tokens: ComputedRef<DesignTokens>;
  setTheme: (themeName: string) => void;
  nextTheme: () => void;
  availableThemes: ComputedRef<string[]>;
  runtime: ThemeRuntimeClass;
}

export function provideTheme(
  config: ThemeConfig,
  selector: string = ':root',
  prefix: string = 'hf',
  defaultTheme?: string
): ThemeContext {
  const runtime = new ThemeRuntimeClass(config);
  const themeName = defaultTheme || config.defaultTheme || config.themes[0]?.name || 'default';
  const theme = ref(themeName);
  const tokens = computed(() => runtime.getThemeTokens(theme.value));

  // Initialize runtime
  if (typeof window !== 'undefined') {
    runtime.init(selector, prefix);
  }

  // Watch for theme changes
  if (typeof window !== 'undefined') {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      theme.value = customEvent.detail.theme;
    };

    window.addEventListener('tokiforge:theme-change', handleThemeChange);
  }

  const setTheme = (name: string) => {
    runtime.applyTheme(name, selector, prefix);
    theme.value = name;
  };

  const nextTheme = () => {
    const newTheme = runtime.nextTheme();
    theme.value = newTheme;
  };

  const context: ThemeContext = {
    theme,
    tokens,
    setTheme,
    nextTheme,
    availableThemes: computed(() => runtime.getAvailableThemes()),
    runtime,
  };

  provide(ThemeKey, context);

  return context;
}

export function useTheme(): ThemeContext {
  const context = inject<ThemeContext>(ThemeKey);
  if (!context) {
    throw new Error('useTheme must be used within a component that provides theme context');
  }
  return context;
}

