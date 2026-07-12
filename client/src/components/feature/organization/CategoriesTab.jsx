import { useMemo, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';
import Input from '../../common/Input';
import Modal from '../../common/Modal';
import Table from '../../common/Table';

const EMPTY_FORM = {
  name: '',
  description: '',
};

function CategoriesTab({ categories, onSave }) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        (cat.description ?? '').toLowerCase().includes(query),
    );
  }, [categories, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description ?? '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const nextErrors = {};
    const trimmedName = form.name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      nextErrors.name = 'Name is required (2–100 characters).';
    }

    const duplicate = categories.some(
      (cat) =>
        cat.name.toLowerCase() === trimmedName.toLowerCase() && cat.id !== editingId,
    );

    if (duplicate) {
      nextErrors.name = 'A category with this name already exists.';
    }

    if (form.description && form.description.length > 255) {
      nextErrors.description = 'Description must be 255 characters or fewer.';
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
      description: form.description.trim() || null,
      custom_fields: null,
    };

    onSave(payload, editingId);
    setSaving(false);
    setModalOpen(false);
  };

  const columns = [
    { key: 'name', header: 'Category' },
    {
      key: 'description',
      header: 'Description',
      render: (value) => value ?? '—',
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
          <h3 className="text-lg font-semibold text-neutral-900">Asset Categories</h3>
          <p className="text-sm text-neutral-500">Define asset classification types</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Input
        label="Search categories"
        name="catSearch"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or description..."
      />

      {filteredCategories.length === 0 ? (
        <EmptyState
          title="No categories found"
          description="Add asset categories to classify registered assets."
          action={<Button variant="primary" onClick={openCreate}>Add Category</Button>}
        />
      ) : (
        <Table columns={columns} data={filteredCategories} />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Category' : 'Add Category'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleSubmit}>
              {editingId ? 'Save Changes' : 'Add Category'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            error={errors.name}
          />
          <Input
            label="Description"
            name="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional description"
            error={errors.description}
          />
        </div>
      </Modal>
    </div>
  );
}

export default CategoriesTab;
