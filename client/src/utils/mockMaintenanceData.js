import { MAINTENANCE_PRIORITY, MAINTENANCE_STATUS } from './constants';
import { getAssetMockData } from './mockAssetData';
import { getOrganizationMockData } from './mockOrganizationData';

const { employees } = getOrganizationMockData();
const { assets } = getAssetMockData();

const initialMaintenance = [
  {
    id: 1,
    asset_id: 4,
    raised_by: 4,
    issue_description: 'Chair hydraulic lift no longer holds height under normal use.',
    priority: 'Medium',
    photo_url: '',
    status: 'Approved',
    approved_by: 2,
    technician_name: '',
    resolved_at: null,
    created_at: '2026-07-02',
  },
  {
    id: 2,
    asset_id: 5,
    raised_by: 5,
    issue_description: 'Standing desk control panel is intermittently unresponsive.',
    priority: 'High',
    photo_url: '',
    status: 'Pending',
    approved_by: null,
    technician_name: '',
    resolved_at: null,
    created_at: '2026-07-09',
  },
];

export function getMaintenanceMockData() {
  return {
    maintenance: initialMaintenance.map((item) => ({ ...item })),
    assets: assets.map((asset) => ({ ...asset })),
    employees: employees.map((employee) => ({ ...employee })),
    maintenanceStatuses: [...MAINTENANCE_STATUS],
    maintenancePriorities: [...MAINTENANCE_PRIORITY],
  };
}

export function createMaintenanceDraft() {
  return {
    asset_id: '',
    issue_description: '',
    priority: 'Medium',
    photo_url: '',
    technician_name: '',
    status: 'Pending',
  };
}

export function formatMaintenanceDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(date);
}
