import { useMemo, useState } from 'react';
import { UserCog } from 'lucide-react';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';
import Input from '../../common/Input';
import Modal from '../../common/Modal';
import Select from '../../common/Select';
import Table from '../../common/Table';
import { PROMOTABLE_ROLES } from '../../../utils/mockOrganizationData';

function EmployeesTab({ employees, departments, onPromoteRole, onToggleStatus }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newRole, setNewRole] = useState('Employee');
  const [saving, setSaving] = useState(false);

  const departmentOptions = departments.map((dept) => ({
    value: String(dept.id),
    label: dept.name,
  }));

  const roleFilterOptions = [
    { value: '', label: 'All Roles' },
    ...PROMOTABLE_ROLES.map((role) => ({
      value: role,
      label: role === 'AssetManager' ? 'Asset Manager' : role === 'DepartmentHead' ? 'Department Head' : role,
    })),
    { value: 'Admin', label: 'Admin' },
  ];

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((emp) => {
      const matchesSearch =
        !query ||
        emp.name.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query);
      const matchesRole = !roleFilter || emp.role === roleFilter;
      const matchesDept = !deptFilter || String(emp.department_id) === deptFilter;

      return matchesSearch && matchesRole && matchesDept;
    });
  }, [employees, search, roleFilter, deptFilter]);

  const getDepartmentName = (id) =>
    departments.find((dept) => dept.id === id)?.name ?? '—';

  const formatRole = (role) => {
    if (role === 'AssetManager') return 'Asset Manager';
    if (role === 'DepartmentHead') return 'Department Head';
    return role;
  };

  const openPromote = (employee) => {
    setSelectedEmployee(employee);
    setNewRole(
      employee.role === 'Admin' ? 'Employee' : employee.role,
    );
    setPromoteModalOpen(true);
  };

  const handlePromote = () => {
    if (!selectedEmployee || selectedEmployee.role === 'Admin') return;

    setSaving(true);
    onPromoteRole(selectedEmployee.id, newRole);
    setSaving(false);
    setPromoteModalOpen(false);
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'department_id',
      header: 'Department',
      render: (value) => getDepartmentName(value),
    },
    {
      key: 'role',
      header: 'Role',
      render: (value) => (
        <span className="text-sm font-medium text-neutral-700">{formatRole(value)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <Badge status={value} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          {row.role !== 'Admin' && (
            <>
              <Button variant="secondary" onClick={() => openPromote(row)}>
                <UserCog className="h-4 w-4" />
                Change Role
              </Button>
              <Button
                variant={row.status === 'Active' ? 'danger' : 'secondary'}
                onClick={() => onToggleStatus(row.id)}
              >
                {row.status === 'Active' ? 'Deactivate' : 'Activate'}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900">Employees</h3>
        <p className="text-sm text-neutral-500">
          Manage employee directory and role promotions (Admin only)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Input
          label="Search employees"
          name="empSearch"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
        />
        <Select
          label="Filter by role"
          name="roleFilter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          options={roleFilterOptions}
        />
        <Select
          label="Filter by department"
          name="deptFilter"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          placeholder="All departments"
          options={[{ value: '', label: 'All Departments' }, ...departmentOptions]}
        />
      </div>

      {filteredEmployees.length === 0 ? (
        <EmptyState
          title="No employees found"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <Table columns={columns} data={filteredEmployees} />
      )}

      <Modal
        isOpen={promoteModalOpen}
        onClose={() => setPromoteModalOpen(false)}
        title="Change Employee Role"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPromoteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handlePromote}>
              Save Role
            </Button>
          </>
        }
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              Updating role for <strong>{selectedEmployee.name}</strong>
            </p>
            <Select
              label="New Role"
              name="newRole"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              options={PROMOTABLE_ROLES.map((role) => ({
                value: role,
                label: formatRole(role),
              }))}
            />
            <p className="text-xs text-neutral-500">
              Admin role cannot be assigned here. Signup always creates Employee;
              only Admin can promote to Asset Manager or Department Head.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default EmployeesTab;
