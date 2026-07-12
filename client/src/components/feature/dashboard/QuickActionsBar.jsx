import { CalendarPlus, PackagePlus, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../common/Button';
import Card from '../../common/Card';

const QUICK_ACTIONS = [
  {
    label: 'Register Asset',
    path: '/assets/new',
    icon: PackagePlus,
    roles: ['Admin', 'AssetManager'],
  },
  {
    label: 'Book Resource',
    path: '/bookings',
    icon: CalendarPlus,
    roles: ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'],
  },
  {
    label: 'Raise Maintenance',
    path: '/maintenance',
    icon: Wrench,
    roles: ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'],
  },
];

function QuickActionsBar({ userRole }) {
  const navigate = useNavigate();
  const visibleActions = QUICK_ACTIONS.filter((action) =>
    action.roles.includes(userRole),
  );

  if (!visibleActions.length) {
    return null;
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-neutral-900">Quick Actions</h3>
      <div className="mt-3 flex flex-wrap gap-3">
        {visibleActions.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.label}
              variant="secondary"
              onClick={() => navigate(action.path)}
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}

export default QuickActionsBar;
