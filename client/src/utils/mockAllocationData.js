import { ALLOCATION_STATUS, TRANSFER_STATUS } from './constants';
import { initialEmployees } from './mockOrganizationData';
import { getAssetMockData } from './mockAssetData';

const { assets } = getAssetMockData();

const initialAllocations = [
  {
    id: 1,
    asset_id: 2,
    employee_id: 4,
    department_id: 1,
    allocated_date: '2026-06-20',
    expected_return_date: '2026-07-20',
    actual_return_date: '',
    condition_checkin_notes: '',
    status: 'Active',
    allocated_by: 2,
  },
  {
    id: 2,
    asset_id: 5,
    employee_id: 5,
    department_id: 3,
    allocated_date: '2026-05-10',
    expected_return_date: '2026-06-10',
    actual_return_date: '',
    condition_checkin_notes: '',
    status: 'Overdue',
    allocated_by: 2,
  },
];

const initialTransfers = [
  {
    id: 1,
    asset_id: 1,
    from_user_id: 2,
    to_user_id: 5,
    requested_by: 2,
    status: 'Requested',
    approved_by: null,
    requested_at: '2026-07-01',
    resolved_at: null,
  },
  {
    id: 2,
    asset_id: 3,
    from_user_id: 2,
    to_user_id: 6,
    requested_by: 5,
    status: 'Approved',
    approved_by: 2,
    requested_at: '2026-06-26',
    resolved_at: '2026-06-26',
  },
];

export function getAllocationMockData() {
  return {
    allocations: initialAllocations.map((allocation) => ({ ...allocation })),
    transfers: initialTransfers.map((transfer) => ({ ...transfer })),
    allocationStatuses: [...ALLOCATION_STATUS],
    transferStatuses: [...TRANSFER_STATUS],
    employees: initialEmployees.map((employee) => ({ ...employee })),
    assets: assets.map((asset) => ({ ...asset })),
  };
}

export function createAllocationDraft() {
  return {
    asset_id: '',
    employee_id: '',
    department_id: '',
    allocated_date: '',
    expected_return_date: '',
    condition_checkin_notes: '',
  };
}

export function createTransferDraft() {
  return {
    asset_id: '',
    to_user_id: '',
    requested_by: '',
  };
}
