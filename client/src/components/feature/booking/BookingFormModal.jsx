import { useMemo, useState } from 'react';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Modal from '../../common/Modal';
import Select from '../../common/Select';
import { createBookingDraft } from '../../../utils/mockBookingData';

function BookingFormModal({ isOpen, onClose, onSubmit, assets = [], departments = [], existingBookings = [], currentUserId, initialValue }) {
  const [form, setForm] = useState(() => (initialValue ? { ...createBookingDraft(), ...initialValue } : createBookingDraft()));
  const [errors, setErrors] = useState({});

  const assetOptions = useMemo(
    () => assets.map((asset) => ({ value: String(asset.id), label: asset.name })),
    [assets],
  );

  const departmentOptions = useMemo(
    () => departments.map((department) => ({ value: String(department.id), label: department.name })),
    [departments],
  );

  const resetForm = () => {
    setForm(initialValue ? { ...createBookingDraft(), ...initialValue } : createBookingDraft());
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.asset_id) {
      nextErrors.asset_id = 'Please select a resource to book.';
    }

    if (!form.purpose.trim()) {
      nextErrors.purpose = 'Purpose is required.';
    }

    if (!form.start_time) {
      nextErrors.start_time = 'Start time is required.';
    }

    if (!form.end_time) {
      nextErrors.end_time = 'End time is required.';
    }

    if (form.start_time && form.end_time && new Date(form.end_time) <= new Date(form.start_time)) {
      nextErrors.end_time = 'End time must be later than start time.';
    }

    if (form.asset_id && form.start_time && form.end_time) {
      const hasConflict = existingBookings.some((booking) => {
        if (initialValue?.id && booking.id === initialValue.id) {
          return false;
        }

        if (String(booking.asset_id) !== String(form.asset_id)) {
          return false;
        }

        const existingStart = new Date(booking.start_time);
        const existingEnd = new Date(booking.end_time);
        const newStart = new Date(form.start_time);
        const newEnd = new Date(form.end_time);

        return newStart < existingEnd && newEnd > existingStart;
      });

      if (hasConflict) {
        nextErrors.end_time = 'The selected slot overlaps with an existing booking for this resource.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      ...form,
      asset_id: Number(form.asset_id),
      department_id: form.department_id ? Number(form.department_id) : null,
      purpose: form.purpose.trim(),
      booked_by: currentUserId ?? 1,
      status: form.status ?? 'Upcoming',
    };

    onSubmit(payload);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialValue ? 'Edit booking' : 'Book resource'}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="booking-form">
            {initialValue ? 'Save changes' : 'Book resource'}
          </Button>
        </>
      }
    >
      <form id="booking-form" className="space-y-4" onSubmit={handleSubmit}>
        <Select
          label="Resource"
          name="asset_id"
          value={form.asset_id}
          onChange={handleChange}
          options={[{ value: '', label: 'Select a resource' }, ...assetOptions]}
          error={errors.asset_id}
          required
        />

        <Input
          label="Purpose"
          name="purpose"
          value={form.purpose}
          onChange={handleChange}
          placeholder="Meeting, training, or site visit"
          error={errors.purpose}
          required
        />

        <Select
          label="Department"
          name="department_id"
          value={form.department_id}
          onChange={handleChange}
          options={[{ value: '', label: 'Select department (optional)' }, ...departmentOptions]}
          error={errors.department_id}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Start time"
            name="start_time"
            type="datetime-local"
            value={form.start_time}
            onChange={handleChange}
            error={errors.start_time}
            required
          />
          <Input
            label="End time"
            name="end_time"
            type="datetime-local"
            value={form.end_time}
            onChange={handleChange}
            error={errors.end_time}
            required
          />
        </div>
      </form>
    </Modal>
  );
}

export default BookingFormModal;
