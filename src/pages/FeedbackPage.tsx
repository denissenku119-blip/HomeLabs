import { useState } from 'react';
import { Link } from '@/lib/router-compat';
import { Server, Send, CheckCircle2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BackButton } from '@/components/layout/BackButton';
import { APP_VERSION } from '@/config/app';
import {
  FEEDBACK_TYPES,
  feedbackSchema,
  formatFeedback,
  submitFeedback,
  type FeedbackEntry,
  type FeedbackType,
} from '@/features/feedback/feedbackStore';

type Errors = Partial<Record<'type' | 'subject' | 'message' | 'email', string>>;

export function FeedbackPage() {
  const [type, setType] = useState<FeedbackType>('bug');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState<FeedbackEntry | null>(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    const result = feedbackSchema.safeParse({ type, subject, message, email });

    if (!result.success) {
      const next: Errors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === 'type' || field === 'subject' || field === 'message' || field === 'email') {
          next[field] = next[field] ?? issue.message;
        }
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setSending(true);
    const outcome = await submitFeedback(result.data, APP_VERSION);
    setSending(false);
    setSent(outcome.sent);
    setSubmitted(outcome.entry);
  };

  const handleCopy = async () => {
    if (!submitted) return;
    try {
      await navigator.clipboard.writeText(formatFeedback(submitted));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const resetForm = () => {
    setSubmitted(null);
    setSent(false);
    setSubject('');
    setMessage('');
    setEmail('');
    setType('bug');
  };

  return (
    <div className="public-page-scroll flex flex-col">
      <header className="sticky top-0 z-40 bg-base-950/80 backdrop-blur-md border-b border-base-800 safe-top">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-base-950">
              <Server className="w-4.5 h-4.5" strokeWidth={2.5} />
            </span>
            <span className="text-sm font-bold text-base-50">
              HomeLab <span className="text-accent">Architect</span>
            </span>
          </Link>
          <Link to="/app">
            <Button size="sm">Launch App</Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 safe-bottom">
        <BackButton to="/app/settings" label="Back to Settings" className="mb-4" />
        <SectionHeader
          eyebrow="Feedback"
          title="Report a bug or suggest an improvement"
          description="Tell us what happened or what you would like to see next."
        />

        {submitted ? (
          <Card className="mt-8">
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-success-500/15 text-success-400 flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-base-50">
                  {sent ? 'Feedback sent' : 'Saved on this device'}
                </h2>
                <p className="text-sm text-base-300 mt-1 leading-relaxed">
                  {sent
                    ? 'Thanks — your feedback reached us and a copy is kept on this device.'
                    : 'We could not reach the server, so your feedback is saved on this device only. Copy the details below and try again later.'}
                </p>
              </div>
            </div>

            <pre className="mt-4 whitespace-pre-wrap break-words rounded-xl border border-base-700 bg-base-850 p-3 text-xs text-base-200">
              {formatFeedback(submitted)}
            </pre>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                onClick={handleCopy}
                leftIcon={
                  copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />
                }
              >
                {copied ? 'Copied' : 'Copy details'}
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Send more feedback
              </Button>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-6">
            <Card>
              <div className="flex flex-col gap-5">
                <Select
                  label="Feedback type"
                  options={FEEDBACK_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                  value={type}
                  onChange={(e) => setType(e.target.value as FeedbackType)}
                  error={errors.type}
                />

                <Input
                  label="Subject"
                  value={subject}
                  maxLength={120}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Short summary"
                  error={errors.subject}
                  helperText={!errors.subject ? `${subject.trim().length}/120` : undefined}
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="feedback-message" className="text-sm font-medium text-base-100">
                    Details
                  </label>
                  <textarea
                    id="feedback-message"
                    value={message}
                    maxLength={2000}
                    rows={7}
                    onChange={(e) => setMessage(e.target.value)}
                    aria-invalid={!!errors.message}
                    placeholder="What happened, what you expected, and how to reproduce it."
                    className={`w-full px-3 py-2 text-sm rounded-lg bg-base-850 border text-base-100 placeholder:text-base-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent resize-y ${
                      errors.message
                        ? 'border-danger-500 focus:ring-danger-500'
                        : 'border-base-600 hover:border-base-500'
                    }`}
                  />
                  {errors.message ? (
                    <p className="text-xs text-danger-400">{errors.message}</p>
                  ) : (
                    <p className="text-xs text-base-300">{message.trim().length}/2000</p>
                  )}
                </div>

                <Input
                  label="Email (optional)"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  maxLength={254}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  error={errors.email}
                  helperText={
                    !errors.email
                      ? 'Only add this if you want to be reachable about this report.'
                      : undefined
                  }
                />
              </div>
            </Card>

            <p className="text-xs text-base-400 leading-relaxed">
              Your feedback is sent to us and a copy stays on this device. No account is needed and
              nothing else about you is collected.
            </p>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={sending}
                leftIcon={<Send className="w-4 h-4" />}
              >
                {sending ? 'Sending…' : 'Submit feedback'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
