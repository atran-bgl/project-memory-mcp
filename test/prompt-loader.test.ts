import { describe, it, expect } from 'vitest';
import { validatePromptLength, MAX_PROMPT_LINES } from '../src/utils/prompt-loader.js';

describe('Prompt Loader', () => {
  describe('validatePromptLength', () => {
    it('should not warn for prompts under 400 lines', () => {
      const content = Array(350).fill('line').join('\n');
      const consoleSpy = { warnings: [] as string[] };
      const originalWarn = console.warn;
      console.warn = (msg: string) => consoleSpy.warnings.push(msg);

      validatePromptLength(content, 'test.md');

      console.warn = originalWarn;
      expect(consoleSpy.warnings.length).toBe(0);
    });

    it('should warn for prompts exceeding 400 lines', () => {
      const content = Array(450).fill('line').join('\n');
      const consoleSpy = { warnings: [] as string[] };
      const originalWarn = console.warn;
      console.warn = (msg: string) => consoleSpy.warnings.push(msg);

      validatePromptLength(content, 'test.md');

      console.warn = originalWarn;
      expect(consoleSpy.warnings.length).toBe(1);
      expect(consoleSpy.warnings[0]).toContain('test.md');
      expect(consoleSpy.warnings[0]).toContain('450 lines');
      expect(consoleSpy.warnings[0]).toContain(`${MAX_PROMPT_LINES} line limit`);
    });

    it('should warn at exactly 401 lines', () => {
      const content = Array(401).fill('line').join('\n');
      const consoleSpy = { warnings: [] as string[] };
      const originalWarn = console.warn;
      console.warn = (msg: string) => consoleSpy.warnings.push(msg);

      validatePromptLength(content, 'boundary.md');

      console.warn = originalWarn;
      expect(consoleSpy.warnings.length).toBe(1);
    });

    it('should not warn at exactly 400 lines', () => {
      const content = Array(400).fill('line').join('\n');
      const consoleSpy = { warnings: [] as string[] };
      const originalWarn = console.warn;
      console.warn = (msg: string) => consoleSpy.warnings.push(msg);

      validatePromptLength(content, 'boundary.md');

      console.warn = originalWarn;
      expect(consoleSpy.warnings.length).toBe(0);
    });

    it('should handle empty content', () => {
      const content = '';
      const consoleSpy = { warnings: [] as string[] };
      const originalWarn = console.warn;
      console.warn = (msg: string) => consoleSpy.warnings.push(msg);

      validatePromptLength(content, 'empty.md');

      console.warn = originalWarn;
      expect(consoleSpy.warnings.length).toBe(0);
    });
  });
});
