import { useMemo, useState } from 'react';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import ErrorBanner from '../components/common/ErrorBanner';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Select from '../components/common/Select';
import Spinner from '../components/common/Spinner';
import Table from '../components/common/Table';
import AssetDetailsModal from '../components/feature/assets/AssetDetailsModal';
import AssetFormModal from '../components/feature/assets/AssetFormModal';
import useAuth from '../hooks/useAuth';
import { getAssetMockData, formatCurrency } from '../utils/mockAssetData';

function AssetsPage() {
  const { user } = useAuth();
  const initialState = getAssetMockData();
  const [assets, setAssets] = useState(initialState.assets);
  const [categories] = useState(initialState.categories);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading] = useState(false);
  const [error] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const canRegister = ['Admin', 'AssetManager'].includes(user?.role);
  const canEdit = ['Admin', 'AssetManager'].includes(user?.role);

  const filteredAssets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return assets.filter((asset) => {
      const matchesSearch =
        !normalizedSearch ||
        asset.name.toLowerCase().includes(normalizedSearch) ||
        asset.asset_tag.toLowerCase().includes(normalizedSearch) ||
        asset.location.toLowerCase().includes(normalizedSearch);
      const matchesStatus = !statusFilter || asset.status === statusFilter;
      const matchesCategory = !categoryFilter || String(asset.category_id) === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [assets, categoryFilter, search, statusFilter]);

  const statusOptions = useMemo(
    () => [{ value: '', label: 'All statuses' }, ...initialState.assetStatuses.map((status) => ({ value: status, label: status }))],
    [initialState.assetStatuses],
  );

  const categoryOptions = useMemo(
    () => [{ value: '', label: 'All categories' }, ...categories.map((category) => ({ value: String(category.id), label: category.name }))],
    [categories],
  );

  const handleCreate = (payload) => {
    const nextAsset = {
      ...payload,
      id: Date.now(),
      asset_tag: `AF-${String(Date.now()).slice(-4)}`,
      qr_code_value: `QR-${Date.now()}`,
      status: payload.status ?? 'Available',
    };
    setAssets((prev) => [nextAsset, ...prev]);
  };

  const handleEdit = (payload) => {
    if (!editingAsset) {
      return;
    }
    setAssets((prev) => prev.map((asset) => (asset.id === editingAsset.id ? { ...asset, ...payload, id: asset.id } : asset)));
  };

  const openDetails = (asset) => {
    setSelectedAsset(asset);
    setIsDetailsOpen(true);
  };

  const openEdit = (asset) => {
    setEditingAsset(asset);
    setIsFormOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingAsset(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAsset(null);
  };

  const handleDelete = () => {
    if (!selectedAsset) {
      return;
    }
    setAssets((prev) => prev.filter((asset) => asset.id !== selectedAsset.id));
    setIsConfirmOpen(false);
    setSelectedAsset(null);
  };

  const columns = [
    { key: 'asset_tag', header: 'Asset Tag' },
    { key: 'name', header: 'Asset Name' },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <Badge status={value} />,
    },
    {
      key: 'category_id',
      header: 'Category',
      render: (value) => categories.find((category) => category.id === value)?.name ?? '—',
    },
    { key: 'location', header: 'Location' },
    {
      key: 'acquisition_cost',
      header: 'Cost',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_value, row) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => openDetails(row)}>
            View
          </Button>
          {canEdit && (
            <Button variant="secondary" onClick={() => openEdit(row)}>
              Edit
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Asset Registration & Directory</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Track registered assets, inspect asset details, and manage asset records.
          </p>
        </div>
        {canRegister && (
          <Button onClick={handleOpenCreate}>Register Asset</Button>
        )}
      </header>

      <ErrorBanner error={error} />

      <Card>
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Search"
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, tag, or location"
          />
          <Select
            label="Status"
            name="statusFilter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={statusOptions}
          />
          <Select
            label="Category"
            name="categoryFilter"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            options={categoryOptions}
          />
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center rounded-lg border border-neutral-200 bg-white p-10">
          <Spinner size="lg" label="Loading assets" />
        </div>
      ) : error ? (
        <EmptyState title="Unable to load assets" description={error} />
      ) : filteredAssets.length ? (
        <Table columns={columns} data={filteredAssets} emptyMessage="No assets found." />
      ) : (
        <EmptyState title="No assets found" description="Try adjusting your filters or register a new asset." />
      )}

      <AssetFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingAsset ? handleEdit : handleCreate}
        categories={categories}
        initialValue={editingAsset}
        editing={Boolean(editingAsset)}
      />

      <AssetDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedAsset(null);
        }}
        asset={selectedAsset}
        categoryName={selectedAsset ? categories.find((category) => category.id === selectedAsset.category_id)?.name ?? '—' : '—'}
        onEdit={openEdit}
      />

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Remove asset"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-neutral-700">This action is temporary and only updates the local mock directory.</p>
      </Modal>
    </div>
  );
}

export default AssetsPage;
