import { useMemo, useState } from 'react';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Modal from '../../common/Modal';
import Select from '../../common/Select';
import { ASSET_STATUS, ASSET_CONDITIONS } from '../../../utils/constants';
import { createAssetDraft } from '../../../utils/mockAssetData';

const statusOptions = ASSET_STATUS.map((status) => ({ value: status, label: status }));
const conditionOptions = ASSET_CONDITIONS.map((condition) => ({ value: condition, label: condition }));

function AssetFormModal({ isOpen, onClose, onSubmit, categories = [], initialValue, editing = false }) {
  const [form, setForm] = useState(() => {
    const nextValue = initialValue
      ? {
          ...createAssetDraft(),
          ...initialValue,
          category_id: initialValue.category_id ?? '',
          is_bookable: Boolean(initialValue.is_bookable),
        }
      : createAssetDraft();
    return nextValue;
  });
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    const nextValue = initialValue
      ? {
          ...createAssetDraft(),
          ...initialValue,
          category_id: initialValue.category_id ?? '',
          is_bookable: Boolean(initialValue.is_bookable),
        }
      : createAssetDraft();
    setForm(nextValue);
    setErrors({});
  };

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.name })),
    [categories]
  );

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name?.trim()) {
      nextErrors.name = 'Name is required.';
    }

    if (!form.category_id) {
      nextErrors.category_id = 'Category is required.';
    }

    if (form.acquisition_cost && Number.isNaN(Number(form.acquisition_cost))) {
      nextErrors.acquisition_cost = 'Acquisition cost must be a number.';
    }

    if (form.serial_number && form.serial_number.length > 100) {
      nextErrors.serial_number = 'Serial number must be at most 100 characters.';
    }

    if (form.location && form.location.length > 150) {
      nextErrors.location = 'Location must be at most 150 characters.';
    }

    if (form.photo_url && form.photo_url.length > 255) {
      nextErrors.photo_url = 'Photo URL must be at most 255 characters.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    const payload = {
      ...form,
      category_id: Number(form.category_id),
      acquisition_cost: form.acquisition_cost ? Number(form.acquisition_cost) : null,
      is_bookable: Boolean(form.is_bookable),
    };

    onSubmit(payload);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editing ? 'Edit Asset' : 'Register Asset'}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="asset-form">
            {editing ? 'Save Changes' : 'Register Asset'}
          </Button>
        </>
      }
    >
      <form id="asset-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Asset name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          error={errors.name}
        />
        <Select
          label="Category"
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          options={categoryOptions}
          placeholder="Select a category"
          required
          error={errors.category_id}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Serial number"
            name="serial_number"
            value={form.serial_number}
            onChange={handleChange}
            error={errors.serial_number}
          />
          <Input
            label="Acquisition date"
            name="acquisition_date"
            type="date"
            value={form.acquisition_date}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Acquisition cost"
            name="acquisition_cost"
            type="number"
            value={form.acquisition_cost}
            onChange={handleChange}
            error={errors.acquisition_cost}
          />
          <Select
            label="Condition"
            name="condition"
            value={form.condition}
            onChange={handleChange}
            options={conditionOptions}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            error={errors.location}
          />
          <Select
            label="Status"
            name="status"
            value={form.status ?? 'Available'}
            onChange={handleChange}
            options={statusOptions}
          />
        </div>
        <Input
          label="Photo URL"
          name="photo_url"
          value={form.photo_url}
          onChange={handleChange}
          error={errors.photo_url}
        />
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            name="is_bookable"
            checked={Boolean(form.is_bookable)}
            onChange={handleChange}
          />
          Mark as bookable
        </label>
      </form>
    </Modal>
  );
}

export default AssetFormModal;
