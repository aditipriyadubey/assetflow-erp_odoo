import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/feature/AuthLayout';
import Button from '../components/common/Button';
import ErrorBanner from '../components/common/ErrorBanner';
import Input from '../components/common/Input';
import useAuth from '../hooks/useAuth';

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = useMemo(() => {
    const trimmedName = name.trim();

    return (
      trimmedName.length >= 2 &&
      trimmedName.length <= 150 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
      password.length >= 8 &&
      /[A-Za-z]/.test(password) &&
      /\d/.test(password)
    );
  }, [name, email, password]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setLoading(true);

    const result = await signup({ name, email, password });

    setLoading(false);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Signup creates an Employee account only"
      footer={
        <Link to="/login" className="text-primary-600 hover:underline">
          Already have an account? Sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <ErrorBanner error={formError} />}

        <Input
          label="Full Name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters with a letter and number"
          required
        />

        <p className="text-xs text-neutral-500">
          New accounts are always assigned the Employee role. Role promotion is
          performed by an Admin in Organization Setup.
        </p>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!isValid}
          className="w-full"
        >
          Sign up
        </Button>
      </form>
    </AuthLayout>
  );
}

export default SignupPage;
