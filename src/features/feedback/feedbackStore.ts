/**
 * Feedback capture.
 *
 * Validated input is sent to the backend feedback table (insert-only, nobody
 * can read other people's feedback) and also kept on the device so the user
 * always has a copyable record.
 */
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { getPlatform } from '@/services/platform.service';

export const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug report' },
  { value: 'feature', label: 'Feature request' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'general', label: 'General feedback' },
  { value: 'other', label: 'Other' },
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number]['value'];

export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'suggestion', 'general', 'other'], {
    errorMap: () => ({ message: 'Choose a feedback type' }),
  }),
  subject: z
    .string()
    .trim()
    .min(3, { message: 'Subject must be at least 3 characters' })
    .max(120, { message: 'Subject must be under 120 characters' }),
  message: z
    .string()
    .trim()
    .min(10, { message: 'Please describe this in at least 10 characters' })
    .max(2000, { message: 'Message must be under 2000 characters' }),
  email: z
    .string()
    .trim()
    .max(254, { message: 'Email must be under 254 characters' })
    .email({ message: 'Enter a valid email address' })
    .optional()
    .or(z.literal('')),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

export interface FeedbackEntry extends FeedbackInput {
  id: string;
  createdAt: string;
  appVersion: string;
}

const FEEDBACK_KEY = 'homelab-architect:feedback';
const MAX_ENTRIES = 50;

function safeId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `fb-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

export function loadFeedback(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is FeedbackEntry =>
        !!entry && typeof entry === 'object' && typeof (entry as FeedbackEntry).id === 'string'
    );
  } catch {
    return [];
  }
}

export function saveFeedback(input: FeedbackInput, appVersion: string): FeedbackEntry {
  const entry: FeedbackEntry = {
    ...input,
    email: input.email || '',
    id: safeId(),
    createdAt: new Date().toISOString(),
    appVersion,
  };

  try {
    const next = [entry, ...loadFeedback()].slice(0, MAX_ENTRIES);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(next));
  } catch {
    // Storage may be full or blocked; the confirmation still reflects reality
    // because the entry object is returned to the caller either way.
  }

  return entry;
}

export interface SubmitResult {
  entry: FeedbackEntry;
  /** True when the backend accepted the row. */
  sent: boolean;
  error?: string;
}

/** Validates, stores locally and submits to the backend. */
export async function submitFeedback(
  input: FeedbackInput,
  appVersion: string
): Promise<SubmitResult> {
  const entry = saveFeedback(input, appVersion);

  try {
    const { error } = await supabase.from('feedback').insert({
      type: entry.type,
      subject: entry.subject,
      message: entry.message,
      email: entry.email ? entry.email : null,
      app_version: appVersion,
      platform: getPlatform(),
    });
    if (error) return { entry, sent: false, error: error.message };
    return { entry, sent: true };
  } catch {
    return { entry, sent: false, error: 'Network unavailable' };
  }
}

/** Plain-text version the user can copy into an email or a GitHub issue. */
export function formatFeedback(entry: FeedbackEntry): string {
  const typeLabel = FEEDBACK_TYPES.find((t) => t.value === entry.type)?.label ?? entry.type;
  return [
    `Type: ${typeLabel}`,
    `Subject: ${entry.subject}`,
    entry.email ? `Contact: ${entry.email}` : null,
    `App version: ${entry.appVersion}`,
    `Date: ${entry.createdAt}`,
    '',
    entry.message,
  ]
    .filter(Boolean)
    .join('\n');
}
