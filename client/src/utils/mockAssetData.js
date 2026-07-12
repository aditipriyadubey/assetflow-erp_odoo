import { ASSET_STATUS, ASSET_CONDITIONS } from './constants';
import { getOrganizationMockData } from './mockOrganizationData';

const { categories } = getOrganizationMockData();

const initialAssets = [
  {
    id: 1,
    asset_tag: 'AF-0001',
    name: 'Dell Latitude 5440',
    category_id: 1,
    serial_number: 'DL5440-0001',
    qr_code_value: 'QR-AF-0001',
    acquisition_date: '2024-02-15',
    acquisition_cost: 78500,
    condition: 'Good',
    location: 'HQ - 3rd Floor',
    photo_url: '',
    is_bookable: false,
    status: 'Available',
  },
  {
    id: 2,
    asset_tag: 'AF-0002',
    name: 'HP EliteBook 840',
    category_id: 1,
    serial_number: 'HP840-0002',
    qr_code_value: 'QR-AF-0002',
    acquisition_date: '2024-06-01',
    acquisition_cost: 82000,
    condition: 'New',
    location: 'HQ - 3rd Floor',
    photo_url: '',
    is_bookable: false,
    status: 'Allocated',
  },
  {
    id: 3,
    asset_tag: 'AF-0003',
    name: 'Conference Room Projector',
    category_id: 3,
    serial_number: 'PRJ-0003',
    qr_code_value: 'QR-AF-0003',
    acquisition_date: '2023-11-10',
    acquisition_cost: 45000,
    condition: 'Good',
    location: 'HQ - Conf Room A',
    photo_url: '',
    is_bookable: true,
    status: 'Available',
  },
  {
    id: 4,
    asset_tag: 'AF-0004',
    name: 'Ergonomic Office Chair',
    category_id: 2,
    serial_number: 'CHR-0004',
    qr_code_value: 'QR-AF-0004',
    acquisition_date: '2022-08-20',
    acquisition_cost: 12500,
    condition: 'Fair',
    location: 'HQ - 2nd Floor',
    photo_url: '',
    is_bookable: false,
    status: 'Under Maintenance',
  },
  {
    id: 5,
    asset_tag: 'AF-0005',
    name: 'Standing Desk',
    category_id: 2,
    serial_number: 'DSK-0005',
    qr_code_value: 'QR-AF-0005',
    acquisition_date: '2023-03-05',
    acquisition_cost: 21000,
    condition: 'Good',
    location: 'HQ - 2nd Floor',
    photo_url: '',
    is_bookable: false,
    status: 'Available',
  },
];

export function getAssetMockData() {
  return {
    assets: initialAssets.map((asset) => ({ ...asset })),
    categories: categories.map((category) => ({ ...category })),
    assetStatuses: [...ASSET_STATUS],
    assetConditions: [...ASSET_CONDITIONS],
  };
}

export function createAssetDraft() {
  return {
    name: '',
    category_id: '',
    serial_number: '',
    acquisition_date: '',
    acquisition_cost: '',
    condition: 'Good',
    location: '',
    photo_url: '',
    is_bookable: false,
  };
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    style: 'currency',
    currency: 'INR',
  }).format(Number(value ?? 0));
}
