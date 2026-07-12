import { useState } from 'react';
import Badge from './components/common/Badge';
import Button from './components/common/Button';
import Card from './components/common/Card';
import EmptyState from './components/common/EmptyState';
import ErrorBanner from './components/common/ErrorBanner';
import Input from './components/common/Input';
import Modal from './components/common/Modal';
import Select from './components/common/Select';
import Spinner from './components/common/Spinner';
import Table from './components/common/Table';

const SAMPLE_TABLE_DATA = [
  {
    id: 1,
    assetTag: 'AF-0001',
    name: 'Dell Latitude 5540',
    status: 'Available',
    cost: 1250,
  },
  {
    id: 2,
    assetTag: 'AF-0002',
    name: 'Epson Projector',
    status: 'Allocated',
    cost: 890,
  },
  {
    id: 3,
    assetTag: 'AF-0003',
    name: 'Conference Room A',
    status: 'Reserved',
    cost: 0,
  },
];

const TABLE_COLUMNS = [
  { key: 'assetTag', header: 'Asset Tag' },
  { key: 'name', header: 'Name' },
  {
    key: 'status',
    header: 'Status',
    render: (value) => <Badge status={value} />,
  },
  {
    key: 'cost',
    header: 'Cost',
    align: 'right',
    render: (value) =>
      value > 0 ? `$${value.toLocaleString()}` : '—',
  },
];

const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin' },
  { value: 'AssetManager', label: 'Asset Manager' },
  { value: 'DepartmentHead', label: 'Department Head' },
  { value: 'Employee', label: 'Employee' },
];

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">
          AssetFlow Component Showcase
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Phase 1 — shared UI foundation (temporary test page)
        </p>
      </header>

      <div className="space-y-6">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="primary" loading>
              Loading
            </Button>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Inputs &amp; Select
          </h2>
          <div className="grid max-w-md gap-4">
            <Input
              label="Asset Name"
              name="assetName"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter asset name"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value=""
              onChange={() => {}}
              error="Please enter a valid email address."
            />
            <Select
              label="Role"
              name="role"
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              placeholder="Select a role"
              options={ROLE_OPTIONS}
            />
            <Select
              label="Department"
              name="department"
              value=""
              onChange={() => {}}
              placeholder="Select a department"
              options={[]}
              error="Selected department is inactive or does not exist."
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Card</h2>
          <Card className="max-w-md">
            <h3 className="font-semibold text-neutral-900">Assets Available</h3>
            <p className="mt-1 text-2xl font-semibold text-primary-600">24</p>
            <p className="mt-1 text-xs text-neutral-500">Ready for allocation</p>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge status="Available" />
            <Badge status="Allocated" />
            <Badge status="Pending" />
            <Badge status="Under Maintenance" />
            <Badge status="Overdue" />
            <Badge status="Resolved" />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Modal</h2>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Open Modal
          </Button>
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Example Modal"
            footer={
              <>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  Confirm
                </Button>
              </>
            }
          >
            <p className="text-sm text-neutral-600">
              Close via the X button, Escape key, or by clicking the backdrop.
            </p>
          </Modal>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Table</h2>
          <Table columns={TABLE_COLUMNS} data={SAMPLE_TABLE_DATA} />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Spinner</h2>
          <div className="flex items-center gap-4">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Empty State
          </h2>
          <EmptyState
            title="No assets found"
            description="Register your first asset to get started."
            action={<Button variant="primary">Register Asset</Button>}
          />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Error Banner
          </h2>
          <ErrorBanner error="Unable to load assets. Please try again later." />
        </section>
      </div>
    </div>
  );
}

export default App;
