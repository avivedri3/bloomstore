import type { ZodError } from 'zod';

export function fieldErrorsFromZod(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !fields[key]) {
      fields[key] = issue.message;
    }
  }
  return fields;
}

export const emailInputAttrs = {
  autoCapitalize: 'none',
  autoCorrect: 'off',
  spellCheck: false,
  inputMode: 'email' as const,
};

export const telInputAttrs = {
  inputMode: 'tel' as const,
  minLength: 7,
  maxLength: 20,
};
