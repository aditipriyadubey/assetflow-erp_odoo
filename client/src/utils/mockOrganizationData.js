import { ROLES } from './constants';

export const DEPARTMENT_STATUS = ['Active', 'Inactive'];

export const USER_STATUS = ['Active', 'Inactive'];

export const PROMOTABLE_ROLES = ['Employee', 'AssetManager', 'DepartmentHead'];

const initialDepartments = [
  { id: 1, name: 'Information Technology', head_user_id: 2, parent_department_id: null, status: 'Active' },
  { id: 2, name: 'Human Resources', head_user_id: 4, parent_department_id: null, status: 'Active' },
  { id: 3, name: 'IT Support', head_user_id: 3, parent_department_id: 1, status: 'Active' },
];

const initialCategories = [
  { id: 1, name: 'Laptops', description: 'Portable computers and notebooks', custom_fields: null },
  { id: 2, name: 'Projectors', description: 'Presentation and display equipment', custom_fields: null },
  { id: 3, name: 'Furniture', description: 'Desks, chairs, and office furnishings', custom_fields: null },
  { id: 4, name: 'Meeting Rooms', description: 'Bookable shared spaces', custom_fields: null },
];

const initialEmployees = [
  { id: 1, name: 'Admin User', email: 'admin@assetflow.com', role: 'Admin', department_id: 1, status: 'Active' },
  { id: 2, name: 'Priya Sharma', email: 'priya@assetflow.com', role: 'AssetManager', department_id: 1, status: 'Active' },
  { id: 3, name: 'Vikram Singh', email: 'vikram@assetflow.com', role: 'AssetManager', department_id: 1, status: 'Active' },
  { id: 4, name: 'Anita Desai', email: 'anita@assetflow.com', role: 'DepartmentHead', department_id: 2, status: 'Active' },
  { id: 5, name: 'Rahul Mehta', email: 'rahul@assetflow.com', role: 'Employee', department_id: 3, status: 'Active' },
  { id: 6, name: 'Sneha Patel', email: 'sneha@assetflow.com', role: 'Employee', department_id: 2, status: 'Active' },
  { id: 7, name: 'Karan Joshi', email: 'karan@assetflow.com', role: 'DepartmentHead', department_id: 1, status: 'Active' },
  { id: 8, name: 'Meera Nair', email: 'meera@assetflow.com', role: 'Employee', department_id: 3, status: 'Inactive' },
];

export function getOrganizationMockData() {
  return {
    departments: [...initialDepartments],
    categories: [...initialCategories],
    employees: [...initialEmployees],
    roles: ROLES,
  };
}

export { initialDepartments, initialCategories, initialEmployees };
