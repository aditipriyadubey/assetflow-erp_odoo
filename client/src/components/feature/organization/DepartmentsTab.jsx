import { useMemo, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';
import Input from '../../common/Input';
import Modal from '../../common/Modal';
import Select from '../../common/Select';
import Table from '../../common/Table';
import { DEPARTMENT_STATUS } from '../../../utils/mockOrganizationData';

const EMPTY_FORM = {
  name: '',
  head_user_id: '',
  parent_department_id: '',
  status: 'Active',
};

function DepartmentsTab({ departments, employees, onSave }) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const employeeOptions = employees
    .filter((emp) => emp.status === 'Active')
    .map((emp) => ({ value: String(emp.id), label: emp.name }));

  const parentOptions = departments
    .filter((dept) => dept.id !== editingId)
    .map((dept) => ({ value: String(dept.id), label: dept.name }));

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return departments;
    return departments.filter((dept) => dept.name.toLowerCase().includes(query));
  }, [departments, search]);

  const getEmployeeName = (id) =>
    employees.find((emp) => emp.id === id)?.name ?? '—';

  const getDepartmentName = (id) =>
    departments.find((dept) => dept.id === id)?.name ?? '—';

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditingId(dept.id);
    setForm({
      name: dept.name,
      head_user_id: dept.head_user_id ? String(dept.head_user_id) : '',
      parent_department_id: dept.parent_department_id ? String(dept.parent_department_id) : '',
      status: dept.status,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const nextErrors = {};
    const trimmedName = form.name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 120) {
      nextErrors.name = 'Name is required (2–120 characters).';
    }

    const duplicate = departments.some(
      (dept) =>
        dept.name.toLowerCase() === trimmedName.toLowerCase() && dept.id !== editingId,
    );

    if (duplicate) {
      nextErrors.name = 'A department with this name already exists.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    setSaving(true);

    const payload = {
      id: editingId ?? Date.now(),
      name: form.name.trim(),
      head_user_id: form.head_user_id ? Number(form.head_user_id) : null,
      parent_department_id: form.parent_department_id
        ? Number(form.parent_department_id)
        : null,
      status: form.status,
    };

    onSave(payload, editingId);
    setSaving(false);
    setModalOpen(false);
  };

  const columns = [
    { key: 'name', header: 'Department' },
    {
      key: 'head_user_id',
      header: 'Head',
      render: (value) => getEmployeeName(value),
    },
    {
      key: 'parent_department_id',
      header: 'Parent',
      render: (value) => (value ? getDepartmentName(value) : '—'),
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
        <Button variant="secondary" onClick={() => openEdit(row)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Departments</h3>
          <p className="text-sm text-neutral-500">Manage organizational departments</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      <Input
        label="Search departments"
        name="deptSearch"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name..."
      />

      {filteredDepartments.length === 0 ? (
        <EmptyState
          title="No departments found"
          description="Add a department to organize your workforce."
          action={<Button variant="primary" onClick={openCreate}>Add Department</Button>}
        />
      ) : (
        <Table columns={columns} data={filteredDepartments} />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Department' : 'Add Department'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleSubmit}>
              {editingId ? 'Save Changes' : 'Add Department'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Department Name"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            error={errors.name}
          />
          <Select
            label="Department Head"
            name="head_user_id"
            value={form.head_user_id}
            onChange={(e) => setForm({ ...form, head_user_id: e.target.value })}
            placeholder="Select head (optional)"
            options={employeeOptions}
          />
          <Select
            label="Parent Department"
            name="parent_department_id"
            value={form.parent_department_id}
            onChange={(e) => setForm({ ...form, parent_department_id: e.target.value })}
            placeholder="None (top-level)"
            options={parentOptions}
          />
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={DEPARTMENT_STATUS.map((s) => ({ value: s, label: s }))}
          />
        </div>
      </Modal>
    </div>
  );
}

export default DepartmentsTab;
