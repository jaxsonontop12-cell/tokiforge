import type { Plugin, DesignTokens, PluginOptions } from './types';

export class PluginManagerClass {
  private plugins: Map<string, Plugin> = new Map();

  register(plugin: Plugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  export(tokens: DesignTokens, pluginName: string, options?: PluginOptions): string {
    const plugin = this.plugins.get(pluginName);
    if (!plugin || !plugin.exporter) {
      throw new Error(`Plugin "${pluginName}" not found or does not have an exporter`);
    }
    return plugin.exporter(tokens, options);
  }

  validate(tokens: DesignTokens, pluginName: string, options?: PluginOptions): boolean | {
    valid: boolean;
    errors: string[];
  } {
    const plugin = this.plugins.get(pluginName);
    if (!plugin || !plugin.validator) {
      throw new Error(`Plugin "${pluginName}" not found or does not have a validator`);
    }
    return plugin.validator(tokens, options);
  }

  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  listPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }
}

export const pluginManager = new PluginManagerClass();

