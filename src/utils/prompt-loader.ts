import { promises as fs } from 'fs';
import { join } from 'path';
import { TASK_JSON_SCHEMA } from '../schemas/task-schema.js';

/**
 * Maximum lines allowed for overall composed prompts to prevent context bloat
 * Composed prompts = base.md (optional) + specific prompt (e.g., sync.md)
 */
export const MAX_PROMPT_LINES = 400;

/**
 * Prompt placeholders that get replaced with actual content
 */
const PROMPT_PLACEHOLDERS = {
  TASK_SCHEMA: TASK_JSON_SCHEMA,
} as const;

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
 * Injects placeholders into prompt content
 * Replaces [PLACEHOLDER_NAME] with actual content from PROMPT_PLACEHOLDERS
 */
function injectPlaceholders(content: string): string {
  let result = content;
  for (const [placeholder, value] of Object.entries(PROMPT_PLACEHOLDERS)) {
    const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

/**
 * Reads a prompt file from .project-memory/prompts/
 * Returns null if file doesn't exist
 * Injects placeholders with actual content (e.g., [TASK_SCHEMA])
 */
export async function readPromptFile(
  projectRoot: string,
  filename: string
): Promise<string | null> {
  const promptPath = join(projectRoot, '.project-memory', 'prompts', filename);

  try {
    const content = await fs.readFile(promptPath, 'utf-8');
    const withPlaceholders = injectPlaceholders(content);
    validatePromptLength(withPlaceholders, filename);
    return withPlaceholders;
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
