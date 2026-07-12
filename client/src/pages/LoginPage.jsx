import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/feature/AuthLayout';
import Button from '../components/common/Button';
import ErrorBanner from '../components/common/ErrorBanner';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

const DEMO_ROLE_OPTIONS = ROLES.map((role) => ({
  value: role,
  label: role === 'AssetManager' ? 'Asset Manager' : role === 'DepartmentHead' ? 'Department Head' : role,
}));

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [demoRole, setDemoRole] = useState('Employee');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = useMemo(() => {
    return (
      email.trim().length > 0 &&
      password.length >= 8 &&
      /[A-Za-z]/.test(password) &&
      /\d/.test(password) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
      demoRole.length > 0
    );
  }, [email, password, demoRole]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setLoading(true);

    const result = await login({ email, password, demoRole });

    setLoading(false);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    const redirectTo = location.state?.from?.pathname ?? '/dashboard';
    navigate(redirectTo, { replace: true });
  };

  return (
    <AuthLayout title="Sign in" subtitle="Access your AssetFlow account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <ErrorBanner error={formError} />}

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
          placeholder="Enter your password"
          required
        />

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-2">
          <Select
            label="Demo Role (testing only)"
            name="demoRole"
            value={demoRole}
            onChange={(e) => setDemoRole(e.target.value)}
            options={DEMO_ROLE_OPTIONS}
          />
          <p className="text-xs text-amber-800">
            Temporary frontend-only selector for role testing. Real signup always
            creates Employee.
          </p>
        </div>

        <Button type="submit" variant="primary" loading={loading} disabled={!isValid} className="w-full">
          Login
        </Button>

        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-primary-600 hover:underline">
            Forgot password?
          </Link>
          <Link to="/signup" className="text-primary-600 hover:underline">
            Create account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
