import { useState } from 'react';
import { getOrganizationMockData } from '../utils/mockOrganizationData';
import CategoriesTab from '../components/feature/organization/CategoriesTab';
import DepartmentsTab from '../components/feature/organization/DepartmentsTab';
import EmployeesTab from '../components/feature/organization/EmployeesTab';
import OrgTabs from '../components/feature/organization/OrgTabs';

const TABS = [
  { id: 'departments', label: 'Departments' },
  { id: 'categories', label: 'Asset Categories' },
  { id: 'employees', label: 'Employees' },
];

function OrganizationSetupPage() {
  const initialData = getOrganizationMockData();
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState(initialData.departments);
  const [categories, setCategories] = useState(initialData.categories);
  const [employees, setEmployees] = useState(initialData.employees);

  const handleDepartmentSave = (payload, editingId) => {
    if (editingId) {
      setDepartments((prev) =>
        prev.map((dept) => (dept.id === editingId ? { ...dept, ...payload } : dept)),
      );
    } else {
      setDepartments((prev) => [...prev, payload]);
    }
  };

  const handleCategorySave = (payload, editingId) => {
    if (editingId) {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === editingId ? { ...cat, ...payload } : cat)),
      );
    } else {
      setCategories((prev) => [...prev, payload]);
    }
  };

  const handlePromoteRole = (employeeId, newRole) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId ? { ...emp, role: newRole } : emp,
      ),
    );
  };

  const handleToggleStatus = (employeeId) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? { ...emp, status: emp.status === 'Active' ? 'Inactive' : 'Active' }
          : emp,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-neutral-900">Organization Setup</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Configure departments, asset categories, and employee directory.
        </p>
      </header>

      <OrgTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="pt-2">
        {activeTab === 'departments' && (
          <DepartmentsTab
            departments={departments}
            employees={employees}
            onSave={handleDepartmentSave}
          />
        )}
        {activeTab === 'categories' && (
          <CategoriesTab categories={categories} onSave={handleCategorySave} />
        )}
        {activeTab === 'employees' && (
          <EmployeesTab
            employees={employees}
            departments={departments}
            onPromoteRole={handlePromoteRole}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </div>
    </div>
  );
}

export default OrganizationSetupPage;
