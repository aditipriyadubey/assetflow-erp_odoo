import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  ClipboardCheck,
  LayoutDashboard,
  Package,
  Wrench,
} from 'lucide-react';

/**
 * Central navigation config — visibility is frontend UX only, not a security boundary.
 * SDD Part 2 §15 route paths used where specified.
 */
export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'],
  },
  {
    label: 'Organization Setup',
    path: '/organization',
    icon: Building2,
    roles: ['Admin'],
  },
  {
    label: 'Assets',
    path: '/assets',
    icon: Package,
    roles: ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'],
  },
  {
    label: 'Allocations & Transfers',
    path: '/allocations',
    icon: ArrowLeftRight,
    roles: ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'],
  },
  {
    label: 'Resource Booking',
    path: '/bookings',
    icon: Calendar,
    roles: ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'],
  },
  {
    label: 'Maintenance',
    path: '/maintenance',
    icon: Wrench,
    roles: ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'],
  },
  {
    label: 'Asset Audits',
    path: '/audits',
    icon: ClipboardCheck,
    roles: ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'],
  },
  {
    label: 'Reports & Analytics',
    path: '/reports',
    icon: BarChart3,
    roles: ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'],
  },
  {
    label: 'Activity & Notifications',
    path: '/notifications',
    icon: Bell,
    roles: ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'],
  },
];

export function getNavItemsForRole(role) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function getPageTitle(pathname) {
  const item = NAV_ITEMS.find((nav) => nav.path === pathname);
  return item?.label ?? 'AssetFlow';
}
