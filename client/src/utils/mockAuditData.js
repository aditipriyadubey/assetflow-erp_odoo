import { AUDIT_ITEM_STATUS, AUDIT_STATUS } from './constants';
import { getAssetMockData } from './mockAssetData';
import { getOrganizationMockData } from './mockOrganizationData';

const { departments, employees } = getOrganizationMockData();
const { assets } = getAssetMockData();

const initialAudits = [
  {
    id: 1,
    name: 'Q3 Asset Verification',
    department_id: 1,
    location: 'HQ - 3rd Floor',
    start_date: '2026-07-01',
    end_date: '2026-07-05',
    status: 'InProgress',
    created_by: 2,
    items: [
      { id: 11, audit_id: 1, asset_id: 1, verification_status: 'Verified', notes: 'Laptop serial matched.', verified_by: 2, verified_at: '2026-07-02' },
      { id: 12, audit_id: 1, asset_id: 2, verification_status: 'Pending', notes: '', verified_by: null, verified_at: null },
      { id: 13, audit_id: 1, asset_id: 3, verification_status: 'Missing', notes: 'Projector not found in storage.', verified_by: 3, verified_at: '2026-07-03' },
    ],
  },
  {
    id: 2,
    name: 'Facilities Floor Audit',
    department_id: 2,
    location: 'HQ - 2nd Floor',
    start_date: '2026-07-10',
    end_date: '2026-07-12',
    status: 'Draft',
    created_by: 4,
    items: [
      { id: 21, audit_id: 2, asset_id: 4, verification_status: 'Pending', notes: '', verified_by: null, verified_at: null },
      { id: 22, audit_id: 2, asset_id: 5, verification_status: 'Pending', notes: '', verified_by: null, verified_at: null },
    ],
  },
];

export function getAuditMockData() {
  return {
    audits: initialAudits.map((audit) => ({
      ...audit,
      items: audit.items.map((item) => ({ ...item })),
    })),
    assets: assets.map((asset) => ({ ...asset })),
    departments: departments.map((department) => ({ ...department })),
    employees: employees.map((employee) => ({ ...employee })),
    auditStatuses: [...AUDIT_STATUS],
    auditItemStatuses: [...AUDIT_ITEM_STATUS],
  };
}

export function createAuditDraft() {
  return {
    name: '',
    department_id: '',
    location: '',
    start_date: '',
    end_date: '',
  };
}

export function createAuditItems(assets = []) {
  return assets.slice(0, 3).map((asset, index) => ({
    id: Date.now() + index,
    audit_id: null,
    asset_id: asset.id,
    verification_status: 'Pending',
    notes: '',
    verified_by: null,
    verified_at: null,
  }));
}
