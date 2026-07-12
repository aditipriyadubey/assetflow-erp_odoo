import { useMemo, useState } from 'react';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Modal from '../../common/Modal';
import Select from '../../common/Select';
import { createAllocationDraft } from '../../../utils/mockAllocationData';
import { ALLOCATION_STATUS } from '../../../utils/constants';

const statusOptions = ALLOCATION_STATUS.map((status) => ({ value: status, label: status }));

function AllocationFormModal({ isOpen, onClose, onSubmit, assets = [], employees = [], initialValue }) {
  const [form, setForm] = useState(() => (initialValue ? { ...createAllocationDraft(), ...initialValue } : createAllocationDraft()));
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setForm(initialValue ? { ...createAllocationDraft(), ...initialValue } : createAllocationDraft());
    setErrors({});
  };

  const assetOptions = useMemo(
    () => assets.map((asset) => ({ value: asset.id, label: `${asset.asset_tag} — ${asset.name}` })),
    [assets]
  );

  const employeeOptions = useMemo(
    () => employees.map((employee) => ({ value: employee.id, label: `${employee.name} (${employee.role})` })),
    [employees]
  );

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.asset_id) nextErrors.asset_id = 'Asset is required.';
    if (!form.employee_id) nextErrors.employee_id = 'Employee is required.';
    if (!form.department_id) nextErrors.department_id = 'Department is required.';
    if (!form.allocated_date) nextErrors.allocated_date = 'Allocation date is required.';
    if (!form.expected_return_date) nextErrors.expected_return_date = 'Expected return date is required.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...form,
      asset_id: Number(form.asset_id),
      employee_id: Number(form.employee_id),
      department_id: Number(form.department_id),
      allocated_by: 2,
      status: form.status ?? 'Active',
    });
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Allocate Asset"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="allocation-form">Save Allocation</Button>
        </>
      }
    >
      <form id="allocation-form" onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Asset"
          name="asset_id"
          value={form.asset_id}
          onChange={handleChange}
          options={assetOptions}
          placeholder="Select an asset"
          required
          error={errors.asset_id}
        />
        <Select
          label="Employee"
          name="employee_id"
          value={form.employee_id}
          onChange={handleChange}
          options={employeeOptions}
          placeholder="Select an employee"
          required
          error={errors.employee_id}
        />
        <Input
          label="Department"
          name="department_id"
          value={form.department_id}
          onChange={handleChange}
          required
          error={errors.department_id}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Allocated date"
            name="allocated_date"
            type="date"
            value={form.allocated_date}
            onChange={handleChange}
            required
            error={errors.allocated_date}
          />
          <Input
            label="Expected return date"
            name="expected_return_date"
            type="date"
            value={form.expected_return_date}
            onChange={handleChange}
            required
            error={errors.expected_return_date}
          />
        </div>
        <Input
          label="Condition check-in notes"
          name="condition_checkin_notes"
          value={form.condition_checkin_notes}
          onChange={handleChange}
        />
        <Select
          label="Status"
          name="status"
          value={form.status ?? 'Active'}
          onChange={handleChange}
          options={statusOptions}
        />
      </form>
    </Modal>
  );
}

export default AllocationFormModal;
