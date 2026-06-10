import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Input } from '@/components/ui';
import { useAuthActions } from '../auth.hooks';

export function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuthActions();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      await sendPasswordReset(email);
      setMessage('Password reset link sent. Check your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto w-full max-w-md">
        <Card className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">Forgot password</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Enter your email to receive password reset instructions.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Email</label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@example.com" />
            </div>
            {message && <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send reset email'}
              </Button>
              <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                Back to sign in
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
