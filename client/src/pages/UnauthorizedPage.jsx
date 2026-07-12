import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">Not Authorized</h1>
        <p className="mt-2 text-sm text-neutral-500">
          You do not have permission to access this page. Contact your administrator
          if you believe this is an error.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/dashboard">
            <Button variant="primary">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
