import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">Page Not Found</h1>
        <p className="mt-2 text-sm text-neutral-500">
          The page you are looking for does not exist or has been moved.
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

export default NotFoundPage;
