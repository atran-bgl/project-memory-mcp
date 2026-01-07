import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Maximum lines allowed for overall composed prompts to prevent context bloat
 * Composed prompts = base.md (optional) + specific prompt (e.g., sync.md)
 */
export const MAX_PROMPT_LINES = 400;

/**
 * Validates that the final composed prompt does not exceed the line limit
 */
export function validatePromptLength(content: string, filename: string): void {
  const lines = content.split('\n');
  if (lines.length > MAX_PROMPT_LINES) {
    console.warn(
      `Warning: ${filename} has ${lines.length} lines, exceeding the ${MAX_PROMPT_LINES} line limit. ` +
      `Consider removing content or splitting this prompt to prevent context bloat.`
    );
  }
}

/**
 * Reads a prompt file from .project-memory/prompts/
 * Returns null if file doesn't exist
 */
export async function readPromptFile(
  projectRoot: string,
  filename: string
): Promise<string | null> {
  const promptPath = join(projectRoot, '.project-memory', 'prompts', filename);

  try {
    const content = await fs.readFile(promptPath, 'utf-8');
    validatePromptLength(content, filename);
    return content;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Composes a prompt by combining base + specific prompt
 * Returns the hardcoded fallback if project-specific prompts don't exist
 * Validates that the final composed prompt does not exceed MAX_PROMPT_LINES
 */
export async function composePrompt(
  projectRoot: string,
  specificPrompt: string,
  fallbackPrompt: string
): Promise<string> {
  const base = await readPromptFile(projectRoot, 'base.md');
  const specific = await readPromptFile(projectRoot, specificPrompt);

  // If project-specific prompts don't exist, use fallback
  if (!base && !specific) {
    validatePromptLength(fallbackPrompt, 'fallback');
    return fallbackPrompt;
  }

  // Compose available prompts (no wrapper headers, just clean concatenation)
  const parts: string[] = [];

  if (base) {
    parts.push(base);
  }

  if (specific) {
    parts.push(specific);
  }

  const composed = parts.join('\n\n---\n\n');

  // Validate the final composed prompt
  validatePromptLength(composed, `${specificPrompt} (composed)`);

  return composed;
}

/**
 * Gets the project root directory (current working directory)
 */
export function getProjectRoot(): string {
  return process.cwd();
}
