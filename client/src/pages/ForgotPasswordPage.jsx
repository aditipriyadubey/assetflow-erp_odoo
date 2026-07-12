import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/feature/AuthLayout';
import Button from '../components/common/Button';
import ErrorBanner from '../components/common/ErrorBanner';
import Input from '../components/common/Input';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email to receive reset instructions"
      footer={
        <Link to="/login" className="text-primary-600 hover:underline">
          Back to Login
        </Link>
      }
    >
      {submitted ? (
        <div className="space-y-4">
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-success-600">
            If an account exists for {email}, reset instructions have been prepared.
            In local demo mode, no email is sent.
          </div>
          <p className="text-sm text-neutral-500">
            This is a temporary frontend-only success state for UI testing.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorBanner error={error} />}

          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            error={!isValid && email ? 'Please enter a valid email address.' : ''}
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!isValid}
            className="w-full"
          >
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
