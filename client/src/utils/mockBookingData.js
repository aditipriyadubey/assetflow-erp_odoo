import { BOOKING_STATUS } from './constants';
import { getAssetMockData } from './mockAssetData';
import { getOrganizationMockData } from './mockOrganizationData';

const { departments, employees } = getOrganizationMockData();
const { assets } = getAssetMockData();

const initialBookings = [
  {
    id: 1,
    asset_id: 3,
    booked_by: 5,
    department_id: 2,
    purpose: 'Quarterly HR review meeting',
    start_time: '2026-07-15T10:00',
    end_time: '2026-07-15T11:00',
    status: 'Upcoming',
  },
  {
    id: 2,
    asset_id: 3,
    booked_by: 6,
    department_id: 2,
    purpose: 'Training session',
    start_time: '2026-07-12T14:00',
    end_time: '2026-07-12T15:00',
    status: 'Ongoing',
  },
];

export function getBookingMockData() {
  return {
    bookings: initialBookings.map((booking) => ({ ...booking })),
    assets: assets.map((asset) => ({ ...asset })),
    departments: departments.map((department) => ({ ...department })),
    employees: employees.map((employee) => ({ ...employee })),
    bookingStatuses: [...BOOKING_STATUS],
  };
}

export function createBookingDraft() {
  return {
    asset_id: '',
    department_id: '',
    purpose: '',
    start_time: '',
    end_time: '',
    status: 'Upcoming',
  };
}

export function formatBookingDateTime(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
